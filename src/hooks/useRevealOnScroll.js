import { useEffect, useRef } from 'react';

/**
 * Adds a "visible" class to any descendant matching [data-reveal] the first
 * time it crosses into the viewport. One IntersectionObserver per page/tab
 * that calls this, not one per element. A MutationObserver picks up elements
 * added later by React re-renders (e.g. a new card pushed into a list) -
 * without it, anything added after mount would stay opacity:0 forever since
 * the IntersectionObserver would never have been told it exists.
 */
export function useRevealOnScroll() {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.15 });

    const observeAllUnseen = () => {
      root.querySelectorAll('[data-reveal]:not(.visible)').forEach(el => io.observe(el));
    };
    observeAllUnseen();

    const mo = new MutationObserver(observeAllUnseen);
    mo.observe(root, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, []);

  return containerRef;
}
