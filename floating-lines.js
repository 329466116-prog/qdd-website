// ============================================
// 钱多多 · FloatingLines 背景效果（vanilla JS 版）
// 原组件来源：React Bits (https://reactbits.dev)
// 翻译：React + three.js ShaderMaterial → vanilla JS + three.js
// ============================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ============================================
// 调参区（你可以改这些值调效果）
// ============================================
const CONFIG = {
  // 颜色：3 stops 渐变（深蓝 → 灰蓝 → 中灰）
  linesGradient: ['#000eb9', '#94a3b8', '#6a6a6a'],

  // 波层：top / middle / bottom 可单独开关
  enabledWaves: ['top', 'middle', 'bottom'],

  // 每层线数（数字=所有层一样）
  lineCount: 8,
  // 每层线间距
  lineDistance: [8, 6, 4],

  // 鼠标交互（true 让线条随鼠标弯曲）
  interactive: true,
  bendRadius: 5.0,
  bendStrength: -0.5,
  mouseDamping: 0.05,

  // 视差
  parallax: true,
  parallaxStrength: 0.2,

  // 动画速度
  animationSpeed: 1.0,

  // 位置/旋转（不传则用 GLSL 默认值）
  topWavePosition: undefined,
  middleWavePosition: undefined,
  bottomWavePosition: { x: 2.0, y: -0.7, rotate: -1 },

  // 混合模式
  mixBlendMode: 'screen',
};

// ============================================
// GLSL 着色器（从 React 组件 1:1 复制）
// ============================================
const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE = vec3(47.0, 75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);

  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;

  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];

    gradientColor = mix(c1, c2, f);
  }

  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;

  float x_offset = offset;
  float x_movement = time * 0.1;
  float amp = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);

  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;
    }
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

// ============================================
// 工具函数
// ============================================
const MAX_GRADIENT_STOPS = 8;

function hexToVec3(hex) {
  let value = hex.trim();
  if (value.startsWith('#')) value = value.slice(1);

  let r = 255, g = 255, b = 255;

  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }

  return new THREE.Vector3(r / 255, g / 255, b / 255);
}

// 翻译 React 组件里的 getLineCount / getLineDistance
function getLineCount(waveType, lineCount, enabledWaves) {
  if (typeof lineCount === 'number') return lineCount;
  if (!enabledWaves.includes(waveType)) return 0;
  const index = enabledWaves.indexOf(waveType);
  return lineCount[index] ?? 6;
}

function getLineDistance(waveType, lineDistance, enabledWaves) {
  if (typeof lineDistance === 'number') return lineDistance;
  if (!enabledWaves.includes(waveType)) return 0.1;
  const index = enabledWaves.indexOf(waveType);
  return lineDistance[index] ?? 0.1;
}

// ============================================
// 初始化（翻译自 React useEffect setup）
// ============================================
function initFloatingLines() {
  const container = document.getElementById('floating-lines-bg');
  if (!container) {
    console.warn('FloatingLines: container #floating-lines-bg not found');
    return;
  }
  // 清掉旧 canvas（如果有）
  container.innerHTML = '';

  // 派生 lineCount / lineDistance
  const topLineCount = CONFIG.enabledWaves.includes('top') ? getLineCount('top', CONFIG.lineCount, CONFIG.enabledWaves) : 0;
  const middleLineCount = CONFIG.enabledWaves.includes('middle') ? getLineCount('middle', CONFIG.lineCount, CONFIG.enabledWaves) : 0;
  const bottomLineCount = CONFIG.enabledWaves.includes('bottom') ? getLineCount('bottom', CONFIG.lineCount, CONFIG.enabledWaves) : 0;

  const topLineDistance = CONFIG.enabledWaves.includes('top') ? getLineDistance('top', CONFIG.lineDistance, CONFIG.enabledWaves) * 0.01 : 0.01;
  const middleLineDistance = CONFIG.enabledWaves.includes('middle') ? getLineDistance('middle', CONFIG.lineDistance, CONFIG.enabledWaves) * 0.01 : 0.01;
  const bottomLineDistance = CONFIG.enabledWaves.includes('bottom') ? getLineDistance('bottom', CONFIG.lineDistance, CONFIG.enabledWaves) * 0.01 : 0.01;

  // === Scene / Camera / Renderer（照搬 React setup）===
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  // === Uniforms ===
  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(1, 1, 1) },
    animationSpeed: { value: CONFIG.animationSpeed },

    enableTop: { value: CONFIG.enabledWaves.includes('top') },
    enableMiddle: { value: CONFIG.enabledWaves.includes('middle') },
    enableBottom: { value: CONFIG.enabledWaves.includes('bottom') },

    topLineCount: { value: topLineCount },
    middleLineCount: { value: middleLineCount },
    bottomLineCount: { value: bottomLineCount },

    topLineDistance: { value: topLineDistance },
    middleLineDistance: { value: middleLineDistance },
    bottomLineDistance: { value: bottomLineDistance },

    topWavePosition: {
      value: new THREE.Vector3(
        CONFIG.topWavePosition?.x ?? 10.0,
        CONFIG.topWavePosition?.y ?? 0.5,
        CONFIG.topWavePosition?.rotate ?? -0.4
      )
    },
    middleWavePosition: {
      value: new THREE.Vector3(
        CONFIG.middleWavePosition?.x ?? 5.0,
        CONFIG.middleWavePosition?.y ?? 0.0,
        CONFIG.middleWavePosition?.rotate ?? 0.2
      )
    },
    bottomWavePosition: {
      value: new THREE.Vector3(
        CONFIG.bottomWavePosition?.x ?? 2.0,
        CONFIG.bottomWavePosition?.y ?? -0.7,
        CONFIG.bottomWavePosition?.rotate ?? 0.4
      )
    },

    iMouse: { value: new THREE.Vector2(-1000, -1000) },
    interactive: { value: CONFIG.interactive },
    bendRadius: { value: CONFIG.bendRadius },
    bendStrength: { value: CONFIG.bendStrength },
    bendInfluence: { value: 0 },

    parallax: { value: CONFIG.parallax },
    parallaxStrength: { value: CONFIG.parallaxStrength },
    parallaxOffset: { value: new THREE.Vector2(0, 0) },

    lineGradient: {
      value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new THREE.Vector3(1, 1, 1))
    },
    lineGradientCount: { value: 0 }
  };

  if (CONFIG.linesGradient && CONFIG.linesGradient.length > 0) {
    const stops = CONFIG.linesGradient.slice(0, MAX_GRADIENT_STOPS);
    uniforms.lineGradientCount.value = stops.length;
    stops.forEach((hex, i) => {
      const color = hexToVec3(hex);
      uniforms.lineGradient.value[i].set(color.x, color.y, color.z);
    });
  }

  // === Material / Geometry / Mesh ===
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // === Clock ===
  const clock = new THREE.Clock();

  // === Refs 翻译为 vanilla refs ===
  const targetMouse = new THREE.Vector2(-1000, -1000);
  const currentMouse = new THREE.Vector2(-1000, -1000);
  let targetInfluence = 0;
  let currentInfluence = 0;
  const targetParallax = new THREE.Vector2(0, 0);
  const currentParallax = new THREE.Vector2(0, 0);

  // === Resize ===
  function setSize() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setSize(width, height, false);
    const canvasWidth = renderer.domElement.width;
    const canvasHeight = renderer.domElement.height;
    uniforms.iResolution.value.set(canvasWidth, canvasHeight, 1);
  }
  setSize();

  let ro = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => setSize());
    ro.observe(container);
  } else {
    window.addEventListener('resize', setSize);
  }

  // === 鼠标交互（挂在 window 上，绕过容器 pointer-events: none） ===
  function handlePointerMove(event) {
    // canvas 是 fixed 100vw/100vh，viewport 坐标 = canvas 内坐标
    const x = event.clientX;
    const y = event.clientY;
    const dpr = renderer.getPixelRatio();
    const w = window.innerWidth;
    const h = window.innerHeight;
    targetMouse.set(x * dpr, (h - y) * dpr);
    targetInfluence = 1.0;
    if (CONFIG.parallax) {
      const centerX = w / 2;
      const centerY = h / 2;
      const offsetX = (x - centerX) / w;
      const offsetY = -(y - centerY) / h;
      targetParallax.set(offsetX * CONFIG.parallaxStrength, offsetY * CONFIG.parallaxStrength);
    }
  }

  function handlePointerLeave() {
    targetInfluence = 0.0;
  }

  if (CONFIG.interactive) {
    // 挂到 window 而非 canvas：容器 #floating-lines-bg 有 pointer-events: none，
    // 真人鼠标事件传不到 canvas；window 能稳定接收。
    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerleave', handlePointerLeave);
  }

  // === Render loop ===
  let raf = 0;
  function renderLoop() {
    uniforms.iTime.value = clock.getElapsedTime();

    if (CONFIG.interactive) {
      currentMouse.lerp(targetMouse, CONFIG.mouseDamping);
      uniforms.iMouse.value.copy(currentMouse);

      currentInfluence += (targetInfluence - currentInfluence) * CONFIG.mouseDamping;
      uniforms.bendInfluence.value = currentInfluence;
    }

    if (CONFIG.parallax) {
      currentParallax.lerp(targetParallax, CONFIG.mouseDamping);
      uniforms.parallaxOffset.value.copy(currentParallax);
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(renderLoop);
  }
  renderLoop();

  console.log('🦐 FloatingLines 背景已加载 · 颜色 #0016ff · Powered by three.js + WebGL');
}

// DOM ready 后启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFloatingLines);
} else {
  initFloatingLines();
}
