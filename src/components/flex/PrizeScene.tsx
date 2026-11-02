import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial, OrbitControls, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";

const LAYERS = 6; // stacked planes fake thickness

function Piece({ image, kind }: { image: string; kind: "money" | "goyard" }) {
  const tex = useTexture(image);
  tex.colorSpace = THREE.SRGBColorSpace;
  const group = useRef<THREE.Group>(null);
  const jump = useRef({ y: 0, v: 0 });
  const [burst, setBurst] = useState(0);

  useFrame((s, d) => {
    const dt = Math.min(d, 0.05);
    const g = group.current;
    if (!g) return;
    const j = jump.current;
    j.v -= 18 * dt;
    j.y = Math.max(0, j.y + j.v * dt);
    if (j.y === 0) j.v = 0;
    g.rotation.y += dt * (kind === "money" ? 0.6 : 0.4);
    g.position.y = (kind === "money" ? 0.15 + Math.sin(s.clock.elapsedTime * 1.4) * 0.08 : 0) + j.y;
  });

  const hop = () => {
    jump.current.v = 5;
    setBurst((b) => b + 1);
  };

  return (
    <group ref={group} scale={kind === "money" ? 0.78 : 1} onPointerOver={hop} onPointerDown={hop}>
      {Array.from({ length: LAYERS }).map((_, i) => (
        <mesh key={i} position={[0, 0, (i - LAYERS / 2) * 0.012]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshStandardMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} metalness={0.35} roughness={0.35} envMapIntensity={1.2} />
        </mesh>
      ))}
      <Sparkles key={burst} count={burst ? 40 : 14} scale={[2.6, 2.6, 1.2]} size={burst ? 6 : 3} speed={burst ? 2 : 0.4} color="#FFD86B" />
    </group>
  );
}

function MoneyRain({ image }: { image: string }) {
  const tex = useTexture(image);
  const N = 26;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 7, y: Math.random() * 8, z: -2 - Math.random() * 3, s: 0.4 + Math.random() * 0.6, r: Math.random() * 6 })), []);
  const m = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, d) => {
    const dt = Math.min(d, 0.05);
    seeds.forEach((p, i) => {
      p.y -= dt * (0.6 + p.s);
      p.r += dt * 1.5;
      if (p.y < -4) p.y = 4;
      m.position.set(p.x, p.y, p.z);
      m.rotation.set(p.r, p.r * 0.7, 0);
      m.scale.setScalar(p.s * 0.6);
      m.updateMatrix();
      mesh.current?.setMatrixAt(i, m.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} opacity={0.55} />
    </instancedMesh>
  );
}

export default function PrizeScene({ kind, image }: { kind: "money" | "goyard"; image: string }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.4, 4.2], fov: 40 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.35} />
      <spotLight position={[2, 4, 3]} angle={0.5} penumbra={0.8} intensity={60} color="#FFD86B" />
      <pointLight position={[-3, 1, 2]} intensity={8} color="#D4AF37" />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} color="#FFD86B" />
        <Lightformer intensity={1} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} color="#D4AF37" />
      </Environment>
      {kind === "money" && <MoneyRain image={image} />}
      <Piece image={image} kind={kind} />
      {kind === "goyard" && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -1.12, 0]}>
          <planeGeometry args={[10, 10]} />
          <MeshReflectorMaterial resolution={256} mixBlur={1} mixStrength={6} blur={[200, 60]} roughness={0.9} depthScale={0.8} color="#0a0a0a" metalness={0.6} mirror={0.6} />
        </mesh>
      )}
      <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} />
    </Canvas>
  );
}
