"use client";

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import DashboardUI, { CamadasState, EarthLayersInspector } from './DashboardUI';
import type { TargetInfo } from './Scene3D';
import type { SpaceWeatherData } from '../utils/spaceWeatherApi';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

export default function ClientDashboard({
  asteroidesIniciais,
  usandoHistorico,
  spaceWeather,
}: {
  asteroidesIniciais: any[];
  usandoHistorico: boolean;
  spaceWeather?: SpaceWeatherData;
}) {
  const [asteroides] = useState<any[]>(asteroidesIniciais);
  const [selectedTarget, setSelectedTarget] = useState<TargetInfo | null>(null);
  const [timeScale, setTimeScale] = useState<number>(1);
  const [explodedMode, setExplodedMode] = useState<boolean>(false);

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

  const [earthLayers, setEarthLayers] = useState<EarthLayersInspector>({
    bowShock: true,
    vanAllen: true,
    satellitesLeo: true,
    radarsGround: false,
    schumann: false,
  });

  const handleResetCamera = useCallback(() => {
    setSelectedTarget(null);
    setExplodedMode(false);
  }, []);

  return (
    <>
      <Scene3D
        asteroides={asteroides}
        camadas={camadas}
        timeScale={timeScale}
        selectedTarget={selectedTarget}
        onSelectTarget={setSelectedTarget}
        spaceWeather={spaceWeather}
        explodedMode={explodedMode}
        earthLayers={earthLayers}
        isCardOpen={Boolean(selectedTarget)}
      />
      <DashboardUI
        asteroides={asteroides}
        contagem={asteroides.length}
        usandoHistorico={usandoHistorico}
        camadas={camadas}
        setCamadas={setCamadas}
        targetInfo={selectedTarget}
        onResetCamera={handleResetCamera}
        onSelectTarget={setSelectedTarget}
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        spaceWeather={spaceWeather}
        explodedMode={explodedMode}
        setExplodedMode={setExplodedMode}
        earthLayers={earthLayers}
        setEarthLayers={setEarthLayers}
      />
    </>
  );
}
