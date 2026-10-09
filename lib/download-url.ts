/**
 * A link that downloads the file in one click. Supabase Storage serves its files as an
 * attachment when the URL carries `download`, which works in email clients too (where the
 * HTML `download` attribute is ignored). Other URLs are returned unchanged.
 */
export function downloadUrl(url: string, fileName?: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.includes('/storage/v1/object/')) return url;
    const original = parsed.pathname.split('/').pop() ?? '';
    const extension = original.includes('.') ? original.slice(original.lastIndexOf('.')) : '';
    // Keep the image's extension so phones open the download as a photo.
    parsed.searchParams.set('download', fileName ? `${fileName.replace(/[^\w.-]+/g, '-')}${extension}` : original);
    return parsed.toString();
  } catch {
    return url;
  }
}
