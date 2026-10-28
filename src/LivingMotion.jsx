import { useEffect } from 'react';
import './mobile-polish.css';

const REVEAL_SELECTOR = [
 '.hero-copy',
 '.hero-scene',
 '.section-heading',
 '.featured-card',
 '.more-projects-row',
 '.experience-row',
 '.about-stamp',
 '.about-section > div',
 '.contact-section > div',
].join(', ');

const SECTION_SELECTOR = [
 '.hero-section[id]',
 '.work-section[id]',
 '.experience-section[id]',
 '.about-section[id]',
 '.contact-section[id]',
].join(', ');

const NAV_SELECTOR = '.site-nav .nav-links a[href^="#"]';
const PRESS_SELECTOR = [
 '.button-primary',
 '.button-text',
 '.nav-mobile-toggle',
 '.featured-card',
 '.archive-card',
 '.scene-focus-card',
 '.scene-project-annotation',
 '.scene-project-arrow',
 '.modal-close',
 '.contact-email',
 '.contact-side a',
].join(', ');

export default function LivingMotion() {
 useEffect(() => {
 const app = document.querySelector('.portfolio-shell');
 if (!app) return undefined;

 const nav = app.querySelector('.site-nav');
 const navLinks = Array.from(app.querySelectorAll(NAV_SELECTOR));
 const sections = Array.from(app.querySelectorAll(SECTION_SELECTOR));
 const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

 app.classList.add('living-motion-enabled');

 let scrollFrame = 0;
 let revealObserver = null;
 let activeProjectFrame = 0;

 const showNode = (node) => {
 node.classList.add('is-living-visible');
 };

 if (!reduceMotion && 'IntersectionObserver' in window) {
 revealObserver = new IntersectionObserver(
 (entries, observer) => {
 entries.forEach((entry) => {
 if (!entry.isIntersecting) return;
 showNode(entry.target);
 observer.unobserve(entry.target);
 });
 },
 {
 root: null,
 rootMargin: '0px 0px -5% 0px',
 threshold: 0.06,
 },
 );
 }

 app.querySelectorAll(REVEAL_SELECTOR).forEach((node) => {
 node.classList.add('living-reveal');

 const siblings = node.parentElement
 ? Array.from(node.parentElement.children).filter((element) => element.matches(REVEAL_SELECTOR))
 : [];
 const siblingIndex = Math.max(0, siblings.indexOf(node));
 node.style.setProperty('--living-delay', `${Math.min(siblingIndex, 4) * 45}ms`);

 if (reduceMotion || !revealObserver) {
 showNode(node);
 } else {
 revealObserver.observe(node);
 }
 });

 const updateScrollState = () => {
 scrollFrame = 0;
 nav?.classList.toggle('is-living-scrolled', window.scrollY > 18);

 if (!sections.length || !navLinks.length) return;

 const marker = Math.min(window.innerHeight * 0.38, 280);
 let activeSection = sections[0];
 let closestDistance = Infinity;

 for (const section of sections) {
 const rect = section.getBoundingClientRect();

 if (rect.top <= marker && rect.bottom >= marker) {
 activeSection = section;
 closestDistance = 0;
 break;
 }

 if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
 const distance = Math.abs(rect.top - marker);

 if (distance < closestDistance) {
 closestDistance = distance;
 activeSection = section;
 }
 }

 for (const link of navLinks) {
 const active = link.getAttribute('href') === `#${activeSection.id}`;
 link.classList.toggle('is-living-active', active);

 if (active) {
 link.setAttribute('aria-current', 'location');
 } else {
 link.removeAttribute('aria-current');
 }
 }
 };

 const scheduleScrollUpdate = () => {
 if (scrollFrame) return;
 scrollFrame = window.requestAnimationFrame(updateScrollState);
 };

 const handleProjectChange = () => {
 if (reduceMotion) return;

 if (activeProjectFrame) window.cancelAnimationFrame(activeProjectFrame);
 activeProjectFrame = window.requestAnimationFrame(() => {
 activeProjectFrame = 0;
 const annotation = app.querySelector('.scene-project-annotation');
 if (!annotation) return;

 annotation.classList.remove('living-project-arrive');
 void annotation.offsetWidth;
 annotation.classList.add('living-project-arrive');
 });
 };

 const handlePointerDown = (event) => {
 if (reduceMotion || !(event.target instanceof Element)) return;
 const target = event.target.closest(PRESS_SELECTOR);
 if (!target || !app.contains(target)) return;
 target.classList.remove('living-is-pressed');
 target.classList.add('living-is-pressed');
 };

 const handleAnimationEnd = (event) => {
 if (!(event.target instanceof Element)) return;

 if (event.animationName === 'living-project-swap') {
 event.target.classList.remove('living-project-arrive');
 }
 if (event.animationName === 'living-press-pulse') {
 event.target.classList.remove('living-is-pressed');
 }
 };

 window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
 window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
 window.addEventListener('portfolio:viewer-project-change', handleProjectChange);
 app.addEventListener('pointerdown', handlePointerDown);
 app.addEventListener('animationend', handleAnimationEnd);
 scheduleScrollUpdate();

 return () => {
 window.removeEventListener('scroll', scheduleScrollUpdate);
 window.removeEventListener('resize', scheduleScrollUpdate);
 window.removeEventListener('portfolio:viewer-project-change', handleProjectChange);
 app.removeEventListener('pointerdown', handlePointerDown);
 app.removeEventListener('animationend', handleAnimationEnd);

 if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
 if (activeProjectFrame) window.cancelAnimationFrame(activeProjectFrame);
 revealObserver?.disconnect();

 app.classList.remove('living-motion-enabled');
 app.querySelectorAll('.living-reveal').forEach((node) => {
 node.classList.remove('living-reveal', 'is-living-visible');
 node.style.removeProperty('--living-delay');
 });
 app.querySelectorAll('.is-living-active, .living-is-pressed, .living-project-arrive').forEach((node) => {
 node.classList.remove('is-living-active', 'living-is-pressed', 'living-project-arrive');
 node.removeAttribute('aria-current');
 });
 nav?.classList.remove('is-living-scrolled');
 };
 }, []);

 return null;
}
