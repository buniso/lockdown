// THE LOCKDOWN INDEX — shared behavior

// 1. Highlight the current page in the nav
document.addEventListener("DOMContentLoaded", () => {
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav nav a").forEach((link) => {
    const target = link.getAttribute("href");
    if (target === here || (here === "" && target === "index.html")) {
      link.classList.add("active");
    }
  });
});

// 2. Scattered sticker field — a handful of small faces/icons pinned around
// the hero like a moodboard. Each one flips from grin to frown on scroll,
// slightly out of phase with the others, so the whole cluster tips over
// like a scattered collage rather than one clean mechanical flip.
// Every ladder score is a different face — this is meant to read as "many
// countries, many outcomes" rather than a single mascot.
const stickers = document.querySelectorAll(".sticker");

if (stickers.length) {
  const maxScroll = 700; // px of scroll over which the flip completes
  const onScroll = () => {
    const y = window.scrollY;
    const base = Math.min(Math.max(y / maxScroll, 0), 1); // 0 -> 1

    stickers.forEach((el) => {
      const phase = parseFloat(el.dataset.phase || "0"); // 0-1 offset so they don't flip in unison
      const speed = parseFloat(el.dataset.speed || "1");
      let progress = (base * speed) + phase;
      progress = Math.min(Math.max(progress, 0), 1);
      const rotation = progress * 180;
      const drift = base * parseFloat(el.dataset.drift || "0");
      el.style.transform = `translateY(${drift}px) rotate(${rotation}deg)`;

      const mouth = el.querySelector(".mouth");
      if (mouth) {
        mouth.setAttribute(
          "d",
          progress < 0.5
            ? "M 65 125 Q 100 155 135 125" // smile
            : "M 65 135 Q 100 105 135 135" // frown
        );
        // Always ink — a couple of the stickers are pink/teal themselves,
        // so a color-coded mouth can disappear against its own face.
        mouth.setAttribute("stroke", "#5C4A34");
      }
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// 3. Narrative "jump to" menu — highlight whichever section is in view
const tocLinks = document.querySelectorAll(".narrative-toc a");
if (tocLinks.length && "IntersectionObserver" in window) {
  const targets = Array.from(tocLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const tocIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        tocLinks.forEach((l) => l.classList.remove("active"));
        document
          .querySelectorAll(`.narrative-toc a[href="${id}"]`)
          .forEach((l) => l.classList.add("active"));
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  targets.forEach((t) => tocIO.observe(t));
}

// 4. Back-to-top button (shows once you've scrolled past the hero/heading)
const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  const toggleBackToTop = () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 600);
  };
  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// 5. Staggered fade-up reveals as sections scroll into view
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    // threshold near 0 so it fires as soon as any part of the element is
    // visible — long sections (bibliography, data critique) used to need
    // 15% of their *entire* height on screen before appearing, which on a
    // tall block meant the page looked blank until you'd scrolled a lot.
    { threshold: 0, rootMargin: "0px 0px -5% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}
