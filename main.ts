// Tiny stack VM for make.fun's ISA v1. Reads /input/<id>/{program,input}.bin, writes /output/<id>/{stdout.bin,exit.txt}.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// immediate size per opcode, -1 = unknown opcode
const IMM = new Int8Array(256).fill(-1);
for (const o of [0, 3, 4, 5, 6, 7, 0x34, 0x40, 0x41, 0x50, 0x51, 0x52, 0x53]) IMM[o] = 0;
for (let o = 0x10; o <= 0x1e; o++) if (o !== 0x1f) IMM[o] = 0;
for (const o of [0x20, 0x21, 0x22]) IMM[o] = 0;
IMM[1] = 1; IMM[2] = 4;
for (const o of [0x30, 0x31, 0x32, 0x33]) IMM[o] = 2;
// values popped and pushed
const POPS = new Uint8Array(256), PUSH = new Uint8Array(256);
for (let o = 0x10; o <= 0x22; o++) { POPS[o] = 2; PUSH[o] = 1; }
POPS[0x17] = POPS[0x1b] = 1;
POPS[3] = 1; POPS[4] = 1; PUSH[4] = 2; POPS[5] = PUSH[5] = 2; POPS[6] = 2; PUSH[6] = 3; POPS[7] = PUSH[7] = 3;
PUSH[1] = PUSH[2] = PUSH[0x52] = 1;
POPS[0x31] = POPS[0x32] = POPS[0x50] = POPS[0x51] = POPS[0x53] = 1;
POPS[0x40] = PUSH[0x40] = 1; POPS[0x41] = 2;

function run(p: Uint8Array, inp: Uint8Array): [Uint8Array, number] {
  const n = p.length, s = new Int32Array(260), r = new Int32Array(64), m = new Int32Array(256);
  const out = new Uint8Array(65536);
  let sp = 0, rp = 0, pc = 0, ip = 0, ol = 0, steps = 0, a = 0, b = 0;
  for (;;) {
    if (steps >= 1000000) return [out.slice(0, ol), 10];
    if (pc < 0 || pc >= n) return [out.slice(0, ol), 9];
    const op = p[pc], k = IMM[op];
    if (k < 0) return [out.slice(0, ol), 5];
    if (pc + k >= n) return [out.slice(0, ol), 9];
    steps++;
    if (sp < POPS[op]) return [out.slice(0, ol), 2];
    if (sp - POPS[op] + PUSH[op] > 256) return [out.slice(0, ol), 3];
    const nx = pc + 1 + k;
    if (op >= 0x10 && op <= 0x22 && op !== 0x17 && op !== 0x1b) { b = s[--sp]; a = s[sp - 1]; }
    switch (op) {
      case 0x00: return [out.slice(0, ol), 0];
      case 0x01: s[sp++] = (p[pc + 1] << 24) >> 24; break;
      case 0x02: s[sp++] = p[pc + 1] | (p[pc + 2] << 8) | (p[pc + 3] << 16) | (p[pc + 4] << 24); break;
      case 0x03: sp--; break;
      case 0x04: s[sp] = s[sp - 1]; sp++; break;
      case 0x05: a = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = a; break;
      case 0x06: s[sp] = s[sp - 2]; sp++; break;
      case 0x07: a = s[sp - 3]; s[sp - 3] = s[sp - 2]; s[sp - 2] = s[sp - 1]; s[sp - 1] = a; break;
      case 0x10: s[sp - 1] = a + b; break;
      case 0x11: s[sp - 1] = a - b; break;
      case 0x12: s[sp - 1] = Math.imul(a, b); break;
      case 0x13: if (!b) return [out.slice(0, ol), 4]; s[sp - 1] = a / b; break;
      case 0x14: if (!b) return [out.slice(0, ol), 4]; s[sp - 1] = a % b; break;
      case 0x15: if (!b) return [out.slice(0, ol), 4]; s[sp - 1] = (a >>> 0) / (b >>> 0); break;
      case 0x16: if (!b) return [out.slice(0, ol), 4]; s[sp - 1] = (a >>> 0) % (b >>> 0); break;
      case 0x17: s[sp - 1] = -s[sp - 1]; break;
      case 0x18: s[sp - 1] = a & b; break;
      case 0x19: s[sp - 1] = a | b; break;
      case 0x1a: s[sp - 1] = a ^ b; break;
      case 0x1b: s[sp - 1] = ~s[sp - 1]; break;
      case 0x1c: s[sp - 1] = a << b; break;
      case 0x1d: s[sp - 1] = a >> b; break;
      case 0x1e: s[sp - 1] = a >>> b; break;
      case 0x20: s[sp - 1] = +(a === b); break;
      case 0x21: s[sp - 1] = +(a < b); break;
      case 0x22: s[sp - 1] = +((a >>> 0) < (b >>> 0)); break;
      case 0x30: pc = nx + ((p[pc + 1] | (p[pc + 2] << 8)) << 16 >> 16); continue;
      case 0x31: case 0x32:
        if ((s[--sp] === 0) === (op === 0x31)) { pc = nx + ((p[pc + 1] | (p[pc + 2] << 8)) << 16 >> 16); continue; }
        break;
      case 0x33:
        if (rp >= 64) return [out.slice(0, ol), 7];
        r[rp++] = nx; pc = p[pc + 1] | (p[pc + 2] << 8); continue;
      case 0x34:
        if (!rp) return [out.slice(0, ol), 8];
        pc = r[--rp]; continue;
      case 0x40: a = s[sp - 1]; if (a < 0 || a > 255) return [out.slice(0, ol), 6]; s[sp - 1] = m[a]; break;
      case 0x41: a = s[sp - 1]; if (a < 0 || a > 255) return [out.slice(0, ol), 6]; m[a] = s[sp - 2]; sp -= 2; break;
      case 0x50: {
        const t = String(s[sp - 1]);
        if (ol + t.length > 65536) return [out.slice(0, ol), 11];
        for (let i = 0; i < t.length; i++) out[ol++] = t.charCodeAt(i);
        sp--; break;
      }
      case 0x51: if (ol >= 65536) return [out.slice(0, ol), 11]; out[ol++] = s[--sp]; break;
      case 0x52: s[sp++] = ip < inp.length ? inp[ip++] : -1; break;
      case 0x53: return [out.slice(0, ol), s[sp - 1] & 255];
    }
    pc = nx;
  }
}

const rd = (f: string) => { try { return new Uint8Array(readFileSync(f)); } catch { return new Uint8Array(0); } };
for (const id of readdirSync(I).sort()) {
  const [o, c] = run(rd(`${I}/${id}/program.bin`), rd(`${I}/${id}/input.bin`));
  mkdirSync(`${O}/${id}`, { recursive: true });
  writeFileSync(`${O}/${id}/stdout.bin`, o);
  writeFileSync(`${O}/${id}/exit.txt`, `${c}\n`);
}
