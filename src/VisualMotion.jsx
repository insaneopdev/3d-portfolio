import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const REVEAL_SELECTOR = [
  '.reveal',
  '.section-heading',
  '.section-title',
  '.section-kicker',
  '.project-card',
  '.project-tile',
  '.project-row',
  '.experience-card',
  '.experience-entry',
  '.timeline-item',
  '.stat-card',
  '.about-card',
  '.archive-card',
  '.contact-card',
  '.scene-focus-card',
  '.project-grid > *',
  '.projects-grid > *',
  '.experience-grid > *',
].join(', ');

const CARD_SELECTOR = [
  '.project-card',
  '.project-tile',
  '.archive-card',
  '.experience-card',
  '.contact-card',
  '.scene-focus-card',
].join(', ');

const POPUP_SELECTOR = '.project-modal-backdrop, .archive-backdrop, [role=dialog][aria-modal=true]';
const BACKDROP_SELECTOR = '.project-modal-backdrop, .archive-backdrop';

const uniqueElements = (elements) => [...new Set(elements.filter(Boolean))];

const hasFinePointer = () =>
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;

export default function VisualMotion() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const app = document.querySelector('.portfolio-app') || document.getElementById('root');
    if (!app) return undefined;

    app.classList.add('motion-enhanced');

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (reducedMotion) {
      return () => app.classList.remove('motion-enhanced');
    }

    gsap.registerPlugin(ScrollTrigger);

    let context = null;
    let observer = null;
    let refreshFrame = 0;
    let pointerXTo = null;
    let pointerYTo = null;

    const header = app.querySelector('.site-header');
    const progressBar = app.querySelector('.scroll-progress') || document.querySelector('.scroll-progress');
    const finePointer = hasFinePointer();
    const animatedPopups = new WeakSet();

    const inContext = (callback) => {
      if (context) context.add(callback);
      else callback();
    };

    const handleScroll = () => {
      if (header) header.classList.toggle('motion-scrolled', window.scrollY > 24);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch' || !pointerXTo || !pointerYTo) return;

      const bounds = app.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
      const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));

      pointerXTo(`${x}%`);
      pointerYTo(`${y}%`);
    };

    const handlePointerOver = (event) => {
      if (event.pointerType === 'touch' || !(event.target instanceof Element)) return;

      const card = event.target.closest(CARD_SELECTOR);
      if (!card || !app.contains(card)) return;
      if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;

      inContext(() => {
        gsap.to(card, {
          y: -4,
          scale: 1.008,
          boxShadow: '0 18px 48px rgba(38, 32, 73, 0.11)',
          duration: 0.28,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      });
    };

    const handlePointerOut = (event) => {
      if (!(event.target instanceof Element)) return;

      const card = event.target.closest(CARD_SELECTOR);
      if (!card || !app.contains(card)) return;
      if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return;

      inContext(() => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: '0 0 0 rgba(38, 32, 73, 0)',
          duration: 0.34,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => {
            if (card.isConnected) gsap.set(card, { clearProps: 'transform,boxShadow' });
          },
        });
      });
    };

    const handleProjectChange = () => {
      const annotation = app.querySelector('.scene-project-annotation');
      if (annotation) {
        inContext(() => {
          gsap.killTweensOf(annotation);
          gsap.fromTo(
            annotation,
            { autoAlpha: 0.6, y: 10, filter: 'blur(3px)' },
            {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.48,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility,filter',
            },
          );

          const title = annotation.querySelector('strong');
          if (title) {
            gsap.fromTo(
              title,
              { y: 7, autoAlpha: 0.65 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.4,
                delay: 0.04,
                ease: 'power2.out',
                clearProps: 'transform,opacity,visibility',
              },
            );
          }
        });
      }

      const focusCard = app.querySelector('.scene-focus-card');
      if (focusCard) {
        inContext(() => {
          gsap.fromTo(
            focusCard,
            { y: 7, autoAlpha: 0.72 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.42,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility',
            },
          );
        });
      }
    };

    const animatePopup = (popup) => {
      if (!(popup instanceof Element) || animatedPopups.has(popup)) return;
      animatedPopups.add(popup);

      const surface = popup.matches('[role=dialog]')
        ? popup
        : popup.querySelector('[role=dialog]') || popup.firstElementChild;

      inContext(() => {
        if (popup !== surface) {
          gsap.fromTo(
            popup,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 0.24,
              ease: 'power1.out',
              clearProps: 'opacity,visibility',
            },
          );
        }

        if (surface) {
          gsap.fromTo(
            surface,
            { autoAlpha: 0, y: 18, scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.42,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility',
            },
          );
        }
      });
    };

    const inspectAddedNode = (node) => {
      if (!(node instanceof Element)) return;

      if (node.matches(POPUP_SELECTOR)) {
        if (node.matches('[role=dialog]') && node.closest(BACKDROP_SELECTOR)) {
          return;
        }
        animatePopup(node);
      }

      node.querySelectorAll(POPUP_SELECTOR).forEach((popup) => {
        if (popup.matches('[role=dialog]') && popup.closest(BACKDROP_SELECTOR)) return;
        animatePopup(popup);
      });
    };

    const refreshTriggers = () => {
      ScrollTrigger.refresh();
    };

    context = gsap.context(() => {
      if (header) {
        gsap.fromTo(
          header,
          { y: -16, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.82,
            delay: 0.08,
            ease: 'power3.out',
            clearProps: 'transform,opacity,visibility',
          },
        );

        const brandMark = header.querySelector('.brand-mark');
        if (brandMark) {
          gsap.fromTo(
            brandMark,
            { scale: 0.78, rotation: -9 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.72,
              delay: 0.3,
              ease: 'back.out(1.7)',
              clearProps: 'transform',
            },
          );
        }

        const navigationLinks = gsap.utils.toArray('nav a, nav button', header);
        if (navigationLinks.length) {
          gsap.fromTo(
            navigationLinks,
            { y: -7, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.46,
              stagger: 0.065,
              delay: 0.25,
              ease: 'power2.out',
              clearProps: 'transform,opacity,visibility',
            },
          );
        }
      }

      const heroTitle = app.querySelector('.hero-title')
        || app.querySelector('.hero h1')
        || app.querySelector('.hero-section h1')
        || app.querySelector('h1');

      const heroSection = heroTitle?.closest('section') || heroTitle?.parentElement;
      const heroEyebrow = app.querySelector('.hero-eyebrow')
        || app.querySelector('.hero-kicker')
        || app.querySelector('.hero .eyebrow');
      const heroCopy = app.querySelector('.hero-description')
        || app.querySelector('.hero-copy')
        || heroSection?.querySelector('p');
      const heroActions = app.querySelector('.hero-actions, .hero-buttons, .hero-cta-row, .hero-ctas')
        || heroSection?.querySelector('.actions, .cta-group');

      const introTargets = uniqueElements([
        heroEyebrow,
        heroTitle,
        heroCopy,
        heroActions,
        ...(!heroActions && heroSection ? Array.from(heroSection.querySelectorAll('a, button')).slice(0, 3) : []),
      ]).filter((element) => !header?.contains(element));

      if (introTargets.length) {
        gsap.fromTo(
          introTargets,
          { y: 25, autoAlpha: 0, filter: 'blur(5px)' },
          {
            y: 0,
            autoAlpha: 1,
            filter: 'blur(0px)',
            duration: 0.82,
            stagger: 0.105,
            delay: 0.16,
            ease: 'power3.out',
            clearProps: 'transform,opacity,visibility,filter',
          },
        );
      }

      const revealElements = uniqueElements(
        gsap.utils.toArray(REVEAL_SELECTOR, app),
      ).filter((element) => {
        if (header?.contains(element)) return false;
        if (introTargets.some((intro) => intro === element || intro.contains(element) || element.contains(intro))) {
          return false;
        }
        return true;
      });

      revealElements.forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            delay: (index % 4) * 0.045,
            ease: 'power3.out',
            clearProps: 'transform,opacity,visibility',
            scrollTrigger: {
              trigger: element,
              start: 'top 89%',
              once: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      if (progressBar) {
        gsap.set(progressBar, { scaleX: 0, transformOrigin: 'left center' });

        ScrollTrigger.create({
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(progressBar, { scaleX: self.progress });
          },
        });
      }

      if (finePointer) {
        pointerXTo = gsap.quickTo(app, '--motion-pointer-x', {
          duration: 1.05,
          ease: 'power3.out',
        });
        pointerYTo = gsap.quickTo(app, '--motion-pointer-y', {
          duration: 1.05,
          ease: 'power3.out',
        });
      }
    }, app);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('portfolio:viewer-project-change', handleProjectChange);
    handleScroll();

    if (finePointer) {
      app.addEventListener('pointermove', handlePointerMove, { passive: true });
      app.addEventListener('pointerover', handlePointerOver, { passive: true });
      app.addEventListener('pointerout', handlePointerOut, { passive: true });
    }

    window.addEventListener('load', refreshTriggers, { once: true });
    refreshFrame = window.requestAnimationFrame(refreshTriggers);

    if (typeof MutationObserver !== 'undefined' && document.body) {
      observer = new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach(inspectAddedNode);
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('portfolio:viewer-project-change', handleProjectChange);
      window.removeEventListener('load', refreshTriggers);
      window.cancelAnimationFrame(refreshFrame);

      app.removeEventListener('pointermove', handlePointerMove);
      app.removeEventListener('pointerover', handlePointerOver);
      app.removeEventListener('pointerout', handlePointerOut);

      observer?.disconnect();
      context?.revert();
      gsap.killTweensOf(app);
      app.classList.remove('motion-enhanced');
      header?.classList.remove('motion-scrolled');
    };
  }, []);

  return null;
}
