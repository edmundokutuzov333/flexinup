import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
function Piece({ image, kind, reduced }: { image: string; kind: "money" | "goyard"; reduced: boolean }) {
  const tex = useTexture(image);
  tex.colorSpace = THREE.SRGBColorSpace;
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useFrame((s) => { const g = group.current; if (!g) return; g.rotation.y = reduced ? 0 : Math.sin(s.clock.elapsedTime * .16) * .22; g.position.y = hover && !reduced ? .035 : 0; });
  return <group ref={group} scale={kind === "money" ? .92 : 1} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>{Array.from({length:6}).map((_,i) => <mesh key={i} position={[0,0,(i-3)*.008]}><planeGeometry args={[2.2,2.2]} /><meshStandardMaterial map={tex} transparent alphaTest={.4} side={THREE.DoubleSide} metalness={.1} roughness={.7} /></mesh>)}</group>;
}
export default function PrizeScene({ kind, image }: { kind: "money" | "goyard"; image: string }) {
  const [tokens, setTokens] = useState<{ink:string;gold:string;bone:string} | null>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { const css = getComputedStyle(document.documentElement); setTokens({ink:css.getPropertyValue("--ink-2").trim(),gold:css.getPropertyValue("--gold").trim(),bone:css.getPropertyValue("--bone").trim()}); const media=matchMedia("(prefers-reduced-motion: reduce)"); const on=()=>setReduced(media.matches); on(); media.addEventListener("change",on); return ()=>media.removeEventListener("change",on); }, []);
  if (!tokens) return null;
  return <Canvas dpr={[1,1.5]} camera={{position:[0,.3,4.4],fov:40}} gl={{antialias:true,alpha:true}}>
    <ambientLight intensity={1.1} /><directionalLight position={[-3,3,4]} intensity={2} color={tokens.gold} /><directionalLight position={[3,1,3]} intensity={.8} color={tokens.bone} />
    <Piece image={image} kind={kind} reduced={reduced} />
    <mesh rotation-x={-Math.PI/2} position={[0,-1.12,0]}><planeGeometry args={[10,10]} /><MeshReflectorMaterial resolution={128} mixBlur={1} mixStrength={1.8} blur={[100,40]} roughness={.8} depthScale={.4} color={tokens.ink} metalness={.3} mirror={.25} /></mesh>
    <OrbitControls enableZoom={false} enablePan={false} minAzimuthAngle={-.5} maxAzimuthAngle={.5} minPolarAngle={Math.PI/2.4} maxPolarAngle={Math.PI/1.9} />
  </Canvas>;
}
