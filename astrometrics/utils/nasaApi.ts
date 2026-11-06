let cacheDados: any = null;
let ultimaAtualizacao: number = 0;
const TEMPO_CACHE_MS = 30 * 60 * 1000;

// Base com imagens reais catalogadas por missões (NASA, JAXA e radares)
export const DADOS_HISTORICOS = [
  {
    id: "101955",
    name: "101955 Bennu",
    is_potentially_hazardous_asteroid: true,
    velocity_kmh: 101000,
    diameter_m: 490,
    dist_lunar: 1.8,
    mission: "OSIRIS-REx (NASA)",
    image: "https://images-assets.nasa.gov/image/PIA22947/PIA22947~orig.jpg",
    details: "Asteroide rico em carbono carbonáceo. Amostras físicas foram trazidas à Terra pela sonda OSIRIS-REx."
  },
  {
    id: "99942",
    name: "99942 Apophis",
    is_potentially_hazardous_asteroid: true,
    velocity_kmh: 109000,
    diameter_m: 370,
    dist_lunar: 0.1,
    mission: "Goldstone Radar Observatory",
    image: "https://images-assets.nasa.gov/image/PIA17041/PIA17041~orig.jpg",
    details: "Passará a menos de 32.000 km da Terra em 13 de abril de 2029, cruzando a faixa de satélites geoestacionários."
  },
  {
    id: "162173",
    name: "162173 Ryugu",
    is_potentially_hazardous_asteroid: true,
    velocity_kmh: 96000,
    diameter_m: 900,
    dist_lunar: 2.4,
    mission: "Hayabusa2 (JAXA)",
    image: "https://images-assets.nasa.gov/image/PIA23049/PIA23049~orig.jpg",
    details: "Asteroide tipo C primitivo com formato de pião gerado por rotação rápida no início do sistema solar."
  }
];

export async function fetchAsteroids() {
  const agora = Date.now();
  if (cacheDados && agora - ultimaAtualizacao < TEMPO_CACHE_MS) {
    return cacheDados;
  }

  const dataHoje = new Date().toISOString().split('T')[0];
  const urlNasa = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dataHoje}&end_date=${dataHoje}&api_key=DEMO_KEY`;

  try {
    const resposta = await fetch(urlNasa);
    if (!resposta.ok) throw new Error("NASA API Rate Limit");
    const dados = await resposta.json();
    cacheDados = dados;
    ultimaAtualizacao = agora;
    return dados;
  } catch {
    return cacheDados || null;
  }
}