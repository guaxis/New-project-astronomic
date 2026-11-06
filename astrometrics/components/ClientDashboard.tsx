"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardUI, { CamadasState } from './DashboardUI';

// Carrega o Scene3D exclusivamente no navegador sem causar erros de SSR
const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

export default function ClientDashboard({ 
  asteroidesIniciais, 
  usandoHistorico 
}: { 
  asteroidesIniciais: any[]; 
  usandoHistorico: boolean; 
}) {
  const [asteroides] = useState<any[]>(asteroidesIniciais);
  const [camadas, setCamadas] = useState<CamadasState>({
    magnetosfera: true,
    atmosfera: true,
    planetas: true,
  });

  return (
    <>
      <Scene3D asteroides={asteroides} camadas={camadas} />
      <DashboardUI 
        asteroides={asteroides} 
        contagem={asteroides.length} 
        usandoHistorico={usandoHistorico}
        camadas={camadas}
        setCamadas={setCamadas}
      />
    </>
  );
}