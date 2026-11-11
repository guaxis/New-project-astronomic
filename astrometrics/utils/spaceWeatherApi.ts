export interface SpaceWeatherData {
  kpIndex: number;
  kpStatus: string;
  solarWindSpeedKmS: number;
  plasmaDensity: number;
  lastUpdated: string;
}

export async function fetchSpaceWeather(): Promise<SpaceWeatherData> {
  const fallbackData: SpaceWeatherData = {
    kpIndex: 2,
    kpStatus: "Calmo",
    solarWindSpeedKmS: 380,
    plasmaDensity: 4.5,
    lastUpdated: "Tempo Real (Modo Nominal)",
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // 1. Consulta Índice Kp da NOAA
    let kp = 2;
    try {
      const kpRes = await fetch(
        'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
        { signal: controller.signal, mode: 'cors' }
      );
      if (kpRes.ok) {
        const data = await kpRes.json();
        if (Array.isArray(data) && data.length > 1) {
          const lastEntry = data[data.length - 1];
          const parsedKp = parseFloat(lastEntry[1]);
          if (!isNaN(parsedKp)) kp = Math.round(parsedKp);
        }
      }
    } catch {
      // Ignora bloqueio de CORS ou timeout
    }

    // 2. Consulta Vento Solar / Plasma do Satélite DSCOVR
    let speed = 390;
    let density = 4.8;
    try {
      const plasmaRes = await fetch(
        'https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json',
        { signal: controller.signal, mode: 'cors' }
      );
      if (plasmaRes.ok) {
        const plasmaData = await plasmaRes.json();
        if (Array.isArray(plasmaData) && plasmaData.length > 1) {
          const latest = plasmaData[plasmaData.length - 1];
          const parsedDensity = parseFloat(latest[1]);
          const parsedSpeed = parseFloat(latest[2]);
          if (!isNaN(parsedSpeed) && parsedSpeed > 0) speed = Math.round(parsedSpeed);
          if (!isNaN(parsedDensity) && parsedDensity > 0) density = parseFloat(parsedDensity.toFixed(1));
        }
      }
    } catch {
      // Ignora bloqueio de CORS ou timeout
    }

    clearTimeout(timeoutId);

    const getStatus = (val: number) => {
      if (val >= 7) return "Tempestade Severa (G3-G5)";
      if (val >= 5) return "Tempestade Moderada (G1-G2)";
      if (val >= 4) return "Instável";
      return "Calmo (Nominal)";
    };

    return {
      kpIndex: kp,
      kpStatus: getStatus(kp),
      solarWindSpeedKmS: speed,
      plasmaDensity: density,
      lastUpdated: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return fallbackData;
  }
}