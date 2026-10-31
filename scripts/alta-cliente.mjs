#!/usr/bin/env node
/**
 * alta-cliente.mjs — Alta de cuentas para el panel de cliente (/dashboard).
 *
 * Crea/actualiza content/clientes.json (fuente de cuentas del login /acceso)
 * generando el hash PBKDF2-SHA256 con el MISMO formato que src/lib/auth-cliente.ts.
 *
 * USO:
 *   node scripts/alta-cliente.mjs --email cliente@correo.com --nombre "Familia Pérez" \
 *        --slug ejemplo-quince [--rol cliente] [--password "ContraseñaSegura1"] [--escribir]
 *
 *   Alta solo-Google (iteración 034): el cliente entra con «Continuar con Google»
 *   usando ese mismo email; no hay contraseña que comunicar:
 *   node scripts/alta-cliente.mjs --email cliente@gmail.com --nombre "Familia Pérez" \
 *        --slug ejemplo-quince --solo-google [--escribir]
 *
 *   - Sin --password: genera una aleatoria de 12 caracteres y la muestra UNA vez.
 *   - Con --solo-google: hash de una contraseña aleatoria que se descarta (nadie
 *     la conoce); el ingreso es por Google con el email de la cuenta.
 *   - Sin --escribir: solo imprime la entrada JSON (para revisarla a mano).
 *   - Con --escribir: actualiza content/clientes.json (falla si el email ya existe,
 *     usar --reemplazar para actualizar la contraseña/slug de una cuenta existente).
 *
 * Después de editar el archivo, commit + push a main:
 *   git add content/clientes.json && git commit -m "alta cliente <email>" && git push
 *
 * La web NUNCA escribe este archivo; el alta de clientes es siempre del estudio.
 */
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RAIZ = join(process.cwd());
const RUTA = join(RAIZ, 'content', 'clientes.json');
const ITERACIONES = 310000;

// ---------- args ----------
const args = process.argv.slice(2);
const flag = (nombre) => args.includes(nombre);
const valorDe = (nombre) => {
  const i = args.indexOf(nombre);
  return i >= 0 ? args[i + 1] : undefined;
};

const email = (valorDe('--email') || '').trim().toLowerCase();
const nombre = (valorDe('--nombre') || '').trim();
const slug = (valorDe('--slug') || '').trim();
const rol = valorDe('--rol') === 'estudio' ? 'estudio' : 'cliente';
const password = valorDe('--password');
const soloGoogle = flag('--solo-google');
const escribir = flag('--escribir');
const reemplazar = flag('--reemplazar');

function fallir(mensaje) {
  console.error('✗ ' + mensaje);
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fallir('--email es obligatorio (formato válido).');
if (nombre.length < 2) fallir('--nombre es obligatorio (2+ caracteres).');
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fallir('--slug es obligatorio (minúsculas/números/guiones).');
if (password && password.length < 8) fallir('La contraseña necesita al menos 8 caracteres.');
if (password && soloGoogle) fallir('--solo-google y --password son excluyentes (la cuenta solo-Google no usa contraseña).');

// --solo-google: hash de una contraseña aleatoria larga que se descarta:
// nadie la conoce y la verificación por contraseña siempre fallará cerrada.
const contrasenaFinal = password || (soloGoogle ? randomBytes(24).toString('base64url') : randomBytes(9).toString('base64url').slice(0, 12) + 'aA1');
const salt = randomBytes(16);
const hash = pbkdf2Sync(contrasenaFinal, salt, ITERACIONES, 32, 'sha256');
const b64 = (b) => Buffer.from(b).toString('base64');
const hashFormateado = `pbkdf2-sha256$${ITERACIONES}$${b64(salt)}$${b64(hash)}`;

// ---------- colección existente ----------
let coleccion = { esquema: 1, actualizadoEn: '', cuentas: [] };
if (existsSync(RUTA)) {
  try {
    coleccion = JSON.parse(readFileSync(RUTA, 'utf8'));
    if (coleccion.esquema !== 1 || !Array.isArray(coleccion.cuentas)) fallir('content/clientes.json no tiene el esquema esperado (esquema 1 + cuentas[]).');
  } catch {
    fallir('content/clientes.json no es un JSON legible.');
  }
}

const existente = coleccion.cuentas.find((c) => c.email === email);
if (existente && escribir && !reemplazar) fallir(`La cuenta ${email} ya existe. Usá --reemplazar para actualizarla.`);

const entrada = {
  email,
  nombre,
  hash: hashFormateado,
  rol,
  slug,
  creadoEn: existente?.creadoEn || new Date().toISOString(),
};
if (existente) {
  Object.assign(existente, entrada);
} else {
  coleccion.cuentas.push(entrada);
}
coleccion.actualizadoEn = new Date().toISOString();

// ---------- salida ----------
console.log('\n=== Cuenta nueva (entrada para content/clientes.json) ===\n');
console.log(JSON.stringify(entrada, null, 2));
if (!password && !soloGoogle) console.log(`\n🔑 Contraseña generada (mostrada UNA vez, compartila por un canal seguro): ${contrasenaFinal}`);
if (soloGoogle) console.log('\n✓ Cuenta solo-Google: el cliente entra con «Continuar con Google» (mismo email). No hay contraseña que comunicar.');

if (escribir) {
  writeFileSync(RUTA, JSON.stringify(coleccion, null, 2) + '\n');
  console.log(`\n✓ content/clientes.json actualizado (${coleccion.cuentas.length} cuenta(s)).`);
  console.log('  Siguiente paso:');
  console.log('    git add content/clientes.json && git commit -m "alta cliente ' + email + '" && git push');
} else {
  console.log('\n(sin --escribir: nada fue modificado. Revisá la entrada y volvé a correr con --escribir.)');
}
