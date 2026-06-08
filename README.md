# 钱多多 · 个人主页

> Hello, world. 这是我用 AI 工具搭建的第一个个人站 demo。

## 🎨 设计风格

- **风格 A · 清冷蓝**：主色 `#1e88e5`（国网蓝）
- 浅色背景 + 卡片式布局 + 滚动入场动画
- 响应式：手机/平板/电脑都好看

## 📁 文件结构

```
qdd-website/
├── index.html      # 主页内容
├── style.css       # 样式（清冷蓝·暗色版）
├── lightfall.js    # Lightfall WebGL 背景（vanilla JS 版）
├── lightfall.css   # 背景容器样式
├── script.js       # 滚动动画
├── README.md       # 本文件
└── .gitignore
```

零依赖、零构建，纯静态 HTML。

## 🖥️ 本地预览

**方法 1：直接打开**

```bash
open index.html
```

**方法 2：起个本地服务（推荐，模拟线上）**

```bash
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## ☁️ Cloudflare Pages 托管（详细步骤）

1. 登录 https://dash.cloudflare.com/
2. 左侧菜单点击 **Workers & Pages** → **Create application** → **Pages** 标签
3. 选择 **Connect to Git**
4. 授权 Cloudflare 访问你的 GitHub 账号（如果第一次）
5. 选 **GitHub** → 找到 `qdd-website` 仓库 → 点击 **Begin setup**
6. 项目设置：
   - **Project name**: `qdd-website`（这个会决定你的域名是 `qdd-website.pages.dev`）
   - **Production branch**: `main`
   - **Build command**: 留空
   - **Build output directory**: 留空（默认就是项目根）
7. 点击 **Save and Deploy**
8. 等 1-2 分钟，Cloudflare 部署完成，会跳转到项目页面
9. 在项目页面可以找到你的访问地址：`https://qdd-website.pages.dev`

**之后**：每次 `git push` 到 main 分支，Cloudflare 会自动重新部署，不用手动操作。

## ✏️ 自定义内容

### 改 Lightfall 背景效果

编辑 `lightfall.js` 顶部的 `CONFIG` 对象：

```js
const CONFIG = {
  colors: ['#A6C8FF', '#1e88e5', '#1565c0', '#7BB8FF'],  // 4 个颜色
  backgroundColor: '#0a1929',
  speed: 0.5,                  // 0-2
  streakCount: 4,              // 1-16
  glow: 1,
  density: 0.6,
  twinkle: 0.8,
  zoom: 3,
  mouseInteraction: true,      // false 关闭鼠标跟随
};
```

### 改文字

直接编辑 `index.html`：
- `<h1 class="hero-title">` 改大标题
- About / Skills / Now 三个 section 改对应段落

### 改主色

编辑 `style.css` 顶部的 `:root` 变量：

```css
:root {
    --primary: #7BB8FF;        /* 主色：改这一行全站颜色跟着变 */
    --primary-dark: #1e88e5;
    --bg: #0a1929;             /* 背景色 */
    /* ... */
}
```

### 加新 section

复制现有的 `<section class="card">...</section>` 块，粘到对应位置，改改文字即可。

## 🔄 更新部署

```bash
cd /Volumes/driver/opdir/projects/qdd-website
# 改完文件后
git add .
git commit -m "update: xxx"
git push
# Cloudflare 几秒后自动部署
```

## 🛠️ 技术栈

- HTML5
- CSS3（CSS Variables / Flexbox / 动画 / 媒体查询 / backdrop-filter 毛玻璃）
- 原生 JavaScript（IntersectionObserver API + WebGL via ogl）
- **ogl 1.0.11**（WebGL 工具库，从 jsdelivr CDN ES module 加载）
- **Lightfall 组件**（来自 [React Bits](https://reactbits.dev) 的开源 WebGL 背景效果）
- 无任何构建步骤

## 📝 后续计划

- [ ] 添加更多内容（项目展示 / 博客 / 时间线）
- [ ] 自定义域名
- [ ] SEO 优化
- [ ] L2 互动：暗色模式切换（或者颜色主题切换）
- [ ] L3 酷炫：加 3D 头像 / GSAP 滚动动画

---

🦐 Built with AI · 2026
