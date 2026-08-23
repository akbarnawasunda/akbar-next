import { useEffect } from "react";
import { useLocation } from "wouter";
import "./MotionOrchestrator.css";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#";
const SCRAMBLE_TARGETS =
  "a[href],button,h1,h2,h3,.eyebrow,.nf-page-eyebrow,.an-section-index";

function collectTextNodes(element: Element) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (
        !node.textContent?.trim() ||
        parent?.closest("svg,[data-no-scramble]")
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current: Node | null = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

function scrambleElement(element: HTMLElement) {
  if (element.dataset.scrambleRunning === "true") return;

  const nodes = collectTextNodes(element);
  if (!nodes.length) return;

  const finals = nodes.map(node => node.textContent ?? "");
  const previousAriaLabel = element.getAttribute("aria-label");
  const accessibleText = finals.join(" ").replace(/\s+/g, " ").trim();
  const start = performance.now();
  const duration = 420;
  let frame = 0;

  element.dataset.scrambleRunning = "true";
  if (!previousAriaLabel) element.setAttribute("aria-label", accessibleText);

  const update = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const revealCount = Math.floor(
      progress * 1.18 * finals.reduce((sum, value) => sum + value.length, 0)
    );
    let offset = 0;

    nodes.forEach((node, nodeIndex) => {
      const value = finals[nodeIndex];
      node.textContent = [...value]
        .map((character, characterIndex) => {
          if (/\s/.test(character)) return character;
          const isRevealed = offset + characterIndex < revealCount;
          if (isRevealed) return character;
          const randomIndex =
            (Math.floor(now / 34) + nodeIndex * 11 + characterIndex * 5) %
            SCRAMBLE_CHARS.length;
          return SCRAMBLE_CHARS[randomIndex];
        })
        .join("");
      offset += value.length;
    });

    if (progress < 1) {
      frame = window.requestAnimationFrame(update);
      return;
    }

    nodes.forEach((node, nodeIndex) => {
      node.textContent = finals[nodeIndex];
    });
    if (!previousAriaLabel) element.removeAttribute("aria-label");
    delete element.dataset.scrambleRunning;
    frame = 0;
  };

  frame = window.requestAnimationFrame(update);

  window.setTimeout(() => {
    if (!element.isConnected || !element.dataset.scrambleRunning) return;
    if (frame) window.cancelAnimationFrame(frame);
    nodes.forEach((node, nodeIndex) => {
      node.textContent = finals[nodeIndex];
    });
    if (!previousAriaLabel) element.removeAttribute("aria-label");
    delete element.dataset.scrambleRunning;
  }, duration + 160);
}

function useScrambleInteraction() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const element = target.closest<HTMLElement>(SCRAMBLE_TARGETS);
      if (!element || element.closest("[data-no-scramble]")) return;
      scrambleElement(element);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

function usePublicSectionReveal(location: string) {
  useEffect(() => {
    let cancelled = false;
    let retryId: number | undefined;
    let observer: IntersectionObserver | undefined;

    const setup = () => {
      if (cancelled) return;

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(".nf-page main > section")
      );

      // Lazy-loaded route modules can render after this effect's first pass.
      // Retry briefly so the reveal system attaches to the actual page sections.
      if (!sections.length) {
        retryId = window.setTimeout(setup, 50);
        return;
      }

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reducedMotion || !("IntersectionObserver" in window)) {
        sections.forEach(section => section.classList.add("is-motion-in-view"));
        return;
      }

      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-motion-in-view");
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8%" }
      );

      sections.forEach(section => observer?.observe(section));
    };

    setup();

    return () => {
      cancelled = true;
      if (retryId !== undefined) window.clearTimeout(retryId);
      observer?.disconnect();
    };
  }, [location]);
}

export function MotionOrchestrator() {
  const [location] = useLocation();
  useScrambleInteraction();
  usePublicSectionReveal(location);
  return null;
}
