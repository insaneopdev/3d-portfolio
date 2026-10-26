import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CARDS = '.project-card,.project-tile,.archive-card,.experience-card,.contact-card,.scene-focus-card';
const REVEALS = '.reveal,.section-heading,.section-title,.section-kicker,.project-card,.project-tile,.project-row,.experience-card,.experience-entry,.timeline-item,.stat-card,.about-card,.archive-card,.contact-card,.scene-focus-card,.project-grid > *, .projects-grid > *, .experience-grid > *';
const INTERACTIVE = `a,button,[role="button"],${CARDS}`;
const MAGNETIC = '.hero-actions a,.hero-buttons a,.hero-cta-row a,.hero-ctas a,.button-primary,.contact-email';
const POPUPS = '.project-modal-backdrop,.archive-backdrop,[role="dialog"][aria-modal="true"]';
const BACKDROPS = '.project-modal-backdrop,.archive-backdrop';
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const unique = (items) => [...new Set(items.filter(Boolean))];
const finePointer = () => window.matchMedia?.('(hover:hover) and (pointer:fine) and (min-width:721px)').matches ?? false;

export default function VisualMotion() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    const app = document.querySelector('.portfolio-app') || document.getElementById('root');
    if (!app) return undefined;
    app.classList.add('motion-enhanced');
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return () => app.classList.remove('motion-enhanced');
    }

    gsap.registerPlugin(ScrollTrigger);
    let ctx, observer, raf;
    let lastPointer = null, activeCard = null, activeMagnet = null;
    let bgX, bgY, cursorX, cursorY, chainAngle, pendantX, pendantY, cubeX, cubeY, cubeZ;
    const header = app.querySelector('.site-header');
    const progress = app.querySelector('.scroll-progress') || document.querySelector('.scroll-progress');
    const desktop = finePointer();
    const seenPopups = new WeakSet();
    const cardSetters = new WeakMap(), magnetSetters = new WeakMap();
    const cardsTouched = new Set(), magnetsTouched = new Set();
    let cursor, core, halo, chain, pendant, cube;
    const scoped = (fn) => ctx ? ctx.add(fn) : fn();

    if (desktop) {
      cursor = document.createElement('div');
      cursor.className = 'motion-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.innerHTML = '<span class="motion-cursor__halo"></span><span class="motion-cursor__core"></span><span class="motion-cursor__chain"></span><span class="motion-cursor__cube-wrap"><span class="motion-cursor__cube"><i class="motion-cursor__face motion-cursor__face--front">RS</i><i class="motion-cursor__face motion-cursor__face--back">3D</i><i class="motion-cursor__face motion-cursor__face--right">✦</i><i class="motion-cursor__face motion-cursor__face--left">01</i><i class="motion-cursor__face motion-cursor__face--top"></i><i class="motion-cursor__face motion-cursor__face--bottom"></i></span></span>';
      document.body.appendChild(cursor);
      document.documentElement.classList.add('motion-cursor-enabled');
      core = cursor.querySelector('.motion-cursor__core');
      halo = cursor.querySelector('.motion-cursor__halo');
      chain = cursor.querySelector('.motion-cursor__chain');
      pendant = cursor.querySelector('.motion-cursor__cube-wrap');
      cube = cursor.querySelector('.motion-cursor__cube');
      gsap.set(cursor, { autoAlpha: 0, x: -100, y: -100 });
      gsap.set(cube, { rotationX: -23, rotationY: 28, rotationZ: 8, transformPerspective: 520 });
    }

    const getCardSetters = (el) => {
      let s = cardSetters.get(el);
      if (!s) {
        s = { x: gsap.quickTo(el, 'rotationX', { duration: .24, ease: 'power3.out' }), y: gsap.quickTo(el, 'rotationY', { duration: .24, ease: 'power3.out' }) };
        cardSetters.set(el, s); cardsTouched.add(el);
      }
      return s;
    };
    const getMagnetSetters = (el) => {
      let s = magnetSetters.get(el);
      if (!s) {
        s = { x: gsap.quickTo(el, 'x', { duration: .28, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: .28, ease: 'power3.out' }) };
        magnetSetters.set(el, s); magnetsTouched.add(el);
      }
      return s;
    };
    const resetMagnet = (el) => { const s = el && magnetSetters.get(el); s?.x(0); s?.y(0); };
    const onScroll = () => header?.classList.toggle('motion-scrolled', window.scrollY > 24);

    const onMove = (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = app.getBoundingClientRect();
      if (bgX && bounds.width && bounds.height) {
        bgX(`${clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100)}%`);
        bgY(`${clamp((event.clientY - bounds.top) / bounds.height * 100, 0, 100)}%`);
      }
      if (!(event.target instanceof Element)) return;
      if (cursor) {
        if (!cursor.classList.contains('is-visible')) {
          cursor.classList.add('is-visible');
          gsap.to(cursor, { autoAlpha: 1, duration: .18, ease: 'power2.out', overwrite: 'auto' });
        }
        cursor.classList.toggle('is-interactive', Boolean(event.target.closest(INTERACTIVE)));
        const dx = lastPointer ? event.clientX - lastPointer.x : 0;
        const dy = lastPointer ? event.clientY - lastPointer.y : 0;
        lastPointer = { x: event.clientX, y: event.clientY };
        cursorX?.(event.clientX); cursorY?.(event.clientY);
        chainAngle?.(clamp(-dx * .9 + dy * .12, -24, 24));
        pendantX?.(clamp(-dx * .34, -9, 9)); pendantY?.(clamp(-dy * .18, -7, 7));
        cubeX?.(clamp(-23 + dy * .5, -43, -4)); cubeY?.(clamp(28 + dx * .56, -8, 64));
        cubeZ?.(clamp(8 - dx * .45 + dy * .22, -22, 26));
      }

      const card = event.target.closest(CARDS);
      if (card && app.contains(card)) {
        if (activeCard && activeCard !== card) { const old = cardSetters.get(activeCard); old?.x(0); old?.y(0); }
        activeCard = card;
        const r = card.getBoundingClientRect();
        if (r.width && r.height) {
          const s = getCardSetters(card);
          s.x(clamp(-((event.clientY - r.top) / r.height - .5) * 4.6, -3.5, 3.5));
          s.y(clamp(((event.clientX - r.left) / r.width - .5) * 6.5, -5, 5));
        }
      } else if (activeCard) {
        const s = cardSetters.get(activeCard); s?.x(0); s?.y(0); activeCard = null;
      }

      const magnet = event.target.closest(MAGNETIC);
      if (magnet && app.contains(magnet)) {
        if (activeMagnet && activeMagnet !== magnet) resetMagnet(activeMagnet);
        activeMagnet = magnet;
        const r = magnet.getBoundingClientRect(), s = getMagnetSetters(magnet);
        s.x(clamp((event.clientX - r.left - r.width / 2) * .11, -8, 8));
        s.y(clamp((event.clientY - r.top - r.height / 2) * .13, -7, 7));
      } else if (activeMagnet) { resetMagnet(activeMagnet); activeMagnet = null; }
    };

    const onOver = (event) => {
      if (event.pointerType === 'touch' || !(event.target instanceof Element)) return;
      const card = event.target.closest(CARDS);
      if (!card || !app.contains(card) || (event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) return;
      scoped(() => gsap.to(card, { y: -4, scale: 1.008, transformPerspective: 1000, transformStyle: 'preserve-3d', boxShadow: '0 18px 48px rgba(38,32,73,.11)', duration: .28, ease: 'power3.out', overwrite: 'auto' }));
    };
    const onOut = (event) => {
      if (!(event.target instanceof Element)) return;
      const card = event.target.closest(CARDS);
      if (card && app.contains(card) && !(event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) {
        scoped(() => gsap.to(card, { y: 0, scale: 1, rotationX: 0, rotationY: 0, boxShadow: '0 0 0 rgba(38,32,73,0)', duration: .36, ease: 'power3.out', overwrite: 'auto', onComplete: () => card.isConnected && gsap.set(card, { clearProps: 'transform,transformPerspective,transformStyle,boxShadow' }) }));
        if (activeCard === card) activeCard = null;
      }
      const magnet = event.target.closest(MAGNETIC);
      if (magnet && !(event.relatedTarget instanceof Node && magnet.contains(event.relatedTarget))) {
        resetMagnet(magnet); if (activeMagnet === magnet) activeMagnet = null;
      }
    };
    const onLeave = () => {
      if (cursor) { cursor.classList.remove('is-visible', 'is-interactive', 'is-pressed'); gsap.to(cursor, { autoAlpha: 0, duration: .22, overwrite: 'auto' }); }
      resetMagnet(activeMagnet); activeMagnet = null;
      const s = activeCard && cardSetters.get(activeCard); s?.x(0); s?.y(0); activeCard = null; lastPointer = null;
    };
    const onDown = (event) => {
      if (!cursor || event.button !== 0) return;
      cursor.classList.add('is-pressed');
      gsap.to(core, { scale: .76, duration: .09, ease: 'power2.out', overwrite: 'auto' });
      gsap.killTweensOf(halo); gsap.set(halo, { scale: .45, autoAlpha: .72 });
      gsap.to(halo, { scale: 2.45, autoAlpha: 0, duration: .48, ease: 'power2.out', overwrite: 'auto' });
    };
    const onUp = () => { if (cursor) { cursor.classList.remove('is-pressed'); gsap.to(core, { scale: 1, duration: .18, ease: 'back.out(2)', overwrite: 'auto' }); } };

    const onProjectChange = () => {
      const annotation = app.querySelector('.scene-project-annotation');
      if (annotation) scoped(() => {
        gsap.killTweensOf(annotation);
        gsap.fromTo(annotation, { autoAlpha: .6, y: 10, filter: 'blur(3px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .48, ease: 'power3.out', clearProps: 'transform,opacity,visibility,filter' });
        const title = annotation.querySelector('strong');
        if (title) gsap.fromTo(title, { y: 7, autoAlpha: .65 }, { y: 0, autoAlpha: 1, duration: .4, delay: .04, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
      });
      const focus = app.querySelector('.scene-focus-card');
      if (focus) scoped(() => gsap.fromTo(focus, { y: 7, autoAlpha: .72, scale: .99 }, { y: 0, autoAlpha: 1, scale: 1, duration: .42, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }));
    };
    const animatePopup = (popup) => {
      if (!(popup instanceof Element) || seenPopups.has(popup)) return;
      seenPopups.add(popup);
      const surface = popup.matches('[role="dialog"]') ? popup : popup.querySelector('[role="dialog"]') || popup.firstElementChild;
      scoped(() => {
        if (popup !== surface) gsap.fromTo(popup, { autoAlpha: 0 }, { autoAlpha: 1, duration: .24, ease: 'power1.out', clearProps: 'opacity,visibility' });
        if (surface) gsap.fromTo(surface, { autoAlpha: 0, y: 18, scale: .985, filter: 'blur(3px)' }, { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .42, ease: 'power3.out', clearProps: 'transform,opacity,visibility,filter' });
      });
    };
    const inspectNode = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(POPUPS) && !(node.matches('[role="dialog"]') && node.closest(BACKDROPS))) animatePopup(node);
      node.querySelectorAll(POPUPS).forEach((popup) => {
        if (!(popup.matches('[role="dialog"]') && popup.closest(BACKDROPS))) animatePopup(popup);
      });
    };

    ctx = gsap.context(() => {
      if (header) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(header, { y: -16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .82, clearProps: 'transform,opacity,visibility' });
        const brand = header.querySelector('.brand-mark');
        if (brand) tl.fromTo(brand, { scale: .78, rotation: -9 }, { scale: 1, rotation: 0, duration: .65, ease: 'back.out(1.7)', clearProps: 'transform' }, '-=.53');
        const links = gsap.utils.toArray('nav a,nav button', header);
        if (links.length) tl.fromTo(links, { y: -7, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .46, stagger: .065, clearProps: 'transform,opacity,visibility' }, '-=.46');
      }

      const title = app.querySelector('.hero-title') || app.querySelector('.hero h1') || app.querySelector('.hero-section h1') || app.querySelector('h1');
      const hero = title?.closest('section') || title?.parentElement;
      const eyebrow = app.querySelector('.hero-eyebrow,.hero-kicker,.hero .eyebrow');
      const copy = app.querySelector('.hero-description,.hero-copy') || hero?.querySelector('p');
      const actions = app.querySelector('.hero-actions,.hero-buttons,.hero-cta-row,.hero-ctas') || hero?.querySelector('.actions,.cta-group');
      const intro = unique([eyebrow, title, copy, actions, ...(!actions && hero ? [...hero.querySelectorAll('a,button')].slice(0, 3) : [])]).filter((el) => !header?.contains(el));
      if (intro.length) gsap.fromTo(intro, { y: 25, autoAlpha: 0, filter: 'blur(5px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: .82, stagger: .105, delay: .12, ease: 'power3.out', clearProps: 'transform,opacity,visibility,filter' });

      unique(gsap.utils.toArray(REVEALS, app)).filter((el) => !header?.contains(el) && !intro.some((item) => item === el || item.contains(el) || el.contains(item))).forEach((el, i) => {
        gsap.fromTo(el, { autoAlpha: 0, y: 28, scale: .978, filter: 'blur(2px)' }, { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: .76, delay: (i % 4) * .045, ease: 'power3.out', clearProps: 'transform,opacity,visibility,filter', scrollTrigger: { trigger: el, start: 'top 89%', once: true, invalidateOnRefresh: true } });
      });
      unique(gsap.utils.toArray('.section-label,.section-kicker', app)).filter((el) => !intro.includes(el) && !header?.contains(el)).forEach((el) => {
        gsap.fromTo(el, { x: -12, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .52, ease: 'power2.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: el, start: 'top 91%', once: true } });
      });
      gsap.utils.toArray('.section-rule,.section-divider,.heading-rule', app).forEach((el) => {
        gsap.fromTo(el, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: .9, ease: 'power3.inOut', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
      });
      unique(gsap.utils.toArray('.hero-orbit,.hero-visual-orbit,.hero-ambient-shape,.hero-glow', app)).forEach((el, i) => {
        if (hero) gsap.to(el, { y: i % 2 ? -17 : -28, rotation: i % 2 ? -2.5 : 3, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .75, invalidateOnRefresh: true } });
      });
      unique(gsap.utils.toArray('.hero-orbit-note,.hero-scroll,.hero-scroll-indicator', app)).forEach((el, i) => gsap.to(el, { y: i % 2 ? 5 : -5, duration: 2.6 + i * .35, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
      if (progress) {
        gsap.set(progress, { scaleX: 0, transformOrigin: 'left center' });
        ScrollTrigger.create({ trigger: document.documentElement, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onUpdate: (self) => gsap.set(progress, { scaleX: self.progress }) });
      }
      if (desktop) {
        bgX = gsap.quickTo(app, '--motion-pointer-x', { duration: 1.05, ease: 'power3.out' });
        bgY = gsap.quickTo(app, '--motion-pointer-y', { duration: 1.05, ease: 'power3.out' });
        cursorX = gsap.quickTo(cursor, 'x', { duration: .16, ease: 'power3.out' });
        cursorY = gsap.quickTo(cursor, 'y', { duration: .16, ease: 'power3.out' });
        chainAngle = gsap.quickTo(chain, 'rotationZ', { duration: .3, ease: 'power3.out' });
        pendantX = gsap.quickTo(pendant, 'x', { duration: .34, ease: 'elastic.out(1,.62)' });
        pendantY = gsap.quickTo(pendant, 'y', { duration: .38, ease: 'elastic.out(1,.62)' });
        cubeX = gsap.quickTo(cube, 'rotationX', { duration: .32, ease: 'power3.out' });
        cubeY = gsap.quickTo(cube, 'rotationY', { duration: .34, ease: 'power3.out' });
        cubeZ = gsap.quickTo(cube, 'rotationZ', { duration: .36, ease: 'power3.out' });
      }
    }, app);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('portfolio:viewer-project-change', onProjectChange);
    onScroll();
    if (desktop) {
      app.addEventListener('pointermove', onMove, { passive: true });
      app.addEventListener('pointerover', onOver, { passive: true });
      app.addEventListener('pointerout', onOut, { passive: true });
      app.addEventListener('pointerleave', onLeave, { passive: true });
      app.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
    }
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    raf = window.requestAnimationFrame(refresh);
    if (typeof MutationObserver !== 'undefined' && document.body) {
      observer = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach(inspectNode)));
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('portfolio:viewer-project-change', onProjectChange);
      window.removeEventListener('load', refresh);
      window.cancelAnimationFrame(raf);
      app.removeEventListener('pointermove', onMove);
      app.removeEventListener('pointerover', onOver);
      app.removeEventListener('pointerout', onOut);
      app.removeEventListener('pointerleave', onLeave);
      app.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      observer?.disconnect(); ctx?.revert();
      if (cursor) { gsap.killTweensOf([cursor, core, halo, chain, pendant, cube]); cursor.remove(); document.documentElement.classList.remove('motion-cursor-enabled'); }
      magnetsTouched.forEach((el) => { gsap.killTweensOf(el); if (el.isConnected) gsap.set(el, { clearProps: 'transform' }); });
      cardsTouched.forEach((el) => { gsap.killTweensOf(el); if (el.isConnected) gsap.set(el, { clearProps: 'transform,transformPerspective,transformStyle,boxShadow' }); });
      app.classList.remove('motion-enhanced'); header?.classList.remove('motion-scrolled');
    };
  }, []);
  return null;
}
