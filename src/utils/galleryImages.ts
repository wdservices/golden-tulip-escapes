// Bundle every gallery image at build time so they ship inside dist/assets
// and never depend on the hosting server serving /images/gallery/* files.
// Vite hashes the filenames and guarantees they exist in the deployed build.
const bundled = import.meta.glob(
  "../assets/gallery/**/*.{jpg,JPG,jpeg,png,webp}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

// Build a lookup keyed by the public-style path "/images/gallery/<sub>/<file>"
// so existing code that uses those paths keeps working unchanged.
const byPublicPath: Record<string, string> = {};
for (const [absPath, url] of Object.entries(bundled)) {
  const idx = absPath.indexOf("/assets/gallery/");
  if (idx === -1) continue;
  const rel = absPath.slice(idx + "/assets/gallery/".length); // e.g. "rooms/img (2).jpg"
  byPublicPath[`/images/gallery/${rel}`] = url;
}

/**
 * Resolve a gallery image path to its bundled URL.
 * Accepts the legacy "/images/gallery/..." paths used throughout the app.
 * Falls back to the input path if no bundled asset is found.
 */
export function resolveGalleryImage(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return byPublicPath[path] ?? path;
}

export const galleryImageMap = byPublicPath;
