import {useEffect, useRef} from "react";
import "./App.css";

function App() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const title = titleRef.current;
    if (!hero || !title) return;

    const stage = hero.querySelector<HTMLElement>(".hero-stage");
    const imageMask = hero.querySelector<HTMLElement>(".hero-image-mask");
    const image = hero.querySelector<HTMLImageElement>(".hero-image");
    const eyebrow = hero.querySelector<HTMLElement>(".hero-eyebrow");
    const arrow = hero.querySelector<HTMLElement>(".hero-arrow");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const render = () => {
      frame = 0;
      if (!stage || !imageMask || !image || !eyebrow || !arrow) return;

      const scrollRange = Math.max(hero.offsetHeight - stage.offsetHeight, 1);
      const progress = reduceMotion.matches
        ? 1
        : Math.min(
            Math.max(-hero.getBoundingClientRect().top / scrollRange, 0),
            1,
          );
      const startRadius = window.innerWidth < 1100 ? 18 : 8;
      const radius = startRadius + (71 - startRadius) * progress;
      const centerY = 57.5 - 7.5 * progress;
      const textProgress = Math.min(progress / 0.3, 1);
      const titleStart = hero.offsetTop + scrollRange;
      const rawTitleProgress = reduceMotion.matches
        ? 1
        : Math.min(
            Math.max(
              (window.scrollY - titleStart) / (window.innerHeight * 0.5),
              0,
            ),
            1,
          );
      const titleProgress = 1 - Math.pow(1 - rawTitleProgress, 3);
      const mobile = window.innerWidth < 1100;
      const startInset = mobile ? 16 : 24;
      const endInset = 16;
      const startWidth = window.innerWidth - startInset * 2;
      const endWidth = window.innerWidth < 700 ? 132 : 176;

      imageMask.style.clipPath = `circle(${radius}% at 50% ${centerY}%)`;
      image.style.transform = `translate(-50%, -50%) rotate(90deg) scale(${1.1 - 0.1 * progress})`;
      image.style.objectPosition = `50% ${50 + 10 * progress}%`;
      eyebrow.style.opacity = String(1 - textProgress);
      eyebrow.style.transform = `translateY(${-110 * textProgress}%)`;
      arrow.style.opacity = String(1 - textProgress);
      arrow.style.transform = `translateY(${110 * textProgress}%)`;
      title.style.top = `${startInset + (endInset - startInset) * titleProgress}px`;
      title.style.left = `${startInset + (endInset - startInset) * titleProgress}px`;
      title.style.width = `${startWidth + (endWidth - startWidth) * titleProgress}px`;
    };

    const requestRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", requestRender, {passive: true});
    window.addEventListener("resize", requestRender);
    reduceMotion.addEventListener("change", requestRender);

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      reduceMotion.removeEventListener("change", requestRender);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main>
      <svg
        ref={titleRef}
        className="hero-title"
        viewBox="0 0 1600 180"
        role="img"
        aria-labelledby="hero-title-label"
      >
        <title id="hero-title-label">Apartmento Club</title>
        <text
          x="800"
          y="145"
          textAnchor="middle"
          textLength="1560"
          lengthAdjust="spacingAndGlyphs"
        >
          APARTMENTO CLUB
        </text>
      </svg>

      <section className="scroll-hero" ref={heroRef}>
        <div className="hero-stage">
          <div className="hero-image-mask" aria-hidden="true">
            <img className="hero-image" src="/plan.jpeg" alt="" />
          </div>

          <p className="hero-eyebrow">make it exist</p>

          <svg className="hero-arrow" viewBox="0 0 10 28" aria-hidden="true">
            <path d="M5 1v24M1 20l4 6 4-6" />
          </svg>
        </div>
      </section>

      <section className="after-hero" aria-label="Introduction">
        <p>COMING SOON</p>
      </section>
    </main>
  );
}

export default App;
