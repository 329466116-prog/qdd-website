// ============================================
// 钱多多 · 个人主页交互
// 滚动入场动画（卡片淡入上滑）
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');

    // 如果浏览器不支持 IntersectionObserver，直接显示
    if (!('IntersectionObserver' in window)) {
        cards.forEach(card => card.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    cards.forEach((card, index) => {
        // 错开动画延迟
        card.style.transitionDelay = `${index * 100}ms`;
        observer.observe(card);
    });

    // console.log("🦐 网站加载完成 · Powered by OpenClaw");
});
