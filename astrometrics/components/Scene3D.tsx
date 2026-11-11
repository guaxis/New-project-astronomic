"use client";

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Line, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SpaceWeatherData } from '../utils/spaceWeatherApi';
import { EarthLayersInspector } from './DashboardUI';

type TargetPositions = Record<string, THREE.Vector3>;

export interface TargetInfo {
  name: string;
  type: 'Sol' | 'Planeta' | 'Asteroide' | 'Sonda' | 'Lua' | 'Satélite' | 'Galáxia' | 'Radar Terrestre';
  radius: number;
  speedKmh?: number;
  diameter?: string;
  distanceKm?: string;
  orbitalPeriod?: string;
  gravity?: string;
  details?: string;
  imageUrl?: string;
  isHazardous?: boolean;
}

export interface CamadasConfig {
  orbitas: boolean;
  miraAlvo: boolean;
  ventoSolar: boolean;
  planetas: boolean;
  satelites: boolean;
  radaresTerra: boolean;
  galaxias: boolean;
  constelacoes: boolean;
  asteroides: boolean;
}

const PLANET_TEXTURES = {
  mercury: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/mercurymap.jpg',
  venus: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/venusmap.jpg',
  earthDay: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  earthNormal: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
  earthLights: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
  moon: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
  mars: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/marsmap1k.jpg',
  jupiter: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/jupitermap.jpg',
  saturn: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnmap.jpg',
  saturnRing: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/saturnringcolor.jpg',
  uranus: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/uranusmap.jpg',
  neptune: 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/neptunemap.jpg',
  sun: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lava/lavatile.jpg',
};

// 1. SOL
function RealisticSun({
  onFocus,
  positionsRef,
}: {
  onFocus: (info: TargetInfo) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const sunTexture = useTexture(PLANET_TEXTURES.sun);
  sunTexture.wrapS = sunTexture.wrapT = THREE.RepeatWrapping;

  useFrame(({ clock }, delta) => {
    positionsRef.current['Sol'] = new THREE.Vector3(0, 0, 0);

    const t = clock.getElapsedTime();
    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += delta * 0.008;
      sunMeshRef.current.rotation.x += delta * 0.002;
    }
    if (coronaRef.current) {
      const s = 1.05 + Math.sin(t * 1.5) * 0.015;
      coronaRef.current.scale.set(s, s, s);
    }
  });

  const sunData: TargetInfo = {
    name: 'Sol',
    type: 'Sol',
    radius: 2.2,
    diameter: '1.392.700 km',
    distanceKm: 'Centro Gravitacional',
    orbitalPeriod: '230 milhões de anos (Galáxia)',
    gravity: '274 m/s²',
    details: 'Estrela hospedeira tipo G2V concentrando 99,86% da massa do sistema.',
    imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001435/GSFC_20171208_Archive_e001435~orig.jpg'
  };

  return (
    <group position={[0, 0, 0]}>
      <mesh
        ref={sunMeshRef}
        onClick={(e) => { e.stopPropagation(); onFocus(sunData); }}
        className="cursor-pointer"
      >
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial map={sunTexture} color={[1.8, 1.35, 0.8]} toneMapped={false} />
      </mesh>

      <mesh ref={coronaRef} raycast={() => null}>
        <sphereGeometry args={[2.32, 32, 32]} />
        <meshBasicMaterial color={[1.2, 0.6, 0.15]} transparent opacity={0.22} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      <pointLight 
        intensity={34.0} 
        distance={450} 
        decay={0.1} 
        color="#fffaf0" 
      />
    </group>
  );
}

// 2. VENTO SOLAR DINÂMICO
function SolarElectromagneticWave({ 
  kpIndex = 2, 
  windSpeed = 400,
  timeScale = 1
}: { 
  kpIndex?: number; 
  windSpeed?: number;
  timeScale?: number;
}) {
  const waveCount = 5;
  const meshesRef = useRef<(THREE.Mesh | null)[]>([]);

  const baseSpeed = 0.04 * (windSpeed / 400) * (timeScale === 0 ? 0 : Math.max(0.35, timeScale * 0.7));
  const isStorm = kpIndex >= 5;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() * baseSpeed;

    meshesRef.current.forEach((mesh, index) => {
      if (!mesh) return;

      const offset = index / waveCount;
      const progress = (elapsed + offset) % 1;

      const currentRadius = 2.4 + progress * 78.0;
      mesh.scale.set(currentRadius, currentRadius, 1);

      const fadeOut = Math.pow(1 - progress, 2.2);
      const mat = mesh.material as THREE.MeshBasicMaterial;

      const peakOpacity = isStorm ? 0.45 : 0.22;
      mat.opacity = Math.max(0, fadeOut * peakOpacity);
    });
  });

  return (
    <group rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
      {Array.from({ length: waveCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshesRef.current[i] = el; }}
          raycast={() => null}
        >
          <ringGeometry args={[0.985, 1.0, 128]} />
          <meshBasicMaterial
            color={isStorm ? "#ef4444" : "#f59e0b"}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// 3. MODELO DE PARTÍCULAS GALÁCTICAS REALISTAS
function RealisticGalaxyParticleModel({
  galaxyType,
  colorCore,
  colorArms,
  radius,
  onClick,
}: {
  galaxyType: 'spiral-large' | 'spiral-flocculent' | 'irregular-cloud';
  colorCore: string;
  colorArms: string;
  radius: number;
  onClick: (e: any) => void;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 4800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cCore = new THREE.Color(colorCore);
    const cArms = new THREE.Color(colorArms);

    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      let distFromCenter = 0;

      if (galaxyType === 'spiral-large') {
        const r = Math.pow(Math.random(), 2.0) * radius;
        const arms = 2;
        const armOffset = (i % arms) * ((Math.PI * 2) / arms);
        const theta = (r / radius) * 4.5 + armOffset;
        const spread = (Math.random() - 0.5) * (1.0 + (r / radius) * 4.0);

        x = (Math.cos(theta) * r + spread) * 1.35;
        y = (Math.random() - 0.5) * (0.6 + (1 - r / radius) * 2.0);
        z = Math.sin(theta) * r + spread;
        distFromCenter = r / radius;
      } else if (galaxyType === 'spiral-flocculent') {
        const r = Math.pow(Math.random(), 1.6) * radius;
        const arms = 4;
        const armOffset = (i % arms) * ((Math.PI * 2) / arms);
        const theta = (r / radius) * 3.2 + armOffset + (Math.random() - 0.5) * 0.8;
        const spread = (Math.random() - 0.5) * (1.5 + (r / radius) * 3.0);

        x = Math.cos(theta) * r + spread;
        y = (Math.random() - 0.5) * (0.8 + (1 - r / radius) * 1.5);
        z = Math.sin(theta) * r + spread;
        distFromCenter = r / radius;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 1.2) * radius;
        const ellipseFactor = 1.35;

        x = Math.cos(angle) * dist * ellipseFactor + (Math.random() - 0.5) * 1.8;
        y = (Math.random() - 0.5) * (1.2 + (1 - dist / radius) * 2.0);
        z = Math.sin(angle) * dist + (Math.random() - 0.5) * 1.8;
        distFromCenter = dist / radius;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const lerpFactor = Math.min(1.0, Math.max(0.0, distFromCenter));
      const c = cCore.clone().lerp(cArms, lerpFactor);

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, [galaxyType, colorCore, colorArms, radius]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * (galaxyType === 'irregular-cloud' ? 0.005 : 0.01);
    }
  });

  return (
    <group onClick={onClick} className="cursor-pointer">
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={galaxyType === 'irregular-cloud' ? 0.25 : 0.2}
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <mesh raycast={() => null}>
        <sphereGeometry args={[radius * 0.1, 16, 16]} />
        <meshBasicMaterial color={colorCore} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// 4. GALÁXIAS PRÓXIMAS
function NearbyGalaxies({
  onFocus,
  positionsRef,
}: {
  onFocus: (info: TargetInfo) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const galaxias = useMemo(() => [
    {
      name: "Galáxia de Andrômeda (M31)",
      pos: new THREE.Vector3(300, 95, -250),
      galaxyType: 'spiral-large' as const,
      colorCore: "#fef08a",
      colorArms: "#38bdf8",
      size: 38,
      distanceKm: "2,537M anos-luz",
      diameter: "220.000 anos-luz",
      details: "Maior galáxia espiral do Grupo Local com mais de 1 trilhão de estrelas.",
      imageUrl: "https://images-assets.nasa.gov/image/PIA04921/PIA04921~orig.jpg"
    },
    {
      name: "Galáxia do Triângulo (M33)",
      pos: new THREE.Vector3(-270, 75, -280),
      galaxyType: 'spiral-flocculent' as const,
      colorCore: "#fae8ff",
      colorArms: "#c084fc",
      size: 28,
      distanceKm: "2,73M anos-luz",
      diameter: "60.000 anos-luz",
      details: "Galáxia espiral floculenta com múltiplos braços fragmentados.",
      imageUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001465/GSFC_20171208_Archive_e001465~orig.jpg"
    },
    {
      name: "Grande Nuvem de Magalhães (LMC)",
      pos: new THREE.Vector3(-210, -110, 230),
      galaxyType: 'irregular-cloud' as const,
      colorCore: "#fed7aa",
      colorArms: "#fb923c",
      size: 26,
      distanceKm: "163.000 anos-luz",
      diameter: "14.000 anos-luz",
      details: "Galáxia anã satélite irregular visível dos céus austrais do Atacama.",
      imageUrl: "https://images-assets.nasa.gov/image/PIA09178/PIA09178~orig.jpg"
    }
  ], []);

  useFrame(() => {
    galaxias.forEach(g => {
      positionsRef.current[g.name] = g.pos;
    });
  });

  return (
    <>
      {galaxias.map((g) => (
        <group key={g.name} position={g.pos}>
          <RealisticGalaxyParticleModel
            galaxyType={g.galaxyType}
            colorCore={g.colorCore}
            colorArms={g.colorArms}
            radius={g.size}
            onClick={(e) => {
              e.stopPropagation();
              onFocus({
                name: g.name,
                type: 'Galáxia',
                radius: g.size * 0.5,
                distanceKm: g.distanceKm,
                diameter: g.diameter,
                details: g.details,
                imageUrl: g.imageUrl,
              });
            }}
          />
        </group>
      ))}
    </>
  );
}

// 5. ANEL DE ÓRBITA CIRCULAR (PLANETAS)
function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
      <ringGeometry args={[radius - 0.03, radius + 0.03, 128]} />
      <meshBasicMaterial color="#38bdf8" opacity={0.12} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// 6. ASTEROIDES RASTREADOS
function AsteroidsTrackingSystem({
  asteroides,
  timeScale,
  onFocus,
  positionsRef,
  selectedTargetName,
  showOrbits,
}: {
  asteroides: any[];
  timeScale: number;
  onFocus: (info: TargetInfo) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
  selectedTargetName?: string;
  showOrbits?: boolean;
}) {
  const beltRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 3500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const minR = 26.5;
    const maxR = 33.2;
    const baseColorA = new THREE.Color("#d97706");
    const baseColorB = new THREE.Color("#78716c");
    const baseColorC = new THREE.Color("#cbd5e1");

    for (let i = 0; i < count; i++) {
      const r = minR + Math.random() * (maxR - minR);
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.9;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      const seed = Math.random();
      const c = seed > 0.6 ? baseColorA : seed > 0.25 ? baseColorB : baseColorC;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (beltRef.current) beltRef.current.rotation.y += delta * 0.0025;
  });

  return (
    <group>
      <points ref={beltRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.035} vertexColors transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>

      {asteroides.map((ast, i) => (
        <SingleTrackedAsteroid
          key={ast.id || i}
          ast={ast}
          index={i}
          total={asteroides.length}
          timeScale={timeScale}
          onFocus={onFocus}
          positionsRef={positionsRef}
          isSelected={selectedTargetName === ast.name}
          showOrbits={showOrbits}
        />
      ))}
    </group>
  );
}

// 7. MOTOR VISUAL DE COMETA ULTRA-REALISTA (PARTÍCULAS DE SUBLIMAÇÃO + CAUDA DUPLA COM GRADIENTE FADE-OUT)
function RealisticCometEffect({ position }: { position: THREE.Vector3 }) {
  const tailGroupRef = useRef<THREE.Group>(null);

  // Gera uma nuvem de 280 partículas de gás e poeira com decaimento exponencial suave
  const [dustPos, dustColors] = useMemo(() => {
    const count = 280;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorCore = new THREE.Color("#a7f3d0"); // verde-branco brilhante na cabeça
    const colorIon = new THREE.Color("#2dd4bf");  // ciano-esmeralda na cauda de íons
    const colorDust = new THREE.Color("#e2e8f0"); // poeira estelar pálida

    for (let i = 0; i < count; i++) {
      // 25% na cabeleira (coma), 75% espalhadas na cauda anti-solar (+Z no espaço local)
      const isComa = i < count * 0.25;

      if (isComa) {
        const r = Math.pow(Math.random(), 1.8) * 0.16;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);

        col[i * 3] = colorCore.r;
        col[i * 3 + 1] = colorCore.g;
        col[i * 3 + 2] = colorCore.b;
      } else {
        // Distância ao longo da cauda (de 0 até 2.4 unidades)
        const dist = Math.pow(Math.random(), 1.4) * 2.4;
        // Largura aumenta gradualmente à medida que se afasta do núcleo
        const spread = 0.02 + dist * 0.11;
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * spread;

        // Leve curvatura na cauda de poeira
        const isDust = i % 3 === 0;
        const curveX = isDust ? Math.pow(dist, 1.8) * 0.08 : 0;

        pos[i * 3] = Math.cos(angle) * rad + curveX;
        pos[i * 3 + 1] = Math.sin(angle) * rad;
        pos[i * 3 + 2] = dist; // Aponta ao longo do eixo +Z

        // Gradiente suave: desaparece completamente nas pontas (fade to black)
        const fade = Math.pow(1 - dist / 2.4, 2.2);
        const baseC = isDust ? colorDust : colorIon;
        col[i * 3] = baseC.r * fade;
        col[i * 3 + 1] = baseC.g * fade;
        col[i * 3 + 2] = baseC.b * fade;
      }
    }

    return [pos, col];
  }, []);

  // Geometria de brilho de gás contínuo com gradiente de opacidade nos vértices (sem bordas duras!)
  const smoothTailGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.14, 0.015, 2.0, 24, 16, true);
    // Desloca o cilindro para que a base fina fique no (0,0,0) e aponte para +Z
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, 1.0);

    const posAttr = geo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);
    const cStart = new THREE.Color("#2dd4bf");

    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getZ(i); // de 0.0 a 2.0
      const ratio = Math.max(0, Math.min(1, z / 2.0));
      // Intensidade cai ao quadrado para sumir suavemente no vácuo sem corte seco
      const intensity = Math.pow(1 - ratio, 2.8) * 0.35;
      colors[i * 3] = cStart.r * intensity;
      colors[i * 3 + 1] = cStart.g * intensity;
      colors[i * 3 + 2] = cStart.b * intensity;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (!tailGroupRef.current) return;
    // Aponta o eixo +Z exatamente na direção anti-solar (afastando-se do Sol em 0,0,0)
    const antiSunDir = position.clone().normalize();
    const targetPoint = position.clone().add(antiSunDir);
    tailGroupRef.current.lookAt(targetPoint);
  });

  return (
    <group ref={tailGroupRef} raycast={() => null}>
      {/* 1. Halo luminoso suave da cabeleira */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshBasicMaterial
          color="#5eead4"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Véu de plasma com gradiente suave que desaparece no espaço */}
      <mesh geometry={smoothTailGeometry} raycast={() => null}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Partículas cintilantes de sublimação e poeira cósmica */}
      <points raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={dustPos.length / 3} array={dustPos} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={dustColors.length / 3} array={dustColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// 8. ASTEROIDE E COMETA INTERESTELAR
function SingleTrackedAsteroid({
  ast,
  index,
  total,
  timeScale,
  onFocus,
  positionsRef,
  isSelected = false,
  showOrbits = false,
}: {
  ast: any;
  index: number;
  total: number;
  timeScale: number;
  onFocus: (info: TargetInfo) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
  isSelected?: boolean;
  showOrbits?: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [currentCoord, setCurrentCoord] = useState<THREE.Vector3>(new THREE.Vector3());
  const isHazardous = ast.is_potentially_hazardous_asteroid;
  const isInterstellar = ast.isInterstellar || ast.name.includes("3I") || ast.name.includes("ATLAS");

  const rockGeometry = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(isInterstellar ? 0.065 : 0.12, 1);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const noise = (Math.sin(v.x * 6.0) * Math.cos(v.y * 6.0) * Math.sin(v.z * 6.0)) * 0.09;
      v.multiplyScalar(1.0 + noise);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [isInterstellar]);

  const orbitParams = useMemo(() => {
    if (isInterstellar) {
      const points: THREE.Vector3[] = [];
      const segments = 120;
      for (let s = -segments; s <= segments; s++) {
        const u = (s / segments) * 3.2;
        const x = Math.sinh(u) * 22.0;
        const y = u * 4.8 + 2.0;
        const z = (Math.cosh(u) - 1.0) * 16.0 + 8.5;
        points.push(new THREE.Vector3(x, y, z));
      }
      return { isHyperbolic: true, speed: 0.012, points };
    }

    const a = 18.0 + (index % 6) * 2.8; 
    const e = 0.12 + (index % 4) * 0.04;
    const b = a * Math.sqrt(1 - e * e);
    const inclination = ((index % 5) - 2) * 0.08; 
    const speed = 0.01 + ((ast.velocity_kmh || 80000) / 160000) * 0.012;
    const phaseOffset = index * ((Math.PI * 2) / Math.max(total, 1));

    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * a;
      const y = Math.sin(theta) * b * Math.sin(inclination);
      const z = Math.sin(theta) * b * Math.cos(inclination);
      points.push(new THREE.Vector3(x, y, z));
    }

    return { isHyperbolic: false, a, b, inclination, speed, phaseOffset, points };
  }, [index, total, ast, isInterstellar]);

  useFrame(({ clock }) => {
    let x = 0, y = 0, z = 0;

    if (orbitParams.isHyperbolic) {
      const earthYearAngle = (clock.getElapsedTime() * timeScale) * 0.012;
      const cycleProgress = ((earthYearAngle + Math.PI) % (Math.PI * 2)) / (Math.PI * 2);
      const u = (cycleProgress - 0.5) * 6.4;

      x = Math.sinh(u) * 22.0;
      y = u * 4.8 + 2.0;
      z = (Math.cosh(u) - 1.0) * 16.0 + 8.5;
    } else {
      const t = (clock.getElapsedTime() * timeScale) * orbitParams.speed + (orbitParams.phaseOffset || 0);
      x = Math.cos(t) * (orbitParams.a || 18);
      y = Math.sin(t) * (orbitParams.b || 15) * Math.sin(orbitParams.inclination || 0);
      z = Math.sin(t) * (orbitParams.b || 15) * Math.cos(orbitParams.inclination || 0);
    }

    const pos = new THREE.Vector3(x, y, z);
    positionsRef.current[ast.name] = pos;
    setCurrentCoord(pos);

    if (meshRef.current) {
      meshRef.current.position.copy(pos);
    }
  });

  const astData: TargetInfo = {
    name: ast.name,
    type: 'Asteroide',
    radius: isInterstellar ? 0.5 : 0.5,
    diameter: `${ast.diameter_m} m`,
    speedKmh: ast.velocity_kmh,
    distanceKm: `${ast.dist_lunar} Distâncias Lunares`,
    isHazardous: isHazardous,
    details: ast.details || `Objeto em monitoramento. ${isInterstellar ? 'Trajetória hiperbólica de escape solar.' : 'Órbita nominal heliocêntrica.'}`,
    imageUrl: ast.imageUrl || (isInterstellar ? 'https://images-assets.nasa.gov/image/PIA23865/PIA23865~orig.jpg' : 'https://images-assets.nasa.gov/image/PIA24174/PIA24174~orig.jpg')
  };

  return (
    <group>
      {(isSelected || (showOrbits && (isHazardous || isInterstellar))) && (
        <Line
          points={orbitParams.points}
          color={isInterstellar ? "#2dd4bf" : isHazardous ? "#ef4444" : "#38bdf8"}
          opacity={isSelected ? 0.65 : 0.25}
          transparent
          lineWidth={isSelected ? 1.4 : 0.8}
          raycast={() => null}
        />
      )}

      {/* GRUPO DO ASTRO */}
      <group
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onFocus(astData);
        }}
        className="cursor-pointer"
      >
        {/* Núcleo Rochoso Gelado */}
        <mesh geometry={rockGeometry}>
          <meshStandardMaterial
            color={isInterstellar ? "#ccfbf1" : isHazardous ? "#b91c1c" : "#94a3b8"}
            emissive={isInterstellar ? "#2dd4bf" : "#000000"}
            emissiveIntensity={isInterstellar ? 0.6 : 0}
            roughness={0.85}
            metalness={0.1}
            flatShading={true}
          />
        </mesh>

        {/* EFEITO REALISTA DE COMETA COM GRADIENTE SUAVE E PARTÍCULAS */}
        {isInterstellar && <RealisticCometEffect position={currentCoord} />}

        {/* HITBOX INVISÍVEL PARA CLIQUE */}
        <mesh>
          <sphereGeometry args={[isInterstellar ? 1.3 : 0.8, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Retículo de mira */}
      {isSelected && (
        <mesh position={currentCoord} raycast={() => null}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial
            color={isInterstellar ? "#2dd4bf" : isHazardous ? "#ef4444" : "#38bdf8"}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// 9. MAGNETOSFERA E CINTURÕES DE VAN ALLEN
function EarthMagnetosphere({ 
  kpIndex = 2, 
  explodedMode = false,
  showBowShock = false,
  showVanAllen = false,
}: { 
  kpIndex?: number; 
  explodedMode?: boolean; 
  showBowShock?: boolean; 
  showVanAllen?: boolean; 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bowShockRef = useRef<THREE.Group>(null);
  const isStorm = kpIndex >= 5;

  const scaleTarget = explodedMode ? 1.6 : 1.0;
  const currentScale = useRef(1.0);

  const magneticFieldLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const radiuses = [1.8, 2.3, 2.9];

    radiuses.forEach((r) => {
      [-1, 1].forEach((side) => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 32; i++) {
          const theta = (i / 32) * Math.PI;
          const rad = r * Math.sin(theta);
          const y = 1.55 * Math.cos(theta);
          const x = rad * side;
          pts.push(new THREE.Vector3(x, y, 0));
        }
        lines.push(pts);
      });
    });
    return lines;
  }, []);

  const [vanAllenPos, vanAllenColors] = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorInner = new THREE.Color("#f97316");
    const colorOuter = new THREE.Color("#38bdf8");

    for (let i = 0; i < count; i++) {
      const isInner = i < count * 0.45;
      const baseR = isInner ? 1.9 : 2.7;
      const spreadR = (Math.random() - 0.5) * (isInner ? 0.35 : 0.6);
      const r = baseR + spreadR;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * (isInner ? 0.3 : 0.5);

      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;

      const c = isInner ? colorInner : colorOuter;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, scaleTarget, 0.05);
    groupRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);

    if (bowShockRef.current) {
      bowShockRef.current.lookAt(0, 0, 0);
    }
  });

  if (!showBowShock && !showVanAllen) return null;

  return (
    <group ref={groupRef} raycast={() => null}>
      {showBowShock && (
        <>
          <group ref={bowShockRef} raycast={() => null}>
            <mesh position={[0, 0, 2.1]} raycast={() => null}>
              <ringGeometry args={[2.0, 2.15, 64, 1, -Math.PI / 2.2, Math.PI * 0.9]} />
              <meshBasicMaterial
                color={isStorm ? "#ef4444" : "#38bdf8"}
                transparent
                opacity={isStorm ? 0.5 : 0.28}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>

          <mesh position={[0, 1.52, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
            <ringGeometry args={[0.18, 0.42, 32]} />
            <meshBasicMaterial color={isStorm ? "#f43f5e" : "#10b981"} transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, -1.52, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
            <ringGeometry args={[0.18, 0.42, 32]} />
            <meshBasicMaterial color={isStorm ? "#f43f5e" : "#10b981"} transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
        </>
      )}

      {showVanAllen && (
        <>
          <points raycast={() => null}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={vanAllenPos.length / 3} array={vanAllenPos} itemSize={3} />
              <bufferAttribute attach="attributes-color" count={vanAllenColors.length / 3} array={vanAllenColors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.045} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
          </points>

          {magneticFieldLines.map((pts, idx) => (
            <Line key={idx} points={pts} color={isStorm ? "#ef4444" : "#7dd3fc"} opacity={0.35} transparent lineWidth={0.9} raycast={() => null} />
          ))}
        </>
      )}
    </group>
  );
}

// 9.1 RESSONÂNCIA DE SCHUMANN (7.83 Hz)
function SchumannResonanceSphere({ 
  show = false, 
  timeScale = 1 
}: { 
  show?: boolean; 
  timeScale?: number; 
}) {
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!shellRef.current || !show) return;
    const t = clock.getElapsedTime() * (timeScale === 0 ? 0 : Math.max(1, timeScale));
    const pulse = 1.0 + Math.sin(t * 7.83) * 0.018;
    shellRef.current.scale.set(pulse, pulse, pulse);
    const mat = shellRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.15 + Math.sin(t * 7.83) * 0.08;
  });

  if (!show) return null;

  return (
    <mesh ref={shellRef} raycast={() => null}>
      <sphereGeometry args={[1.56, 48, 48]} />
      <meshBasicMaterial
        color="#2dd4bf"
        transparent
        opacity={0.18}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        wireframe={true}
      />
    </mesh>
  );
}

// 10. BASES E RADARES TERRESTRES
function EarthRadarStationsLayer({
  positionsRef,
  earthWorldPos,
  explodedMode = false,
  showRadars = false,
}: {
  positionsRef: React.MutableRefObject<TargetPositions>;
  earthWorldPos: THREE.Vector3;
  explodedMode?: boolean;
  showRadars?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleTarget = explodedMode ? 1.25 : 1.0;
  const currentScale = useRef(1.0);

  const radares = useMemo(() => [
    { name: "Complexo de Comunicações Goldstone (DSN / NASA)", relPos: new THREE.Vector3(1.15, 0.8, 0.9) },
    { name: "Radar Space Fence (Ilha Kwajalein / US Space Force)", relPos: new THREE.Vector3(-1.35, 0.2, 0.85) },
    { name: "Radar Meteorológico Global GOES (NOAA / Flórida)", relPos: new THREE.Vector3(0.65, 0.9, 1.25) },
  ], []);

  useFrame(() => {
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, scaleTarget, 0.05);
    if (groupRef.current) groupRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);

    radares.forEach(r => {
      positionsRef.current[r.name] = new THREE.Vector3(
        earthWorldPos.x + r.relPos.x * currentScale.current,
        earthWorldPos.y + r.relPos.y * currentScale.current,
        earthWorldPos.z + r.relPos.z * currentScale.current
      );
    });
  });

  if (!showRadars) return null;

  return (
    <group ref={groupRef}>
      {radares.map((rad) => (
        <group key={rad.name} position={rad.relPos}>
          <mesh raycast={() => null}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
          <pointLight color="#10b981" intensity={0.9} distance={0.8} />
        </group>
      ))}
    </group>
  );
}

// 11. RETÍCULO DO ALVO
function SelectionReticle({ 
  targetKey, 
  targetRadius,
  positionsRef 
}: { 
  targetKey: string; 
  targetRadius: number;
  positionsRef: React.MutableRefObject<TargetPositions>; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ camera, clock }) => {
    if (!meshRef.current || targetKey === 'VisaoGeral') return;
    const pos = positionsRef.current[targetKey];
    if (pos) {
      meshRef.current.position.copy(pos);
      meshRef.current.lookAt(camera.position);
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.4;
    }
  });

  if (targetKey === 'VisaoGeral') return null;

  const ringRadius = Math.max(targetRadius * 1.35, 1.4);

  return (
    <mesh ref={meshRef} raycast={() => null}>
      <ringGeometry args={[ringRadius, ringRadius + 0.05, 32]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// 12. CÂMERA DE VOO DIRETA COM ROTAÇÃO 360° TOTALMENTE LIVRE NO RATO
function CameraFlightController({
  targetKey,
  targetRadius,
  positionsRef,
  explodedMode = false,
  isCardOpen = true,
}: {
  targetKey: string;
  targetRadius: number;
  positionsRef: React.MutableRefObject<TargetPositions>;
  explodedMode?: boolean;
  isCardOpen?: boolean;
}) {
  const controlsRef = useRef<any>(null);
  const activeKeyRef = useRef(targetKey);
  const isTransitioningRef = useRef(true);
  const isUserInteractingRef = useRef(false);
  const { camera, size } = useThree();

  const desiredDistance = useMemo(() => {
    if (targetKey === 'VisaoGeral') return 125.0;
    if (targetKey === 'Sol') return 16.0;
    if (targetKey === 'Terra') return explodedMode ? 9.0 : 5.4;
    if (targetKey.includes('Galáxia') || targetKey.includes('Nuvem')) return Math.max(targetRadius * 3.4, 90.0);
    if (targetRadius < 0.6) return Math.max(targetRadius * 3.0, 1.8);
    return Math.max(targetRadius * 3.5, 4.5);
  }, [targetKey, targetRadius, explodedMode]);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (targetKey === 'VisaoGeral' || !isCardOpen) {
      cam.clearViewOffset();
      cam.updateProjectionMatrix();
    } else {
      const isWidescreen = size.width > 768;
      const cardWidth = isWidescreen ? Math.min(380, size.width * 0.35) : 0;
      const offsetX = cardWidth / 2;
      cam.setViewOffset(size.width, size.height, offsetX, 0, size.width, size.height);
      cam.updateProjectionMatrix();
    }
  }, [targetKey, isCardOpen, size.width, size.height, camera]);

  useEffect(() => {
    activeKeyRef.current = targetKey;
    isTransitioningRef.current = true;
    isUserInteractingRef.current = false;
  }, [targetKey, explodedMode, isCardOpen]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    const targetPos = targetKey === 'VisaoGeral'
      ? new THREE.Vector3(0, 0, 0)
      : (positionsRef.current[targetKey] || new THREE.Vector3(0, 0, 0));

    if (isTransitioningRef.current && !isUserInteractingRef.current) {
      let idealCamPos: THREE.Vector3;

      if (targetKey === 'VisaoGeral') {
        idealCamPos = new THREE.Vector3(0, 85, 120);
      } else {
        let offsetDir: THREE.Vector3;
        if (targetPos.lengthSq() < 0.001) {
          offsetDir = new THREE.Vector3(0, 0.4, 1).normalize();
        } else {
          const sunDir = targetPos.clone().normalize().negate();
          const up = new THREE.Vector3(0, 1, 0);
          const tangent = new THREE.Vector3().crossVectors(up, targetPos.clone().normalize()).normalize();

          offsetDir = new THREE.Vector3()
            .addScaledVector(sunDir, 0.45)
            .addScaledVector(tangent, 0.65)
            .addScaledVector(up, 0.35)
            .normalize();
        }
        idealCamPos = targetPos.clone().add(offsetDir.multiplyScalar(desiredDistance));
      }

      const factor = 1 - Math.exp(-3.5 * delta);
      camera.position.lerp(idealCamPos, factor);
      controls.target.lerp(targetPos, factor);

      if (
        camera.position.distanceTo(idealCamPos) < 0.25 &&
        controls.target.distanceTo(targetPos) < 0.1
      ) {
        isTransitioningRef.current = false;
      }
    } else {
      if (targetKey !== 'VisaoGeral') {
        const deltaPos = targetPos.clone().sub(controls.target);
        controls.target.copy(targetPos);
        camera.position.add(deltaPos);
      }
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      enablePan={false}
      minDistance={1.2}
      maxDistance={850}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      onStart={() => {
        isUserInteractingRef.current = true;
        isTransitioningRef.current = false;
      }}
    />
  );
}

// 13. SISTEMA TERRA
function EarthSystem({
  camadas,
  timeScale,
  onFocus,
  positionsRef,
  kpIndex = 2,
  explodedMode = false,
  earthLayers,
}: {
  camadas: CamadasConfig;
  timeScale: number;
  onFocus: (info: TargetInfo) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
  kpIndex?: number;
  explodedMode?: boolean;
  earthLayers?: EarthLayersInspector;
}) {
  const earthOrbitRadius = 16.0;
  const systemRef = useRef<THREE.Group>(null);
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const [earthPos, setEarthPos] = useState(new THREE.Vector3(16, 0, 0));

  const [dayMap, normalMap, lightsMap, moonMap] = useTexture([
    PLANET_TEXTURES.earthDay,
    PLANET_TEXTURES.earthNormal,
    PLANET_TEXTURES.earthLights,
    PLANET_TEXTURES.moon,
  ]);

  const satelites = useMemo(() => [
    {
      name: "GOES-16 (Satélite Meteorológico)",
      alt: 3.2,
      speed: 0.05,
      incl: 0.05,
      radius: 0.45,
      diameter: "6 metros",
      speedKmh: 11050,
      distanceKm: "35.786 km (Geoestacionário)",
      orbitalPeriod: "24 horas",
      details: "Satélite geoestacionário da NOAA para previsão de clima severo e monitoramento solar.",
      imageUrl: "https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg"
    },
    {
      name: "Telescópio Espacial Hubble",
      alt: 2.2,
      speed: 0.12,
      incl: -0.35,
      radius: 0.45,
      diameter: "13,2 metros",
      speedKmh: 27300,
      distanceKm: "540 km da Terra",
      orbitalPeriod: "95 min",
      details: "Observatório em órbita baixa responsável por imagens profundas do cosmos.",
      imageUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001465/GSFC_20171208_Archive_e001465~orig.jpg"
    },
    {
      name: "ISS (Estação Espacial Internacional)",
      alt: 1.95,
      speed: 0.16,
      incl: 0.42,
      radius: 0.45,
      diameter: "109 metros",
      speedKmh: 27600,
      distanceKm: "420 km da Terra",
      orbitalPeriod: "92 min",
      details: "Estação orbital habitada permanentemente em microgravidade na órbita baixa.",
      imageUrl: "https://images-assets.nasa.gov/image/iss065e084297/iss065e084297~orig.jpg"
    }
  ], []);

  useFrame(({ clock }, delta) => {
    const t = (clock.getElapsedTime() * timeScale) * 0.012 + 1.2;
    const x = Math.cos(t) * earthOrbitRadius;
    const z = Math.sin(t) * earthOrbitRadius;

    const currentPos = new THREE.Vector3(x, 0, z);
    positionsRef.current['Terra'] = currentPos;
    setEarthPos(currentPos);

    if (systemRef.current) {
      systemRef.current.position.set(x, 0, z);
    }
    
    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y += delta * 0.015 * timeScale;
    }

    if (moonMeshRef.current) {
      const moonDist = explodedMode ? 5.8 : 3.8;
      const mt = (clock.getElapsedTime() * timeScale) * 0.08;
      const mx = Math.cos(mt) * moonDist;
      const my = Math.sin(mt) * (moonDist * 0.08);
      const mz = Math.sin(mt) * moonDist;
      moonMeshRef.current.position.set(mx, my, mz);
      moonMeshRef.current.rotation.y += delta * 0.015 * timeScale;
      
      positionsRef.current['Lua'] = new THREE.Vector3(x + mx, my, z + mz);
    }

    satelites.forEach((sat, i) => {
      const st = (clock.getElapsedTime() * timeScale) * sat.speed + i * 1.8;
      const effectiveAlt = sat.alt * (explodedMode ? 1.4 : 1.0);
      const sx = Math.cos(st) * effectiveAlt;
      const sy = Math.sin(st) * Math.sin(sat.incl) * effectiveAlt;
      const sz = Math.sin(st) * Math.cos(sat.incl) * effectiveAlt;

      positionsRef.current[sat.name] = new THREE.Vector3(x + sx, sy, z + sz);
    });
  });

  return (
    <group>
      {camadas.orbitas && <OrbitRing radius={earthOrbitRadius} />}

      <group ref={systemRef}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            onFocus({
              name: 'Terra',
              type: 'Planeta',
              radius: 1.5,
              diameter: '12.742 km',
              distanceKm: '149,6M km (1 UA)',
              orbitalPeriod: '365,25 dias',
              gravity: '9,8 m/s²',
              details: 'Oásis biológico com oceanos de água líquida e vida em abundância.',
              imageUrl: 'https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~orig.jpg'
            });
          }}
          className="cursor-pointer"
        >
          <mesh ref={earthMeshRef} rotation={[0, -Math.PI / 2, 0]}>
            <sphereGeometry args={[1.5, 64, 64]} />
            <meshStandardMaterial
              map={dayMap}
              normalMap={normalMap}
              roughness={0.65}
              metalness={0.05}
              emissiveMap={lightsMap}
              emissive="#ffbe53"
              emissiveIntensity={0.55}
            />
          </mesh>

          <mesh raycast={() => null}>
            <sphereGeometry args={[1.52, 64, 64]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>

        <EarthMagnetosphere 
          kpIndex={kpIndex} 
          explodedMode={explodedMode}
          showBowShock={earthLayers?.bowShock ?? false}
          showVanAllen={earthLayers?.vanAllen ?? false}
        />

        <SchumannResonanceSphere 
          show={earthLayers?.schumann ?? false} 
          timeScale={timeScale} 
        />

        {earthLayers?.satellitesLeo && satelites.map((sat, i) => (
          <SingleEarthSatelliteMesh
            key={sat.name}
            sat={sat}
            index={i}
            timeScale={timeScale}
            onFocus={onFocus}
            explodedMode={explodedMode}
          />
        ))}

        <EarthRadarStationsLayer
          positionsRef={positionsRef}
          earthWorldPos={earthPos}
          explodedMode={explodedMode}
          showRadars={earthLayers?.radarsGround ?? false}
        />

        <mesh
          ref={moonMeshRef}
          onClick={(e) => {
            e.stopPropagation();
            onFocus({
              name: 'Lua',
              type: 'Lua',
              radius: 0.36,
              diameter: '3.474 km',
              distanceKm: '384.400 km da Terra',
              orbitalPeriod: '27,3 dias',
              gravity: '1,62 m/s²',
              details: 'Satélite natural terrestre em acoplamento de maré.',
              imageUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~orig.jpg'
            });
          }}
          className="cursor-pointer"
        >
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial 
            map={moonMap} 
            color="#cbd5e1" 
            roughness={0.92} 
            metalness={0.0}
          />
        </mesh>
      </group>
    </group>
  );
}

function SingleEarthSatelliteMesh({
  sat,
  index,
  timeScale,
  onFocus,
  explodedMode = false,
}: {
  sat: any;
  index: number;
  timeScale: number;
  onFocus: (info: TargetInfo) => void;
  explodedMode?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const effectiveAlt = sat.alt * (explodedMode ? 1.4 : 1.0);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * timeScale) * sat.speed + index * 1.8;
    const sx = Math.cos(t) * effectiveAlt;
    const sy = Math.sin(t) * Math.sin(sat.incl) * effectiveAlt;
    const sz = Math.sin(t) * Math.cos(sat.incl) * effectiveAlt;

    if (meshRef.current) {
      meshRef.current.position.set(sx, sy, sz);
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onFocus(sat);
      }}
      className="cursor-pointer"
    >
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>
  );
}

// 14. PLANETAS
function SolarPlanet({
  planet,
  camadas,
  timeScale,
  onFocus,
  positionsRef,
}: {
  planet: any;
  camadas: CamadasConfig;
  timeScale: number;
  onFocus: (info: TargetInfo) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(planet.textureUrl);
  const ringTexture = useTexture(planet.ringTextureUrl || PLANET_TEXTURES.saturnRing);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * timeScale) * planet.speed + planet.initialAngle;
    const x = Math.cos(t) * planet.dist;
    const z = Math.sin(t) * planet.dist;

    positionsRef.current[planet.name] = new THREE.Vector3(x, 0, z);

    if (meshRef.current) {
      meshRef.current.position.set(x, 0, z);
      meshRef.current.rotation.y += 0.006;
    }
  });

  return (
    <group>
      {camadas.orbitas && <OrbitRing radius={planet.dist} />}

      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onFocus({
            name: planet.name,
            type: 'Planeta',
            radius: planet.radius,
            diameter: planet.diameter,
            distanceKm: planet.distanceKm,
            orbitalPeriod: planet.orbitalPeriod,
            gravity: planet.gravity,
            details: planet.details,
            imageUrl: planet.previewUrl,
          });
        }}
        className="cursor-pointer"
      >
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={planet.roughness ?? 0.7} 
          metalness={0.02} 
        />

        {planet.ring && (
          <mesh rotation={[Math.PI / 2.35, 0.2, 0]} raycast={() => null}>
            <ringGeometry args={[planet.radius * 1.35, planet.radius * 2.45, 64]} />
            <meshStandardMaterial 
              map={ringTexture}
              side={THREE.DoubleSide} 
              transparent 
              opacity={0.85} 
              roughness={0.6} 
            />
          </mesh>
        )}
      </mesh>
    </group>
  );
}

// 15. VOYAGER 1
function DeepSpaceProbes({
  onFocus,
  positionsRef,
}: {
  onFocus: (info: TargetInfo) => void;
  positionsRef: React.MutableRefObject<TargetPositions>;
}) {
  const voyagerPos = useMemo(() => new THREE.Vector3(55.0, 12.0, -32.0), []);

  useFrame(() => {
    positionsRef.current['Voyager 1'] = voyagerPos;
  });

  const voyagerData: TargetInfo = {
    name: 'Voyager 1',
    type: 'Sonda',
    radius: 0.8,
    diameter: 'Antena HGA: 3,7 m',
    distanceKm: '24 Bilhões km (160+ UA)',
    speedKmh: 61200,
    details: 'O artefato humano mais distante da Terra, cruzando o meio interestelar além da heliosfera.',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA01482/PIA01482~orig.jpg'
  };

  return (
    <group position={[voyagerPos.x, voyagerPos.y, voyagerPos.z]}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onFocus(voyagerData);
        }}
        className="cursor-pointer"
      >
        <mesh rotation={[0.6, -0.4, 0]}>
          <cylinderGeometry args={[0.16, 0.01, 0.05, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <pointLight color="#38bdf8" intensity={1.5} distance={1.5} />
      </group>
    </group>
  );
}

export default function Scene3D({
  asteroides = [],
  camadas = { 
    orbitas: false, 
    miraAlvo: false, 
    ventoSolar: true, 
    planetas: true, 
    satelites: true, 
    radaresTerra: false, 
    galaxias: true, 
    constelacoes: false, 
    asteroides: true 
  },
  timeScale = 1,
  selectedTarget = null,
  onSelectTarget,
  spaceWeather,
  explodedMode = false,
  earthLayers,
  isCardOpen = true,
}: {
  asteroides?: any[];
  camadas?: CamadasConfig;
  timeScale?: number;
  selectedTarget?: TargetInfo | null;
  onSelectTarget?: (info: TargetInfo | null) => void;
  spaceWeather?: SpaceWeatherData;
  explodedMode?: boolean;
  earthLayers?: EarthLayersInspector;
  isCardOpen?: boolean;
}) {
  const currentKey = selectedTarget ? selectedTarget.name : "VisaoGeral";
  const currentRadius = selectedTarget ? selectedTarget.radius : 20.0;

  const positionsRef = useRef<TargetPositions>({
    'VisaoGeral': new THREE.Vector3(0, 0, 0),
  });

  const handleFocus = (info: TargetInfo | null) => {
    if (onSelectTarget) onSelectTarget(info);
  };

  const planetasCatalogo = useMemo(() => [
    { 
      name: "Mercúrio", 
      radius: 0.45, 
      dist: 7.0, 
      speed: 0.04, 
      initialAngle: 0.5, 
      diameter: '4.879 km', 
      distanceKm: '57,9M km', 
      orbitalPeriod: '88 dias', 
      gravity: '3,7 m/s²', 
      details: 'Superfície densamente craterada fotografada pela sonda MESSENGER.',
      textureUrl: PLANET_TEXTURES.mercury,
      previewUrl: 'https://images-assets.nasa.gov/image/PIA15190/PIA15190~orig.jpg',
      roughness: 0.95
    },
    { 
      name: "Vénus", 
      radius: 0.8, 
      dist: 11.2, 
      speed: 0.024, 
      initialAngle: 2.1, 
      diameter: '12.104 km', 
      distanceKm: '108,2M km', 
      orbitalPeriod: '225 dias', 
      gravity: '8,87 m/s²', 
      details: 'Manto perpétuo de nuvens de ácido sulfúrico em tons de ocre.',
      textureUrl: PLANET_TEXTURES.venus,
      previewUrl: 'https://images-assets.nasa.gov/image/PIA00271/PIA00271~orig.jpg',
      roughness: 0.4
    },
    { 
      name: "Marte", 
      radius: 0.68, 
      dist: 22.0, 
      speed: 0.009, 
      initialAngle: 4.2, 
      diameter: '6.779 km', 
      distanceKm: '227,9M km', 
      orbitalPeriod: '687 dias', 
      gravity: '3,72 m/s²', 
      details: 'Planeta Vermelho com calotas de gelo e desfiladeiros mapeados pela Viking.',
      textureUrl: PLANET_TEXTURES.mars,
      previewUrl: 'https://images-assets.nasa.gov/image/PIA04304/PIA04304~orig.jpg',
      roughness: 0.88
    },
    { 
      name: "Júpiter", 
      radius: 2.3, 
      dist: 36.0, 
      speed: 0.004, 
      initialAngle: 1.0, 
      diameter: '139.820 km', 
      distanceKm: '778,5M km', 
      orbitalPeriod: '11,8 anos', 
      gravity: '24,79 m/s²', 
      details: 'Gigante gasoso com faixas zonais e a Grande Mancha Vermelha.',
      textureUrl: PLANET_TEXTURES.jupiter,
      previewUrl: 'https://images-assets.nasa.gov/image/PIA02873/PIA02873~orig.jpg',
      roughness: 0.5
    },
    { 
      name: "Saturno", 
      radius: 1.85, 
      dist: 48.0, 
      speed: 0.0028, 
      initialAngle: 3.5, 
      ring: true, 
      diameter: '116.460 km', 
      distanceKm: '1,43 Bilhão km', 
      orbitalPeriod: '29,4 anos', 
      gravity: '10,44 m/s²', 
      details: 'Gigante gasoso dourado envolto no mais brilhante sistema de anéis.',
      textureUrl: PLANET_TEXTURES.saturn,
      ringTextureUrl: PLANET_TEXTURES.saturnRing,
      previewUrl: 'https://images-assets.nasa.gov/image/PIA01482/PIA01482~orig.jpg',
      roughness: 0.6
    },
    { 
      name: "Úrano", 
      radius: 1.25, 
      dist: 60.0, 
      speed: 0.0018, 
      initialAngle: 5.0, 
      diameter: '50.724 km', 
      distanceKm: '2,87 Bilhões km', 
      orbitalPeriod: '84 anos', 
      gravity: '8,69 m/s²', 
      details: 'Gigante de gelo com atmosfera de metano gerando cor ciano pálida.',
      textureUrl: PLANET_TEXTURES.uranus,
      previewUrl: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg',
      roughness: 0.3
    },
    { 
      name: "Neptuno", 
      radius: 1.25, 
      dist: 72.0, 
      speed: 0.0012, 
      initialAngle: 0.8, 
      diameter: '49.244 km', 
      distanceKm: '4,5 Bilhões km', 
      orbitalPeriod: '164,8 anos', 
      gravity: '11,15 m/s²', 
      details: 'Mundo azul ultramarino profundo com tempestades supersónicas.',
      textureUrl: PLANET_TEXTURES.neptune,
      previewUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg',
      roughness: 0.25
    },
  ], []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-transparent">
      <Canvas 
        camera={{ position: [0, 85, 120], fov: 45, near: 0.05, far: 2000 }} 
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Stars radius={300} depth={100} count={6500} factor={4} saturation={0.5} fade speed={1.0} />

        <ambientLight intensity={0.25} />
        <hemisphereLight groundColor="#0f172a" color="#94a3b8" intensity={0.4} />

        <CameraFlightController
          targetKey={currentKey}
          targetRadius={currentRadius}
          positionsRef={positionsRef}
          explodedMode={explodedMode}
          isCardOpen={isCardOpen}
        />

        {camadas.miraAlvo && (
          <SelectionReticle 
            targetKey={currentKey} 
            targetRadius={currentRadius}
            positionsRef={positionsRef} 
          />
        )}

        <RealisticSun onFocus={handleFocus} positionsRef={positionsRef} />

        {camadas.ventoSolar && (
          <SolarElectromagneticWave 
            kpIndex={spaceWeather?.kpIndex} 
            windSpeed={spaceWeather?.solarWindSpeedKmS} 
            timeScale={timeScale}
          />
        )}

        {camadas.galaxias && (
          <NearbyGalaxies onFocus={handleFocus} positionsRef={positionsRef} />
        )}

        {camadas.asteroides && (
          <AsteroidsTrackingSystem 
            asteroides={asteroides}
            timeScale={timeScale}
            onFocus={handleFocus}
            positionsRef={positionsRef}
            selectedTargetName={selectedTarget?.name}
            showOrbits={camadas.orbitas}
          />
        )}

        <EarthSystem
          camadas={camadas}
          timeScale={timeScale}
          onFocus={handleFocus}
          positionsRef={positionsRef}
          kpIndex={spaceWeather?.kpIndex}
          explodedMode={explodedMode}
          earthLayers={earthLayers}
        />

        {camadas.planetas && planetasCatalogo.map((p) => (
          <SolarPlanet
            key={p.name}
            planet={p}
            camadas={camadas}
            timeScale={timeScale}
            onFocus={handleFocus}
            positionsRef={positionsRef}
          />
        ))}

        <DeepSpaceProbes onFocus={handleFocus} positionsRef={positionsRef} />

        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.3} intensity={0.7} radius={0.65} />
          <ToneMapping />
          <Vignette eskil={false} offset={0.12} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}