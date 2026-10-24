# Raghul Sah — 3D Scroll Story Portfolio

An interactive, scroll-driven portfolio built with React, Vite, React Three Fiber, Three.js, GSAP ScrollTrigger, and Drei. The 3D scene remains in view while scrolling advances the camera through six connected stations: origin, thesis, projects, build log, experience, and contact.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, then preview it with `npm run preview`.

## Interaction model

- Scroll to move the camera along a six-stage 3D route.
- Move the pointer on desktop for gentle parallax; coarse-pointer devices avoid this extra motion.
- Select a project card or its 3D artifact to change the active project signal.
- Use the fixed navigation or left story rail to jump between sections.
- Copy a starter outreach message from the final section; no fake submission form or invented contact endpoint is included.
- The layout responds to mobile widths and follows `prefers-reduced-motion`.

## Design references

The direction combines the exploratory 3D world of [Bruno Simon](https://bruno-simon.com/), the immersive scroll-motion treatment featured in the [0110 Studio Awwwards showcase](https://www.awwwards.com/inspiration/3d-scroll-animation-0110-studio-portfolio-web), and scroll-driven 3D narrative principles described in [Hilo Studio's Tabasco case study](https://hilostudiolab.com/en/projects/tabasco). These are inspiration references, not copied assets or layouts.

Implementation references: [Three.js WebGLRenderer documentation](https://threejs.org/docs/pages/WebGLRenderer), [React Three Fiber `useFrame` documentation](https://github.com/pmndrs/react-three-fiber/blob/master/docs/API/hooks.mdx), and [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Project content

Project and experience copy is authored from the supplied context. Add real personal contact details or outbound social URLs when they are available; this build deliberately avoids fabricated email addresses, profile links, performance metrics, or project URLs.
