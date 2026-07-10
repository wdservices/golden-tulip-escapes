// Images live in public/images/gallery/ and are served directly by Vite / the
// production web-server.  This module simply passes the path through unchanged.
export function resolveGalleryImage(path: string): string {
  return path;
}

export const galleryImagesMap: Record<string, string> = {};
