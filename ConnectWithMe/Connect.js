const form = document.getElementById("contactForm");
const navbar = document.getElementById("navbar");
const mobileMenu = document.getElementById("mobile-menu");
const openMenuButton = document.getElementById("mobile-menu-button");
const closeMenuButton = document.getElementById("close-menu-button");
const navLinks = document.querySelectorAll("#mobile-menu a, .nav-link");
const formMessage = document.getElementById("formMessage");

function openMobileMenu() {
  mobileMenu.classList.remove("translate-x-full");
  mobileMenu.classList.add("translate-x-0");
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  mobileMenu.classList.remove("translate-x-0");
  mobileMenu.classList.add("translate-x-full");
  document.body.style.overflow = "";
}

openMenuButton.addEventListener("click", openMobileMenu);
closeMenuButton.addEventListener("click", closeMobileMenu);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (mobileMenu.contains(link)) closeMobileMenu();
  });
});

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("bg-white/90", "backdrop-blur-md", "shadow-md");
    navbar.classList.remove("bg-black/10", "backdrop-blur-sm");
  } else {
    navbar.classList.remove("bg-white/90", "backdrop-blur-md", "shadow-md");
    navbar.classList.add("bg-black/10", "backdrop-blur-sm");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    formMessage.textContent = "Please fill out all required fields.";
    formMessage.classList.remove("hidden", "text-green-600");
    formMessage.classList.add("text-red-500");
    return;
  }

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      formMessage.textContent = "Thank you! Your vision has been received.";
      formMessage.classList.remove("hidden", "text-red-500");
      formMessage.classList.add("text-green-600");
      form.reset();
    } else {
      formMessage.textContent =
        "Oops! There was a problem submitting your form.";
      formMessage.classList.remove("hidden", "text-green-600");
      formMessage.classList.add("text-red-500");
    }
  } catch (error) {
    console.error(error);
    formMessage.textContent = "Oops! There was a problem submitting your form.";
    formMessage.classList.remove("hidden", "text-green-600");
    formMessage.classList.add("text-red-500");
  }
});

function initializeSnakeAnimation() {
  document.querySelectorAll(".snake-path").forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    const isFooterSnake = path.closest("footer") !== null;

    gsap.to(path.style, {
      strokeDashoffset: 0,
      duration: isFooterSnake ? 2.5 : 3.5,
      repeat: -1,
      ease: "linear",
      yoyo: true,

      onUpdate: () => {
        if (isFooterSnake) {
          const t =
            (gsap.getProperty(path.style, "strokeDashoffset") / length) % 1;
          if (t < 0.33) path.style.stroke = "white";
          else if (t < 0.66) path.style.stroke = "lightgray";
          else path.style.stroke = "black";
        } else {
          const t =
            (gsap.getProperty(path.style, "strokeDashoffset") / length) % 1;
          if (t < 0.33) path.style.stroke = "white";
          else if (t < 0.66) path.style.stroke = "gray";
          else path.style.stroke = "black";
        }
      },
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeSnakeAnimation();
});
