"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardUI, { CamadasState, EarthLayersInspector } from '../components/DashboardUI';
import { TargetInfo } from '../components/Scene3D';
import { fetchSpaceWeather, SpaceWeatherData } from '../utils/spaceWeatherApi';

const Scene3D = dynamic(() => import('../components/Scene3D'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center text-cyan-400 font-mono text-sm z-50">
      <span className="animate-pulse">A carregar astrometria e varredura orbital...</span>
    </div>
  ),
});

const DADOS_HISTORICOS_FALLBACK = [
  { 
    id: "3i-atlas", 
    name: "3I/ATLAS", 
    diameter_m: 650, 
    velocity_kmh: 198000, 
    is_potentially_hazardous_asteroid: false, 
    isInterstellar: true,
    dist_lunar: 42.6, 
    details: "Objeto com trajetória hiperbólica aberto (excentricidade e > 1.0) vindo do espaço interestelar detetado pela rede ATLAS. Trajetória não periódica em rota de escape solar." 
  },
  { 
    id: "2099942", 
    name: "99942 Apophis", 
    diameter_m: 370, 
    velocity_kmh: 109800, 
    is_potentially_hazardous_asteroid: true, 
    dist_lunar: 0.1, 
    details: "Asteroide potencialmente perigoso (PHA) em monitoramento rasante prioritário." 
  },
  { 
    id: "2101955", 
    name: "101955 Bennu", 
    diameter_m: 490, 
    velocity_kmh: 99720, 
    is_potentially_hazardous_asteroid: true, 
    dist_lunar: 5.4, 
    details: "Asteroide carbonáceo rico em compostos voláteis amostrado pela NASA." 
  },
  { 
    id: "2000433", 
    name: "433 Eros", 
    diameter_m: 16840, 
    velocity_kmh: 87840, 
    is_potentially_hazardous_asteroid: false, 
    dist_lunar: 70.2, 
    details: "Primeiro asteroide NEO registado e orbitado pela sonda NEAR Shoemaker." 
  },
  { 
    id: "2162173", 
    name: "162173 Ryugu", 
    diameter_m: 900, 
    velocity_kmh: 96480, 
    is_potentially_hazardous_asteroid: true, 
    dist_lunar: 8.9, 
    details: "Asteroide primitivo do tipo C explorado com sucesso pela JAXA." 
  }
];

export default function Home() {
  const [camadas, setCamadas] = useState<CamadasState>({
    orbitas: false,
    miraAlvo: false,
    ventoSolar: true,
    planetas: true,
    satelites: true,
    radaresTerra: false,
    galaxias: true,
    constelacoes: false,
    asteroides: true,
  });

  const [asteroides, setAsteroides] = useState<any[]>(DADOS_HISTORICOS_FALLBACK);
  const [usandoHistorico, setUsandoHistorico] = useState<boolean>(true);
  const [targetInfo, setTargetInfo] = useState<TargetInfo | null>(null);
  const [timeScale, setTimeScale] = useState<number>(1);
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherData | undefined>(undefined);
  const [explodedMode, setExplodedMode] = useState<boolean>(false);
  const [isCardOpen, setIsCardOpen] = useState<boolean>(true);

  const [earthLayers, setEarthLayers] = useState<EarthLayersInspector>({
    bowShock: false,
    vanAllen: false,
    satellitesLeo: true,
    radarsGround: false,
    schumann: false,
  });

  useEffect(() => {
    fetchSpaceWeather().then(setSpaceWeather);

    const carregarAsteroidesNasa = async () => {
      try {
        const hoje = new Date().toISOString().split('T')[0];
        const res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${hoje}&end_date=${hoje}&api_key=DEMO_KEY`);
        if (!res.ok) throw new Error("Falha no feed da NASA");
        const json = await res.json();
        
        const dadosDoDia = json.near_earth_objects[hoje] || [];
        if (dadosDoDia.length > 0) {
          const formatados = dadosDoDia.map((neo: any) => {
            const closeData = neo.close_approach_data?.[0];
            const distLunar = closeData ? parseFloat(parseFloat(closeData.miss_distance.lunar).toFixed(2)) : 10.0;
            const diametroMedio = Math.round(
              ((neo.estimated_diameter?.meters?.estimated_diameter_min || 100) + 
               (neo.estimated_diameter?.meters?.estimated_diameter_max || 200)) / 2
            );
            const vel = closeData ? Math.round(parseFloat(closeData.relative_velocity.kilometers_per_hour)) : 80000;

            return {
              id: neo.id,
              name: neo.name.replace(/[()]/g, ''),
              diameter_m: diametroMedio,
              velocity_kmh: vel,
              is_potentially_hazardous_asteroid: Boolean(neo.is_potentially_hazardous_asteroid),
              isInterstellar: false,
              dist_lunar: distLunar,
              details: `NEO monitorado hoje pela NASA. Aproximação calculada a ${distLunar} LD (${Math.round(distLunar * 384400).toLocaleString('pt-PT')} km da Terra).`
            };
          });

          setAsteroides([...DADOS_HISTORICOS_FALLBACK, ...formatados]);
          setUsandoHistorico(false);
        }
      } catch {
        setAsteroides(DADOS_HISTORICOS_FALLBACK);
        setUsandoHistorico(true);
      }
    };

    carregarAsteroidesNasa();
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-transparent select-none">
      <DashboardUI
        asteroides={asteroides}
        contagem={asteroides.length}
        usandoHistorico={usandoHistorico}
        camadas={camadas}
        setCamadas={setCamadas}
        targetInfo={targetInfo}
        onResetCamera={() => {
          setTargetInfo(null);
          setExplodedMode(false);
        }}
        onSelectTarget={(info) => {
          setTargetInfo(info);
          setIsCardOpen(true);
          if (!info || info.name !== 'Terra') {
            setExplodedMode(false);
          }
        }}
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        spaceWeather={spaceWeather}
        explodedMode={explodedMode}
        setExplodedMode={setExplodedMode}
        earthLayers={earthLayers}
        setEarthLayers={setEarthLayers}
        cardTelemetriaAberto={isCardOpen}
        setCardTelemetriaAberto={setIsCardOpen}
      />

      <Scene3D
        asteroides={asteroides}
        camadas={camadas}
        timeScale={timeScale}
        selectedTarget={targetInfo}
        onSelectTarget={setTargetInfo}
        spaceWeather={spaceWeather}
        explodedMode={explodedMode}
        earthLayers={earthLayers}
        isCardOpen={isCardOpen && Boolean(targetInfo)}
      />
    </main>
  );
}