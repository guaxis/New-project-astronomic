"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardUI, { CamadasState } from '../components/DashboardUI';

const Scene3D = dynamic(() => import('../components/Scene3D'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center text-cyan-400 font-mono text-sm z-50">
      <span className="animate-pulse">A inicializar telemetria 3D...</span>
    </div>
  ),
});

const DADOS_HISTORICOS_ASTEROIDES = [
  {
    id: "2000433",
    name: "433 Eros",
    diameter_m: 16840,
    velocity_kmh: 87840,
    is_potentially_hazardous_asteroid: false,
    dist_lunar: 70.2,
  },
  {
    id: "2099942",
    name: "99942 Apophis",
    diameter_m: 370,
    velocity_kmh: 109800,
    is_potentially_hazardous_asteroid: true,
    dist_lunar: 0.1,
  },
  {
    id: "2101955",
    name: "101955 Bennu",
    diameter_m: 490,
    velocity_kmh: 99720,
    is_potentially_hazardous_asteroid: true,
    dist_lunar: 5.4,
  },
  {
    id: "2162173",
    name: "162173 Ryugu",
    diameter_m: 900,
    velocity_kmh: 96480,
    is_potentially_hazardous_asteroid: true,
    dist_lunar: 8.9,
  }
];

export default function Home() {
  const [camadas, setCamadas] = useState<CamadasState>({
    orbitas: true,
    alinhamento: true,
    asteroides: true,
    planetas: true,
  });

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#020617] select-none">
      <DashboardUI
        asteroides={DADOS_HISTORICOS_ASTEROIDES}
        contagem={DADOS_HISTORICOS_ASTEROIDES.length}
        usandoHistorico={true}
        camadas={camadas}
        setCamadas={setCamadas}
      />

      <Scene3D
        asteroides={DADOS_HISTORICOS_ASTEROIDES}
        camadas={camadas}
      />
    </main>
  );
}