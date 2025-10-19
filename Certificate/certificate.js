document.addEventListener("DOMContentLoaded", () => {
  try {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.warn(
        "GSAP or ScrollTrigger not loaded. Animations will not run."
      );
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const snake = document.querySelector(".snake-logo path");
    if (snake) {
      const pathLength = snake.getTotalLength();
      snake.style.strokeDasharray = pathLength;
      snake.style.strokeDashoffset = pathLength;
      snake.style.fill = "none";

      gsap.to(snake, {
        strokeDashoffset: 0,
        duration: 6,
        repeat: -1,
        ease: "linear",
      });

      const colors = ["#000000ff", "#e61818", "#000000", "#ff0000ff"];
      let currentColorIndex = 0;

      const cycleColor = () => {
        const nextIndex = (currentColorIndex + 1) % colors.length;
        gsap.to(snake, {
          stroke: colors[nextIndex],
          duration: 2,
          ease: "power1.inOut",
          onComplete: () => {
            currentColorIndex = nextIndex;
            cycleColor();
          },
        });
      };
      cycleColor();
    }
    const verticalSections = document.querySelectorAll(".section-vertical");
    const horizontalSections = document.querySelectorAll(".section-horizontal");

    const allSections = [...verticalSections, ...horizontalSections];

    if (allSections.length) {
      const updateSectionHeights = () => {
        allSections.forEach((section) => {
          section.style.minHeight = `${window.innerHeight}px`;
        });
      };
      updateSectionHeights();
      window.addEventListener("resize", updateSectionHeights);
      let scrollPos = 0;
      let targetScroll = 0;
      const body = document.body;

      const layers = document.querySelectorAll("[data-layer]");
      const layerSetters = [];
      layers.forEach((layer) => {
        layerSetters.push({
          el: layer,
          ySetter: gsap.quickSetter(layer, "y", "px"),
          xSetter: gsap.quickSetter(layer, "x", "px"),
          opacitySetter: gsap.quickSetter(layer, "opacity"),
        });
      });

      const smoothScroll = () => {
        targetScroll = window.scrollY || window.pageYOffset;
        scrollPos += (targetScroll - scrollPos) * 0.1;
        layerSetters.forEach(({ el, ySetter, xSetter, opacitySetter }) => {
          const speedY = parseFloat(el.dataset.layerY) || 0.5;
          const speedX = parseFloat(el.dataset.layerX) || 0;
          const fadeDistance = parseFloat(el.dataset.fade) || 0.5;
          ySetter(-scrollPos * speedY);
          xSetter(-scrollPos * speedX);
          const fade =
            1 -
            Math.min(
              Math.max(scrollPos / (window.innerHeight * fadeDistance), 0),
              1
            );
          opacitySetter(fade);
        });

        requestAnimationFrame(smoothScroll);
      };
      smoothScroll();

      // ---------------------------
      // Horizontal Scroll Sections
      // ---------------------------
      horizontalSections.forEach((section) => {
        const container = section.querySelector(".horizontal-container");
        if (!container) return;

        const totalWidth = container.scrollWidth;
        gsap.to(container, {
          x: () => -(totalWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${totalWidth}`,
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
        });
      });

      verticalSections.forEach((section) => {
        const parallaxEls = section.querySelectorAll("[data-parallax]");
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.3;
          gsap.to(el, {
            y: () => -(window.innerHeight * speed),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      });
    }

    const modal = document.getElementById("contentModal");
    const modalContent = document.getElementById("modalContent");

    if (modal && modalContent) {
      const closeBtn = modal.querySelector(".close-btn");
      const prevBtn = modal.querySelector("#modalPrev");
      const nextBtn = modal.querySelector("#modalNext");
      const contents = document.querySelectorAll(".content");
      let currentIndex = 0;

      const openModal = (index) => {
        if (index < 0 || index >= contents.length) return;
        currentIndex = index;
        modalContent.innerHTML = contents[index].innerHTML;
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      };

      const closeModal = () => {
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      };

      contents.forEach((c, i) =>
        c.addEventListener("click", () => openModal(i))
      );
      closeBtn?.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
      prevBtn?.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + contents.length) % contents.length;
        modalContent.innerHTML = contents[currentIndex].innerHTML;
      });
      nextBtn?.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % contents.length;
        modalContent.innerHTML = contents[currentIndex].innerHTML;
      });
    }
  } catch (error) {
    console.error("Error initializing cinematic portfolio scripts:", error);
  }
});


