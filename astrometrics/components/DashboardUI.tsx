"use client";

import { useState, useMemo } from 'react';
import { TargetInfo } from './Scene3D';
import { SpaceWeatherData } from '../utils/spaceWeatherApi';

export interface CamadasState {
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

export interface EarthLayersInspector {
  bowShock: boolean;
  vanAllen: boolean;
  satellitesLeo: boolean;
  radarsGround: boolean;
  schumann: boolean;
}

export interface ItemCosmico extends TargetInfo {
  distanciaMetricaKm: number;
  categoria: 'Galáxia' | 'Sonda' | 'Planeta' | 'Sol' | 'Lua' | 'Satélite' | 'Asteroide';
}

export default function DashboardUI({ 
  asteroides = [],
  camadas,
  setCamadas,
  targetInfo,
  onResetCamera,
  onSelectTarget,
  timeScale,
  setTimeScale,
  spaceWeather,
  explodedMode,
  setExplodedMode,
  earthLayers,
  setEarthLayers,
}: { 
  asteroides: any[]; 
  contagem: number | string; 
  usandoHistorico: boolean;
  camadas: CamadasState;
  setCamadas: React.Dispatch<React.SetStateAction<CamadasState>>;
  targetInfo: TargetInfo | null;
  onResetCamera: () => void;
  onSelectTarget: (info: TargetInfo | null) => void;
  timeScale: number;
  setTimeScale: (scale: number) => void;
  spaceWeather?: SpaceWeatherData;
  explodedMode: boolean;
  setExplodedMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  earthLayers: EarthLayersInspector;
  setEarthLayers: React.Dispatch<React.SetStateAction<EarthLayersInspector>>;
  cardTelemetriaAberto?: boolean;
  setCardTelemetriaAberto?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [menuFiltrosAberto, setMenuFiltrosAberto] = useState(false);
  const [painelDadosAberto, setPainelDadosAberto] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'galaxias' | 'planetas' | 'asteroides' | 'satelites'>('todos');
  const [secaoTerra, setSecaoTerra] = useState<'geral' | 'estrutura' | 'noaa'>('geral');

  const formatarNumero = (num: number | undefined | null) => {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const catalogoOrdenado: ItemCosmico[] = useMemo(() => {
    const itensBase: ItemCosmico[] = [
      { 
        name: "Galáxia do Triângulo (M33)", 
        type: 'Galáxia', 
        categoria: 'Galáxia',
        radius: 28, 
        distanciaMetricaKm: 2.73e6 * 9.46e12,
        distanceKm: "2,73M anos-luz", 
        diameter: "60.000 anos-luz", 
        details: "Galáxia espiral floculenta com múltiplos braços fragmentados e intensa atividade estelar.", 
        imageUrl: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001465/GSFC_20171208_Archive_e001465~orig.jpg" 
      },
      { 
        name: "Galáxia de Andrômeda (M31)", 
        type: 'Galáxia', 
        categoria: 'Galáxia',
        radius: 38, 
        distanciaMetricaKm: 2.537e6 * 9.46e12,
        distanceKm: "2,537M anos-luz", 
        diameter: "220.000 anos-luz", 
        details: "Maior galáxia espiral do Grupo Local com mais de 1 trilhão de estrelas.", 
        imageUrl: "https://images-assets.nasa.gov/image/PIA04921/PIA04921~orig.jpg" 
      },
      { 
        name: "Grande Nuvem de Magalhães (LMC)", 
        type: 'Galáxia', 
        categoria: 'Galáxia',
        radius: 26, 
        distanciaMetricaKm: 1.63e5 * 9.46e12,
        distanceKm: "163.000 anos-luz", 
        diameter: "14.000 anos-luz", 
        details: "Galáxia anã satélite irregular visível dos céus austrais do Atacama.", 
        imageUrl: "https://images-assets.nasa.gov/image/PIA09178/PIA09178~orig.jpg" 
      },
      { 
        name: "Voyager 1", 
        type: 'Sonda', 
        categoria: 'Sonda',
        radius: 0.8, 
        distanciaMetricaKm: 24e9,
        distanceKm: "24 Bilhões km (160+ UA)", 
        diameter: "3,7 m", 
        speedKmh: 61200,
        details: "O artefato humano mais distante da Terra, cruzando o meio interestelar.", 
        imageUrl: "https://images-assets.nasa.gov/image/PIA01482/PIA01482~orig.jpg" 
      },
      { 
        name: "Neptuno", 
        type: 'Planeta', 
        categoria: 'Planeta',
        radius: 1.25, 
        distanciaMetricaKm: 4.5e9,
        diameter: '49.244 km', 
        distanceKm: '4,5 Bilhões km', 
        orbitalPeriod: '164 anos', 
        gravity: '11,15 m/s²',
        details: 'Mundo azul ultramarino açoitado pelos ventos supersónicos mais velozes do sistema solar.', 
        imageUrl: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg' 
      },
      { 
        name: "Úrano", 
        type: 'Planeta', 
        categoria: 'Planeta',
        radius: 1.25, 
        distanciaMetricaKm: 2.87e9,
        diameter: '50.724 km', 
        distanceKm: '2,87 Bilhões km', 
        orbitalPeriod: '84 anos', 
        gravity: '8,69 m/s²',
        details: 'Gigante de gelo com atmosfera de metano e inclinação axial extrema de 98°.', 
        imageUrl: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg' 
      },
      { 
        name: "Saturno", 
        type: 'Planeta', 
        categoria: 'Planeta',
        radius: 1.85, 
        distanciaMetricaKm: 1.43e9,
        diameter: '116.460 km', 
        distanceKm: '1,43 Bilhão km', 
        orbitalPeriod: '29,4 anos', 
        gravity: '10,44 m/s²',
        details: 'Mundo dourado famoso pelo seu brilhante sistema de anéis de gelo e rocha.', 
        imageUrl: 'https://images-assets.nasa.gov/image/PIA01482/PIA01482~orig.jpg' 
      },
      { 
        name: "Júpiter", 
        type: 'Planeta', 
        categoria: 'Planeta',
        radius: 2.3, 
        distanciaMetricaKm: 7.785e8,
        diameter: '139.820 km', 
        distanceKm: '778,5M km', 
        orbitalPeriod: '11,8 anos', 
        gravity: '24,79 m/s²',
        details: 'O maior planeta do sistema solar, com faixas de amônia e a Grande Mancha Vermelha.', 
        imageUrl: 'https://images-assets.nasa.gov/image/PIA02873/PIA02873~orig.jpg' 
      },
      { 
        name: "Marte", 
        type: 'Planeta', 
        categoria: 'Planeta',
        radius: 0.68, 
        distanciaMetricaKm: 2.279e8,
        diameter: '6.779 km', 
        distanceKm: '227,9M km', 
        orbitalPeriod: '687 dias', 
        gravity: '3,72 m/s²',
        details: 'Planeta Vermelho rico em óxido de ferro, vales profundos e calotas polares.', 
        imageUrl: 'https://images-assets.nasa.gov/image/PIA04304/PIA04304~orig.jpg' 
      },
      { 
        name: "Terra", 
        type: 'Planeta', 
        categoria: 'Planeta',
        radius: 1.5, 
        distanciaMetricaKm: 1.496e8,
        diameter: '12.742 km', 
        distanceKm: '149,6M km (1 UA)', 
        orbitalPeriod: '365,25 dias', 
        gravity: '9,8 m/s²',
        details: 'Oásis biológico com água líquida em abundância, atmosfera protetora e vida.', 
        imageUrl: 'https://images-assets.nasa.gov/image/as17-148-22727/as17-148-22727~orig.jpg' 
      },
      { 
        name: "Vénus", 
        type: 'Planeta', 
        categoria: 'Planeta',
        radius: 0.8, 
        distanciaMetricaKm: 1.082e8,
        diameter: '12.104 km', 
        distanceKm: '108,2M km', 
        orbitalPeriod: '225 dias', 
        gravity: '8,87 m/s²',
        details: 'Manto perpétuo de nuvens de ácido sulfúrico com efeito estufa descontrolado.', 
        imageUrl: 'https://images-assets.nasa.gov/image/PIA00271/PIA00271~orig.jpg' 
      },
      { 
        name: "Mercúrio", 
        type: 'Planeta', 
        categoria: 'Planeta',
        radius: 0.45, 
        distanciaMetricaKm: 5.79e7,
        diameter: '4.879 km', 
        distanceKm: '57,9M km', 
        orbitalPeriod: '88 dias', 
        gravity: '3,7 m/s²',
        details: 'Planeta rochoso mais interno e denso, coberto de crateras de impacto.', 
        imageUrl: 'https://images-assets.nasa.gov/image/PIA15190/PIA15190~orig.jpg' 
      },
      { 
        name: "Sol", 
        type: 'Sol', 
        categoria: 'Sol',
        radius: 2.2, 
        distanciaMetricaKm: 0,
        diameter: '1.392.700 km', 
        distanceKm: 'Centro Gravitacional', 
        gravity: '274 m/s²',
        details: 'Estrela hospedeira tipo G2V que ancora e ilumina todos os mundos.', 
        imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001435/GSFC_20171208_Archive_e001435~orig.jpg' 
      },
      { 
        name: "Lua", 
        type: 'Lua', 
        categoria: 'Lua',
        radius: 0.36, 
        distanciaMetricaKm: 384400,
        diameter: '3.474 km', 
        distanceKm: '384.400 km da Terra', 
        orbitalPeriod: '27,3 dias', 
        gravity: '1,62 m/s²',
        details: 'Satélite natural terrestre em acoplamento de maré síncrono.', 
        imageUrl: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~orig.jpg' 
      },
      { 
        name: "GOES-16 (Satélite Meteorológico)", 
        type: 'Satélite', 
        categoria: 'Satélite',
        radius: 0.45, 
        distanciaMetricaKm: 35786,
        diameter: "6 m", 
        speedKmh: 11050, 
        distanceKm: "35.786 km (Geoestacionário)", 
        orbitalPeriod: "24 horas", 
        details: "Satélite da NOAA para monitoramento de clima severo e atividade solar em tempo real.",
        imageUrl: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg'
      },
      { 
        name: "Telescópio Espacial Hubble", 
        type: 'Satélite', 
        categoria: 'Satélite',
        radius: 0.45, 
        distanciaMetricaKm: 540,
        diameter: "13,2 m", 
        speedKmh: 27300, 
        distanceKm: "540 km da Terra", 
        orbitalPeriod: "95 min", 
        details: "Observatório óptico em órbita baixa capturando imagens profundas do cosmos desde 1990.",
        imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001465/GSFC_20171208_Archive_e001465~orig.jpg'
      },
      { 
        name: "ISS (Estação Espacial Internacional)", 
        type: 'Satélite', 
        categoria: 'Satélite',
        radius: 0.45, 
        distanciaMetricaKm: 420,
        diameter: "109 m", 
        speedKmh: 27600, 
        distanceKm: "420 km da Terra", 
        orbitalPeriod: "92 min", 
        details: "Estação orbital habitada permanentemente em microgravidade.",
        imageUrl: 'https://images-assets.nasa.gov/image/iss065e084297/iss065e084297~orig.jpg'
      }
    ];

    const asteroidesMapeados: ItemCosmico[] = asteroides.map(ast => {
      // Fotografia real de cometa com coma ciano/verde para o ATLAS
      let urlImagem = 'https://images-assets.nasa.gov/image/PIA24174/PIA24174~orig.jpg';
      if (ast.name.includes("Eros")) {
        urlImagem = 'https://images-assets.nasa.gov/image/PIA02471/PIA02471~orig.jpg';
      } else if (ast.name.includes("ATLAS") || ast.name.includes("3I")) {
        urlImagem = 'https://images-assets.nasa.gov/image/PIA23865/PIA23865~orig.jpg'; // Imagem telescópica real Hubble/NASA de cometa interestelar com cauda
      }

      return {
        name: ast.name,
        type: 'Asteroide',
        categoria: 'Asteroide',
        radius: 0.45,
        distanciaMetricaKm: (ast.dist_lunar || 10) * 384400,
        diameter: `${ast.diameter_m} m`,
        speedKmh: ast.velocity_kmh,
        distanceKm: `${ast.dist_lunar} Distâncias Lunares`,
        isHazardous: ast.is_potentially_hazardous_asteroid,
        details: ast.details || `Asteroide em monitoramento heliocêntrico. ${ast.is_potentially_hazardous_asteroid ? '⚠️ Classificado como Potencialmente Perigoso (PHA).' : '✅ Objeto com trajetória nominal.'}`,
        imageUrl: ast.imageUrl || urlImagem
      };
    });

    return [...itensBase, ...asteroidesMapeados].sort((a, b) => b.distanciaMetricaKm - a.distanciaMetricaKm);
  }, [asteroides]);

  const itensFiltrados = useMemo(() => {
    if (filtroCategoria === 'todos') return catalogoOrdenado;
    if (filtroCategoria === 'galaxias') return catalogoOrdenado.filter(i => i.categoria === 'Galáxia');
    if (filtroCategoria === 'planetas') return catalogoOrdenado.filter(i => i.categoria === 'Planeta' || i.categoria === 'Sol' || i.categoria === 'Lua');
    if (filtroCategoria === 'asteroides') return catalogoOrdenado.filter(i => i.categoria === 'Asteroide');
    return catalogoOrdenado.filter(i => i.categoria === 'Satélite' || i.categoria === 'Sonda');
  }, [catalogoOrdenado, filtroCategoria]);

  const isEarth = targetInfo?.name === 'Terra';

  const handleSelectItem = (item: TargetInfo) => {
    onSelectTarget(item);
    setPainelDadosAberto(true);
    setDrawerAberto(false);
  };

  const handlePassarObjeto = (direcao: 'next' | 'prev') => {
    const lista = catalogoOrdenado;
    if (!targetInfo) {
      handleSelectItem(lista[0]);
      return;
    }
    const indexAtual = lista.findIndex(i => i.name === targetInfo.name);
    if (indexAtual === -1) {
      handleSelectItem(lista[0]);
      return;
    }
    const proximoIndex = direcao === 'next' 
      ? (indexAtual + 1) % lista.length 
      : (indexAtual - 1 + lista.length) % lista.length;

    handleSelectItem(lista[proximoIndex]);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      
      {/* 1. BARRA SUPERIOR */}
      <header className="flex justify-between items-center gap-3 shrink-0">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={() => {
              setDrawerAberto(!drawerAberto);
              setMenuFiltrosAberto(false);
            }}
            className="bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-400 text-cyan-300 w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-xl backdrop-blur-xl transition-all cursor-pointer"
            title="Abrir Catálogo Cósmico (☰)"
          >
            ☰
          </button>

          <div className="bg-slate-950/70 backdrop-blur-xl border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-2.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-100">Astrometria</span>
            {spaceWeather && (
              <span className="text-[10px] text-slate-400 hidden sm:inline border-l border-slate-800 pl-2.5">
                Kp <strong className={spaceWeather.kpIndex >= 5 ? 'text-red-400' : 'text-emerald-400'}>{spaceWeather.kpIndex}</strong> • {spaceWeather.solarWindSpeedKmS} km/s
              </span>
            )}
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {isEarth && (
            <button
              onClick={() => setExplodedMode(prev => !prev)}
              className={`border px-3.5 py-1.5 rounded-xl backdrop-blur-xl font-mono text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                explodedMode
                  ? "bg-amber-500/25 border-amber-400 text-amber-200 font-bold animate-pulse"
                  : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-amber-400/50"
              }`}
            >
              <span>💥</span>
              <span>{explodedMode ? "Contrair" : "Vista Explodida"}</span>
            </button>
          )}

          <button
            onClick={() => {
              setExplodedMode(false);
              onResetCamera();
            }}
            className="bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 px-3 py-1.5 rounded-xl backdrop-blur-xl font-mono text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            title="Resetar câmera para a Visão Geral"
          >
            <span>🌌</span>
            <span className="hidden sm:inline">Visão Geral</span>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setMenuFiltrosAberto(!menuFiltrosAberto);
                setDrawerAberto(false);
              }}
              className={`border px-3 py-1.5 rounded-xl backdrop-blur-xl font-mono text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                menuFiltrosAberto 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' 
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-cyan-500/50'
              }`}
            >
              <span>⚙️ Filtros</span>
              <span className="text-[10px]">{menuFiltrosAberto ? '▲' : '▼'}</span>
            </button>

            {menuFiltrosAberto && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-2xl p-4 shadow-2xl font-mono text-xs space-y-2.5 z-50">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-800 flex justify-between items-center">
                  <span>Limpeza Visual</span>
                  <button onClick={() => setMenuFiltrosAberto(false)} className="text-slate-500 hover:text-white cursor-pointer">✕</button>
                </div>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg">
                  <span className="text-slate-200">Linhas de Órbita</span>
                  <input
                    type="checkbox"
                    checked={camadas.orbitas}
                    onChange={(e) => setCamadas(prev => ({ ...prev, orbitas: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg">
                  <span className="text-slate-200">Mira do Alvo (Círculo Azul)</span>
                  <input
                    type="checkbox"
                    checked={camadas.miraAlvo}
                    onChange={(e) => setCamadas(prev => ({ ...prev, miraAlvo: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg">
                  <span className="text-slate-200">Vento Solar (Faixa Laranja)</span>
                  <input
                    type="checkbox"
                    checked={camadas.ventoSolar}
                    onChange={(e) => setCamadas(prev => ({ ...prev, ventoSolar: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer w-4 h-4"
                  />
                </label>

                <div className="border-t border-slate-800/80 my-1 pt-1 text-[10px] text-slate-500 uppercase">Camadas Celestes</div>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg">
                  <span className="text-slate-300">Planetas</span>
                  <input
                    type="checkbox"
                    checked={camadas.planetas}
                    onChange={(e) => setCamadas(prev => ({ ...prev, planetas: e.target.checked }))}
                    className="accent-cyan-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg">
                  <span className="text-purple-300">Galáxias</span>
                  <input
                    type="checkbox"
                    checked={camadas.galaxias}
                    onChange={(e) => setCamadas(prev => ({ ...prev, galaxias: e.target.checked }))}
                    className="accent-purple-400 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-slate-900 rounded-lg">
                  <span className="text-amber-300">Monitoramento Asteroides</span>
                  <input
                    type="checkbox"
                    checked={camadas.asteroides}
                    onChange={(e) => setCamadas(prev => ({ ...prev, asteroides: e.target.checked }))}
                    className="accent-amber-400 cursor-pointer w-4 h-4"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. GAVETA DO CATÁLOGO COM DIÂMETRO VISÍVEL EM CADA ITEM */}
      <aside className={`pointer-events-auto fixed top-20 left-6 bottom-16 w-80 sm:w-96 bg-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-4 shadow-2xl transition-all duration-300 flex flex-col font-mono z-40 ${
        drawerAberto ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0 pointer-events-none'
      }`}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider whitespace-nowrap">Catálogo Cósmico</h2>
            <p className="text-[10px] text-cyan-400 font-mono">Ordenado: mais distante ➔ mais próximo</p>
          </div>
          <button
            onClick={() => setDrawerAberto(false)}
            className="text-slate-400 hover:text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1 py-2 border-b border-slate-800/80 text-[10px] shrink-0">
          {(['todos', 'galaxias', 'planetas', 'asteroides', 'satelites'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`py-1.5 rounded-lg text-center capitalize transition-all cursor-pointer ${
                filtroCategoria === cat ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'asteroides' ? 'NEOs' : cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-2 text-xs">
          {itensFiltrados.map((item, index) => (
            <div
              key={item.name}
              onClick={() => handleSelectItem(item)}
              className="p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer flex justify-between items-center transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] text-slate-500 font-mono w-4 shrink-0">{index + 1}.</span>
                <div className="min-w-0">
                  <h4 className="text-slate-200 font-semibold truncate group-hover:text-cyan-300 transition-colors">
                    {item.name} 
                    {item.name.includes("3I") && <span className="ml-1 text-teal-400 text-[9px] border border-teal-500/40 px-1 py-0.2 rounded">INTERESTELAR</span>}
                    {item.isHazardous && <span className="text-red-400 text-[10px]">⚠️ PHA</span>}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 truncate">
                    <span className="text-cyan-400 font-mono">⌀ {item.diameter || "N/A"}</span>
                    <span>•</span>
                    <span className="truncate">{item.distanceKm}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 group-hover:translate-x-1 transition-transform ml-2">➔</span>
            </div>
          ))}
        </div>
      </aside>

      {/* 3. CARD LATERAL DE TELEMETRIA */}
      {targetInfo && painelDadosAberto && (
        <aside className="pointer-events-auto fixed bottom-14 right-6 w-84 sm:w-96 max-h-[calc(100vh-140px)] bg-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-4 shadow-2xl font-mono text-xs z-30 flex flex-col transition-all">
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-2.5 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                onClick={() => handlePassarObjeto('prev')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all cursor-pointer shrink-0"
                title="Astro anterior"
              >
                ◀
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-cyan-400 block uppercase tracking-widest">{targetInfo.type}</span>
                  {targetInfo.name.includes("3I") && (
                    <span className="bg-teal-500/20 text-teal-300 border border-teal-500/50 text-[8px] font-bold px-1.5 py-0.2 rounded">
                      INTERESTELAR
                    </span>
                  )}
                  {targetInfo.isHazardous && (
                    <span className="bg-red-500/20 text-red-400 border border-red-500/50 text-[8px] font-bold px-1.5 py-0.2 rounded animate-pulse">
                      CRÍTICO &lt;1.0 LD
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-sm truncate max-w-[190px]" title={targetInfo.name}>
                  {targetInfo.name}
                </h3>
              </div>

              <button
                onClick={() => handlePassarObjeto('next')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all cursor-pointer shrink-0"
                title="Próximo astro"
              >
                ▶
              </button>
            </div>

            <button
              onClick={() => setPainelDadosAberto(false)}
              className="text-slate-500 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 cursor-pointer"
              title="Fechar painel"
            >
              ✕
            </button>
          </div>

          {isEarth && (
            <div className="grid grid-cols-3 gap-1 py-1.5 border-b border-slate-800/80 text-[10px] shrink-0 mb-2">
              <button
                onClick={() => setSecaoTerra('geral')}
                className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                  secaoTerra === 'geral' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setSecaoTerra('estrutura')}
                className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                  secaoTerra === 'estrutura' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Estrutura 3D
              </button>
              <button
                onClick={() => setSecaoTerra('noaa')}
                className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                  secaoTerra === 'noaa' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Boletim NOAA
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">

            {(secaoTerra === 'geral' || !isEarth) && (
              <>
                {targetInfo.imageUrl && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                    <img
                      src={targetInfo.imageUrl}
                      alt={targetInfo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Se falhar o carregamento, garante que um cometa receba foto de cometa e asteroides recebam foto rochosa
                        let fallbackUrl = 'https://images-assets.nasa.gov/image/PIA24174/PIA24174~orig.jpg';
                        if (targetInfo.name.includes("ATLAS") || targetInfo.name.includes("3I")) {
                          fallbackUrl = 'https://images-assets.nasa.gov/image/PIA23865/PIA23865~orig.jpg';
                        }
                        (e.target as HTMLImageElement).src = fallbackUrl;
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-cyan-500/40 bg-cyan-950/20">
                    <span className="text-[9px] text-cyan-300 block uppercase font-bold">Diâmetro Real</span>
                    <span className="text-white font-mono font-bold text-xs">{targetInfo.diameter || "N/A"}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase">Distância</span>
                    <span className="text-cyan-300 font-bold truncate block">{targetInfo.distanceKm || "N/A"}</span>
                  </div>
                  {targetInfo.orbitalPeriod && (
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase">Período Orbital</span>
                      <span className="text-slate-200 font-semibold">{targetInfo.orbitalPeriod}</span>
                    </div>
                  )}
                  {targetInfo.gravity && (
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase">Gravidade</span>
                      <span className="text-slate-200 font-semibold">{targetInfo.gravity}</span>
                    </div>
                  )}
                  {targetInfo.speedKmh && (
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2">
                      <span className="text-[9px] text-slate-500 block uppercase">Velocidade Orbital</span>
                      <span className="text-cyan-300 font-bold">{formatarNumero(targetInfo.speedKmh)} km/h</span>
                    </div>
                  )}
                </div>

                {targetInfo.details && (
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/80">
                    {targetInfo.details}
                  </p>
                )}

                {targetInfo.type === 'Asteroide' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">
                        Vetor Orbital
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {targetInfo.name.includes("3I") ? 'Trajetória hiperbólica de escape interestelar' : targetInfo.isHazardous ? 'Trajetória cruza a órbita da Terra' : 'Sem risco de colisão orbital'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded border text-[9px] font-bold ${
                      targetInfo.name.includes("3I")
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        : targetInfo.isHazardous
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {targetInfo.name.includes("3I") ? 'ESCAPE SOLAR' : targetInfo.isHazardous ? 'ROTA ATIVA' : 'ÓRBITA ESTÁVEL'}
                    </span>
                  </div>
                )}
              </>
            )}

            {isEarth && secaoTerra === 'estrutura' && (
              <div className="space-y-2 text-[10px]">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  earthLayers.bowShock ? 'bg-blue-950/40 border-blue-400' : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-300 font-bold uppercase">1. Escudo Magnético / Bow Shock (~65.000 km)</span>
                    <button
                      onClick={() => setEarthLayers(p => ({ ...p, bowShock: !p.bowShock }))}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                        earthLayers.bowShock ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {earthLayers.bowShock ? 'ATIVO' : 'DESATIVADO'}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Arco frontal onde o campo geomagnético deflete o vento solar e protege a atmosfera da perda por erosão.
                  </p>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  earthLayers.vanAllen ? 'bg-amber-950/40 border-amber-400' : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-300 font-bold uppercase">2. Cinturões de Radiação Van Allen</span>
                    <button
                      onClick={() => setEarthLayers(p => ({ ...p, vanAllen: !p.vanAllen }))}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                        earthLayers.vanAllen ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {earthLayers.vanAllen ? 'ATIVO' : 'DESATIVADO'}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Zonas toroidais que capturam prótons e elétrons de alta energia de tempestades cósmicas.
                  </p>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  earthLayers.satellitesLeo ? 'bg-cyan-950/40 border-cyan-400' : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-cyan-300 font-bold uppercase">3. Satélites em Órbita (ISS, Hubble, GOES)</span>
                    <button
                      onClick={() => setEarthLayers(p => ({ ...p, satellitesLeo: !p.satellitesLeo }))}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                        earthLayers.satellitesLeo ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {earthLayers.satellitesLeo ? 'ATIVO' : 'DESATIVADO'}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Malha de satélites científicos e meteorológicos orbitando a partir de 420 km de altitude.
                  </p>
                </div>

                <div className={`p-2.5 rounded-xl border transition-all ${
                  earthLayers.radarsGround ? 'bg-emerald-950/40 border-emerald-400' : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-emerald-300 font-bold uppercase">4. Radares e Bases Espaciais (Goldstone / DSN)</span>
                    <button
                      onClick={() => setEarthLayers(p => ({ ...p, radarsGround: !p.radarsGround }))}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                        earthLayers.radarsGround ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {earthLayers.radarsGround ? 'ATIVO' : 'DESATIVADO'}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Rede global Deep Space Network e radares de vigilância aeroespacial na superfície terrestre.
                  </p>
                </div>

                {/* 5. RESSONÂNCIA DE SCHUMANN (7.83 Hz) */}
                <div className={`p-2.5 rounded-xl border transition-all ${
                  earthLayers.schumann ? 'bg-teal-950/40 border-teal-400' : 'bg-slate-900/40 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-teal-300 font-bold uppercase">5. Cavidade de Schumann (7.83 Hz)</span>
                    <button
                      onClick={() => setEarthLayers(p => ({ ...p, schumann: !p.schumann }))}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                        earthLayers.schumann ? 'bg-teal-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {earthLayers.schumann ? 'ATIVO' : 'DESATIVADO'}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Ressonância eletromagnética global na cavidade ionosférica excitada pelas descargas elétricas na atmosfera.
                  </p>
                </div>
              </div>
            )}

            {isEarth && secaoTerra === 'noaa' && (
              <div className="space-y-2 text-[10px]">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-emerald-400 font-bold uppercase">Boletim SWPC / NOAA</span>
                  <span className="text-slate-400">{spaceWeather?.lastUpdated || "Tempo Real"}</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <span>Estado Geomagnético:</span>
                  <span className={`font-bold ${spaceWeather && spaceWeather.kpIndex >= 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    Índice Kp {spaceWeather?.kpIndex || 2} ({spaceWeather?.kpStatus || "Nominal"})
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <span>Velocidade do Vento Solar:</span>
                  <span className="text-cyan-300 font-bold">{spaceWeather?.solarWindSpeedKmS || 400} km/s</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                  <span>Densidade de Plasma:</span>
                  <span className="text-cyan-300 font-bold">{spaceWeather?.plasmaDensity || 4.5} p/cm³</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/60 border border-teal-500/30 flex justify-between items-center bg-teal-950/20">
                  <span className="text-teal-300">Ressonância de Schumann:</span>
                  <span className="text-teal-400 font-bold font-mono">7.83 Hz (Fundamental Q1)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 uppercase text-[9px] block">Integridade Operacional</span>
                  <p className="text-slate-300 leading-relaxed">
                    Sem interferências em links de alta frequência (HF) ou sinais GNSS. Satélites operando normalmente.
                  </p>
                </div>
              </div>
            )}

          </div>
        </aside>
      )}

      {/* 4. CONTROLE DE NAVEGAÇÃO COMPACTO E FIXO COM SETAS CHEVRON (2 RISCOS BRANCOS) E TAG SUPERIOR */}
      <div className="pointer-events-auto fixed bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
        
        {/* TAG ELEGANTE E FLUTUANTE COM O NOME DO ASTRO FOCADO */}
        {targetInfo && (
          <div className="mb-2 px-3 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-lg flex items-center gap-1.5 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-200 tracking-wider uppercase font-semibold">
              {targetInfo.name}
            </span>
          </div>
        )}

        {/* CÁPSULA COM LARGURA 100% FIXA */}
        <div className="w-28 h-9 bg-slate-950/70 hover:bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/80 rounded-full shadow-2xl flex items-center justify-between px-2 transition-all">
          
          <button
            onClick={() => handlePassarObjeto('prev')}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all cursor-pointer group"
            title="Astro anterior"
          >
            <svg className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 17l-5-5 5-5" />
              <path d="M18 17l-5-5 5-5" />
            </svg>
          </button>

          <span className="w-1 h-1 rounded-full bg-white/30" />

          <button
            onClick={() => handlePassarObjeto('next')}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all cursor-pointer group"
            title="Próximo astro"
          >
            <svg className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 17l5-5-5-5" />
              <path d="M6 17l5-5-5-5" />
            </svg>
          </button>

        </div>
      </div>

      {/* 5. RODAPÉ */}
      <footer className="flex justify-between items-center gap-3 pointer-events-auto shrink-0">
        <div className="w-10 sm:w-20" />

        <div className="bg-slate-950/70 backdrop-blur-xl border border-slate-800 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 font-mono text-xs ml-auto">
          <span className="text-slate-400 text-[11px]">Tempo:</span>
          {[0, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setTimeScale(s)}
              className={`px-2 py-0.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                timeScale === s
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {s === 0 ? "⏸" : `${s}×`}
            </button>
          ))}
        </div>
      </footer>

    </div>
  );
}