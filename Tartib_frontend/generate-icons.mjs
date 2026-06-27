import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.156;

  // Background
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(1, '#818cf8');
  ctx.fillStyle = grad;
  ctx.fill();

  // Letter T
  ctx.fillStyle = 'white';
  ctx.font = `900 ${size * 0.58}px Arial Black`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T', size / 2, size * 0.54);

  return canvas.toBuffer('image/png');
}

writeFileSync('public/icon-192.png', createIcon(192));
writeFileSync('public/icon-512.png', createIcon(512));
writeFileSync('public/apple-touch-icon.png', createIcon(180));
console.log('Icons created!');
