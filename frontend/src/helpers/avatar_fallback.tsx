function fnv1a(num: number) {
  const arr = new Uint8Array([
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    (num >>> 0) & 0xff,
  ]);

  let hash = 2166136261n;
  for (const byte of arr) {
    hash = hash ^ BigInt(byte);
    hash = BigInt.asUintN(32, hash * 16777619n);
  }
  return Number(hash);
}

function getColorPair(num: number) {
  const hash = fnv1a(num);
  const mainHue = 30 + (hash % 6) * 60;
  const secHue = (hash % 61) - 30;
  const hue = mainHue + secHue;
  return [`hsl(${hue - 5}, 80%, 20%)`, `hsl(${hue + 5}, 35%, 60%)`];
}

function avatarFallback(opts: { seed: number; label: string }) {
  const { seed, label } = opts;
  const [textColor, bgColor] = getColorPair(seed);
  const cap_label = label.toUpperCase().slice(0, 2);
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text font-family="Arial, Helvetica, sans-serif" x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-weight="bold" fill="${textColor}">${cap_label}</text>
  </svg>`;
}

export default avatarFallback;
