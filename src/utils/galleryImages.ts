// Bundles every image under src/assets/gallery via Vite. Using `query: '?url'`
// means only hashed URL strings ship in JS (not base64), so the bundle stays
// small AND images are guaranteed to be served (they live under /assets/... in
// the final build, which SPA rewrites always exclude).
const modules = import.meta.glob('/src/assets/gallery/**/*.{jpg,jpeg,png,JPG,JPEG,PNG,webp,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

// Build a lookup keyed by the legacy public path so callers can keep passing
// "/images/gallery/foo/bar.jpg" and get the hashed URL back.
const byPublicPath: Record<string, string> = {};
for (const [modPath, url] of Object.entries(modules)) {
  // modPath looks like "/src/assets/gallery/rooms/img (2).jpg"
  const legacy = modPath.replace('/src/assets/gallery', '/images/gallery');
  byPublicPath[legacy] = url;
}

export function resolveGalleryImage(path: string): string {
  if (!path) return path;
  // Already resolved (hashed asset, http url, data uri, etc.)
  if (path.startsWith('/assets/') || path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  return byPublicPath[path] ?? path;
}

export const galleryImagesMap = byPublicPath;
