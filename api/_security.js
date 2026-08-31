import crypto from 'node:crypto';

function str(v) { return typeof v === 'string' ? v.trim() : ''; }
function ipOf(req) {
  const f = req.headers['x-forwarded-for'];
  return typeof f === 'string' ? f.split(',')[0].trim() : String(req.headers['x-real-ip'] || 'unknown');
}
async function redis(path, options = {}) {
  const url = str(process.env.UPSTASH_REDIS_REST_URL).replace(/\/$/, '');
  const token = str(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !token) return null;
  const r = await fetch(`${url}${path}`, { method: options.method || 'GET', headers: { Authorization: `Bearer ${token}`, ...(options.body !== undefined ? {'Content-Type':'application/json'} : {}) }, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.error) return null;
  return data.result;
}
export async function consumeRateLimit(req, scope, limit = 10, windowSeconds = 900) {
  const ip = ipOf(req);
  const key = `cm:rl:${scope}:${crypto.createHash('sha256').update(ip).digest('hex').slice(0,32)}`;
  const current = await redis(`/incr/${encodeURIComponent(key)}`);
  if (current === null) return { configured: false, allowed: true, remaining: null };
  if (Number(current) === 1) await redis(`/expire/${encodeURIComponent(key)}/${windowSeconds}`);
  return { configured: true, allowed: Number(current) <= limit, remaining: Math.max(0, limit - Number(current)) };
}

function decodeBase64(value) {
  const clean = String(value || '').replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  return Buffer.from(clean, 'base64');
}
function hasDangerousPdf(bytes) {
  const text = bytes.toString('latin1').slice(0, Math.min(bytes.length, 8 * 1024 * 1024));
  return /\/JavaScript\b|\/JS\b|\/OpenAction\b|\/AA\b|\/Launch\b/i.test(text);
}
function magicMatches(type, bytes) {
  if (type === 'application/pdf') return bytes.slice(0,4).toString('ascii') === '%PDF';
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.slice(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (type === 'image/webp') return bytes.slice(0,4).toString('ascii') === 'RIFF' && bytes.slice(8,12).toString('ascii') === 'WEBP';
  if (type === 'application/msword' || type === 'application/vnd.ms-excel') return bytes.slice(0,8).equals(Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]));
  if (type.includes('openxmlformats')) return bytes.slice(0,2).toString('ascii') === 'PK';
  return false;
}
function dangerousZipMarkers(bytes) {
  const text = bytes.toString('latin1');
  return /vbaProject\.bin|word\/vbaProject|xl\/vbaProject|macros|embeddings\/.*\.(exe|dll|js|vbs|ps1|bat)/i.test(text);
}

export async function scanAttachment({ filename, content, contentType }) {
  const bytes = decodeBase64(content);
  if (!bytes.length) return { clean: false, reason: 'file_empty' };
  if (!magicMatches(contentType, bytes)) return { clean: false, reason: 'file_signature_mismatch' };
  if (contentType === 'application/pdf' && hasDangerousPdf(bytes)) return { clean: false, reason: 'pdf_active_content' };
  if (contentType.includes('openxmlformats') && dangerousZipMarkers(bytes)) return { clean: false, reason: 'office_macro_or_embedding' };

  const scannerUrl = str(process.env.CM_ANTIVIRUS_WEBHOOK_URL);
  if (!scannerUrl) {
    if (String(process.env.CM_REQUIRE_ANTIVIRUS).toLowerCase() === 'true') return { clean: false, reason: 'antivirus_not_configured' };
    return { clean: true, engine: 'signature-heuristics' };
  }
  try {
    const headers = { 'Content-Type':'application/json' };
    if (process.env.CM_ANTIVIRUS_WEBHOOK_SECRET) headers['x-cm-antivirus-secret'] = process.env.CM_ANTIVIRUS_WEBHOOK_SECRET;
    const r = await fetch(scannerUrl, { method:'POST', headers, body: JSON.stringify({ filename, contentType, content, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }) });
    const result = await r.json().catch(() => ({}));
    if (!r.ok || result.clean !== true) return { clean:false, reason:'antivirus_rejected' };
    return { clean:true, engine:'external-antivirus' };
  } catch {
    return { clean:false, reason:'antivirus_unavailable' };
  }
}

export { ipOf };
