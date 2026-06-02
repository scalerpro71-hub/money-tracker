export function fmt(n) {
  return Number(n).toLocaleString('en-IN');
}

export function cur(n) {
  return '₹' + fmt(n);
}

export function fmtK(n) {
  const abs = Math.abs(n);
  if (abs >= 1e7) return (n / 1e7).toFixed(1).replace(/\.0$/, '') + ' Cr';
  if (abs >= 1e5) return (n / 1e5).toFixed(1).replace(/\.0$/, '') + ' L';
  if (abs >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return fmt(n);
}
