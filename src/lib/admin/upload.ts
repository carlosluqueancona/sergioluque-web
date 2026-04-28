/**
 * Direct-to-R2 admin upload helper.
 *
 * Flow:
 *   1. POST { filename, contentType } to /api/admin/upload/presign — Next
 *      proxies it to the Worker, which mints a SigV4 presigned PUT URL
 *      against R2's S3-compatible API and replies with { uploadUrl,
 *      publicUrl, key }.
 *   2. PUT the file body directly to `uploadUrl`. The Worker is no longer
 *      in the data path — files larger than the 100 MB Worker request
 *      body limit (audio, FLAC, big PDFs) work fine.
 *   3. Return `publicUrl` so the caller can store it on the entity.
 *
 * onProgress reports 0..100 based on XHR upload events. We use XHR
 * instead of fetch because fetch's upload progress story in browsers is
 * still patchy (no readable progress on the request body).
 */

interface PresignResponse {
  uploadUrl: string
  publicUrl: string
  key: string
  error?: string
}

export interface UploadOptions {
  onProgress?: (percent: number) => void
}

export async function uploadViaPresign(
  file: File,
  opts: UploadOptions = {}
): Promise<{ url: string }> {
  const presignRes = await fetch('/api/admin/upload/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
    }),
  })

  const presigned = (await presignRes.json()) as PresignResponse
  if (!presignRes.ok || !presigned.uploadUrl) {
    throw new Error(presigned.error || `Presign failed (${presignRes.status})`)
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presigned.uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    if (opts.onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          opts.onProgress!(Math.round((e.loaded / e.total) * 100))
        }
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`R2 upload failed (${xhr.status}): ${xhr.responseText}`))
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.onabort = () => reject(new Error('Upload aborted'))
    xhr.send(file)
  })

  return { url: presigned.publicUrl }
}
