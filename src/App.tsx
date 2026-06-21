import {useEffect, useRef, useState} from "react";
import "./App.css";

const rooms = [
  {
    id: "bathroom",
    name: "Bathroom",
    points: "22,16 357,16 357,325 22,325",
  },
  {
    id: "kitchen",
    name: "Kitchen",
    points: "381,16 713,16 713,361 454,361 454,349 381,349",
  },
  {
    id: "living-room",
    name: "Living room",
    points: "22,349 374,349 374,272 454,272 454,361 713,361 713,839 22,839",
  },
] as const;

function App() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<SVGSVGElement>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [introVisible, setIntroVisible] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [introLeaving, setIntroLeaving] = useState(false);

  useEffect(() => {
    if (!introVisible) return;

    document.body.classList.add("intro-is-active");

    const leaveTimer = window.setTimeout(() => setIntroLeaving(true), 900);
    const removeTimer = window.setTimeout(() => {
      setIntroVisible(false);
      document.body.classList.remove("intro-is-active");
    }, 3300);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
      document.body.classList.remove("intro-is-active");
    };
  }, [introVisible]);

  useEffect(() => {
    const hero = heroRef.current;
    const title = titleRef.current;
    if (!hero || !title) return;

    const stage = hero.querySelector<HTMLElement>(".hero-stage");
    const imageMask = hero.querySelector<HTMLElement>(".hero-image-mask");
    const image = hero.querySelector<SVGSVGElement>(".hero-image");
    const arrow = hero.querySelector<HTMLElement>(".hero-arrow");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const render = () => {
      frame = 0;
      if (!stage || !imageMask || !image || !arrow) return;

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
      const titleProgress = progress;
      const mobile = window.innerWidth < 1100;
      const startInset = mobile ? 16 : 24;
      const endInset = 16;
      const startWidth = window.innerWidth - startInset * 2;
      const endWidth = window.innerWidth < 700 ? 132 : 176;

      const imageClip = `circle(${radius}% at 50% ${centerY}%)`;
      imageMask.style.clipPath = imageClip;
      imageMask.style.setProperty("-webkit-clip-path", imageClip);
      image.style.transform = `translate(-50%, -50%) rotate(90deg) scale(${1.1 - 0.1 * progress})`;
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
      {introVisible && (
        <div
          className={`intro-overlay${introLeaving ? " is-leaving" : ""}`}
          aria-hidden="true"
        >
          <svg
            className="intro-surface"
          >
            <defs>
              <mask id="intro-holes" maskUnits="userSpaceOnUse">
                <rect width="100%" height="100%" fill="white" />
                <circle
                  className="intro-reveal-hole"
                  cx="50%"
                  cy="57.5%"
                  r="8%"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              className="intro-surface-fill"
              width="100%"
              height="100%"
              mask="url(#intro-holes)"
            />
          </svg>
        </div>
      )}

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
          <div className="hero-image-mask">
            <svg
              className="hero-image"
              viewBox="0 0 735 859"
              preserveAspectRatio="xMidYMid slice"
              role="group"
              aria-label="Interactive apartment floor plan"
            >
              <image href="/plan.jpeg" width="735" height="859" />

              {rooms.map((room) => (
                <g
                  key={room.id}
                  className={`room-hotspot room-hotspot--${room.id}${selectedRoom === room.name ? " is-selected" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${room.name}`}
                  onClick={() => setSelectedRoom(room.name)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedRoom(room.name);
                    }
                  }}
                >
                  <polygon points={room.points} />
                  <title>{room.name}</title>
                </g>
              ))}
            </svg>
          </div>

          <p className="room-status" aria-live="polite">
            {selectedRoom ? `${selectedRoom} selected` : "Select a room"}
          </p>

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
