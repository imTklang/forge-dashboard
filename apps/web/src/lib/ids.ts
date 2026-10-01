import { randomInt } from "node:crypto";

const ALPHABET = "abcdefghjkmnpqrstvwxyz23456789";

/** ID curto e legível, ex.: tsk_8f2k */
export function shortId(prefix: string, len = 4) {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}_${s}`;
}
