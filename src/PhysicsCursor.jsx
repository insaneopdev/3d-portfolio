import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import './physics-cursor.css';

const NODE_COUNT = 7;
const LINK_LENGTH = 5.65;
const GRAVITY = 460;
const BASE_COLOR = new THREE.Color('#7467f5');
const HOVER_COLOR = new THREE.Color('#ff896f');
const INTERACTIVE_TARGETS = 'a, button, [role=button], input, textarea, select, summary, label, [contenteditable=true], [data-cursor=interactive]';

function CursorRig({ pointerRef, interactionRef, reducedMotion }) {
 const { size } = useThree();
 const anchorGroupRef = useRef(null);
 const anchorMaterialRef = useRef(null);
 const haloMaterialRef = useRef(null);
 const pendantPanelMaterialRef = useRef(null);
 const attachmentMaterialRef = useRef(null);
 const chainSegmentsRef = useRef([]);
 const pendantRef = useRef(null);
 const initializedRef = useRef(false);
 const lastAnchorRef = useRef(new THREE.Vector3());
 const smoothedAnchorRef = useRef(new THREE.Vector3());
 const pendantAngleRef = useRef(0);
 const scratchVectorRef = useRef(new THREE.Vector3());
 const mixedColorRef = useRef(new THREE.Color());
 const hoverAmountRef = useRef(0);
 const pressAmountRef = useRef(0);
 const points = useMemo(
 () => Array.from({ length: NODE_COUNT }, () => new THREE.Vector3()),
 []
 );
 const previousPoints = useMemo(
 () => Array.from({ length: NODE_COUNT }, () => new THREE.Vector3()),
 []
 );

 useFrame((_, frameDelta) => {
 const pointer = pointerRef.current;
 if (!pointer.hasPosition) return;

 const dt = Math.min(Math.max(frameDelta, 1 / 240), 1 / 30);
 const targetAnchorX = pointer.x - size.width / 2;
 const targetAnchorY = size.height / 2 - pointer.y;
 let pointerDeltaX = 0;
 let pointerDeltaY = 0;

 if (!initializedRef.current) {
 smoothedAnchorRef.current.set(targetAnchorX, targetAnchorY, 0);
 for (let index = 0; index < NODE_COUNT; index += 1) {
 points[index].set(targetAnchorX, targetAnchorY - index * LINK_LENGTH, 0);
 previousPoints[index].copy(points[index]);
 }
 lastAnchorRef.current.set(targetAnchorX, targetAnchorY, 0);
 initializedRef.current = true;
 }

 // Ease the physical anchor toward the mouse target. This prevents large pointer
 // jumps from injecting an unrealistic amount of energy into the chain.
 const anchorFollow = reducedMotion ? 1 : 1 - Math.exp(-8 * dt);
 const anchorStepX = (targetAnchorX - smoothedAnchorRef.current.x) * anchorFollow;
 const anchorStepY = (targetAnchorY - smoothedAnchorRef.current.y) * anchorFollow;
 const anchorStepLength = Math.hypot(anchorStepX, anchorStepY);
 const maxAnchorStep = 22;
 const anchorStepScale = anchorStepLength > maxAnchorStep ? maxAnchorStep / anchorStepLength : 1;
 smoothedAnchorRef.current.x += anchorStepX * anchorStepScale;
 smoothedAnchorRef.current.y += anchorStepY * anchorStepScale;
 const anchorX = smoothedAnchorRef.current.x;
 const anchorY = smoothedAnchorRef.current.y;

 if (initializedRef.current) {
 pointerDeltaX = anchorX - lastAnchorRef.current.x;
 pointerDeltaY = anchorY - lastAnchorRef.current.y;
 lastAnchorRef.current.set(anchorX, anchorY, 0);
 }

 points[0].set(anchorX, anchorY, 0);

 if (reducedMotion) {
 for (let index = 1; index < NODE_COUNT; index += 1) {
 points[index].set(anchorX, anchorY - index * LINK_LENGTH, 0);
 previousPoints[index].copy(points[index]);
 }
 } else {
 const damping = Math.pow(0.986, dt * 60);

 // Verlet integration gives the hanging chain momentum without a physics dependency.
 for (let index = 1; index < NODE_COUNT; index += 1) {
 const current = points[index];
 const previous = previousPoints[index];
 const velocityX = (current.x - previous.x) * damping;
 const velocityY = (current.y - previous.y) * damping;
 const velocityZ = (current.z - previous.z) * damping;

 previous.copy(current);
 current.x += velocityX;
 current.y += velocityY - GRAVITY * dt * dt;
 current.z += velocityZ;
 }

 // Repeated distance constraints keep the chain links connected and stop stretching.
 const difference = scratchVectorRef.current;
 for (let pass = 0; pass < 7; pass += 1) {
 points[0].set(anchorX, anchorY, 0);

 for (let index = 1; index < NODE_COUNT; index += 1) {
 const parent = points[index - 1];
 const current = points[index];
 difference.set(
 current.x - parent.x,
 current.y - parent.y,
 current.z - parent.z
 );

 const distance = Math.max(difference.length(), 0.0001);
 difference.multiplyScalar((distance - LINK_LENGTH) / distance);

 if (index === 1) {
 current.sub(difference);
 } else {
 parent.addScaledVector(difference, 0.5);
 current.addScaledVector(difference, -0.5);
 }
 }
 }
 }

 points[0].set(anchorX, anchorY, 0);

 const hoverTarget = interactionRef.current.hover ? 1 : 0;
 const pressTarget = interactionRef.current.pressed ? 1 : 0;

 if (reducedMotion) {
 hoverAmountRef.current = hoverTarget;
 pressAmountRef.current = pressTarget;
 } else {
 hoverAmountRef.current = THREE.MathUtils.damp(
 hoverAmountRef.current,
 hoverTarget,
 14,
 dt
 );
 pressAmountRef.current = THREE.MathUtils.damp(
 pressAmountRef.current,
 pressTarget,
 20,
 dt
 );
 }

 const cursorColor = mixedColorRef.current.lerpColors(
 BASE_COLOR,
 HOVER_COLOR,
 hoverAmountRef.current
 );

 if (anchorGroupRef.current) {
 anchorGroupRef.current.position.set(anchorX, anchorY, 7);
 anchorGroupRef.current.rotation.z = reducedMotion
 ? 0
 : THREE.MathUtils.clamp(pointerDeltaX * 0.018, -0.7, 0.7);
 anchorGroupRef.current.rotation.x = reducedMotion
 ? 0
 : THREE.MathUtils.clamp(-pointerDeltaY * 0.009, -0.28, 0.28);
 }

 if (anchorMaterialRef.current) {
 anchorMaterialRef.current.color.copy(cursorColor);
 }

 if (haloMaterialRef.current) {
 haloMaterialRef.current.opacity =
 0.27 + hoverAmountRef.current * 0.17 + pressAmountRef.current * 0.1;
 haloMaterialRef.current.color.copy(cursorColor);
 }

 if (pendantPanelMaterialRef.current) {
 pendantPanelMaterialRef.current.color.copy(cursorColor);
 }

 if (attachmentMaterialRef.current) {
 attachmentMaterialRef.current.color.copy(cursorColor);
 }

 for (let index = 0; index < NODE_COUNT - 1; index += 1) {
 const segment = chainSegmentsRef.current[index];
 if (!segment) continue;

 const start = points[index];
 const end = points[index + 1];
 segment.position.set(
 (start.x + end.x) / 2,
 (start.y + end.y) / 2,
 4.35
 );
 const angle = Math.atan2(end.y - start.y, end.x - start.x);
 segment.rotation.set(
 0,
 0,
 angle + (index % 2 === 0 ? 0.32 : -0.32)
 );
 }

 const endPoint = points[NODE_COUNT - 1];
 const linkBeforeEnd = points[NODE_COUNT - 2];
 // The pendant hangs below its attachment point. Its down vector must extend
 // the final simulated link, rather than being counter-rotated or velocity-led.
 const chainTilt = Math.atan2(
 endPoint.x - linkBeforeEnd.x,
 Math.max(0.001, linkBeforeEnd.y - endPoint.y)
 );
 const angleDelta = Math.atan2(
 Math.sin(chainTilt - pendantAngleRef.current),
 Math.cos(chainTilt - pendantAngleRef.current)
 );
 const continuousTilt = pendantAngleRef.current + angleDelta;
 pendantAngleRef.current = reducedMotion
 ? 0
 : THREE.MathUtils.damp(pendantAngleRef.current, continuousTilt, 16, dt);

 if (pendantRef.current) {
 // The group origin is the connector loop, so every rotation keeps the last
 // chain link physically attached to the top of the keychain.
 pendantRef.current.position.set(endPoint.x, endPoint.y, 3.15);
 pendantRef.current.rotation.set(
 0,
 0,
 reducedMotion ? 0 : THREE.MathUtils.clamp(pendantAngleRef.current, -0.78, 0.78)
 );
 const pendantScale = 1 - pressAmountRef.current * 0.11;
 pendantRef.current.scale.setScalar(pendantScale);
 }
 });

 return (
 <>
 {/* The visible cursor tip: a polished metal ring, a central glint, and a subtle halo. */}
 <group ref={anchorGroupRef}>
 <mesh position={[0, 0, 0]}>
 <torusGeometry args={[4.15, 0.86, 10, 28]} />
 <meshStandardMaterial
 ref={anchorMaterialRef}
 color='#7467f5'
 metalness={0.78}
 roughness={0.2}
 />
 </mesh>
 <mesh position={[0, 0, 0.75]}>
 <sphereGeometry args={[1.2, 16, 16]} />
 <meshStandardMaterial
 color='#fff8f2'
 emissive='#a99fff'
 emissiveIntensity={0.24}
 metalness={0.18}
 roughness={0.2}
 />
 </mesh>
 <mesh position={[0, 0, -0.85]}>
 <torusGeometry args={[9, 0.17, 6, 36]} />
 <meshBasicMaterial
 ref={haloMaterialRef}
 color='#7467f5'
 transparent
 opacity={0.27}
 depthWrite={false}
 />
 </mesh>
 </group>

 {/* Each small metal link follows the constrained 3D chain simulation. */}
 {Array.from({ length: NODE_COUNT - 1 }, (_, index) => (
 <mesh
 key={index}
 ref={(mesh) => {
 chainSegmentsRef.current[index] = mesh;
 }}
 position={[0, 0, 4.35]}
 scale={[1.1, 0.75, 0.82]}
 >
 <torusGeometry args={[2, 0.72, 8, 14]} />
 <meshStandardMaterial
 color='#c6c0ff'
 metalness={0.9}
 roughness={0.19}
 />
 </mesh>
 ))}

 {/* Custom pendant: bevelled metallic housing and a contrasting monogram. */}
 <group ref={pendantRef}>
 <group position={[0, -14, 0]}>
 <RoundedBox
 args={[25, 30, 5]}
 radius={4.5}
 smoothness={5}
 castShadow={false}
 receiveShadow={false}
 >
 <meshStandardMaterial
 color='#c9c2ff'
 metalness={0.84}
 roughness={0.22}
 />
 </RoundedBox>

 <RoundedBox
 args={[20.5, 25.5, 1.4]}
 radius={3.1}
 smoothness={4}
 position={[0, 0, 2.9]}
 >
 <meshStandardMaterial
 ref={pendantPanelMaterialRef}
 color='#7467f5'
 metalness={0.3}
 roughness={0.25}
 />
 </RoundedBox>

 <RoundedBox
 args={[16.8, 21.5, 0.8]}
 radius={2.6}
 smoothness={4}
 position={[0, -0.3, 3.85]}
 >
 <meshStandardMaterial
 color='#302954'
 metalness={0.28}
 roughness={0.34}
 />
 </RoundedBox>

 {/* Abstract R-shaped monogram, modelled as small raised geometric bars. */}
 <RoundedBox
 args={[1.55, 8.8, 0.85]}
 radius={0.6}
 smoothness={3}
 position={[-3.05, 0.3, 4.65]}
 >
 <meshStandardMaterial color='#fff8f2' metalness={0.28} roughness={0.22} />
 </RoundedBox>
 <RoundedBox
 args={[5.7, 1.5, 0.85]}
 radius={0.55}
 smoothness={3}
 position={[-0.2, 3.8, 4.65]}
 >
 <meshStandardMaterial color='#fff8f2' metalness={0.28} roughness={0.22} />
 </RoundedBox>
 <RoundedBox
 args={[5.7, 1.5, 0.85]}
 radius={0.55}
 smoothness={3}
 position={[-0.2, 0.35, 4.65]}
 >
 <meshStandardMaterial color='#fff8f2' metalness={0.28} roughness={0.22} />
 </RoundedBox>
 <RoundedBox
 args={[1.5, 4.1, 0.85]}
 radius={0.55}
 smoothness={3}
 position={[2.2, 2.05, 4.65]}
 >
 <meshStandardMaterial color='#fff8f2' metalness={0.28} roughness={0.22} />
 </RoundedBox>
 <RoundedBox
 args={[1.55, 6.1, 0.85]}
 radius={0.55}
 smoothness={3}
 position={[1.55, -3.1, 4.65]}
 rotation={[0, 0, 0.53]}
 >
 <meshStandardMaterial color='#fff8f2' metalness={0.28} roughness={0.22} />
 </RoundedBox>

 {/* A tiny warm enamel detail gives the charm an intentional accent. */}
 <mesh position={[6.2, 9.3, 4.85]}>
 <sphereGeometry args={[1.05, 16, 16]} />
 <meshStandardMaterial
 color='#ffad8e'
 emissive='#a83d38'
 emissiveIntensity={0.18}
 metalness={0.22}
 roughness={0.2}
 />
 </mesh>

 {/* The connector loop sits over the top edge of the pendant. */}
 <mesh position={[0, 14, 3.75]}>
 <torusGeometry args={[3.1, 0.85, 10, 24]} />
 <meshStandardMaterial
 ref={attachmentMaterialRef}
 color='#7467f5'
 metalness={0.88}
 roughness={0.18}
 />
 </mesh>
 </group>
 </group>
 </>
 );
}

export default function PhysicsCursor() {
 const [enabled, setEnabled] = useState(false);
 const [cursorVisible, setCursorVisible] = useState(false);
 const [reducedMotion, setReducedMotion] = useState(false);
 const pointerRef = useRef({ x: 0, y: 0, hasPosition: false, inside: false });
 const interactionRef = useRef({ hover: false, pressed: false });
 const capabilityRef = useRef(false);

 useEffect(() => {
 const root = document.documentElement;
 const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
 const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

 const clearPointerState = () => {
 pointerRef.current.inside = false;
 interactionRef.current.hover = false;
 interactionRef.current.pressed = false;
 setCursorVisible(false);
 };

 const updateCapability = () => {
 const supported = finePointerQuery.matches;
 capabilityRef.current = supported;
 setEnabled(supported);
 root.classList.toggle('physics-cursor-enabled', supported);

 if (!supported) {
 pointerRef.current.hasPosition = false;
 clearPointerState();
 }
 };

 const updateReducedMotion = () => {
 setReducedMotion(reducedMotionQuery.matches);
 };

 const handlePointerMove = (event) => {
 if (!capabilityRef.current || event.pointerType === 'touch') return;

 pointerRef.current.x = event.clientX;
 pointerRef.current.y = event.clientY;
 pointerRef.current.hasPosition = true;

 if (!pointerRef.current.inside) {
 pointerRef.current.inside = true;
 setCursorVisible(true);
 }

 const target = event.target instanceof Element ? event.target : null;
 interactionRef.current.hover = Boolean(target?.closest(INTERACTIVE_TARGETS));
 };

 const handlePointerDown = (event) => {
 if (!capabilityRef.current || event.pointerType === 'touch') return;
 interactionRef.current.pressed = true;
 };

 const handlePointerUp = () => {
 interactionRef.current.pressed = false;
 };

 const handlePointerLeave = () => {
 clearPointerState();
 };

 const handleVisibilityChange = () => {
 if (document.visibilityState === 'hidden') clearPointerState();
 };

 updateCapability();
 updateReducedMotion();

 window.addEventListener('pointermove', handlePointerMove, { passive: true });
 window.addEventListener('pointerdown', handlePointerDown, { passive: true });
 window.addEventListener('pointerup', handlePointerUp, { passive: true });
 window.addEventListener('pointercancel', handlePointerUp, { passive: true });
 window.addEventListener('pointerleave', handlePointerLeave);
 window.addEventListener('blur', handlePointerLeave);
 document.addEventListener('visibilitychange', handleVisibilityChange);

 if (typeof finePointerQuery.addEventListener === 'function') {
 finePointerQuery.addEventListener('change', updateCapability);
 reducedMotionQuery.addEventListener('change', updateReducedMotion);
 } else {
 finePointerQuery.addListener(updateCapability);
 reducedMotionQuery.addListener(updateReducedMotion);
 }

 return () => {
 window.removeEventListener('pointermove', handlePointerMove);
 window.removeEventListener('pointerdown', handlePointerDown);
 window.removeEventListener('pointerup', handlePointerUp);
 window.removeEventListener('pointercancel', handlePointerUp);
 window.removeEventListener('pointerleave', handlePointerLeave);
 window.removeEventListener('blur', handlePointerLeave);
 document.removeEventListener('visibilitychange', handleVisibilityChange);

 if (typeof finePointerQuery.removeEventListener === 'function') {
 finePointerQuery.removeEventListener('change', updateCapability);
 reducedMotionQuery.removeEventListener('change', updateReducedMotion);
 } else {
 finePointerQuery.removeListener(updateCapability);
 reducedMotionQuery.removeListener(updateReducedMotion);
 }

 root.classList.remove('physics-cursor-enabled');
 };
 }, []);

 if (!enabled) return null;

 return (
 <div
 className={'physics-cursor-layer' + (cursorVisible ? ' is-visible' : '')}
 aria-hidden='true'
 >
 <Canvas
 orthographic
 dpr={[1, 1.5]}
 camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 500 }}
 gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
 style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
 >
 <ambientLight intensity={1.25} />
 <directionalLight position={[24, 44, 70]} intensity={2.15} />
 <pointLight position={[-28, 22, 48]} intensity={1.55} color='#b9aaff' />
 <CursorRig
 pointerRef={pointerRef}
 interactionRef={interactionRef}
 reducedMotion={reducedMotion}
 />
 </Canvas>
 </div>
 );
}
