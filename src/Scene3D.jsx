import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, OrbitControls, Sparkles } from '@react-three/drei';
import './viewer-fixes.css';

const metal = { metalness: 0.35, roughness: 0.28 };
export const VIEWER_PROJECT_CHANGE_EVENT = 'portfolio:viewer-project-change';

/* Existing metadata for every project already supported by the viewer. */
const VIEWER_PROJECTS = [
  { id: 'sand', number: '01', name: 'SandScope', category: 'AI / COASTAL INTELLIGENCE', year: 'SIH ’25', description: 'Turning shoreline imagery into meaningful coastal signals, from boundary detection to sand-grain size estimation.', details: 'SandScope explores how shoreline imagery can be transformed into measurable coastal insights. The pipeline estimates sand-grain size from images and combines image-based predictions with environmental attributes to support coastal monitoring and understanding of erosion patterns.', stack: ['Python', 'Machine learning', 'OpenCV', 'Image processing', 'Hardware integration'], result: 'Shoreline analysis and sand-attribute detection', accent: '#5a56e8', model: 'shoreline', type: 'Featured project' },
  { id: 'vision', number: '02', name: 'VisionGuard', category: 'REAL-TIME AI / INDUSTRIAL SAFETY', year: 'DELPHI TVS', description: 'A vision-language safety monitoring system for detecting PPE compliance through existing CCTV infrastructure.', details: 'The safety surveillance workflow analyses frames to detect protective equipment such as helmets, goggles, masks, and vests. Multi-frame temporal verification helps reduce false positives, with industrial hardware and PLC/Modbus integration explored for safety alerts.', stack: ['Python', 'PyTorch', 'OpenCV', 'Vision-language models', 'PLC / Modbus'], result: 'Industrial AI / ML internship project', accent: '#ee785b', model: 'helmet', type: 'Featured project' },
  { id: 'blind', number: '03', name: 'BlindSight', category: 'ASSISTIVE TECHNOLOGY', year: 'HACKATHON PROJECT', description: 'Smart glasses exploring context-aware navigation, scene descriptions, and obstacle awareness.', details: 'A wearable smart-glasses concept using vision-language models to describe scenes and detect obstacles. It combines macro-navigation with map routing and micro-navigation for obstacle avoidance to support more independent mobility.', stack: ['Python', 'OpenCV', 'Vision-language models', 'Maps API', 'Sensor fusion'], result: '1st place at a hackathon', accent: '#609b56', model: 'glasses', type: 'Featured project' },
  { id: 'ariv', number: '04', name: 'ARIV.AI', category: 'AI / AUDIO AUTHENTICITY', year: 'PRODUCT CONCEPT', description: 'A phone-first concept for detecting potential AI-generated voice clones during calls.', details: 'ARIV.AI explores real-time call-audio analysis with clear safety signals and a reviewable record of analysed audio. It is presented as a product concept rather than a claim of a deployed detection service.', stack: ['AI audio analysis', 'Machine learning', 'Real-time processing', 'Mobile UX'], result: 'Voice authenticity product concept', accent: '#8b68ce', model: 'audio', type: 'AI / Product' },
  { id: 'power', number: '05', name: 'Power Insights Dashboard', category: 'DATA / INDUSTRIAL INSIGHTS', year: 'DELPHI TVS', description: 'An analytics dashboard that makes energy data easier to interpret across departments.', details: 'The platform processes heterogeneous energy spreadsheets with automatic schema detection and presents interactive trends, peak-usage patterns, and department-level comparisons to support energy analysis.', stack: ['Python', 'Pandas', 'Excel automation', 'Data visualisation', 'Web development'], result: 'Industrial analytics dashboard', accent: '#3d91a0', model: 'dashboard', type: 'Data / Dashboard' },
  { id: 'co2', number: '06', name: 'CO₂ Safety Checklist', category: 'MOBILE / INDUSTRIAL SAFETY', year: 'DELPHI TVS', description: 'A Flutter inspection workflow with AI-assisted safety checklist validation.', details: 'The mobile inspection experience supports checklist verification using image recognition. The workflow includes offline-first operation, cloud synchronisation, timestamped records, and compliance reporting.', stack: ['Flutter', 'Dart', 'Computer vision', 'AI image recognition', 'Cloud sync'], result: 'Mobile safety application', accent: '#b7854b', model: 'checklist', type: 'Mobile / Safety' },
  { id: 'induction', number: '07', name: 'Safety Induction Website', category: 'WEB / LEARNING EXPERIENCE', year: 'DELPHI TVS', description: 'A digital training experience for safety induction and workforce readiness.', details: 'A structured website concept for delivering essential safety training information. The internship work also involved training workflows, assessment modules, performance tracking, and multilingual experience considerations.', stack: ['HTML', 'CSS', 'JavaScript', 'Web development', 'SQL'], result: 'Safety training web experience', accent: '#568c69', model: 'browser', type: 'Web / Learning' },
  { id: 'wow', number: '08', name: 'WoWSQL Web Products', category: 'SOFTWARE / WEB ENGINEERING', year: 'CURRENT ROLE', description: 'Full-stack product engineering work connected to wowfolio.in and wowcare.pro.', details: 'Software engineering work connected to the existing WoWSQL web products.', stack: ['Web development', 'APIs', 'Relational data'], result: 'Full-stack product engineering', accent: '#5279bd', model: 'webproducts', type: 'Software / Web' },
  { id: 'vr', number: '09', name: 'Resilience x VR', category: 'VR / EMERGENCY TRAINING', year: 'RESILIENCE X VR', description: 'An immersive VR-based simulation platform to train users to handle emergency and crisis situations.', details: 'Resilience x VR is an immersive emergency-training simulator. Interactive scenarios help users practise decision-making and response behaviour under uncertain conditions, with a focus on realistic environments and user interaction.', stack: ['Godot Engine', 'Virtual Reality', 'Simulation Design', '3D Modelling'], result: 'Virtual reality emergency training simulator', accent: '#c06c9a', model: 'vr', type: 'VR / Simulation' },
];

/*
 * Keep the existing focus panel in sync with the active 3D project. This helper
 * deliberately updates only elements already present in the panel. Calling it
 * both at publication time and from the event listener avoids the old stale-card
 * behaviour when a viewer arrow changes the model without re-rendering App.jsx.
 */
function syncFocusPanels(project) {
  if (typeof document === 'undefined' || !project) return;

  document.querySelectorAll('.scene-focus-card').forEach((panel) => {
    const title = panel.querySelector('[data-focus-title], strong');
    const category = panel.querySelector('[data-focus-category], .focus-category');
    const about = panel.querySelector('[data-focus-description], .focus-description, .focus-about');
    const action = panel.querySelector('.focus-cta');

    if (title && title.textContent !== project.name) title.textContent = project.name;
    if (category && category.textContent !== project.category) category.textContent = project.category;
    if (about) {
      const nextAbout = project.description || project.details || '';
      if (about.textContent !== nextAbout) about.textContent = nextAbout;
    }

    panel.dataset.projectId = project.id || '';
    panel.style.setProperty('--project-accent', project.accent || '#5a56e8');

    if (action) {
      action.dataset.projectId = project.id || '';
      action.setAttribute('aria-label', `Open ${project.name} details`);
    }
  });
}

function publishViewerProject(project) {
  if (typeof window === 'undefined' || !project) return;
  syncFocusPanels(project);
  window.dispatchEvent(new CustomEvent(VIEWER_PROJECT_CHANGE_EVENT, { detail: project }));
}

function ShorelineModel() {
  return <group>
    <mesh position={[0, -0.80, 0]} receiveShadow>
      <cylinderGeometry args={[1.85, 1.85, 0.12, 64]} />
      <meshStandardMaterial color='#d8c29a' roughness={0.8} />
    </mesh>
    {/* Raise the existing surface disk clear of the platform cap to prevent z-fighting. */}
    <mesh position={[0, -0.728, 0]} receiveShadow>
      <cylinderGeometry args={[1.82, 1.82, 0.014, 128]} />
      <meshStandardMaterial color='#ead9b6' roughness={0.95} />
    </mesh>
    <mesh position={[-0.1, -0.68, -0.02]} rotation={[0.02, 0, -0.12]}>
      <boxGeometry args={[3.1, 0.07, 0.65]} />
      <meshStandardMaterial color='#76a9c7' roughness={0.35} />
    </mesh>
    <mesh position={[0.1, -0.60, 0.28]} rotation={[0, 0, 0.12]}>
      <boxGeometry args={[2.5, 0.08, 0.44]} />
      <meshStandardMaterial color='#b7d4d8' roughness={0.4} />
    </mesh>
    <mesh position={[0, -0.52, 0.55]} rotation={[0, 0, -0.18]}>
      <boxGeometry args={[2.8, 0.09, 0.42]} />
      <meshStandardMaterial color='#e7c88d' roughness={0.8} />
    </mesh>
    {Array.from({ length: 32 }, (_, i) => {
      const angle = i * 2.399;
      const radius = 0.35 + (i % 7) * 0.17;
      const size = 0.025 + (i % 4) * 0.012;
      return <mesh key={i} position={[Math.cos(angle) * radius, -0.42 + (i % 3) * 0.025, Math.sin(angle) * radius]}>
        <sphereGeometry args={[size, 9, 9]} />
        <meshStandardMaterial color={['#b9925e', '#e4c99e', '#7c9c9b'][i % 3]} roughness={0.65} />
      </mesh>;
    })}
    <mesh position={[0, -0.45, 0]} rotation={[Math.PI / 2, 0.1, 0]}>
      <torusGeometry args={[1.48, 0.025, 8, 96, Math.PI * 1.22]} />
      <meshStandardMaterial color='#477fa5' {...metal} />
    </mesh>
  </group>;
}

function HelmetModel() {
  return <group>
    <mesh position={[0, 0.12, 0]} castShadow><capsuleGeometry args={[0.49, 0.72, 8, 20]} /><meshStandardMaterial color='#e6a184' roughness={0.4} /></mesh>
    <mesh position={[0, 0.72, 0]} castShadow><sphereGeometry args={[0.64, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color='#f28b54' {...metal} /></mesh>
    <mesh position={[0, 0.73, 0]}><cylinderGeometry args={[0.63, 0.63, 0.08, 32]} /><meshStandardMaterial color='#f6a16b' {...metal} /></mesh>
    <mesh position={[0, -0.62, 0]} castShadow><boxGeometry args={[1.48, 0.66, 0.58]} /><meshStandardMaterial color='#f3c94e' roughness={0.42} /></mesh>
    <mesh position={[0, -0.62, 0.31]}><boxGeometry args={[0.19, 0.68, 0.025]} /><meshStandardMaterial color='#f3f0de' metalness={0.15} /></mesh>
    <mesh position={[-0.48, -0.62, 0.31]}><boxGeometry args={[0.12, 0.68, 0.025]} /><meshStandardMaterial color='#f3f0de' metalness={0.15} /></mesh>
    <mesh position={[0.48, -0.62, 0.31]}><boxGeometry args={[0.12, 0.68, 0.025]} /><meshStandardMaterial color='#f3f0de' metalness={0.15} /></mesh>
    <mesh position={[0, 0.28, 0.59]}><boxGeometry args={[0.46, 0.16, 0.04]} /><meshStandardMaterial color='#263b48' roughness={0.24} /></mesh>
  </group>;
}

function GlassesModel() {
  return <group>
    <mesh position={[-0.53, 0.15, 0]}><torusGeometry args={[0.48, 0.09, 14, 48]} /><meshStandardMaterial color='#609b56' {...metal} /></mesh>
    <mesh position={[0.53, 0.15, 0]}><torusGeometry args={[0.48, 0.09, 14, 48]} /><meshStandardMaterial color='#609b56' {...metal} /></mesh>
    <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.23, 0.1, 0.12]} /><meshStandardMaterial color='#395a46' {...metal} /></mesh>
    <mesh position={[-1.12, 0.21, -0.18]} rotation={[0, -0.15, -0.05]}><boxGeometry args={[0.72, 0.08, 0.09]} /><meshStandardMaterial color='#486f53' {...metal} /></mesh>
    <mesh position={[1.12, 0.21, -0.18]} rotation={[0, 0.15, 0.05]}><boxGeometry args={[0.72, 0.08, 0.09]} /><meshStandardMaterial color='#486f53' {...metal} /></mesh>
    <mesh position={[0.72, 0.75, -0.18]}><boxGeometry args={[0.33, 0.18, 0.18]} /><meshStandardMaterial color='#5279bd' /></mesh>
  </group>;
}

function AudioModel() {
  const heights = [0.45, 0.75, 1.05, 1.5, 1.12, 0.7, 1.35, 0.88, 1.62, 0.95, 0.56, 1.15, 0.62];
  return <group>
    <mesh position={[0, 0, -0.25]}><torusGeometry args={[1.08, 0.055, 12, 80]} /><meshStandardMaterial color='#8b68ce' {...metal} /></mesh>
    {heights.map((height, i) => <group key={i} position={[(i - (heights.length - 1) / 2) * 0.19, 0, 0]}>
      <mesh position={[0, 0, 0]} castShadow><capsuleGeometry args={[0.045, height * 0.52, 5, 10]} /><meshStandardMaterial color={i % 3 === 0 ? '#bd9be8' : '#8061c4'} {...metal} /></mesh>
      <mesh position={[0, height * 0.31 + 0.12, 0.04]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color='#edc9ff' emissive='#5c2c91' emissiveIntensity={0.25} /></mesh>
    </group>)}
    <mesh position={[0, -0.94, 0.1]}><torusGeometry args={[0.42, 0.075, 12, 48]} /><meshStandardMaterial color='#4d367f' {...metal} /></mesh>
  </group>;
}

function DashboardModel() {
  const heights = [0.55, 1.05, 0.76, 1.55, 1.23, 0.92, 1.7];
  return <group>
    <mesh position={[0, 0.05, -0.15]}><boxGeometry args={[2.75, 2.05, 0.16]} /><meshStandardMaterial color='#eaf3f3' roughness={0.55} /></mesh>
    <mesh position={[0, 0.91, -0.045]}><boxGeometry args={[2.75, 0.24, 0.035]} /><meshStandardMaterial color='#3d91a0' /></mesh>
    {[-0.96, -0.55, -0.14, 0.27, 0.68].map((x, i) => <mesh key={i} position={[x, 0.91, 0.0]}><sphereGeometry args={[0.045, 10, 10]} /><meshStandardMaterial color='#f8f5ef' /></mesh>)}
    {heights.map((height, i) => <mesh key={i} position={[-0.98 + i * 0.32, -0.42 + height / 2, 0.14]} castShadow><boxGeometry args={[0.19, height, 0.17]} /><meshStandardMaterial color={i === 3 ? '#e98b69' : '#4ba2ad'} roughness={0.45} /></mesh>)}
    <mesh position={[0, -0.84, 0.12]}><boxGeometry args={[2.08, 0.035, 0.08]} /><meshStandardMaterial color='#87b1b7' /></mesh>
  </group>;
}

function ChecklistModel() {
  return <group>
    <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[1.55, 2.65, 0.18]} /><meshStandardMaterial color='#2d3c44' roughness={0.25} /></mesh>
    <mesh position={[0, 0, 0.105]}><boxGeometry args={[1.39, 2.47, 0.035]} /><meshStandardMaterial color='#f6f2e9' roughness={0.75} /></mesh>
    <mesh position={[0, 0.91, 0.13]}><boxGeometry args={[1.12, 0.29, 0.025]} /><meshStandardMaterial color='#b7854b' /></mesh>
    {[-0.57, -0.05, -0.57, -0.05].map((x, i) => <group key={i} position={[x, [0.43, 0.43, -0.12, -0.12][i], 0.15]}>
      <mesh><boxGeometry args={[0.16, 0.16, 0.025]} /><meshStandardMaterial color={i < 2 ? '#78a77d' : '#e4dac7'} /></mesh>
      {i < 2 && <mesh rotation={[0, 0, -0.65]}><boxGeometry args={[0.08, 0.025, 0.035]} /><meshStandardMaterial color='#f7f5e9' /></mesh>}
    </group>)}
    {[-0.12, -0.36, -0.6, -0.82].map((y, i) => <mesh key={i} position={[0.23, y, 0.15]}><boxGeometry args={[0.49 - (i % 2) * 0.11, 0.055, 0.025]} /><meshStandardMaterial color='#c6c1b5' /></mesh>)}
    <mesh position={[0, -1.08, 0.15]}><boxGeometry args={[0.48, 0.06, 0.03]} /><meshStandardMaterial color='#b7854b' /></mesh>
  </group>;
}

function BrowserModel() {
  return <group>
    <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[2.9, 1.95, 0.15]} /><meshStandardMaterial color='#e8e6df' roughness={0.58} /></mesh>
    <mesh position={[0, 0, 0.085]}><boxGeometry args={[2.7, 1.74, 0.025]} /><meshStandardMaterial color='#faf9f4' /></mesh>
    <mesh position={[0, 0.77, 0.11]}><boxGeometry args={[2.7, 0.2, 0.025]} /><meshStandardMaterial color='#568c69' /></mesh>
    {[-1.15, -0.98, -0.81].map((x, i) => <mesh key={i} position={[x, 0.77, 0.14]}><sphereGeometry args={[0.035, 10, 10]} /><meshStandardMaterial color='#f4f1e9' /></mesh>)}
    <mesh position={[-0.69, -0.09, 0.12]}><boxGeometry args={[0.86, 1.14, 0.04]} /><meshStandardMaterial color='#dce9dc' /></mesh>
    <mesh position={[-0.69, 0.24, 0.15]}><boxGeometry args={[0.55, 0.22, 0.035]} /><meshStandardMaterial color='#568c69' /></mesh>
    {[-0.12, -0.37, -0.62].map((y, i) => <mesh key={i} position={[-0.69, y, 0.15]}><boxGeometry args={[0.53 - i * 0.08, 0.045, 0.03]} /><meshStandardMaterial color='#9cac9c' /></mesh>)}
    {[0.28, 0.55, 0.82].map((x, i) => <mesh key={i} position={[x, 0.13 - (i % 2) * 0.28, 0.14]}><boxGeometry args={[0.31, 0.38, 0.04]} /><meshStandardMaterial color={['#99b9a0', '#dfb69d', '#8bb4b8'][i]} /></mesh>)}
  </group>;
}

function WebProductsModel() {
  return <group>
    <mesh position={[-0.63, 0.14, 0]} castShadow><boxGeometry args={[1.58, 1.8, 0.14]} /><meshStandardMaterial color='#e6edf6' /></mesh>
    <mesh position={[-0.63, 0.75, 0.08]}><boxGeometry args={[1.58, 0.34, 0.04]} /><meshStandardMaterial color='#5279bd' /></mesh>
    <mesh position={[-0.63, 0.75, 0.11]}><boxGeometry args={[0.78, 0.06, 0.025]} /><meshStandardMaterial color='#f2f5fa' /></mesh>
    {[-0.35, -0.65, -0.95].map((y, i) => <mesh key={i} position={[-0.63, y, 0.1]}><boxGeometry args={[0.98 - i * 0.18, 0.07, 0.03]} /><meshStandardMaterial color='#8ba8cf' /></mesh>)}
    <mesh position={[0.92, -0.13, 0.1]} castShadow><boxGeometry args={[1.15, 1.28, 0.14]} /><meshStandardMaterial color='#dcece8' /></mesh>
    <mesh position={[0.92, 0.28, 0.19]}><boxGeometry args={[0.81, 0.27, 0.04]} /><meshStandardMaterial color='#3b978e' /></mesh>
    {[-0.02, -0.31, -0.57].map((y, i) => <mesh key={i} position={[0.92, y, 0.19]}><boxGeometry args={[0.7 - i * 0.1, 0.06, 0.025]} /><meshStandardMaterial color='#7bb8ae' /></mesh>)}
    <mesh position={[0.16, 0.2, 0.2]} rotation={[0, 0, -0.48]}><cylinderGeometry args={[0.035, 0.035, 0.85, 10]} /><meshStandardMaterial color='#5279bd' /></mesh>
    <mesh position={[0.28, 0.46, 0.2]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color='#7894c6' /></mesh>
  </group>;
}

function VRModel() {
  return <group>
    <mesh position={[0, -0.05, -0.22]}><torusGeometry args={[1.16, 0.11, 16, 64]} /><meshStandardMaterial color='#c06c9a' {...metal} /></mesh>
    <mesh position={[0, 0.05, 0]} castShadow><boxGeometry args={[1.62, 1.5, 1.08]} /><meshStandardMaterial color='#383549' roughness={0.34} metalness={0.48} /></mesh>
    <mesh position={[0, 0.11, 0.57]}><boxGeometry args={[1.19, 0.79, 0.05]} /><meshStandardMaterial color='#ac92cb' roughness={0.22} metalness={0.15} /></mesh>
    <mesh position={[0, 0.11, 0.61]}><boxGeometry args={[0.96, 0.56, 0.025]} /><meshStandardMaterial color='#82b4c6' emissive='#2c596e' emissiveIntensity={0.2} /></mesh>
    <mesh position={[0, -0.56, 0.61]}><boxGeometry args={[0.78, 0.08, 0.03]} /><meshStandardMaterial color='#e1c2de' /></mesh>
    <mesh position={[-0.94, -0.13, 0.1]}><cylinderGeometry args={[0.17, 0.17, 0.25, 24]} /><meshStandardMaterial color='#df9ebf' {...metal} /></mesh>
    <mesh position={[0.94, -0.13, 0.1]}><cylinderGeometry args={[0.17, 0.17, 0.25, 24]} /><meshStandardMaterial color='#df9ebf' {...metal} /></mesh>
  </group>;
}

function ProjectGeometry({ project }) {
  switch (project?.model) {
    case 'shoreline': return <ShorelineModel />;
    case 'helmet': return <HelmetModel />;
    case 'glasses': return <GlassesModel />;
    case 'audio': return <AudioModel />;
    case 'dashboard': return <DashboardModel />;
    case 'checklist': return <ChecklistModel />;
    case 'browser': return <BrowserModel />;
    case 'webproducts': return <WebProductsModel />;
    case 'vr': return <VRModel />;
    default: return <ShorelineModel />;
  }
}

function AnimatedProject({ project, onClick }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });
  return <group
    ref={ref}
    onClick={(event) => { event.stopPropagation(); onClick?.(project); }}
    onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer'; }}
    onPointerOut={() => { document.body.style.cursor = ''; }}
  >
    <Float speed={1.3} rotationIntensity={0.07} floatIntensity={0.13}>
      <ProjectGeometry project={project} />
    </Float>
  </group>;
}

export function ProjectPreview({ project, compact = false }) {
  if (compact) return <div className={`project-preview-static project-preview-static-${project.model}`} style={{ '--project-accent': project.accent }}>
    <span className='preview-shape preview-shape-a' />
    <span className='preview-shape preview-shape-b' />
    <span className='preview-shape preview-shape-c' />
  </div>;

  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.15, 5.4], fov: 36 }} gl={{ alpha: true, antialias: true }}>
    <ambientLight intensity={1.25} />
    <directionalLight position={[4, 5, 5]} intensity={2.2} castShadow />
    <pointLight position={[-3, 1, 2]} intensity={1.2} color={project.accent} />
    <Suspense fallback={null}>
      <AnimatedProject project={project} />
      <Sparkles count={12} scale={3.7} size={1.7} speed={0.18} color={project.accent} />
    </Suspense>
    <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.15} enableDamping dampingFactor={0.08} />
  </Canvas>;
}

function ArrowButton({ direction, onNavigate }) {
  const isPrevious = direction < 0;
  return <Html position={[isPrevious ? -2.35 : 2.35, -0.1, 0.4]} center distanceFactor={7.5} zIndexRange={[5, 0]}>
    <button
      type='button'
      className='scene-project-arrow'
      aria-label={`${isPrevious ? 'Previous' : 'Next'} 3D project`}
      title={`${isPrevious ? 'Previous' : 'Next'} project`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => { event.stopPropagation(); onNavigate(direction); }}
    >{isPrevious ? '←' : '→'}</button>
  </Html>;
}

function ResettableOrbitControls() {
  const controlsRef = useRef(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.25, 6.9);
    camera.zoom = 1;
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
      controls.saveState();
    }
  }, [camera]);

  return <OrbitControls
    ref={controlsRef}
    makeDefault
    enablePan
    enableZoom
    minDistance={5.8}
    maxDistance={9.5}
    enableDamping
    dampingFactor={0.07}
    rotateSpeed={0.65}
  />;
}

function normalizeProjectName(name) {
  return String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function findProjectIndex(project) {
  const byId = VIEWER_PROJECTS.findIndex((candidate) => candidate.id === project?.id);
  if (byId >= 0) return byId;

  const wantedName = normalizeProjectName(project?.name);
  if (wantedName) {
    const byName = VIEWER_PROJECTS.findIndex((candidate) => normalizeProjectName(candidate.name) === wantedName);
    if (byName >= 0) return byName;
  }

  const byModel = VIEWER_PROJECTS.findIndex((candidate) => candidate.model === project?.model);
  return byModel >= 0 ? byModel : 0;
}

export default function Scene3D({ project, onProjectSelect, onProjectChange }) {
  const requestedIndex = useMemo(() => findProjectIndex(project), [project?.id, project?.name, project?.model]);
  const [activeIndex, setActiveIndex] = useState(requestedIndex);
  const activeIndexRef = useRef(requestedIndex);
  const activeProject = VIEWER_PROJECTS[activeIndex] || VIEWER_PROJECTS[0];

  useEffect(() => {
    let currentViewerProject = null;
    let scrollLocked = false;
    let lockedScrollY = 0;
    let originalStyles = null;
    const popupSelector = '.project-modal-backdrop, .archive-backdrop, [role="dialog"][aria-modal="true"]';

    const lockBackgroundScroll = () => {
      if (scrollLocked) return;
      scrollLocked = true;
      lockedScrollY = window.scrollY || window.pageYOffset || 0;
      const computedPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      originalStyles = {
        htmlOverflow: document.documentElement.style.overflow,
        bodyOverflow: document.body.style.overflow,
        bodyPosition: document.body.style.position,
        bodyTop: document.body.style.top,
        bodyLeft: document.body.style.left,
        bodyRight: document.body.style.right,
        bodyWidth: document.body.style.width,
        bodyPaddingRight: document.body.style.paddingRight,
      };

      document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('viewer-scroll-locked');
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${computedPadding + scrollbarWidth}px`;
      document.body.classList.add('viewer-scroll-locked');
    };

    const unlockBackgroundScroll = () => {
      if (!scrollLocked || !originalStyles) return;
      const restoreY = lockedScrollY;
      document.documentElement.style.overflow = originalStyles.htmlOverflow;
      document.body.style.overflow = originalStyles.bodyOverflow;
      document.body.style.position = originalStyles.bodyPosition;
      document.body.style.top = originalStyles.bodyTop;
      document.body.style.left = originalStyles.bodyLeft;
      document.body.style.right = originalStyles.bodyRight;
      document.body.style.width = originalStyles.bodyWidth;
      document.body.style.paddingRight = originalStyles.bodyPaddingRight;
      document.documentElement.classList.remove('viewer-scroll-locked');
      document.body.classList.remove('viewer-scroll-locked');
      originalStyles = null;
      scrollLocked = false;
      window.scrollTo(0, restoreY);
    };

    const reconcileScrollLock = () => {
      if (document.querySelector(popupSelector)) lockBackgroundScroll();
      else unlockBackgroundScroll();
    };

    const handleViewerProjectChange = (event) => {
      currentViewerProject = event.detail || null;
      syncFocusPanels(currentViewerProject);
    };

    const handleFocusPanelAction = (event) => {
      const origin = event.target instanceof Element ? event.target : null;
      const action = origin?.closest('.scene-focus-card .focus-cta');
      if (!action || !currentViewerProject) return;
      const activeAnnotation = document.querySelector('.scene-project-annotation');
      if (!activeAnnotation) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      activeAnnotation.click();
    };

    window.addEventListener(VIEWER_PROJECT_CHANGE_EVENT, handleViewerProjectChange);
    document.addEventListener('click', handleFocusPanelAction, true);

    const mutationObserver = new MutationObserver(() => {
      reconcileScrollLock();
      if (currentViewerProject) syncFocusPanels(currentViewerProject);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    reconcileScrollLock();

    return () => {
      window.removeEventListener(VIEWER_PROJECT_CHANGE_EVENT, handleViewerProjectChange);
      document.removeEventListener('click', handleFocusPanelAction, true);
      mutationObserver.disconnect();
      unlockBackgroundScroll();
    };
  }, []);

  useEffect(() => {
    activeIndexRef.current = requestedIndex;
    setActiveIndex(requestedIndex);
    publishViewerProject(VIEWER_PROJECTS[requestedIndex]);
  }, [requestedIndex]);

  const navigate = (direction) => {
    const nextIndex = (activeIndexRef.current + direction + VIEWER_PROJECTS.length) % VIEWER_PROJECTS.length;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    const nextProject = VIEWER_PROJECTS[nextIndex];
    publishViewerProject(nextProject);
    onProjectChange?.(nextProject);
  };

  return <Canvas className='main-project-canvas' shadows dpr={[1, 1.7]} camera={{ position: [0, 0.5, 8], fov: 37 }} gl={{ alpha: true, antialias: true }}>
    <color attach='background' args={['#efedf2']} />
    <fog attach='fog' args={['#efedf2', 8, 16]} />
    <ambientLight intensity={1.1} />
    <directionalLight position={[5, 6, 5]} intensity={2.15} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <pointLight position={[-4, 1.2, 2]} intensity={1.4} color={activeProject.accent} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.38, 0]} receiveShadow>
      <circleGeometry args={[6, 64]} />
      <meshStandardMaterial color='#e8e5ea' roughness={0.9} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0.2, 0]} position={[0, 0, -0.45]}>
      <torusGeometry args={[2.48, 0.012, 8, 150]} />
      <meshBasicMaterial color={activeProject.accent} transparent opacity={0.45} />
    </mesh>
    <mesh rotation={[Math.PI / 2.3, -0.2, 0.4]} position={[0, 0.03, -0.35]}>
      <torusGeometry args={[2.02, 0.009, 8, 150]} />
      <meshBasicMaterial color='#e99f7c' transparent opacity={0.7} />
    </mesh>
    <Suspense fallback={null}>
      <AnimatedProject project={activeProject} onClick={onProjectSelect} />
      <Sparkles count={55} scale={7.6} size={1.5} speed={0.2} color={activeProject.accent} opacity={0.48} />
      <Html position={[-1.5, 1.4, 0.35]} center distanceFactor={4.5} zIndexRange={[6, 0]}>
        <button type='button' className='scene-project-annotation' onClick={() => onProjectSelect?.(activeProject)} style={{ '--annotation-accent': activeProject.accent }}>
          <span className='scene-annotation-kicker'><i /> PROJECT IN FOCUS</span>
          <strong>{activeProject.name}</strong>
          <span className='scene-annotation-category'>{activeProject.category}</span>
          <p>{activeProject.description}</p>
          <span className='scene-annotation-stack'>{activeProject.stack.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</span>
          <span className='scene-annotation-hint'>CLICK OBJECT FOR FULL DETAILS ↗</span>
        </button>
      </Html>
      <ArrowButton direction={-1} onNavigate={navigate} />
      <ArrowButton direction={1} onNavigate={navigate} />
    </Suspense>
    {/* Remount the controls for each model to clear stale orbit and zoom state. */}
    <ResettableOrbitControls key={activeProject.id} />
  </Canvas>;
}
