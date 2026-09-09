/**
 * WebGL capability detection for the 2D fallback path.
 *
 * Runs once and caches: creating a probe context is not free, and jsdom (our
 * test environment) has no WebGL at all, so this must degrade rather than throw.
 */
let cached: boolean | null = null;

export function isWebGLAvailable(): boolean {
  if (cached !== null) return cached;
  if (typeof document === 'undefined') {
    cached = false;
    return cached;
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    cached = gl !== null;
  } catch {
    cached = false;
  }
  return cached;
}

/** Test seam — lets tests force either branch. */
export function __setWebGLAvailable(value: boolean | null): void {
  cached = value;
}
