const DIGIT_FINAL = [true, true, false, true, false, false, true, true, true, false];
const DIGIT_RIEUL = [false, true, false, false, false, false, false, true, true, false];
const LATIN_FINAL = /[lmnr]$|ng$/i;

function finalOf(word: string): { final: boolean; rieul: boolean } {
  const s = word.replace(/\s*\([^()]*\)\s*$/, '').trim();
  const c = s.at(-1) ?? '';
  const code = c.charCodeAt(0) - 0xac00;
  if (code >= 0 && code < 11172) return { final: code % 28 > 0, rieul: code % 28 === 8 };
  if (/\d/.test(c)) return { final: DIGIT_FINAL[+c], rieul: DIGIT_RIEUL[+c] };
  if (c === '%') return { final: false, rieul: false };
  if (/[a-z]/i.test(c)) return { final: LATIN_FINAL.test(s), rieul: /l$/i.test(s) };
  return { final: false, rieul: false };
}

export function josa(word: string, pair: '이/가' | '은/는' | '을/를' | '과/와' | '으로/로') {
  const { final, rieul } = finalOf(word);
  if (pair === '으로/로') return final && !rieul ? '으로' : '로';
  const [withFinal, without] = pair.split('/');
  return final ? withFinal : without;
}
