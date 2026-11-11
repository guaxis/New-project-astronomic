export interface NasaImageItem {
  id: string;
  title: string;
  description: string;
  dateCreated: string;
  imageUrl: string;
}

export async function fetchNasaImages(query: string, limit = 4): Promise<NasaImageItem[]> {
  try {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const items = data.collection?.items?.slice(0, limit) || [];

    return items.map((item: any) => {
      const itemData = item.data?.[0] || {};
      const href = item.links?.[0]?.href || '';
      return {
        id: itemData.nasa_id || Math.random().toString(),
        title: itemData.title || 'Observação Espacial',
        description: itemData.description || '',
        dateCreated: itemData.date_created ? new Date(itemData.date_created).toLocaleDateString('pt-PT') : '',
        imageUrl: href,
      };
    }).filter((img: NasaImageItem) => Boolean(img.imageUrl));
  } catch (err) {
    console.error("Erro ao contactar a NASA Image Library:", err);
    return [];
  }
}