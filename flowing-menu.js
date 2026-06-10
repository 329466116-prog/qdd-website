// ============================================
// 钱多多 · FlowingMenu 组件（React.createElement 翻译版）
// 原组件来源：React Bits (https://reactbits.dev)
// 翻译：JSX → React.createElement；CDN 复用 card-nav 已加载的 React 18 + GSAP 3.12
// ============================================

const { useRef, useEffect, useState } = React;

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#120F17',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#120F17',
  borderColor = '#fff'
}) {
  return React.createElement('div', {
    className: 'menu-wrap',
    style: { backgroundColor: bgColor }
  },
    React.createElement('nav', { className: 'menu' },
      items.map((item, idx) =>
        React.createElement(MenuItem, {
          key: idx,
          link: item.link,
          text: item.text,
          image: item.image,
          speed: speed,
          textColor: textColor,
          marqueeBgColor: marqueeBgColor,
          marqueeTextColor: marqueeTextColor,
          borderColor: borderColor
        })
      )
    )
  );
}

function MenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const linkRef = useRef(null);  // 静态文字 <a> 的 ref，hover 时隐藏
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const distMetric = (x, y, x2, y2) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  // 计算 marquee 复制次数（铺满视口宽度 + 2 份冗余）
  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };
    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text, image]);

  // marquee 无限循环动画
  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;
      if (animationRef.current) animationRef.current.kill();
      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1
      });
    };
    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) animationRef.current.kill();
    };
  }, [text, image, repetitions, speed]);

  // hover：判断从 top/bottom 进入，pan 整条 marquee 盖住，同时隐藏静态文字
  const handleMouseEnter = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);
    const tl = gsap.timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
    if (linkRef.current) tl.to(linkRef.current, { opacity: 0 }, 0);
  };

  // leave：pan 出，静态文字渐回
  const handleMouseLeave = ev => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);
    const tl = gsap.timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
    if (linkRef.current) tl.to(linkRef.current, { opacity: 1 }, 0);
  };

  return React.createElement('div', {
    className: 'menu__item',
    ref: itemRef,
    id: link && link.startsWith('#') ? link.slice(1) : undefined,  // 给 CardNav anchor 跳转用（#about → id="about"）
    style: { borderColor: borderColor }
  },
    React.createElement('a', {
      className: 'menu__item-link',
      ref: linkRef,  // hover 时隐藏这个静态文字
      href: link,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      style: { color: textColor }
    }, text),
    React.createElement('div', {
      className: 'marquee',
      ref: marqueeRef,
      style: { backgroundColor: marqueeBgColor }
    },
      React.createElement('div', { className: 'marquee__inner-wrap' },
        React.createElement('div', {
          className: 'marquee__inner',
          ref: marqueeInnerRef,
          'aria-hidden': 'true'
        },
          [...Array(repetitions)].map((_, idx) =>
            React.createElement('div', {
              className: 'marquee__part',
              key: idx,
              style: { color: marqueeTextColor }
            },
              React.createElement('span', null, text),
              React.createElement('div', {
                className: 'marquee__img',
                style: { backgroundImage: `url(${image})` }
              })
            )
          )
        )
      )
    )
  );
}

// ============================================
// 4 个 items（基于原 BorderGlow 卡片内容浓缩）
// 链接 #about / #skills / #now / #hobbies 跟 CardNav 对齐
// ============================================
const FLOWING_ITEMS = [
  {
    link: '#about',
    text: '关于我 · 电力 AI 工程师',
    image: 'https://s3.bmp.ovh/2026/06/10/JMh81OlW.jpg'
  },
  {
    link: '#skills',
    text: '核心技能 · AI 工具 + 数据分析',
    image: 'https://s3.bmp.ovh/2026/06/10/O9H5fVs3.jpg'
  },
  {
    link: '#now',
    text: '最近在玩 · AI Agent + 自动化',
    image: 'https://s3.bmp.ovh/2026/06/10/T0eiyMrq.jpg'
  },
  {
    link: '#hobbies',
    text: '兴趣爱好 · 美食 + 折腾 AI',
    image: 'https://s3.bmp.ovh/2026/06/10/eum5uZbY.jpg'
  }
];

// 颜色：配 FloatingLines #0016ff 蓝调
const FLOWING_PROPS = {
  items: FLOWING_ITEMS,
  speed: 18,
  textColor: '#ffffff',
  bgColor: 'transparent',         // 透明底，FloatingLines 透出来
  marqueeBgColor: 'transparent',   // hover 整条透出 FloatingLines 背景
  marqueeTextColor: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.12)'
};

function mount() {
  const root = document.getElementById('flowing-menu-root');
  if (!root) {
    console.error('FlowingMenu: #flowing-menu-root not found');
    return;
  }
  // 容器高度（在 CSS .flowing-menu-container 写死 500px）
  ReactDOM.createRoot(root).render(
    React.createElement(FlowingMenu, FLOWING_PROPS)
  );
  console.log('🦐 FlowingMenu 已挂载 · 4 items · hover pan + marquee 滚动');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
