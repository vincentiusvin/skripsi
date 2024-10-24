function getColorPair(num: number) {
  const limit = 360;
  let hue: number;
  if (num * 2 < limit) {
    hue = (num * num) % limit;
  } else {
    hue = limit - ((num * num) % limit);
  }

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
