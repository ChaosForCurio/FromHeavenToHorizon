const hContainer = document.getElementById("products");

if (hContainer) {
  const hImages = Array.from(hContainer.querySelectorAll(".product-item img"));
  const speedMultiplier = 1.8;

  const cloneH = hContainer.cloneNode(true);
  hContainer.parentNode.appendChild(cloneH);
  cloneH.style.position = "absolute";
  cloneH.style.top = "0";
  cloneH.style.left = `${hContainer.scrollWidth}px`;

  const hAllContainers = [hContainer, cloneH];

  let hScrollTween;
  const createHTween = (duration) => {
    return gsap.to(hAllContainers, {
      x: `-=${hContainer.scrollWidth}`,
      duration: duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(
          (x) => parseFloat(x) % (hContainer.scrollWidth * 2)
        ),
      },
      onUpdate: () => {
        hImages.forEach((img, index) => {
          const scrollProgress =
            (img.getBoundingClientRect().left + img.offsetWidth) /
            window.innerWidth;
          const parallax = gsap.utils.clamp(
            -20,
            20,
            (scrollProgress - 0.5) * 50
          );
          gsap.set(img, { y: parallax });
        });
      },
    });
  };

  const baseDuration =
    window.innerWidth < 768 ? 35 / speedMultiplier : 20 / speedMultiplier;
  hScrollTween = createHTween(baseDuration);

  hContainer.addEventListener("mouseenter", () => {
    gsap.to(hScrollTween, { timeScale: 0, duration: 1, ease: "power2.out" });
  });

  hContainer.addEventListener("mouseleave", () => {
    gsap.to(hScrollTween, { timeScale: 1, duration: 1, ease: "power2.out" });
  });

  window.addEventListener("resize", () => {
    hScrollTween.kill();
    const newDuration =
      window.innerWidth < 768 ? 35 / speedMultiplier : 20 / speedMultiplier;
    hScrollTween = createHTween(newDuration);
  });
}

function animateSnake(selector, duration = 4.5, yoyo = false) {
  const svgs = document.querySelectorAll(selector);
  if (!svgs.length) return;

  svgs.forEach((svg) => {
    const paths = svg.querySelectorAll("path");
    if (!paths.length) return;

    paths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      gsap.to(path, {
        strokeDashoffset: 0,
        duration,
        repeat: -1,
        yoyo,
        ease: yoyo ? "power1.inOut" : "linear",
      });
    });
  });
}

animateSnake(".footer-snake", 4.5, true);
