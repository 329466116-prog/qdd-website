// ============================================
// 钱多多 · ElectricBorder 头像（vanilla JS 版）
// 原组件来源：React Bits (https://reactbits.dev)
// CREDIT: @BalintFerenczy on X (https://codepen.io/BalintFerenczy/pen/KwdoyEN)
// 翻译：React + useRef/useEffect/Canvas 2D → vanilla DOM + Canvas 2D
// ============================================

// 调参（可改）
const EB_CONFIG = {
  color: '#7df9ff',        // 主色（青色，跟绿色头像 + 蓝背景形成冷色系科技感）
  speed: 1,                // 动画速度倍率
  chaos: 0.12,             // 扭曲强度（0=无扭曲，越大越乱）
  borderRadius: 50,        // 圆角（50% 圆形，50px 也行）
  thickness: 2,            // 厚度（影响 glow 层边框粗细）
  imagePath: 'img/head.png', // 头像图片路径
};

function applyElectricBorder() {
  const target = document.querySelector('.hero-avatar');
  if (!target) {
    console.warn('ElectricBorder: .hero-avatar not found');
    return;
  }
  if (target.dataset.ebApplied === 'true') {
    console.log('ElectricBorder: already applied');
    return;
  }
  target.dataset.ebApplied = 'true';

  // 清空原内容（"Q" 文字）
  target.innerHTML = '';
  target.classList.remove('hero-avatar');  // 移除原 blue 圆形样式
  target.style.padding = '0';
  target.style.background = 'transparent';
  target.style.boxShadow = 'none';
  target.style.display = 'inline-block';
  target.style.verticalAlign = 'top';

  // === 构建 DOM 结构（1:1 翻译 React 组件）===
  const root = document.createElement('div');
  root.className = 'electric-border';
  root.style.setProperty('--electric-border-color', EB_CONFIG.color);
  root.style.borderRadius = `${EB_CONFIG.borderRadius}%`;

  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'eb-canvas-container';

  const canvas = document.createElement('canvas');
  canvas.className = 'eb-canvas';

  const layers = document.createElement('div');
  layers.className = 'eb-layers';
  ['eb-glow-1', 'eb-glow-2', 'eb-background-glow'].forEach(cls => {
    const d = document.createElement('div');
    d.className = cls;
    layers.appendChild(d);
  });

  const content = document.createElement('div');
  content.className = 'eb-content';

  const img = document.createElement('img');
  img.className = 'eb-avatar-img';
  img.src = EB_CONFIG.imagePath;
  img.alt = '钱多多头像';
  content.appendChild(img);

  canvasContainer.appendChild(canvas);
  root.appendChild(canvasContainer);
  root.appendChild(layers);
  root.appendChild(content);
  target.appendChild(root);

  // === 启动 Canvas 描边动画（1:1 翻译 useEffect）===
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('ElectricBorder: canvas 2d context not available');
    return;
  }

  // Noise functions
  const random = x => (Math.sin(x * 12.9898) * 43758.5453) % 1;

  const noise2D = (x, y) => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const a = random(i + j * 57);
    const b = random(i + 1 + j * 57);
    const c = random(i + (j + 1) * 57);
    const d = random(i + 1 + (j + 1) * 57);
    const ux = fx * fx * (3.0 - 2.0 * fx);
    const uy = fy * fy * (3.0 - 2.0 * fy);
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
  };

  const octavedNoise = (x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time, seed, baseFlatness) => {
    let y = 0;
    let amplitude = baseAmplitude;
    let frequency = baseFrequency;
    for (let i = 0; i < octaves; i++) {
      let octaveAmplitude = amplitude;
      if (i === 0) octaveAmplitude *= baseFlatness;
      y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
      frequency *= lacunarity;
      amplitude *= gain;
    }
    return y;
  };

  const getCornerPoint = (centerX, centerY, radius, startAngle, arcLength, progress) => {
    const angle = startAngle + progress * arcLength;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const getRoundedRectPoint = (t, left, top, width, height, radius) => {
    const straightWidth = width - 2 * radius;
    const straightHeight = height - 2 * radius;
    const cornerArc = (Math.PI * radius) / 2;
    const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
    const distance = t * totalPerimeter;
    let accumulated = 0;

    // Top edge
    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth;
      return { x: left + radius + progress * straightWidth, y: top };
    }
    accumulated += straightWidth;

    // Top-right corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    // Right edge
    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight;
      return { x: left + width, y: top + radius + progress * straightHeight };
    }
    accumulated += straightHeight;

    // Bottom-right corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    // Bottom edge
    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth;
      return { x: left + width - radius - progress * straightWidth, y: top + height };
    }
    accumulated += straightWidth;

    // Bottom-left corner
    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    // Left edge
    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight;
      return { x: left, y: top + height - radius - progress * straightHeight };
    }
    accumulated += straightHeight;

    // Top-left corner
    const progress = (distance - accumulated) / cornerArc;
    return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
  };

  // Configuration (from React useEffect)
  const octaves = 10;
  const lacunarity = 1.6;
  const gain = 0.7;
  const amplitude = EB_CONFIG.chaos;
  const frequency = 10;
  const baseFlatness = 0;
  const displacement = 60;
  const borderOffset = 60;

  let width = 100, height = 100;
  let lastDpr = Math.min(window.devicePixelRatio || 1, 2);

  const updateSize = () => {
    const rect = root.getBoundingClientRect();
    const w = rect.width + borderOffset * 2;
    const h = rect.height + borderOffset * 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);
    return { w, h };
  };

  let size = updateSize();
  width = size.w;
  height = size.h;

  let timeRef = 0;
  let lastFrameTimeRef = performance.now();
  let raf = 0;

  const drawElectricBorder = (currentTime) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (dpr !== lastDpr) {
      lastDpr = dpr;
      const newSize = updateSize();
      width = newSize.w;
      height = newSize.h;
    }
    const deltaTime = (currentTime - lastFrameTimeRef) / 1000;
    timeRef += deltaTime * EB_CONFIG.speed;
    lastFrameTimeRef = currentTime;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = EB_CONFIG.color;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const scale = displacement;
    const left = borderOffset;
    const top = borderOffset;
    const borderWidth = width - 2 * borderOffset;
    const borderHeight = height - 2 * borderOffset;
    const maxRadius = Math.min(borderWidth, borderHeight) / 2;
    const radius = Math.min(EB_CONFIG.borderRadius, maxRadius);

    const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
    const sampleCount = Math.floor(approximatePerimeter / 2);

    ctx.beginPath();
    for (let i = 0; i <= sampleCount; i++) {
      const progress = i / sampleCount;
      const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);
      const xNoise = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, frequency, timeRef, 0, baseFlatness);
      const yNoise = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, frequency, timeRef, 1, baseFlatness);
      const displacedX = point.x + xNoise * scale;
      const displacedY = point.y + yNoise * scale;
      if (i === 0) ctx.moveTo(displacedX, displacedY);
      else ctx.lineTo(displacedX, displacedY);
    }
    ctx.closePath();
    ctx.stroke();

    raf = requestAnimationFrame(drawElectricBorder);
  };
  raf = requestAnimationFrame(drawElectricBorder);

  // Resize handling
  const ro = new ResizeObserver(() => {
    const newSize = updateSize();
    width = newSize.w;
    height = newSize.h;
  });
  ro.observe(root);

  console.log(`🦐 ElectricBorder 已挂载 · 颜色 ${EB_CONFIG.color} · speed ${EB_CONFIG.speed} · chaos ${EB_CONFIG.chaos}`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyElectricBorder);
} else {
  applyElectricBorder();
}
