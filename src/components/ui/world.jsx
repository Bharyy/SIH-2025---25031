"use client";
import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export const World = () => {
  const canvasRef = useRef();
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(null);
  const spring = useRef({ r: 0 });

  useEffect(() => {
    let phi = 0;
    let width = 0;
    const onResize = () =>
      canvasRef.current && (width = canvasRef.current.offsetWidth);

    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: -0.3, // Fixed: Changed from 0.3 to -0.3 to flip globe right-side up
      dark: 1,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: 0.8,
      baseColor: [0.2, 0.2, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.8, 0.8, 1],
      markers: [],
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.005;
        }
        state.phi = phi + spring.current.r;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    // Fixed: Remove setTimeout for immediate visibility
    if (canvasRef.current) {
      canvasRef.current.style.opacity = "1";
    }

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => {
        pointerInteracting.current =
          e.clientX - pointerInteractionMovement.current;
        canvasRef.current.style.cursor = "grabbing";
      }}
      onPointerUp={() => {
        pointerInteracting.current = null;
        canvasRef.current.style.cursor = "grab";
      }}
      onPointerOut={() => {
        pointerInteracting.current = null;
        canvasRef.current.style.cursor = "grab";
      }}
      onMouseMove={(e) => {
        if (pointerInteracting.current !== null) {
          const delta = e.clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta;
          spring.current.r = delta / 200;
        }
      }}
      onTouchMove={(e) => {
        if (pointerInteracting.current !== null && e.touches[0]) {
          const delta = e.touches[0].clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta;
          spring.current.r = delta / 200;
        }
      }}
      style={{
        width: "100%",
        height: "100%",
        cursor: "grab",
        contain: "layout style size",
        opacity: 1, // Fixed: Set to 1 for immediate visibility
        transition: "none", // Fixed: Remove transition
      }}
    />
  );
};