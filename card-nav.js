/* ============================================
   CardNav 组件（React + GSAP）
   来自 React Bits，改为 React.createElement 写法
   无需 Babel，直接在浏览器跑
   ============================================ */

(function () {
  'use strict'

  // 等待 React/ReactDOM/GSAP 加载
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined' || typeof gsap === 'undefined') {
    console.error('[CardNav] 依赖未加载：需要 React / ReactDOM / GSAP')
    return
  }

  const { useState, useLayoutEffect, useRef } = React
  const { createRoot } = ReactDOM
  const h = React.createElement

  // 右上箭头 inline SVG（替代 react-icons/go/GoArrowUpRight）
  function ArrowIcon() {
    return h(
      'svg',
      {
        className: 'nav-card-link-icon',
        'aria-hidden': 'true',
        width: 16,
        height: 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      h('path', { d: 'M7 17 L17 7' }),
      h('path', { d: 'M7 7 H17 V17' })
    )
  }

  function CardNav(props) {
    const {
      logo,
      logoAlt = 'Logo',
      items,
      className = '',
      ease = 'power3.out',
      baseColor = '#fff',
      menuColor,
      buttonBgColor,
      buttonTextColor,
    } = props

    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const navRef = useRef(null)
    const cardsRef = useRef([])
    const tlRef = useRef(null)

    const calculateHeight = () => {
      const navEl = navRef.current
      if (!navEl) return 260

      const isMobile = window.matchMedia('(max-width: 768px)').matches
      if (isMobile) {
        const contentEl = navEl.querySelector('.card-nav-content')
        if (contentEl) {
          const wasVisible = contentEl.style.visibility
          const wasPointerEvents = contentEl.style.pointerEvents
          const wasPosition = contentEl.style.position
          const wasHeight = contentEl.style.height

          contentEl.style.visibility = 'visible'
          contentEl.style.pointerEvents = 'auto'
          contentEl.style.position = 'static'
          contentEl.style.height = 'auto'

          void contentEl.offsetHeight

          const topBar = 60
          const padding = 16
          const contentHeight = contentEl.scrollHeight

          contentEl.style.visibility = wasVisible
          contentEl.style.pointerEvents = wasPointerEvents
          contentEl.style.position = wasPosition
          contentEl.style.height = wasHeight

          return topBar + contentHeight + padding
        }
      }
      return 260
    }

    const createTimeline = () => {
      const navEl = navRef.current
      if (!navEl) return null

      gsap.set(navEl, { height: 60, overflow: 'hidden' })
      gsap.set(cardsRef.current, { y: 50, opacity: 0 })

      const tl = gsap.timeline({ paused: true })

      tl.to(navEl, {
        height: calculateHeight,
        duration: 0.4,
        ease: ease,
      })

      tl.to(
        cardsRef.current,
        { y: 0, opacity: 1, duration: 0.4, ease: ease, stagger: 0.08 },
        '-=0.1'
      )

      return tl
    }

    useLayoutEffect(() => {
      const tl = createTimeline()
      tlRef.current = tl
      return () => {
        if (tl) tl.kill()
        tlRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ease, items])

    useLayoutEffect(() => {
      const handleResize = () => {
        if (!tlRef.current) return
        if (isExpanded) {
          const newHeight = calculateHeight()
          gsap.set(navRef.current, { height: newHeight })
          tlRef.current.kill()
          const newTl = createTimeline()
          if (newTl) {
            newTl.progress(1)
            tlRef.current = newTl
          }
        } else {
          tlRef.current.kill()
          const newTl = createTimeline()
          if (newTl) {
            newTl.progress(1)
            tlRef.current = newTl
          }
        }
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded])

    const toggleMenu = () => {
      const tl = tlRef.current
      if (!tl) return
      if (!isExpanded) {
        setIsHamburgerOpen(true)
        setIsExpanded(true)
        tl.play(0)
      } else {
        setIsHamburgerOpen(false)
        tl.eventCallback('onReverseComplete', () => setIsExpanded(false))
        tl.reverse()
      }
    }

    const setCardRef = (i) => (el) => {
      if (el) cardsRef.current[i] = el
    }

    return h(
      'div',
      { className: `card-nav-container ${className}` },
      h(
        'nav',
        {
          ref: navRef,
          className: `card-nav ${isExpanded ? 'open' : ''}`,
          style: { backgroundColor: baseColor },
        },
        // 顶栏
        h(
          'div',
          { className: 'card-nav-top' },
          // 汉堡按钮
          h(
            'div',
            {
              className: `hamburger-menu ${isHamburgerOpen ? 'open' : ''}`,
              onClick: toggleMenu,
              role: 'button',
              'aria-label': isExpanded ? 'Close menu' : 'Open menu',
              tabIndex: 0,
              style: { color: menuColor || '#000' },
            },
            h('div', { className: 'hamburger-line' }),
            h('div', { className: 'hamburger-line' })
          ),
          // Logo
          h(
            'div',
            { className: 'logo-container' },
            h('img', { src: logo, alt: logoAlt, className: 'logo' })
          ),
          // CTA
          h(
            'button',
            {
              type: 'button',
              className: 'card-nav-cta-button',
              style: { backgroundColor: buttonBgColor, color: buttonTextColor },
              onClick: () => {
                // 跳到 prisma-studio
                window.open('https://prisma-studio.pages.dev', '_blank')
              },
            },
            'Prisma 工作室'
          )
        ),
        // 卡片内容
        h(
          'div',
          { className: 'card-nav-content', 'aria-hidden': !isExpanded },
          (items || []).slice(0, 3).map((item, idx) =>
            h(
              'div',
              {
                key: `${item.label}-${idx}`,
                className: 'nav-card',
                ref: setCardRef(idx),
                style: { backgroundColor: item.bgColor, color: item.textColor },
              },
              h('div', { className: 'nav-card-label' }, item.label),
              h(
                'div',
                { className: 'nav-card-links' },
                (item.links || []).map((lnk, i) =>
                  h(
                    'a',
                    {
                      key: `${lnk.label}-${i}`,
                      className: 'nav-card-link',
                      href: lnk.href,
                      'aria-label': lnk.ariaLabel || lnk.label,
                      onClick: () => {
                        // 展开后点击链接，关闭菜单
                        if (isExpanded) toggleMenu()
                      },
                    },
                    h(ArrowIcon),
                    lnk.label
                  )
                )
              )
            )
          )
        )
      )
    )
  }

  // ============ 卡片配置 ============
  const cardNavItems = [
    {
      label: '作品',
      bgColor: '#1B1722',
      textColor: '#fff',
      links: [
        {
          label: 'Prisma',
          href: 'https://prisma-studio.pages.dev',
          ariaLabel: 'Prisma 创意工作室',
        },
        { label: '电力行业 PPT', href: '#', ariaLabel: '电力行业汇报 PPT' },
      ],
    },
    {
      label: '关于',
      bgColor: '#2F293A',
      textColor: '#fff',
      links: [
        { label: '自我介绍', href: '#about', ariaLabel: '关于我' },
        { label: '核心技能', href: '#skills', ariaLabel: '核心技能' },
        { label: '最近在玩', href: '#now', ariaLabel: '最近在玩' },
        { label: '兴趣爱好', href: '#hobbies', ariaLabel: '兴趣爱好' },
      ],
    },
    {
      label: '联系',
      bgColor: '#2F293A',
      textColor: '#fff',
      links: [
        { label: '飞书', href: '#', ariaLabel: '飞书' },
        { label: 'GitHub', href: 'https://github.com/329466116-prog', ariaLabel: 'GitHub' },
        { label: '邮箱', href: 'mailto:329466116@qq.com', ariaLabel: 'Email' },
      ],
    },
  ]

  // 内联 SVG logo（"Q" 字 avatar，匹配 qdd-website 风格）
  const logoSvg =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#1B1722"/><text x="16" y="22" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="18" fill="#DEDBC8">Q</text></svg>'
    )

  // ============ 挂载 ============
  function mountCardNav() {
    const root = document.getElementById('card-nav-root')
    if (!root) {
      console.error('[CardNav] 找不到 #card-nav-root 挂载点')
      return
    }
    createRoot(root).render(
      h(CardNav, {
        logo: logoSvg,
        logoAlt: '钱多多',
        items: cardNavItems,
        baseColor: '#fff',
        menuColor: '#000',
        buttonBgColor: '#111',
        buttonTextColor: '#fff',
        ease: 'power3.out',
      })
    )
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCardNav)
  } else {
    mountCardNav()
  }
})()
