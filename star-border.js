// ============================================
// 钱多多 · StarBorder 包装（vanilla JS 版）
// 原组件来源：React Bits (https://reactbits.dev)
// 用途：把 .hero 4 元素（头像 + 标题 + 副标题 + tagline）包进带流动光边的卡片
// ============================================

// 调参（可改）
const SB_CONFIG = {
  color: 'magenta',         // 主色（径向渐变中心色）
  speed: '5s',              // 动画周期
  thickness: 4,             // 边框粗细（通过 container 上下 padding 体现，让 gradient 露出更多）
  marginTop: '5rem',        // 卡片与顶部 CardNav 的间距（远离一些）
  opacity: 1,               // 渐变层不透明度（提亮 magenta 流光）
};

function applyStarBorder() {
  const hero = document.querySelector('.hero');
  if (!hero) {
    console.warn('StarBorder: .hero not found');
    return;
  }
  // 防止重复挂载
  if (hero.classList.contains('star-border-container')) {
    console.log('StarBorder: already applied');
    return;
  }

  // 1) 把 hero 4 元素提取出来
  const kids = Array.from(hero.children);   // .hero-avatar / .hero-title / .hero-subtitle / .hero-tagline
  if (kids.length === 0) {
    console.warn('StarBorder: .hero has no children');
    return;
  }

  // 2) 创建 inner-content 容器，把 4 元素移进去
  const inner = document.createElement('div');
  inner.className = 'inner-content';
  kids.forEach(k => inner.appendChild(k));

  // 3) 创建上下两个流动渐变层
  const bottom = document.createElement('div');
  bottom.className = 'border-gradient-bottom';
  bottom.style.background = `radial-gradient(circle, ${SB_CONFIG.color}, transparent 30%)`;
  bottom.style.animationDuration = SB_CONFIG.speed;
  bottom.style.opacity = String(SB_CONFIG.opacity);

  const top = document.createElement('div');
  top.className = 'border-gradient-top';
  top.style.background = `radial-gradient(circle, ${SB_CONFIG.color}, transparent 30%)`;
  top.style.animationDuration = SB_CONFIG.speed;
  top.style.opacity = String(SB_CONFIG.opacity);

  // 4) 给 hero 加 class，把 3 个新元素按 z-index 顺序塞进去
  // 顺序很重要：border-gradient-bottom → border-gradient-top → inner-content
  hero.classList.add('star-border-container');
  hero.style.padding = `${SB_CONFIG.thickness}px 0`;  // 原组件 thickness 实现
  hero.style.marginTop = SB_CONFIG.marginTop;          // 往下推，远离 CardNav
  hero.appendChild(bottom);   // z-index: 0（最下）
  hero.appendChild(top);      // z-index: 0（与 bottom 同层，但 top: -12px 不重叠）
  hero.appendChild(inner);    // z-index: 1（最上）

  console.log(`🦐 StarBorder 已应用 · 颜色 ${SB_CONFIG.color} · speed ${SB_CONFIG.speed}`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyStarBorder);
} else {
  applyStarBorder();
}
