import { PoeNinjaGem, ProcessedGem } from '../types';

// The poe.ninja API does not provide CORS headers, which are required for direct
// browser-to-API communication. We use a public CORS proxy to bypass this limitation.
const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const API_URL = 'https://poe.ninja/api/data/itemoverview?league=Keepers&type=SkillGem';
const PROXIED_API_URL = `${PROXY_URL}${encodeURIComponent(API_URL)}`;

// Paths for fetch are relative to the root HTML page
const GEM_COLORS_URL = './data/gemColors.json';

type GemColorData = {
    Red: string[];
    Green: string[];
    Blue: string[];
}

const createColorMap = (gemColorData: GemColorData): Map<string, 'Red' | 'Green' | 'Blue'> => {
  const map = new Map<string, 'Red' | 'Green' | 'Blue'>();
  (Object.keys(gemColorData) as Array<'Red' | 'Green' | 'Blue'>).forEach((color) => {
    gemColorData[color].forEach((gemName) => {
      map.set(gemName, color);
    });
  });
  return map;
};

const getBaseGemName = (name: string): string => {
  const transfiguredMatch = name.match(/^(.*?) of /);
  if (transfiguredMatch && transfiguredMatch[1]) {
    return transfiguredMatch[1];
  }
  return name;
};

const getGemColor = (
  gemName: string,
  baseName: string,
  colorMap: Map<string, 'Red' | 'Green' | 'Blue'>,
): 'Red' | 'Green' | 'Blue' | 'White' => {
  const candidates = [
    gemName,
    baseName,
    gemName.replace(/^Vaal /, ''),
    baseName.replace(/^Vaal /, ''),
  ];

  for (const candidate of candidates) {
    const color = colorMap.get(candidate);
    if (color) return color;
  }

  return 'White';
};

export const fetchAndProcessGemData = async (): Promise<ProcessedGem[]> => {
  try {
    // Fetch both the API data (via proxy) and the local color data in parallel
    const [ninjaResponse, colorsResponse] = await Promise.all([
      fetch(PROXIED_API_URL),
      fetch(GEM_COLORS_URL)
    ]);

    if (!ninjaResponse.ok) {
      throw new Error(`Failed to fetch data from poe.ninja (via proxy): ${ninjaResponse.statusText}`);
    }
    if (!colorsResponse.ok) {
      throw new Error(`Failed to fetch gem color data (${GEM_COLORS_URL}): ${colorsResponse.statusText}`);
    }

    const ninjaData = await ninjaResponse.json();
    const colorData: GemColorData = await colorsResponse.json();

    // Create the color map on-the-fly with the fetched data
    const colorMap = createColorMap(colorData);

    const rawGems: PoeNinjaGem[] = ninjaData.lines;

    return rawGems.map((gem) => {
      const baseName = getBaseGemName(gem.name);
      const color = getGemColor(gem.name, baseName, colorMap);

      return {
        ...gem,
        color,
        isTransfigured: gem.name.includes(' of '),
        baseName,
      };
    });
  } catch (error) {
    console.error("Error in fetchAndProcessGemData:", error);
    if (error instanceof Error) {
        throw new Error(`Network or parsing error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching gem data.');
  }
};
