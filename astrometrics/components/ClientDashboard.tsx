"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardUI from './DashboardUI';
import type { CamadasConfig } from './Scene3D';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

export default function ClientDashboard({
  asteroidesIniciais,
  usandoHistorico,
}: {
  asteroidesIniciais: any[];
  usandoHistorico: boolean;
}) {
  const [asteroides] = useState<any[]>(asteroidesIniciais);
  const [camadas, setCamadas] = useState<CamadasConfig>({
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

  return (
    <>
      <Scene3D asteroides={asteroides} camadas={camadas} />
      <DashboardUI
        asteroides={asteroides}
        contagem={asteroides.length}
        usandoHistorico={usandoHistorico}
        camadas={camadas as any}
        setCamadas={setCamadas as any}
      />
    </>
  );
}
