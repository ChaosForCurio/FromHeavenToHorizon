(() => {
  "use strict";

  const app = angular.module('portfolioApp', []);

  app.controller('MainController', ['$scope', function($scope) {
    $scope.heroWords = ['Comes', 'From', 'Heaven'];
    $scope.marqueeItems = [
      'People are terrified of me, and I want them to be.',
      'People are terrified of me, and I want them to be.'
    ];

    // Wait for view to render before initializing GSAP
    angular.element(document).ready(function() {
      initAnimations();
    });
  }]);

  const { gsap, ScrollTrigger } = window;
  const hasGSAP = typeof gsap !== "undefined";
  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";
  const NOT_FOUND_PATH = "/404.html";
  const RAF_FALLBACK_TIMEOUT = 1000;

  function isOn404() {
    return window.location.pathname.includes(NOT_FOUND_PATH);
  }

  function safeRedirectTo404() {
    // Disabled aggressive redirect for debugging/stability
    console.error("Critical error occurred. Redirect to 404 suppressed.");
    // if (!isOn404()) {
    //   window.location.href = NOT_FOUND_PATH;
    // }
  }

  function initAnimations() {
    if (!hasGSAP || !hasScrollTrigger) {
      console.error("GSAP or ScrollTrigger not available. Aborting animations.");
      return;
    }

    try {
      new PageTransition();
      startMarquee();
      animateSnake(".footer-snake", 4.5, true);
      
      const images = document.querySelectorAll("#back img");
      if (images && images.length > 0) {
        startSmoothScroll(images);
      }

      window.addEventListener("pagehide", () => {
        cancelSmoothScroll();
      });

    } catch (err) {
      console.error("Animation init failed:", err);
    }
  }

  let currentScroll = 0;
  let targetScroll = 0;
  let ease = 0.08;
  let rafId = null;
  let smoothScrollActive = false;
  let rafTimeoutId = null;

  function startSmoothScroll(images) {
    if (!images || images.length === 0) return;

    gsap.set(images, {
      x: (i) => i * 100 + "%",
      y: 0,
      opacity: 1,
    });

    document.body.style.height = `${images.length * 150}vh`;
    smoothScrollActive = true;

    function step() {
      try {
        targetScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
        currentScroll += (targetScroll - currentScroll) * ease;

        const maxScroll = Math.max(
          document.body.scrollHeight - window.innerHeight,
          0
        );
        const progress = maxScroll > 0 ? currentScroll / maxScroll : 0;
        const totalMove = (images.length - 1) * 100;
        const moveAmount = progress * totalMove;

        images.forEach((img, i) => {
          gsap.set(img, {
            x: i * 100 - moveAmount + "%",
          });
        });

        rafId = requestAnimationFrame(step);

        if (rafTimeoutId) clearTimeout(rafTimeoutId);
        rafTimeoutId = setTimeout(() => {
          console.warn("rAF fallback triggered — cancelling smoothScroll RAF.");
          cancelSmoothScroll();
        }, RAF_FALLBACK_TIMEOUT);

      } catch (err) {
        console.error("SmoothScroll failed:", err);
        cancelSmoothScroll();
      }
    }

    if (!rafId) rafId = requestAnimationFrame(step);
  }

  function cancelSmoothScroll() {
    smoothScrollActive = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (rafTimeoutId) {
      clearTimeout(rafTimeoutId);
      rafTimeoutId = null;
    }
  }

  class PageTransition {
    constructor() {
      this.overlay = document.getElementById("pageTransition");
      this.mainContent = document.getElementById("main");
      this.transitionText = document.querySelector(".transition-text");
      this.isTransitioning = false;

      if (!this.overlay || !this.mainContent || !this.transitionText) {
        console.warn("PageTransition elements missing");
        return;
      }

      this.bindedClickHandler = this.handleNavClick.bind(this);
      this.init();
    }

    init() {
      const nav = document.getElementById("nav");
      if (nav) {
        nav.addEventListener("click", this.bindedClickHandler, true);
      } else {
        const navLinks = document.querySelectorAll("#nav a");
        navLinks.forEach((link) =>
          link.addEventListener("click", this.bindedClickHandler, true)
        );
      }
    }

    handleNavClick(e) {
      const el = e.target.closest && e.target.closest("a");
      if (!el) return;

      const href = el.getAttribute("href");
      if (!href || href === "#" || href.startsWith("javascript:")) return;
      
      const url = new URL(href, window.location.href);
      if (url.origin === window.location.origin) {
        e.preventDefault();
        if (!this.isTransitioning)
          this.navigateToPage(url.href, el.textContent.trim());
      }
    }

    async navigateToPage(href, title = "Page", opts = {}) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      this.transitionText.textContent = `Loading ${title}...`;

      await this.startTransition();
      setTimeout(() => {
        window.location.href = href;
      }, 800);
    }

    startTransition() {
      return new Promise((resolve) => {
        this.mainContent.classList.add("fade-out");
        this.overlay.classList.add("active");
        setTimeout(resolve, 800);
      });
    }
  }

  function startMarquee() {
    const marquee = document.querySelector(".marquee");
    if (!marquee) return;

    // Wait for Angular to render ng-repeat
    setTimeout(() => {
      const texts = marquee.querySelectorAll(".marquee-text");
      if (!texts || texts.length < 1) return;

      const textWidth = texts[0].offsetWidth;
      if (!textWidth) return;

      gsap.to(".marquee-text", {
        x: `-=${textWidth}`,
        duration: 10,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % (textWidth * 2)),
        },
      });
    }, 100);
  }

  function animateSnake(selector, duration, yoyo = false) {
    const paths = document.querySelectorAll(selector + " path");
    if (!paths || paths.length === 0) return;

    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: duration,
        repeat: -1,
        yoyo: yoyo,
        ease: yoyo ? "power1.inOut" : "linear",
      });
    });
  }

})();
