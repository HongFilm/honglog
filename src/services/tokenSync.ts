import { Project } from '../types';

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function utf8ToBase64(str: string): string {
  const utf8Bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      utf8Bytes.push(charCode);
    } else if (charCode < 0x800) {
      utf8Bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8Bytes.push(
        0xe0 | (charCode >> 12),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    } else {
      i++;
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8Bytes.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    }
  }

  let output = '';
  let i = 0;
  while (i < utf8Bytes.length) {
    const b1 = utf8Bytes[i++];
    const b2 = i < utf8Bytes.length ? utf8Bytes[i++] : NaN;
    const b3 = i < utf8Bytes.length ? utf8Bytes[i++] : NaN;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4);
    const enc3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6);
    const enc4 = isNaN(b3) ? 64 : b3 & 63;

    output +=
      B64_CHARS.charAt(enc1) +
      B64_CHARS.charAt(enc2) +
      B64_CHARS.charAt(enc3) +
      B64_CHARS.charAt(enc4);
  }
  return output;
}

export function base64ToUtf8(b64: string): string {
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  const bytes: number[] = [];
  let i = 0;
  while (i < clean.length) {
    const enc1 = B64_CHARS.indexOf(clean.charAt(i++));
    const enc2 = B64_CHARS.indexOf(clean.charAt(i++));
    const enc3 = B64_CHARS.indexOf(clean.charAt(i++));
    const enc4 = B64_CHARS.indexOf(clean.charAt(i++));

    const b1 = (enc1 << 2) | (enc2 >> 4);
    const b2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const b3 = ((enc3 & 3) << 6) | enc4;

    bytes.push(b1);
    if (enc3 !== 64 && enc3 !== -1) bytes.push(b2);
    if (enc4 !== 64 && enc4 !== -1) bytes.push(b3);
  }

  let result = '';
  let j = 0;
  while (j < bytes.length) {
    const b1 = bytes[j++];
    if (b1 < 0x80) {
      result += String.fromCharCode(b1);
    } else if (b1 > 0xbf && b1 < 0xe0) {
      const b2 = bytes[j++];
      result += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
    } else if (b1 >= 0xe0 && b1 < 0xf0) {
      const b2 = bytes[j++];
      const b3 = bytes[j++];
      result += String.fromCharCode(
        ((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f)
      );
    } else {
      const b2 = bytes[j++];
      const b3 = bytes[j++];
      const b4 = bytes[j++];
      let cp =
        ((b1 & 0x07) << 18) |
        ((b2 & 0x3f) << 12) |
        ((b3 & 0x3f) << 6) |
        (b4 & 0x3f);
      cp -= 0x10000;
      result += String.fromCharCode(
        0xd800 + ((cp >> 10) & 0x3ff),
        0xdc00 + (cp & 0x3ff)
      );
    }
  }
  return result;
}

export const TOKEN_PREFIX = 'HLTOK_';

export interface ProjectTokenPayload {
  v: number;
  type: 'honglog_project';
  generatedAt: number;
  project: {
    name: string;
    meta: Project['meta'];
    takes?: Project['takes'];
  };
}

export function generateProjectToken(project: Project): string {
  const payload: ProjectTokenPayload = {
    v: 1,
    type: 'honglog_project',
    generatedAt: Date.now(),
    project: {
      name: project.name,
      meta: project.meta,
      takes: project.takes || [],
    },
  };
  const jsonStr = JSON.stringify(payload);
  const b64 = utf8ToBase64(jsonStr);
  return `${TOKEN_PREFIX}${b64}`;
}

export function parseProjectToken(tokenStr: string): {
  valid: boolean;
  payload?: ProjectTokenPayload;
  error?: string;
} {
  const trimmed = tokenStr.trim();
  if (!trimmed) {
    return { valid: false, error: 'Token tidak boleh kosong' };
  }

  let rawB64 = trimmed;
  if (trimmed.startsWith(TOKEN_PREFIX)) {
    rawB64 = trimmed.substring(TOKEN_PREFIX.length);
  }

  try {
    const jsonStr = base64ToUtf8(rawB64);
    const parsed = JSON.parse(jsonStr) as ProjectTokenPayload;

    if (!parsed || parsed.type !== 'honglog_project' || !parsed.project) {
      return { valid: false, error: 'Format token bukan project Honglog yang valid' };
    }

    if (!parsed.project.name && !parsed.project.meta?.production) {
      return { valid: false, error: 'Token tidak memiliki nama project yang valid' };
    }

    return { valid: true, payload: parsed };
  } catch (e: any) {
    return { valid: false, error: 'Gagal membaca token (kode rusak atau tidak lengkap)' };
  }
}
