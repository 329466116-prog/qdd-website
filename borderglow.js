// ============================================
// 钱多多 · BorderGlow 卡片（vanilla JS 版）
// 原组件来源：React Bits (https://reactbits.dev)
// 翻译：React → vanilla JS（无依赖）
//
// 用法（HTML）：
// <div class="border-glow-card"
//      data-edge-sensitivity="30"
//      data-glow-color="200 80% 60%"
//      data-glow-radius="30"
//      data-glow-intensity="1.0"
//      data-cone-spread="25"
//      data-colors='["#7BB8FF","#38bdf8","#A6C8FF"]'>
//   <span class="edge-light"></span>
//   <div class="border-glow-inner">内容</div>
// </div>
// ============================================

// ============================================
// 工具函数（从 React 翻译）
// ============================================
function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

// 计算 glow CSS 变量
function applyGlowVars(card, glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  for (let i = 0; i < opacities.length; i++) {
    card.style.setProperty(
      `--glow-color${keys[i]}`,
      `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`
    );
  }
}

// 计算 mesh gradient CSS 变量
const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = [
  '--gradient-one', '--gradient-two', '--gradient-three',
  '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function applyGradientVars(card, colors) {
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    card.style.setProperty(
      GRADIENT_KEYS[i],
      `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`
    );
  }
  card.style.setProperty('--gradient-base', `linear-gradient(${colors[0]} 0 100%)`);
}

// ============================================
// 初始化单个卡片
// ============================================
function initBorderGlowCard(card) {
  // 读 data 属性（带默认值）
  const edgeSensitivity = parseFloat(card.dataset.edgeSensitivity || '30');
  const glowColor = card.dataset.glowColor || '200 80% 60%';
  const glowRadius = parseFloat(card.dataset.glowRadius || '30');
  const glowIntensity = parseFloat(card.dataset.glowIntensity || '1.0');
  const coneSpread = parseFloat(card.dataset.coneSpread || '25');
  const backgroundColor = card.dataset.backgroundColor || 'rgba(255,255,255,0.04)';

  // JSON 解析 colors（默认 3 蓝调）
  let colors;
  try {
    colors = JSON.parse(card.dataset.colors || '["#7BB8FF","#38bdf8","#A6C8FF"]');
  } catch {
    colors = ['#7BB8FF', '#38bdf8', '#A6C8FF'];
  }

  // 注入 CSS 变量
  card.style.setProperty('--card-bg', backgroundColor);
  card.style.setProperty('--edge-sensitivity', edgeSensitivity);
  card.style.setProperty('--border-radius', '20px');
  card.style.setProperty('--glow-padding', `${glowRadius}px`);
  card.style.setProperty('--cone-spread', coneSpread);
  card.style.setProperty('--fill-opacity', '0.5');

  applyGlowVars(card, glowColor, glowIntensity);
  applyGradientVars(card, colors);

  // pointermove handler
  const handlePointerMove = (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    // edge proximity
    let kx = Infinity, ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

    // cursor angle
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;

    card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
    card.style.setProperty('--cursor-angle', `${degrees.toFixed(3)}deg`);
  };

  card.addEventListener('pointermove', handlePointerMove);

  // 触摸设备 fallback：让边缘有微光（不然永远没效果）
  card.addEventListener('touchstart', () => {
    card.style.setProperty('--edge-proximity', '80');
  });
}

// ============================================
// DOM ready 后批量初始化
// ============================================
function initAllBorderGlow() {
  const cards = document.querySelectorAll('.border-glow-card');
  cards.forEach(initBorderGlowCard);
  if (cards.length > 0) {
    console.log(`🦐 BorderGlow 初始化 ${cards.length} 张卡片`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllBorderGlow);
} else {
  initAllBorderGlow();
}
