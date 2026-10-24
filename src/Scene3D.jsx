import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, Sparkles } from '@react-three/drei';

const metal = { metalness: 0.35, roughness: 0.28 };

function ShorelineModel() {
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]} receiveShadow><cylinderGeometry args={[1.85, 1.85, 0.12, 64]} /><meshStandardMaterial color="#d8c29a" roughness={0.8} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.74, 0]}><circleGeometry args={[1.82, 64]} /><meshStandardMaterial color="#ead9b6" roughness={0.95} /></mesh>
    <mesh position={[-0.1, -0.68, -0.02]} rotation={[0.02, 0, -0.12]}><boxGeometry args={[3.1, 0.07, 0.65]} /><meshStandardMaterial color="#76a9c7" roughness={0.35} /></mesh>
    <mesh position={[0.1, -0.60, 0.28]} rotation={[0, 0, 0.12]}><boxGeometry args={[2.5, 0.08, 0.44]} /><meshStandardMaterial color="#b7d4d8" roughness={0.4} /></mesh>
    <mesh position={[0, -0.52, 0.55]} rotation={[0, 0, -0.18]}><boxGeometry args={[2.8, 0.09, 0.42]} /><meshStandardMaterial color="#e7c88d" roughness={0.8} /></mesh>
    {Array.from({ length: 32 }, (_, i) => { const angle = i * 2.399; const radius = 0.35 + (i % 7) * 0.17; const size = 0.025 + (i % 4) * 0.012; return <mesh key={i} position={[Math.cos(angle) * radius, -0.42 + (i % 3) * 0.025, Math.sin(angle) * radius]}><sphereGeometry args={[size, 9, 9]} /><meshStandardMaterial color={['#b9925e', '#e4c99e', '#7c9c9b'][i % 3]} roughness={0.65} /></mesh>; })}
    <mesh position={[0, -0.45, 0]} rotation={[Math.PI / 2, 0.1, 0]}><torusGeometry args={[1.48, 0.025, 8, 96, Math.PI * 1.22]} /><meshStandardMaterial color="#477fa5" {...metal} /></mesh>
  </group>;
}

function HelmetModel() {
  return <group>
    <mesh position={[0, 0.12, 0]} castShadow><capsuleGeometry args={[0.49, 0.72, 8, 20]} /><meshStandardMaterial color="#e6a184" roughness={0.4} /></mesh>
    <mesh position={[0, 0.72, 0]} castShadow><sphereGeometry args={[0.64, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#f28b54" {...metal} /></mesh>
    <mesh position={[0, 0.73, 0]}><cylinderGeometry args={[0.63, 0.63, 0.08, 32]} /><meshStandardMaterial color="#f6a16b" {...metal} /></mesh>
    <mesh position={[0, -0.62, 0]} castShadow><boxGeometry args={[1.48, 0.66, 0.58]} /><meshStandardMaterial color="#f3c94e" roughness={0.42} /></mesh>
    <mesh position={[0, -0.62, 0.31]}><boxGeometry args={[0.19, 0.68, 0.025]} /><meshStandardMaterial color="#f3f0de" metalness={0.15} /></mesh>
    <mesh position={[-0.48, -0.62, 0.31]}><boxGeometry args={[0.12, 0.68, 0.025]} /><meshStandardMaterial color="#f3f0de" metalness={0.15} /></mesh>
    <mesh position={[0.48, -0.62, 0.31]}><boxGeometry args={[0.12, 0.68, 0.025]} /><meshStandardMaterial color="#f3f0de" metalness={0.15} /></mesh>
    <mesh position={[0, 0.28, 0.59]}><boxGeometry args={[0.46, 0.16, 0.04]} /><meshStandardMaterial color="#263b48" roughness={0.24} /></mesh>
  </group>;
}

function GlassesModel() {
  return <group>
    <mesh position={[-0.53, 0.15, 0]}><torusGeometry args={[0.48, 0.09, 14, 48]} /><meshStandardMaterial color="#609b56" {...metal} /></mesh>
    <mesh position={[0.53, 0.15, 0]}><torusGeometry args={[0.48, 0.09, 14, 48]} /><meshStandardMaterial color="#609b56" {...metal} /></mesh>
    <mesh position={[-0.53, 0.15, 0.02]}><circleGeometry args={[0.39, 32]} /><meshStandardMaterial color="#b4d9ca" transparent opacity={0.82} metalness={0.3} roughness={0.16} /></mesh>
    <mesh position={[0.53, 0.15, 0.02]}><circleGeometry args={[0.39, 32]} /><meshStandardMaterial color="#b4d9ca" transparent opacity={0.82} metalness={0.3} roughness={0.16} /></mesh>
    <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.23, 0.1, 0.12]} /><meshStandardMaterial color="#395a46" {...metal} /></mesh>
    <mesh position={[-1.12, 0.21, -0.18]} rotation={[0, -0.15, -0.05]}><boxGeometry args={[0.72, 0.08, 0.09]} /><meshStandardMaterial color="#486f53" {...metal} /></mesh>
    <mesh position={[1.12, 0.21, -0.18]} rotation={[0, 0.15, 0.05]}><boxGeometry args={[0.72, 0.08, 0.09]} /><meshStandardMaterial color="#486f53" {...metal} /></mesh>
    <mesh position={[0, -0.55, -0.06]} rotation={[0.15, 0, Math.PI / 2]}><torusGeometry args={[0.7, 0.045, 8, 64, Math.PI]} /><meshStandardMaterial color="#a5c7b0" {...metal} /></mesh>
    <mesh position={[0.72, 0.75, -0.18]}><boxGeometry args={[0.33, 0.18, 0.18]} /><meshStandardMaterial color="#5279bd" /></mesh>
  </group>;
}

function AudioModel() {
  const heights = [0.45, 0.75, 1.05, 1.5, 1.12, 0.7, 1.35, 0.88, 1.62, 0.95, 0.56, 1.15, 0.62];
  return <group>
    <mesh position={[0, 0, -0.25]}><torusGeometry args={[1.08, 0.055, 12, 80]} /><meshStandardMaterial color="#8b68ce" {...metal} /></mesh>
    {heights.map((height, i) => <group key={i} position={[(i - (heights.length - 1) / 2) * 0.19, 0, 0]}><mesh position={[0, 0, 0]} castShadow><capsuleGeometry args={[0.045, height * 0.52, 5, 10]} /><meshStandardMaterial color={i % 3 === 0 ? '#bd9be8' : '#8061c4'} {...metal} /></mesh><mesh position={[0, height * 0.31 + 0.12, 0.04]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#edc9ff" emissive="#5c2c91" emissiveIntensity={0.25} /></mesh></group>)}
    <mesh position={[0, -0.94, 0.1]}><torusGeometry args={[0.42, 0.075, 12, 48]} /><meshStandardMaterial color="#4d367f" {...metal} /></mesh>
  </group>;
}

function DashboardModel() {
  const heights = [0.55, 1.05, 0.76, 1.55, 1.23, 0.92, 1.7];
  return <group>
    <mesh position={[0, 0.05, -0.15]}><boxGeometry args={[2.75, 2.05, 0.16]} /><meshStandardMaterial color="#eaf3f3" roughness={0.55} /></mesh>
    <mesh position={[0, 0.91, -0.045]}><boxGeometry args={[2.75, 0.24, 0.035]} /><meshStandardMaterial color="#3d91a0" /></mesh>
    {[-0.96, -0.55, -0.14, 0.27, 0.68].map((x, i) => <mesh key={i} position={[x, 0.91, 0.0]}><sphereGeometry args={[0.045, 10, 10]} /><meshStandardMaterial color="#f8f5ef" /></mesh>)}
    {heights.map((height, i) => <mesh key={i} position={[-0.98 + i * 0.32, -0.42 + height / 2, 0.14]} castShadow><boxGeometry args={[0.19, height, 0.17]} /><meshStandardMaterial color={i === 3 ? '#e98b69' : '#4ba2ad'} roughness={0.45} /></mesh>)}
    <mesh position={[0, -0.84, 0.12]}><boxGeometry args={[2.08, 0.035, 0.08]} /><meshStandardMaterial color="#87b1b7" /></mesh>
    <mesh position={[0.63, 0.37, 0.17]}><torusGeometry args={[0.25, 0.07, 10, 32]} /><meshStandardMaterial color="#ec9b78" {...metal} /></mesh>
  </group>;
}

function ChecklistModel() {
  return <group>
    <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[1.55, 2.65, 0.18]} /><meshStandardMaterial color="#2d3c44" roughness={0.25} /></mesh>
    <mesh position={[0, 0, 0.105]}><boxGeometry args={[1.39, 2.47, 0.035]} /><meshStandardMaterial color="#f6f2e9" roughness={0.75} /></mesh>
    <mesh position={[0, 0.91, 0.13]}><boxGeometry args={[1.12, 0.29, 0.025]} /><meshStandardMaterial color="#b7854b" /></mesh>
    {[-0.57, -0.05, -0.57, -0.05].map((x, i) => <group key={i} position={[x, [0.43, 0.43, -0.12, -0.12][i], 0.15]}><mesh><boxGeometry args={[0.16, 0.16, 0.025]} /><meshStandardMaterial color={i < 2 ? '#78a77d' : '#e4dac7'} /></mesh>{i < 2 && <mesh rotation={[0, 0, -0.65]}><boxGeometry args={[0.08, 0.025, 0.035]} /><meshStandardMaterial color="#f7f5e9" /></mesh>}</group>)}
    {[-0.12, -0.36, -0.6, -0.82].map((y, i) => <mesh key={i} position={[0.23, y, 0.15]}><boxGeometry args={[0.49 - (i % 2) * 0.11, 0.055, 0.025]} /><meshStandardMaterial color="#c6c1b5" /></mesh>)}
    <mesh position={[0, -1.08, 0.15]}><boxGeometry args={[0.48, 0.06, 0.03]} /><meshStandardMaterial color="#b7854b" /></mesh>
  </group>;
}

function BrowserModel() {
  return <group>
    <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[2.9, 1.95, 0.15]} /><meshStandardMaterial color="#e8e6df" roughness={0.58} /></mesh>
    <mesh position={[0, 0, 0.085]}><boxGeometry args={[2.7, 1.74, 0.025]} /><meshStandardMaterial color="#faf9f4" /></mesh>
    <mesh position={[0, 0.77, 0.11]}><boxGeometry args={[2.7, 0.2, 0.025]} /><meshStandardMaterial color="#568c69" /></mesh>
    {[-1.15, -0.98, -0.81].map((x, i) => <mesh key={i} position={[x, 0.77, 0.14]}><sphereGeometry args={[0.035, 10, 10]} /><meshStandardMaterial color="#f4f1e9" /></mesh>)}
    <mesh position={[-0.69, -0.09, 0.12]}><boxGeometry args={[0.86, 1.14, 0.04]} /><meshStandardMaterial color="#dce9dc" /></mesh>
    <mesh position={[-0.69, 0.24, 0.15]}><boxGeometry args={[0.55, 0.22, 0.035]} /><meshStandardMaterial color="#568c69" /></mesh>
    {[-0.12, -0.37, -0.62].map((y, i) => <mesh key={i} position={[-0.69, y, 0.15]}><boxGeometry args={[0.53 - i * 0.08, 0.045, 0.03]} /><meshStandardMaterial color="#9cac9c" /></mesh>)}
    {[0.28, 0.55, 0.82].map((x, i) => <mesh key={i} position={[x, 0.13 - (i % 2) * 0.28, 0.14]}><boxGeometry args={[0.31, 0.38, 0.04]} /><meshStandardMaterial color={['#99b9a0', '#dfb69d', '#8bb4b8'][i]} /></mesh>)}
  </group>;
}

function WebProductsModel() {
  return <group>
    <mesh position={[-0.63, 0.14, 0]} castShadow><boxGeometry args={[1.58, 1.8, 0.14]} /><meshStandardMaterial color="#e6edf6" /></mesh>
    <mesh position={[-0.63, 0.75, 0.08]}><boxGeometry args={[1.58, 0.34, 0.04]} /><meshStandardMaterial color="#5279bd" /></mesh>
    <mesh position={[-0.63, 0.75, 0.11]}><boxGeometry args={[0.78, 0.06, 0.025]} /><meshStandardMaterial color="#f2f5fa" /></mesh>
    {[-0.35, -0.65, -0.95].map((y, i) => <mesh key={i} position={[-0.63, y, 0.1]}><boxGeometry args={[0.98 - i * 0.18, 0.07, 0.03]} /><meshStandardMaterial color="#8ba8cf" /></mesh>)}
    <mesh position={[0.92, -0.13, 0.1]} castShadow><boxGeometry args={[1.15, 1.28, 0.14]} /><meshStandardMaterial color="#dcece8" /></mesh>
    <mesh position={[0.92, 0.28, 0.19]}><boxGeometry args={[0.81, 0.27, 0.04]} /><meshStandardMaterial color="#3b978e" /></mesh>
    {[-0.02, -0.31, -0.57].map((y, i) => <mesh key={i} position={[0.92, y, 0.19]}><boxGeometry args={[0.7 - i * 0.1, 0.06, 0.025]} /><meshStandardMaterial color="#7bb8ae" /></mesh>)}
    <mesh position={[0.16, 0.2, 0.2]} rotation={[0, 0, -0.48]}><cylinderGeometry args={[0.035, 0.035, 0.85, 10]} /><meshStandardMaterial color="#5279bd" /></mesh>
    <mesh position={[0.28, 0.46, 0.2]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#7894c6" /></mesh>
  </group>;
}

function VRModel() {
  return <group>
    <mesh position={[0, -0.05, -0.22]}><torusGeometry args={[1.16, 0.11, 16, 64]} /><meshStandardMaterial color="#c06c9a" {...metal} /></mesh>
    <mesh position={[0, 0.05, 0]} castShadow><boxGeometry args={[1.62, 1.5, 1.08]} /><meshStandardMaterial color="#383549" roughness={0.34} metalness={0.48} /></mesh>
    <mesh position={[0, 0.11, 0.57]}><boxGeometry args={[1.19, 0.79, 0.05]} /><meshStandardMaterial color="#ac92cb" roughness={0.22} metalness={0.15} /></mesh>
    <mesh position={[0, 0.11, 0.61]}><boxGeometry args={[0.96, 0.56, 0.025]} /><meshStandardMaterial color="#82b4c6" emissive="#2c596e" emissiveIntensity={0.2} /></mesh>
    <mesh position={[0, -0.56, 0.61]}><boxGeometry args={[0.78, 0.08, 0.03]} /><meshStandardMaterial color="#e1c2de" /></mesh>
    <mesh position={[-0.94, -0.13, 0.1]}><cylinderGeometry args={[0.17, 0.17, 0.25, 24]} /><meshStandardMaterial color="#df9ebf" {...metal} /></mesh>
    <mesh position={[0.94, -0.13, 0.1]}><cylinderGeometry args={[0.17, 0.17, 0.25, 24]} /><meshStandardMaterial color="#df9ebf" {...metal} /></mesh>
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
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.09; });
  return <group ref={ref} onClick={(event) => { event.stopPropagation(); onClick?.(project); }} onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
    <Float speed={1.3} rotationIntensity={0.07} floatIntensity={0.13}><ProjectGeometry project={project} /></Float>
  </group>;
}

export function ProjectPreview({ project, compact = false }) {
  if (compact) return <div className={`project-preview-static project-preview-static-${project.model}`} style={{ '--project-accent': project.accent }}><span className="preview-shape preview-shape-a" /><span className="preview-shape preview-shape-b" /><span className="preview-shape preview-shape-c" /></div>;
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.15, 5.4], fov: 36 }} gl={{ alpha: true, antialias: true }}>
    <ambientLight intensity={1.25} /><directionalLight position={[4, 5, 5]} intensity={2.2} castShadow /><pointLight position={[-3, 1, 2]} intensity={1.2} color={project.accent} />
    <Suspense fallback={null}><AnimatedProject project={project} /><Sparkles count={12} scale={3.7} size={1.7} speed={0.18} color={project.accent} /></Suspense>
    <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.15} enableDamping dampingFactor={0.08} />
  </Canvas>;
}

export default function Scene3D({ project, onProjectSelect }) {
  return <Canvas className="main-project-canvas" shadows dpr={[1, 1.7]} camera={{ position: [0, 0.25, 6.9], fov: 37 }} gl={{ alpha: true, antialias: true }}>
    <color attach="background" args={['#efedf2']} />
    <fog attach="fog" args={['#efedf2', 8, 16]} />
    <ambientLight intensity={1.1} /><directionalLight position={[5, 6, 5]} intensity={2.15} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} /><pointLight position={[-4, 1.2, 2]} intensity={1.4} color={project.accent} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.38, 0]} receiveShadow><circleGeometry args={[6, 64]} /><meshStandardMaterial color="#e8e5ea" roughness={0.9} /></mesh>
    <mesh rotation={[Math.PI / 2.5, 0.2, 0]} position={[0, 0, -0.45]}><torusGeometry args={[2.48, 0.012, 8, 150]} /><meshBasicMaterial color={project.accent} transparent opacity={0.45} /></mesh>
    <mesh rotation={[Math.PI / 2.3, -0.2, 0.4]} position={[0, 0.03, -0.35]}><torusGeometry args={[2.02, 0.009, 8, 150]} /><meshBasicMaterial color="#e99f7c" transparent opacity={0.7} /></mesh>
    <Suspense fallback={null}>
      <AnimatedProject project={project} onClick={onProjectSelect} />
      <Sparkles count={55} scale={7.6} size={1.5} speed={0.2} color={project.accent} opacity={0.48} />
      <Html position={[0, 1.85, 0]} center distanceFactor={7.5} zIndexRange={[2, 0]}>
        <button className="scene-project-annotation" onClick={() => onProjectSelect?.(project)} style={{ '--annotation-accent': project.accent }}>
          <span className="scene-annotation-kicker"><i /> PROJECT IN FOCUS</span><strong>{project.name}</strong><span className="scene-annotation-category">{project.category}</span><p>{project.description}</p><span className="scene-annotation-stack">{project.stack.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</span><span className="scene-annotation-hint">CLICK OBJECT FOR FULL DETAILS ↗</span>
        </button>
      </Html>
    </Suspense>
    <OrbitControls makeDefault enablePan enableZoom minDistance={4.8} maxDistance={9.5} enableDamping dampingFactor={0.07} rotateSpeed={0.65} />
  </Canvas>;
}
