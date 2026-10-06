"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft01Icon, ArrowRight01Icon, Camera01Icon, Image01Icon, Video01Icon } from "hugeicons-react";
import { Artwork } from "./shared";
import styles from "./face-search.module.css";

const slides = [
  { artwork: "dashboard/search", icon: Image01Icon, label: "PHOTO SEARCH", title: "A clearer photo. A better starting point.", description: "Choose a well-lit photograph with the face visible. Select the exact person before searching." },
  { artwork: "search/video", icon: Video01Icon, label: "VIDEO FRAMES", title: "Find the moment that matters.", description: "Upload a short clip, browse the detected frames, and choose the clearest face to continue." },
  { artwork: "search/live", icon: Camera01Icon, label: "LIVE CAMERA", title: "Capture a clue as it happens.", description: "Start the camera, freeze a clear frame, and select one face. You stay in control of the search." },
];

export function SearchGuideCarousel() {
  const [viewport, carousel] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if (!carousel) return;
    const update = () => setSelected(carousel.selectedScrollSnap());
    carousel.on("select", update).on("reInit", update);
    return () => { carousel.off("select", update).off("reInit", update); };
  }, [carousel]);
  return <section className={styles.guide} aria-roledescription="carousel" aria-label="Face search guide" tabIndex={0} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowLeft") { event.preventDefault(); carousel?.scrollPrev(); } if (event.key === "ArrowRight") { event.preventDefault(); carousel?.scrollNext(); } }}>
    <div className={styles.guideTop}><span>THE NEXT STEP</span><span>{String(selected + 1).padStart(2, "0")} / 03</span></div>
    <div ref={viewport} className={styles.carouselViewport}><div className={styles.carouselTrack}>{slides.map((slide, index) => <div key={slide.label} className={styles.guideSlide} aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} aria-hidden={index !== selected}>
      <div className={styles.guideArtwork}><Artwork name={slide.artwork} /></div><div className={styles.guideCopy}><p><slide.icon size={16} aria-hidden="true" />{slide.label}</p><h2>{slide.title}</h2><span>{slide.description}</span></div>
    </div>)}</div></div>
    <div className={styles.carouselControls}><div className={styles.carouselDots}>{slides.map((slide, index) => <button key={slide.label} aria-label={`Show guide ${index + 1}: ${slide.label.toLowerCase()}`} aria-current={index === selected ? "true" : undefined} onClick={() => carousel?.scrollTo(index)} />)}</div><div className={styles.controlGroup}><button aria-label="Previous guide" onClick={() => carousel?.scrollPrev()}><ArrowLeft01Icon size={17} /></button><button aria-label="Next guide" onClick={() => carousel?.scrollNext()}><ArrowRight01Icon size={17} /></button></div></div>
  </section>;
}
