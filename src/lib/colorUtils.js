export function hexWithAlpha(hex, alphaHex) {
  if (!hex) return 'transparent';
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = (parseInt(alphaHex, 16) / 255).toFixed(2);
  return `rgba(${r},${g},${b},${a})`;
}
