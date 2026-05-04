import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { config } = body

    if (!config) {
      return NextResponse.json({ error: 'No config provided' }, { status: 400 })
    }

    // 1. Read the current config file to preserve types/interfaces
    const configPath = path.join(process.cwd(), 'src/data/config.ts')
    const currentContent = fs.readFileSync(configPath, 'utf-8')

    // 2. Split into type section + config section
    const typeSectionMatch = currentContent.match(
      /^(\/\/[^\n]*\n)*export interface [\s\S]*?\n}\n/
    )
    const typeSection = typeSectionMatch ? typeSectionMatch[0] : ''

    // 3. Build the new config content preserving types
    const newContent = `${typeSection}
// ============================================================
// VALORES — Auto-generated from admin panel
// ============================================================
const config: SiteConfig = ${JSON.stringify(config, null, 2)} as SiteConfig

export default config
`

    fs.writeFileSync(configPath, newContent, 'utf-8')

    // 4. Git add, commit, and push
    const gitDir = process.cwd()
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const commitMsg = `Config update from admin - ${timestamp}`

    let gitOutput = ''
    try {
      await execAsync('git add -A', { cwd: gitDir })
      await execAsync(`git commit -m "Config update from admin - ${timestamp}"`, { cwd: gitDir })
      await execAsync('git push', { cwd: gitDir })
      gitOutput = 'Committed and pushed successfully'
    } catch (gitErr: unknown) {
      const err = gitErr as { stderr?: string; stdout?: string }
      if (err.stderr?.includes('nothing to commit')) {
        gitOutput = 'No changes to commit (already up to date)'
      } else {
        gitOutput = `Git warning: ${err.stderr || err.stdout || 'unknown error'}`
      }
    }

    // 5. Trigger rebuild (npm run build)
    let buildOutput = ''
    try {
      const { stdout } = await execAsync('npm run build', { cwd: gitDir, timeout: 180000 })
      buildOutput = 'Build completed successfully'
    } catch (buildErr: unknown) {
      const err = buildErr as { stderr?: string }
      buildOutput = 'Build may have issues, but config is saved and pushed'
      console.error('Build details:', err.stderr)
    }

    return NextResponse.json({
      success: true,
      git: gitOutput,
      build: buildOutput,
      message: 'Config saved, committed, pushed and rebuild triggered!',
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Deploy error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
