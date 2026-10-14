import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'photos');
fs.mkdirSync(outDir, { recursive: true });

// Create a music directory too
const musicDir = path.resolve('public', 'music');
fs.mkdirSync(musicDir, { recursive: true });

// A minimal valid 1x1 or styled SVG-as-data/image generator
const quotes = [
  "Một trong những ngày anh thấy thật hạnh phúc",
  "Cảm ơn em vì đã xuất hiện",
  "Bình thường thôi, nhưng vì có em nên thật đặc biệt",
  "Mong rằng chúng mình sẽ còn thật nhiều bức ảnh như thế này",
  "Nắm tay em đi qua mọi cung đường",
  "Nụ cười của em là ánh sáng của anh",
  "Chỉ cần có em bên cạnh",
  "Khoảnh khắc bình yên nhất",
  "Dưới bầu trời đêm đầy sao",
  "Điều ngọt ngào nhất thế gian",
  "Mỗi chuyến đi đều là một kỷ niệm",
  "Hành trình của chúng mình"
];

const colors = [
  ['#FFE4E6', '#FECDD3', '#F43F5E'],
  ['#FFF1F2', '#FBCFE8', '#E11D48'],
  ['#FEF3C7', '#FDE68A', '#D97706'],
  ['#FCE7F3', '#FBCFE8', '#DB2777'],
  ['#FFF7ED', '#FED7AA', '#EA580C'],
  ['#FDF2F8', '#FCE7F3', '#BE185D'],
  ['#FFFBEB', '#FEF3C7', '#B45309'],
  ['#FFE4E6', '#FDA4AF', '#E11D48'],
  ['#F5F3FF', '#DDD6FE', '#7C3AED'],
  ['#FFF1F2', '#FECDD3', '#F43F5E'],
  ['#FFFBEB', '#FDE68A', '#D97706'],
  ['#FDF2F8', '#FBCFE8', '#BE185D']
];

for (let i = 1; i <= 12; i++) {
  const numStr = String(i).padStart(2, '0');
  const quote = quotes[i - 1];
  const [c1, c2, cAccent] = colors[i - 1];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="grad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="50%" stop-color="${c2}" />
      <stop offset="100%" stop-color="${c1}" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
  </defs>
  
  <rect width="800" height="600" fill="url(#grad${i})" />
  
  <!-- Subtle decorative patterns -->
  <circle cx="120" cy="100" r="80" fill="${c2}" opacity="0.4" />
  <circle cx="680" cy="500" r="120" fill="${c2}" opacity="0.4" />
  <circle cx="700" cy="120" r="40" fill="${cAccent}" opacity="0.1" />
  
  <!-- Center Frame -->
  <rect x="150" y="100" width="500" height="400" rx="24" fill="#ffffff" opacity="0.85" filter="url(#shadow)" />
  
  <!-- Heart Icon -->
  <g transform="translate(370, 200) scale(2.5)">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${cAccent}"/>
  </g>
  
  <!-- Text -->
  <text x="400" y="320" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#374151" text-anchor="middle">Kỷ Niệm #${numStr}</text>
  <text x="400" y="370" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" fill="#6B7280" text-anchor="middle">"${quote}"</text>
  <text x="400" y="440" font-family="monospace" font-size="14" fill="#9CA3AF" text-anchor="middle">Thay thế bằng ảnh thật của hai bạn</text>
</svg>`;

  fs.writeFileSync(path.join(outDir, `memory-${numStr}.jpg`), svg);
  fs.writeFileSync(path.join(outDir, `memory-${numStr}.svg`), svg);
}

// Cover photo
const coverSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE4E6" />
      <stop offset="50%" stop-color="#FDF2F8" />
      <stop offset="100%" stop-color="#FEF3C7" />
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#coverGrad)" />
  <circle cx="600" cy="400" r="180" fill="#ffffff" opacity="0.8" />
  <text x="600" y="380" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#881337" text-anchor="middle">Chúc Mừng Sinh Nhật Em Yêu</text>
  <text x="600" y="440" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" fill="#9F1239" text-anchor="middle">21.10.2026</text>
</svg>`;
fs.writeFileSync(path.join(outDir, `cover.jpg`), coverSvg);

console.log('Successfully generated photo placeholders in /public/photos');
