import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, guests, message } = body

    if (!name || !guests) {
      return NextResponse.json(
        { error: 'Nombre y cantidad de invitados son obligatorios' },
        { status: 400 }
      )
    }

    const rsvp = await db.rsvp.create({
      data: {
        name: String(name).trim(),
        guests: Number(guests),
        message: message ? String(message).trim() : null,
      },
    })

    return NextResponse.json(
      { success: true, data: rsvp },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving RSVP:', error)
    return NextResponse.json(
      { error: 'Error al guardar la confirmación' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const rsvps = await db.rsvp.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: rsvps })
  } catch (error) {
    console.error('Error fetching RSVPs:', error)
    return NextResponse.json(
      { error: 'Error al obtener confirmaciones' },
      { status: 500 }
    )
  }
}
