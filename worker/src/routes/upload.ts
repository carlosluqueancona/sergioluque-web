import { Hono } from 'hono';
import type { Env } from '../types';
import { requireAuth, json, jsonError, corsHeaders, getAllowedOrigins } from '../lib/shared';

const upload = new Hono<{ Bindings: Env }>();

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
  'audio/flac',
  'audio/x-flac',
]);

// Magic byte signatures
function detectMime(bytes: Uint8Array): string | null {
  // JPEG: FF D8
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return 'image/png';
  // WebP: 52 49 46 46 (RIFF) + offset 8: 57 45 42 50 (WEBP)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return 'image/webp';
  // MP3: FF FB, FF F3, FF F2
  if (
    bytes[0] === 0xff &&
    (bytes[1] === 0xfb || bytes[1] === 0xf3 || bytes[1] === 0xf2)
  )
    return 'audio/mpeg';
  // ID3 (MP3 with ID3 tag): 49 44 33
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'audio/mpeg';
  // MP4 / M4A container: bytes 4-7 = "ftyp" (66 74 79 70). Major brand at 8-11.
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    // Common audio/MP4 brands. iTunes/QuickTime export ".m4a" as M4A.
    if (
      brand === 'M4A ' ||
      brand === 'M4B ' ||
      brand === 'M4P ' ||
      brand === 'mp41' ||
      brand === 'mp42' ||
      brand === 'isom' ||
      brand === 'iso2' ||
      brand === 'dash'
    ) {
      return 'audio/mp4';
    }
  }
  // ADTS AAC: FF F1 / FF F9
  if (bytes[0] === 0xff && (bytes[1] === 0xf1 || bytes[1] === 0xf9)) return 'audio/aac';
  // FLAC: 66 4C 61 43 ("fLaC")
  if (bytes[0] === 0x66 && bytes[1] === 0x4c && bytes[2] === 0x61 && bytes[3] === 0x43)
    return 'audio/flac';
  return null;
}

function randomHex(len = 8): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fileTypeFolder(mime: string): string {
  if (mime.startsWith('image/')) return 'images';
  if (mime.startsWith('audio/')) return 'audio';
  return 'files';
}

upload.post('/', async (c) => {
  const origin = c.req.raw.headers.get('origin') ?? '';
  const cors = corsHeaders(origin, getAllowedOrigins(c.env), 'POST, OPTIONS');

  // Auth guard
  const payload = await requireAuth(c.req.raw, c.env);
  if (!payload) return jsonError('Unauthorized', 401, cors);

  let formData: FormData;
  try {
    formData = await c.req.raw.formData();
  } catch {
    return jsonError('Invalid multipart/form-data', 400, cors);
  }

  const file = formData.get('file') as (File & { name: string; type: string }) | null;
  if (!file || typeof file.arrayBuffer !== 'function') {
    return jsonError('Missing file field', 400, cors);
  }

  const claimedType = file.type;
  if (!ALLOWED_MIME.has(claimedType)) {
    return jsonError(`File type not allowed: ${claimedType}`, 400, cors);
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Validate with magic bytes
  const detectedMime = detectMime(bytes);
  if (!detectedMime || !ALLOWED_MIME.has(detectedMime)) {
    return jsonError('File content does not match allowed types', 400, cors);
  }

  // Build key
  const year = new Date().getFullYear();
  const folder = fileTypeFolder(detectedMime);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `${folder}/${year}/${randomHex()}-${safeName}`;

  try {
    await c.env.MEDIA.put(key, buffer, {
      httpMetadata: { contentType: detectedMime },
    });

    const baseUrl =
      c.env.MEDIA_PUBLIC_URL ??
      `https://${c.req.raw.headers.get('host') ?? 'sergioluque-cms.carlosluque-095.workers.dev'}/media`;
    return json({ url: `${baseUrl}/${key}` }, 200, cors);
  } catch (err) {
    console.error('R2 upload error', err);
    return jsonError('Upload failed', 500, cors);
  }
});

// ── Delete object from R2 ─────────────────────────────────────────────────
upload.delete('/', async (c) => {
  const origin = c.req.raw.headers.get('origin') ?? '';
  const cors = corsHeaders(origin, getAllowedOrigins(c.env), 'DELETE, OPTIONS');

  const payload = await requireAuth(c.req.raw, c.env);
  if (!payload) return jsonError('Unauthorized', 401, cors);

  // Accept ?key=... or ?url=...
  const url = new URL(c.req.url);
  let key = url.searchParams.get('key') ?? '';
  const fullUrl = url.searchParams.get('url') ?? '';

  if (!key && fullUrl) {
    // Extract key from URL (everything after /media/)
    const match = /\/media\/(.+)$/.exec(fullUrl);
    if (match) key = match[1] ?? '';
  }

  if (!key) return jsonError('Missing key or url parameter', 400, cors);

  // Safety: only allow keys under our managed prefixes
  if (!/^(images|audio|files)\//.test(key)) {
    return jsonError('Invalid key prefix', 400, cors);
  }

  try {
    await c.env.MEDIA.delete(key);
    return json({ ok: true, deleted: key }, 200, cors);
  } catch (err) {
    console.error('R2 delete error', err);
    return jsonError('Delete failed', 500, cors);
  }
});

export { upload };
