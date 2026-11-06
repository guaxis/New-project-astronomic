"use client";

import { useState } from 'react';

export interface CamadasState {
  orbitas: boolean;
  alinhamento: boolean;
  asteroides: boolean;
  planetas: boolean;
}

export default function DashboardUI({ 
  asteroides, 
  contagem, 
  usandoHistorico,
  camadas,
  setCamadas,
}: { 
  asteroides: any[]; 
  contagem: number | string; 
  usandoHistorico: boolean;
  camadas: CamadasState;
  setCamadas: React.Dispatch<React.SetStateAction<CamadasState>>;
}) {
  const [menuCamadasAberto, setMenuCamadasAberto] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<any>(asteroides[0] || null);

  // Formatação determinística à prova de erros de hidratação entre SSR e Browser
  const formatarNumero = (num: number | undefined | null) => {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      
      {/* Top Header */}
      <header className="flex justify-between items-start">
        <div className="pointer-events-auto bg-slate-950/75 backdrop-blur-md border border-cyan-500/30 px-5 py-3 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-xl font-black tracking-wider text-cyan-400 uppercase">Astrometrics HUD</h1>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wide mt-0.5 font-mono">
            {usandoHistorico ? "Modo Arquivo Histórico / Contingência" : "Telemetria do Sistema Solar em Tempo Real"}
          </p>
        </div>

        {/* Controlos de Topo */}
        <div className="flex gap-2.5 pointer-events-auto relative">
          <div className="relative">
            <button
              onClick={() => setMenuCamadasAberto(!menuCamadasAberto)}
              className="bg-slate-950/80 hover:bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 px-4 py-2.5 rounded-xl backdrop-blur-md text-xs font-mono tracking-wider uppercase transition-all shadow-lg flex items-center gap-2"
            >
              <span>Filtros & Camadas</span>
              <span className="text-[10px]">{menuCamadasAberto ? "▲" : "▼"}</span>
            </button>

            {menuCamadasAberto && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl p-3 shadow-2xl text-xs font-mono space-y-2">
                <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1 uppercase tracking-widest">
                  Camadas de Visualização
                </div>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-cyan-200">Linhas de Órbita</span>
                  <input
                    type="checkbox"
                    checked={camadas.orbitas}
                    onChange={(e) => setCamadas(prev => ({ ...prev, orbitas: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-cyan-200">Vetores de Alinhamento</span>
                  <input
                    type="checkbox"
                    checked={camadas.alinhamento}
                    onChange={(e) => setCamadas(prev => ({ ...prev, alinhamento: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-cyan-200">Cinturão de Asteroides</span>
                  <input
                    type="checkbox"
                    checked={camadas.asteroides}
                    onChange={(e) => setCamadas(prev => ({ ...prev, asteroides: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded">
                  <span className="text-cyan-200">Planetas do Sistema</span>
                  <input
                    type="checkbox"
                    checked={camadas.planetas}
                    onChange={(e) => setCamadas(prev => ({ ...prev, planetas: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          <button
            onClick={() => setPainelAberto(!painelAberto)}
            className="bg-slate-950/80 hover:bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 px-4 py-2.5 rounded-xl backdrop-blur-md text-xs font-mono tracking-wider uppercase transition-all shadow-lg"
          >
            {painelAberto ? "Ocultar Telemetria" : "Radar de Asteroides"}
          </button>
        </div>
      </header>

      {/* Painel Retrátil */}
      <div className={`pointer-events-auto transition-all duration-500 ease-in-out ${
        painelAberto ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0 pointer-events-none"
      } w-full max-w-sm max-h-[60vh] flex flex-col bg-slate-950/85 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-2xl overflow-hidden`}>
        
        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
          <span className="text-xs font-mono uppercase text-slate-400">Objetos Catalogados</span>
          <span className="text-sm font-mono font-bold text-cyan-400">{contagem}</span>
        </div>

        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {asteroides.map((ast: any) => (
            <div
              key={ast.id}
              onClick={() => setSelecionado(ast)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                selecionado?.id === ast.id
                  ? "bg-cyan-500/15 border-cyan-400"
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xs text-slate-100 truncate">{ast.name}</h3>
                <span className="text-[10px]">{ast.is_potentially_hazardous_asteroid ? "⚠️ Risco" : "✅ Seguro"}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                {/* Formatado com regex determinística, eliminando o Hydration Error */}
                <span suppressHydrationWarning>{formatarNumero(ast.velocity_kmh)} km/h</span>
                <span>{ast.diameter_m} m</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="pointer-events-auto text-[11px] text-slate-500 font-mono">
        Clique em qualquer planeta para inspecionar • Scroll para zoom livre
      </footer>
    </div>
  );
}