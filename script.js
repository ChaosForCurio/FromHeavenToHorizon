(() => {
  "use strict";
  const { gsap, ScrollTrigger } = window;
  const hasGSAP = typeof gsap !== "undefined";
  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";
  const NOT_FOUND_PATH = "/404.html";
  const RAF_FALLBACK_TIMEOUT = 1000;

  function isOn404() {
    return window.location.pathname.includes(NOT_FOUND_PATH);
  }

  function safeRedirectTo404() {
    try {
      if (!isOn404()) {
        window.location.href = NOT_FOUND_PATH;
      } else {
        console.error("Already on 404 page; not redirecting to avoid loop.");
      }
    } catch (e) {
      console.error("safeRedirectTo404 failed:", e);
    }
  }

  function warnAndMaybeRedirect(msg, shouldRedirect = true) {
    console.warn(msg);
    if (shouldRedirect) safeRedirectTo404();
  }

  if (!hasGSAP || !hasScrollTrigger) {
    console.error("GSAP or ScrollTrigger not available. Aborting animations.");
  }

  const images =
    hasGSAP && document.querySelectorAll
      ? Array.from(document.querySelectorAll("#back img"))
      : [];
  let currentScroll = 0;
  let targetScroll = 0;
  let ease = 0.08;
  let rafId = null;
  let smoothScrollActive = false;
  let rafTimeoutId = null;

  function startSmoothScroll() {
    if (!hasGSAP) {
      console.warn("GSAP unavailable for smoothScroll — skipping.");
      return;
    }
    if (!images || images.length === 0) {
      console.warn("No images found in #back for smoothScroll — skipping.");
      return;
    }

    gsap.set(images, {
      x: (i) => i * 100 + "%",
      y: 0,
      opacity: 1,
    });

    document.body.style.height = `${images.length * 150}vh`;

    smoothScrollActive = true;

    function step() {
      try {
        targetScroll =
          window.pageYOffset || document.documentElement.scrollTop || 0;
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
          console.warn(
            "rAF fallback triggered — cancelling smoothScroll RAF to avoid locking."
          );
          cancelSmoothScroll();
        }, RAF_FALLBACK_TIMEOUT);
      } catch (err) {
        console.error("SmoothScroll failed:", err);
        cancelSmoothScroll();
        safeRedirectTo404();
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
        console.error("Critical DOM elements missing for PageTransition:", {
          overlay: !!this.overlay,
          mainContent: !!this.mainContent,
          transitionText: !!this.transitionText,
        });

        return;
      }

      this.bindedClickHandler = this.handleNavClick.bind(this);
      this.init();
    }

    init() {
      try {
        const nav = document.getElementById("nav");
        if (nav) {
          nav.addEventListener("click", this.bindedClickHandler, true);
        } else {
          const navLinks = document.querySelectorAll("#nav a");
          navLinks.forEach((link) =>
            link.addEventListener("click", this.bindedClickHandler, true)
          );
        }

        const exploreButton = document.getElementById("explore-button");
        if (exploreButton) {
          exploreButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.navigateToPage(
              "https://www.cloudskillsboost.google/profile/badges",
              "Explore More",
              {
                external: true,
              }
            );
          });
        }
      } catch (err) {
        console.error("PageTransition init failed:", err);
        safeRedirectTo404();
      }
    }

    handleNavClick(e) {
      const el = e.target.closest && e.target.closest("a");
      if (!el) return;

      const href = el.getAttribute("href");
      if (!href || href === "#" || href.startsWith("javascript:")) return;
      try {
        const url = new URL(href, window.location.href);
        const isSameOrigin = url.origin === window.location.origin;
        if (isSameOrigin) {
          e.preventDefault();
          if (!this.isTransitioning)
            this.navigateToPage(url.href, el.textContent.trim());
        }
      } catch (err) {
        console.warn("Malformed link href:", href, err);
      }
    }

    async navigateToPage(href, title = "Page", opts = {}) {
      if (this.isTransitioning) return;

      try {
        const normalizedTarget = new URL(href, window.location.href);
        const current = new URL(window.location.href);

        if (opts.external || normalizedTarget.origin !== current.origin) {
          this.isTransitioning = true;
          try {
            this.transitionText.textContent = `Loading ${title}...`;
            await this.startTransition();
          } catch (e) {
            console.warn("Transition start failed:", e);
          }
          window.location.href = normalizedTarget.href;
          return;
        }
        if (
          normalizedTarget.pathname === current.pathname &&
          normalizedTarget.search === current.search &&
          normalizedTarget.hash === current.hash
        ) {
          await this.fullCycleNoNav();
          return;
        }

        this.isTransitioning = true;
        this.transitionText.textContent = `Loading ${title}...`;

        await this.startTransition();
        await this.loadPage(normalizedTarget.href);

        this.isTransitioning = false;
      } catch (err) {
        console.error("Navigation failed:", err);
        safeRedirectTo404();
      }
    }

    startTransition() {
      return new Promise((resolve) => {
        try {
          this.mainContent.classList.add("fade-out");
          this.overlay.classList.add("active");
        } catch (e) {
          console.warn("Error applying transition classes:", e);
        }
        setTimeout(resolve, 800);
      });
    }

    async loadPage(href) {
      await new Promise((r) => setTimeout(r, 1200));
      window.location.href = href;
    }

    endTransition() {
      return new Promise((resolve) => {
        try {
          this.overlay.classList.remove("active");
          this.mainContent.classList.remove("fade-out");
        } catch (e) {
          console.warn("Error removing transition classes:", e);
        }
        setTimeout(resolve, 800);
      });
    }

    async fullCycleNoNav() {
      this.isTransitioning = true;
      this.transitionText.textContent = "Refreshing...";
      await this.startTransition();
      await this.endTransition();
      this.isTransitioning = false;
    }
  }

  function startMarquee() {
    if (!hasGSAP) {
      console.warn("GSAP unavailable for marquee — skipping.");
      return;
    }
    const marquee = document.querySelector(".marquee");
    if (!marquee) return;

    const texts = marquee.querySelectorAll(".marquee-text");
    if (!texts || texts.length < 2) return;

    const measureAndAnimate = () => {
      const textWidth = texts[0].offsetWidth;
      if (!textWidth || isNaN(textWidth) || textWidth === 0) {
        console.warn("Marquee text width invalid — skipping animation.");
        return;
      }

      gsap.to(".marquee-text", {
        x: `-=${textWidth}`,
        duration: 10,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % (textWidth * 2)),
        },
      });
    };

    if (document.fonts && typeof document.fonts.ready !== "undefined") {
      document.fonts.ready.then(measureAndAnimate).catch((e) => {
        console.warn(
          "document.fonts.ready failed, proceeding to measure immediately",
          e
        );
        measureAndAnimate();
      });
    } else {
      window.addEventListener("load", measureAndAnimate, { once: true });
      setTimeout(measureAndAnimate, 500);
    }
  }

  function startProductsScroller() {
    try {
      if (!hasGSAP) {
        console.warn("GSAP unavailable for products scroller — skipping.");
        return;
      }
      const container = document.getElementById("products");
      if (!container) {
        console.warn("Products container not found");
        return;
      }
      const totalWidth = container.scrollWidth / 2;
      if (!totalWidth || isNaN(totalWidth)) {
        console.warn(
          "Products container width invalid:",
          container.scrollWidth
        );
        return;
      }
      gsap.to(container, {
        x: -totalWidth,
        duration: 40,
        ease: "none",
        repeat: -1,
      });
    } catch (err) {
      console.error("Products scroller failed:", err);
    }
  }

  function animateSnake(selector, duration, yoyo = false) {
    if (!hasGSAP) {
      console.warn("GSAP unavailable for snake animation — skipping.");
      return;
    }
    try {
      const paths = document.querySelectorAll(selector + " path");
      if (!paths || paths.length === 0) {
        console.warn("No paths found for snake selector:", selector);
        return;
      }
      paths.forEach((path) => {
        const length = path.getTotalLength();
        if (!isFinite(length) || length === 0) return;
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
    } catch (err) {
      console.error("Snake animation failed:", err);
    }
  }

  window.addEventListener("error", (e) => {
    console.error("Global error caught:", e ? e.message || e : e);
  });

  window.addEventListener("unhandledrejection", (e) => {
    console.error("Unhandled Promise rejection:", e ? e.reason || e : e);
  });

  document.addEventListener("DOMContentLoaded", () => {
    try {
      try {
        new PageTransition();
      } catch (err) {
        console.error("Failed to instantiate PageTransition:", err);
      }

      if (hasGSAP) {
        startMarquee();
      }

      if (hasGSAP) {
        startProductsScroller();
      }

      animateSnake(".footer-snake", 4.5, true);

      if (hasGSAP && images && images.length > 0) {
        startSmoothScroll();
      }

      window.addEventListener("pagehide", () => {
        cancelSmoothScroll();
      });
    } catch (err) {
      console.error("DOM init failed:", err);
      if (!isOn404()) safeRedirectTo404();
    }
  });

  try {
    window.__appDebug = {
      cancelSmoothScroll,
      startSmoothScroll,
      isOn404,
    };
  } catch (e) {}
})();
