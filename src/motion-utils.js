export function dampMotion(current, target, smoothing = 6, deltaSeconds = 1 / 60) {
  const from = Number.isFinite(current) ? current : 0;
  const to = Number.isFinite(target) ? target : from;
  const rate = Number.isFinite(smoothing) ? Math.max(0, smoothing) : 0;
  const rawDelta = Number.isFinite(deltaSeconds) ? deltaSeconds : 0;
  const delta = Math.min(Math.max(rawDelta, 0), 0.033);

  if (rate === 0 || delta === 0) return from;

  const blend = 1 - Math.exp(-rate * delta);
  return from + (to - from) * blend;
}

export function getScrollProgress(scrollY, viewportHeight, scrollHeight) {
  const pageHeight = Number.isFinite(scrollHeight) ? Math.max(0, scrollHeight) : 0;
  const viewport = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0;
  const scrollRange = pageHeight - viewport;

  if (scrollRange <= 0) return 0;

  const position = Number.isFinite(scrollY) ? scrollY : 0;
  return Math.min(1, Math.max(0, position / scrollRange));
}
