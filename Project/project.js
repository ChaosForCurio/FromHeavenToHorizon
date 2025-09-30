gsap.registerPlugin(ScrollTrigger);

function showFallbackUI(targetSelector, message) {
  const targetEl = document.querySelector(targetSelector);
  if (targetEl) {
    targetEl.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        text-align: center;
        color: #ff0000;
        font-weight: bold;
        font-size: 1.5rem;
        background: rgba(0,0,0,0.05);
        border-radius: 12px;
      ">
        ${message}
      </div>
    `;
  }
}

try {
  const strip = document.getElementById("creative-strip");
  if (strip) {
    strip.innerHTML += strip.innerHTML;
    gsap.to(strip, {
      x: () => -strip.offsetWidth / 2,
      duration: 25,
      ease: "linear",
      repeat: -1,
    });
  } else {
    showFallbackUI("#creative-strip", "Text strip failed to load");
  }

  const verticalScroll = document.getElementById("vertical-scroll");
  if (verticalScroll) {
    const verticalImages = verticalScroll.querySelectorAll("img");
    const parallaxFactors = [0.5, 0.6, 0.7, 0.8, 0.9];

    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;

      verticalImages.forEach((img, i) => {
        if (img) {
          img.style.transform = `translateY(-${
            scrollY * parallaxFactors[i] * 0.5
          }px)`;
        }
      });

      const heroVideo = document.getElementById("hero-video");
      if (heroVideo) {
        heroVideo.style.transform = `translateY(${scrollY * 0.08}px) scale(${
          1 + (scrollY / document.body.scrollHeight) * 0.08
        })`;
      } else {
        showFallbackUI("#hero-video", "Hero video failed to load");
      }
    });
  } else {
    showFallbackUI(
      "#vertical-scroll",
      "Vertical scroll section failed to load"
    );
  }

  const cinematicSection = document.querySelector("#cinematic-4 img");
  if (cinematicSection) {
    gsap.to(cinematicSection, {
      scale: 1.15,
      scrollTrigger: {
        trigger: "#cinematic-4",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  } else {
    showFallbackUI("#cinematic-4", "Cinematic section failed to load");
  }

  function updateClock() {
    try {
      const now = new Date();
      const date = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(now);

      const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);

      const scrollPercent =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);
      const r = Math.floor(255 * scrollPercent),
        g = Math.floor(255 * (1 - scrollPercent)),
        b = Math.floor(150 + 105 * scrollPercent);

      const clockEl = document.getElementById("clock");
      if (clockEl) {
        clockEl.textContent = `${date}, ${time} IST`;
        clockEl.style.color = `rgb(${r},${g},${b})`;
      }
    } catch {
      console.error("Clock update failed");
    }
  }

  setInterval(updateClock, 1000);
  updateClock();

  const awwardsInner = document.querySelector(".awwwards-inner");
  if (awwardsInner) {
    awwardsInner.innerHTML += awwardsInner.innerHTML;
    let scrollPos = 0;
    let targetScroll = 0;
    let isHovered = false;
    const scrollSpeed = 0.7;

    function autoScroll() {
      try {
        scrollPos += (targetScroll - scrollPos) * 0.05;
        awwardsInner.style.transform = `translateX(-${scrollPos}px)`;
        if (!isHovered) targetScroll += scrollSpeed;

        if (targetScroll >= awwardsInner.scrollWidth / 2) {
          scrollPos = 0;
          targetScroll = 0;
        }
        requestAnimationFrame(autoScroll);
      } catch {
        showFallbackUI(".awwwards-inner", "Awwwards section failed to scroll");
      }
    }

    autoScroll();

    awwardsInner.addEventListener("mouseenter", () => (isHovered = true));
    awwardsInner.addEventListener("mouseleave", () => (isHovered = false));
  } else {
    showFallbackUI(".awwwards-inner", "Awwwards section failed to load");
  }

  document.querySelectorAll(".awwward-card").forEach((card, i) => {
    try {
      const links = [
        "#typography",
        "#nocode",
        "#ecommerce",
        "#product",
        "#portfolio",
      ];
      card.addEventListener("click", () =>
        window.open(links[i % links.length], "_blank")
      );
    } catch {
      console.error("Awwward card click failed");
    }
  });
} catch (error) {
  console.error("Script execution failed", error);
  document.body.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
      font-size: 2rem;
      color: #ff0000;
      padding: 2rem;
    ">
      Something went wrong. Please try refreshing the page.
    </div>
  `;
}
