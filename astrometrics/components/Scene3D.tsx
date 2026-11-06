"use client";

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

type TargetPositions = Record<string, THREE.Vector3>;

export interface CamadasConfig {
  orbitas: boolean;
  alinhamento: boolean;
  asteroides: boolean;
  planetas: boolean;
}

// Gerador de Texturas Fotorrealistas de Alta Fidelidade (100% local, sem 404 ou quebras de rede)
function createDetailedPlanetTexture(planet: string): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture(document.createElement('canvas'));
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (planet === 'mercury') {
    // Relevo cinzento com milhares de crateras de impacto e manchas de albedo
    ctx.fillStyle = '#87898c';
    ctx.fillRect(0, 0, 1024, 512);

    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 14 + 2;
      const grad = ctx.createRadialGradient(x, y, 1, x, y, r);
      grad.addColorStop(0, '#5a5b5e');
      grad.addColorStop(0.8, '#717377');
      grad.addColorStop(1, '#a6a9ad');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planet === 'venus') {
    // Atmosfera densa de ácido sulfúrico com bandas de convecção cremosas e douradas
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#ecd799');
    grad.addColorStop(0.25, '#f4e5b8');
    grad.addColorStop(0.5, '#e4c988');
    grad.addColorStop(0.75, '#edd9a3');
    grad.addColorStop(1, '#d8b975');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let y = 0; y < 512; y += 4) {
      if (Math.sin(y * 0.05) > 0.2) {
        ctx.fillRect(0, y, 1024, 3);
      }
    }
  } else if (planet === 'mars') {
    // Relevo ferruginoso com mares de basalto escuro e calotas polares de gelo
    ctx.fillStyle = '#b84e27';
    ctx.fillRect(0, 0, 1024, 512);

    // Bacias de impacto e planaltos escuros (Syrtis Major / Acidalia)
    ctx.fillStyle = '#7a3118';
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 1024,
        150 + Math.random() * 220,
        Math.random() * 120 + 30,
        Math.random() * 45 + 15,
        Math.random(),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Calotas Polares Brancas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 32);
    ctx.fillRect(0, 480, 1024, 32);
  } else if (planet === 'jupiter') {
    // Faixas atmosféricas alternadas com turbulências
    for (let y = 0; y < 512; y++) {
      const wave = Math.sin(y * 0.08) * 0.5 + Math.sin(y * 0.02) * 0.3;
      if (wave > 0.3) {
        ctx.fillStyle = '#bc7c49';
      } else if (wave > -0.1) {
        ctx.fillStyle = '#eed6b3';
      } else if (wave > -0.4) {
        ctx.fillStyle = '#9c5b2e';
      } else {
        ctx.fillStyle = '#f5e4cb';
      }
      ctx.fillRect(0, y, 1024, 1);
    }

    // A Grande Mancha Vermelha
    const spotX = 650;
    const spotY = 320;
    const spotGrad = ctx.createRadialGradient(spotX, spotY, 5, spotX, spotY, 45);
    spotGrad.addColorStop(0, '#992d15');
    spotGrad.addColorStop(0.7, '#ba4324');
    spotGrad.addColorStop(1, 'rgba(238, 214, 179, 0)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.ellipse(spotX, spotY, 65, 35, -0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (planet === 'saturn') {
    // Bandas gasosas em tons pastel dourados e manteiga
    for (let y = 0; y < 512; y++) {
      const v = Math.sin(y * 0.06) * 0.5 + 0.5;
      ctx.fillStyle = v > 0.4 ? '#e6cf9e' : '#ceb27a';
      ctx.fillRect(0, y, 1024, 1);
    }
  } else if (planet === 'uranus') {
    // Atmosfera turquesa suave de metano com gradiente subtil
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#74c4d4');
    grad.addColorStop(0.5, '#9ee0ec');
    grad.addColorStop(1, '#62b4c5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);
  } else if (planet === 'neptune') {
    // Azul cobalto vibrante com cirros brancos e tempestade escura
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#2153b6');
    grad.addColorStop(0.5, '#3b74e0');
    grad.addColorStop(1, '#1b4396');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Faixas de cirros brancos de metano
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(0, 210, 1024, 6);
    ctx.fillRect(0, 310, 1024, 4);

    // Grande Mancha Escura
    ctx.fillStyle = '#112a66';
    ctx.beginPath();
    ctx.ellipse(400, 260, 48, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Linha orbital fina
function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.035, radius + 0.035, 128]} />
      <meshBasicMaterial color="#0284c7" opacity={0.25} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// Controlador de Câmara sem bloqueio de zoom
function CameraFlightController({
  targetKey,
  targetRadius,
  positionsRef,
}: {
  targetKey: string;
  targetRadius: number;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const controlsRef = useRef<any>(null);
  const activeKeyRef = useRef(targetKey);
  const isTransitioningRef = useRef(true);

  const desiredDistance = useMemo(() => {
    if (targetKey === 'VisaoGeral') return 74.0;
    if (targetKey === 'Sol') return 11.0;
    return Math.max(targetRadius * 3.4, 2.5);
  }, [targetKey, targetRadius]);

  if (activeKeyRef.current !== targetKey) {
    activeKeyRef.current = targetKey;
    isTransitioningRef.current = true;
  }

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const planetPos = positionsRef.current[targetKey] || new THREE.Vector3(0, 0, 0);

    if (isTransitioningRef.current) {
      controls.target.lerp(planetPos, 0.08);

      const offset = camera.position.clone().sub(controls.target);
      if (offset.lengthSq() === 0) offset.set(0, 0.6, 1);
      offset.setLength(desiredDistance);

      const targetCamPos = planetPos.clone().add(offset);
      camera.position.lerp(targetCamPos, 0.08);

      if (
        controls.target.distanceTo(planetPos) < 0.05 &&
        Math.abs(camera.position.distanceTo(planetPos) - desiredDistance) < 0.1
      ) {
        isTransitioningRef.current = false;
      }
    } else {
      const shift = planetPos.clone().sub(controls.target);
      controls.target.copy(planetPos);
      camera.position.add(shift);
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={false}
      minDistance={1.2}
      maxDistance={350}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      onStart={() => {
        isTransitioningRef.current = false;
      }}
    />
  );
}

// Sol Central Incandescente
function Sun({
  onFocus,
  positionsRef,
}: {
  onFocus: (key: string, radius: number) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lava/lavatile.jpg'
    );
  }, []);

  useFrame(({ clock }, delta) => {
    positionsRef.current['Sol'] = new THREE.Vector3(0, 0, 0);
    if (sunMeshRef.current) sunMeshRef.current.rotation.y += delta * 0.015;
    if (flareRef.current) {
      const s = 1.05 + Math.sin(clock.getElapsedTime() * 2) * 0.02;
      flareRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh
        ref={sunMeshRef}
        onClick={(e) => { e.stopPropagation(); onFocus('Sol', 2.3); }}
        className="cursor-pointer"
      >
        <sphereGeometry args={[2.3, 48, 48]} />
        <meshBasicMaterial map={texture} color="#ffde6a" />
      </mesh>

      <mesh ref={flareRef}>
        <sphereGeometry args={[2.55, 32, 32]} />
        <meshBasicMaterial color="#ff7b00" transparent opacity={0.32} blending={THREE.AdditiveBlending} />
      </mesh>

      <pointLight intensity={18.0} distance={250} decay={0.15} color="#ffffff" />
    </group>
  );
}

// Planetas do Sistema Solar
function SolarPlanet({
  name,
  type,
  radius,
  orbitRadius,
  speed,
  initialAngle,
  ring = false,
  camadas,
  onFocus,
  positionsRef,
}: {
  name: string;
  type: string;
  radius: number;
  orbitRadius: number;
  speed: number;
  initialAngle: number;
  ring?: boolean;
  camadas: CamadasConfig;
  onFocus: (key: string, radius: number) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createDetailedPlanetTexture(type), [type]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + initialAngle;
    const x = Math.cos(t) * orbitRadius;
    const z = Math.sin(t) * orbitRadius;

    positionsRef.current[name] = new THREE.Vector3(x, 0, z);

    if (meshRef.current) {
      meshRef.current.position.set(x, 0, z);
      meshRef.current.rotation.y += 0.012;
    }
  });

  return (
    <group>
      {camadas.orbitas && <OrbitRing radius={orbitRadius} />}

      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onFocus(name, radius); }}
        className="cursor-pointer"
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.65}
          metalness={0.05}
        />

        {ring && (
          <mesh rotation={[Math.PI / 2.35, 0.2, 0]}>
            <ringGeometry args={[radius * 1.35, radius * 2.45, 64]} />
            <meshStandardMaterial
              color="#e2d4b7"
              side={THREE.DoubleSide}
              transparent
              opacity={0.85}
              roughness={0.7}
            />
          </mesh>
        )}

        <Html distanceFactor={15} position={[0, radius + 0.6, 0]}>
          <div className="bg-slate-950/85 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 pointer-events-none whitespace-nowrap shadow-md">
            {name}
          </div>
        </Html>
      </mesh>
    </group>
  );
}

// Terra e Lua
function EarthSystem({
  camadas,
  onFocus,
  positionsRef,
}: {
  camadas: CamadasConfig;
  onFocus: (key: string, radius: number) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const earthOrbitRadius = 12.0;
  const systemRef = useRef<THREE.Group>(null);
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);

  const [colorMap, normalMap, moonMap] = useMemo(() => {
    if (typeof window === 'undefined') return [null, null, null];
    const loader = new THREE.TextureLoader();
    return [
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'),
    ];
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime() * 0.04 + 1.2;
    const x = Math.cos(t) * earthOrbitRadius;
    const z = Math.sin(t) * earthOrbitRadius;

    positionsRef.current['Terra'] = new THREE.Vector3(x, 0, z);

    if (systemRef.current) {
      systemRef.current.position.set(x, 0, z);
    }
    if (earthMeshRef.current) earthMeshRef.current.rotation.y += delta * 0.03;

    if (moonMeshRef.current) {
      const mt = clock.getElapsedTime() * 0.25;
      const mx = Math.cos(mt) * 2.6;
      const mz = Math.sin(mt) * 2.6;
      moonMeshRef.current.position.set(mx, 0, mz);
      positionsRef.current['Lua'] = new THREE.Vector3(x + mx, 0, z + mz);
    }
  });

  return (
    <group>
      {camadas.orbitas && <OrbitRing radius={earthOrbitRadius} />}

      <group ref={systemRef}>
        <group onClick={(e) => { e.stopPropagation(); onFocus('Terra', 1.5); }} className="cursor-pointer">
          <mesh ref={earthMeshRef}>
            <sphereGeometry args={[1.5, 64, 64]} />
            <meshStandardMaterial
              map={colorMap || undefined}
              normalMap={normalMap || undefined}
              color={colorMap ? '#ffffff' : '#2563eb'}
              roughness={0.65}
              metalness={0.1}
            />
          </mesh>
          <Html distanceFactor={14} position={[0, 2.0, 0]}>
            <div className="bg-slate-950/80 border border-cyan-400 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 pointer-events-none whitespace-nowrap shadow-md">
              Terra
            </div>
          </Html>
        </group>

        <mesh
          ref={moonMeshRef}
          onClick={(e) => { e.stopPropagation(); onFocus('Lua', 0.36); }}
          className="cursor-pointer"
        >
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial map={moonMap || undefined} color="#cbd5e1" roughness={0.9} />
          <Html distanceFactor={10} position={[0, 0.55, 0]}>
            <div className="bg-slate-950/80 border border-slate-600 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300 pointer-events-none whitespace-nowrap">
              Lua
            </div>
          </Html>
        </mesh>
      </group>
    </group>
  );
}

// Sondas Espaciais
function DeepSpaceProbes({
  onFocus,
  positionsRef,
}: {
  onFocus: (key: string, radius: number) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const jwstPos = useMemo(() => new THREE.Vector3(-14.2, 0.8, 0), []);
  const voyagerPos = useMemo(() => new THREE.Vector3(38.0, 8.0, -22.0), []);

  useFrame(() => {
    positionsRef.current['JWST'] = jwstPos;
    positionsRef.current['Voyager 1'] = voyagerPos;
  });

  return (
    <>
      <group position={[jwstPos.x, jwstPos.y, jwstPos.z]}>
        <group onClick={(e) => { e.stopPropagation(); onFocus('JWST', 0.6); }} className="cursor-pointer">
          <mesh rotation={[0.4, 0.3, 0]}>
            <boxGeometry args={[0.2, 0.003, 0.11]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[0.4, 0.3, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.005, 6]} />
            <meshStandardMaterial color="#f59e0b" metalness={1.0} roughness={0.05} />
          </mesh>
          <pointLight color="#f59e0b" intensity={2.0} distance={1.0} />
          <Html distanceFactor={12} position={[0, 0.35, 0]}>
            <div className="bg-slate-950/80 border border-yellow-500/50 px-2 py-0.5 rounded text-[10px] font-mono text-yellow-300 pointer-events-none whitespace-nowrap shadow-md">
              JWST • L2
            </div>
          </Html>
        </group>
      </group>

      <group position={[voyagerPos.x, voyagerPos.y, voyagerPos.z]}>
        <group onClick={(e) => { e.stopPropagation(); onFocus('Voyager 1', 0.8); }} className="cursor-pointer">
          <mesh rotation={[0.6, -0.4, 0]}>
            <cylinderGeometry args={[0.14, 0.01, 0.04, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.05, 0.06, 0.05]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <pointLight color="#38bdf8" intensity={1.5} distance={1.2} />
          <Html distanceFactor={14} position={[0, 0.45, 0]}>
            <div className="bg-slate-950/80 border border-indigo-500/50 px-2 py-0.5 rounded text-[10px] font-mono text-indigo-300 pointer-events-none whitespace-nowrap shadow-md">
              Voyager 1 • Interestelar
            </div>
          </Html>
        </group>
      </group>
    </>
  );
}

// Cinturão de Asteroides
function AsteroidsLayer({
  asteroides,
  onFocus,
  positionsRef,
}: {
  asteroides: any[];
  onFocus: (key: string, radius: number) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  return (
    <>
      {asteroides.map((ast, i) => {
        const orbitRadius = 18.0 + (i * 0.65);
        const speed = (ast.velocity_kmh / 120000) * 0.12 + 0.02;
        const isHazardous = ast.is_potentially_hazardous_asteroid;

        return (
          <AsteroidSingle
            key={ast.id || i}
            ast={ast}
            orbitRadius={orbitRadius}
            speed={speed}
            index={i}
            total={asteroides.length}
            isHazardous={isHazardous}
            onFocus={onFocus}
            positionsRef={positionsRef}
          />
        );
      })}
    </>
  );
}

function AsteroidSingle({
  ast,
  orbitRadius,
  speed,
  index,
  total,
  isHazardous,
  onFocus,
  positionsRef,
}: {
  ast: any;
  orbitRadius: number;
  speed: number;
  index: number;
  total: number;
  isHazardous: boolean;
  onFocus: (key: string, radius: number) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + index * ((Math.PI * 2) / total);
    const x = Math.cos(t) * orbitRadius;
    const y = Math.sin(t) * 0.4 * Math.sin(index + 1);
    const z = Math.sin(t) * orbitRadius;

    positionsRef.current[ast.name] = new THREE.Vector3(x, y, z);

    if (meshRef.current) {
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onFocus(ast.name, 0.4); }}
        className="cursor-pointer"
      >
        <dodecahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} metalness={0.2} />
        <Html distanceFactor={14} position={[0, 0.25, 0]}>
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md border pointer-events-none ${
            isHazardous ? "bg-red-950/80 border-red-500/60 text-red-200" : "bg-slate-950/80 border-cyan-500/40 text-cyan-200"
          }`}>
            {ast.name}
          </div>
        </Html>
      </mesh>
    </group>
  );
}

// Cena Principal
export default function Scene3D({
  asteroides = [],
  camadas = { orbitas: true, alinhamento: true, asteroides: true, planetas: true },
}: {
  asteroides?: any[];
  camadas?: CamadasConfig;
}) {
  const [activeTarget, setActiveTarget] = useState<{ key: string; radius: number }>({
    key: "VisaoGeral",
    radius: 20.0,
  });

  const positionsRef = useRef<TargetPositions>({
    'VisaoGeral': new THREE.Vector3(0, 0, 0),
  });

  const handleFocus = (key: string, radius: number) => {
    setActiveTarget({ key, radius });
  };

  const planetasCatalogo = useMemo(() => [
    { name: "Mercúrio", type: 'mercury', radius: 0.45, dist: 6.2, speed: 0.12, initialAngle: 0.5 },
    { name: "Vénus", type: 'venus', radius: 0.8, dist: 9.0, speed: 0.07, initialAngle: 2.1 },
    { name: "Marte", type: 'mars', radius: 0.75, dist: 15.2, speed: 0.03, initialAngle: 4.2 },
    { name: "Júpiter", type: 'jupiter', radius: 2.5, dist: 24.5, speed: 0.015, initialAngle: 1.0 },
    { name: "Saturno", type: 'saturn', radius: 2.0, dist: 32.0, speed: 0.01, initialAngle: 3.5, ring: true },
    { name: "Úrano", type: 'uranus', radius: 1.3, dist: 39.0, speed: 0.007, initialAngle: 5.0 },
    { name: "Neptuno", type: 'neptune', radius: 1.3, dist: 46.0, speed: 0.005, initialAngle: 0.8 },
  ], []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#020617]">
      <div className="absolute top-24 left-6 z-20 pointer-events-auto">
        <button
          onClick={() => handleFocus('VisaoGeral', 20.0)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono border backdrop-blur-md transition-all shadow-xl flex items-center gap-2 ${
            activeTarget.key === 'VisaoGeral'
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
              : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
          }`}
        >
          <span>🌌</span>
          <span>Visão Geral do Sistema</span>
        </button>
      </div>

      <Canvas camera={{ position: [0, 52, 75], fov: 45 }}>
        <Stars radius={300} depth={100} count={9000} factor={4} saturation={0} fade speed={1.2} />

        <ambientLight intensity={0.65} />
        <directionalLight position={[0, 40, 20]} intensity={0.7} color="#ffffff" />

        <CameraFlightController
          targetKey={activeTarget.key}
          targetRadius={activeTarget.radius}
          positionsRef={positionsRef}
        />

        <Sun onFocus={handleFocus} positionsRef={positionsRef} />

        <EarthSystem
          camadas={camadas}
          onFocus={handleFocus}
          positionsRef={positionsRef}
        />

        {camadas.planetas && planetasCatalogo.map((p) => (
          <SolarPlanet
            key={p.name}
            name={p.name}
            type={p.type}
            radius={p.radius}
            orbitRadius={p.dist}
            speed={p.speed}
            initialAngle={p.initialAngle}
            ring={p.ring}
            camadas={camadas}
            onFocus={handleFocus}
            positionsRef={positionsRef}
          />
        ))}

        <DeepSpaceProbes onFocus={handleFocus} positionsRef={positionsRef} />

        {camadas.asteroides && (
          <AsteroidsLayer
            asteroides={asteroides}
            onFocus={handleFocus}
            positionsRef={positionsRef}
          />
        )}
      </Canvas>
    </div>
  );
}