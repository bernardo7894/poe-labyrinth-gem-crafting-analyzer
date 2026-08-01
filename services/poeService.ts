import { PoeNinjaGem, ProcessedGem } from '../types';

// Reuse the Cloudflare Worker proxy from the Volatile Analyst project. The
// browser cannot call poe.ninja directly because the public API does not send
// browser CORS headers.
const PROXY_URL = 'https://poe-proxy.bernardo-7894.workers.dev/?url=';
const LEAGUE_SOURCE_URLS = [
  'https://api.poe.watch/leagues',
  'https://poe.ninja/poe1/api/economy/leagues',
];
const SKILL_GEM_API_URL = 'https://poe.ninja/poe1/api/economy/stash/current/item/overview';

// Paths for fetch are relative to the root HTML page.
const GEM_COLORS_URL = './data/gemColors.json';

type GemColorData = {
  Red: string[];
  Green: string[];
  Blue: string[];
};

type LeagueCandidate = {
  id?: string;
  name?: string;
  end_date?: string;
};

export type GemDataResult = {
  league: string;
  gems: ProcessedGem[];
};

const proxyUrl = (targetUrl: string): string => (
  `${PROXY_URL}${encodeURIComponent(targetUrl)}`
);

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${url}`);
  }
  return response.json() as Promise<T>;
};

const createColorMap = (gemColorData: GemColorData): Map<string, 'Red' | 'Green' | 'Blue'> => {
  const map = new Map<string, 'Red' | 'Green' | 'Blue'>();
  (Object.keys(gemColorData) as Array<'Red' | 'Green' | 'Blue'>).forEach((color) => {
    gemColorData[color].forEach((gemName) => {
      map.set(gemName, color);
    });
  });
  return map;
};

const isExcludedLeague = (league: LeagueCandidate): boolean => {
  const label = league.name ?? league.id ?? '';
  return /(^|\s)(hardcore|standard|solo self-found|ssf|ruthless|hc)(\s|$)/i.test(label);
};

const resolveCurrentLeague = async (): Promise<{ id: string; name: string }> => {
  let lastError: unknown;

  for (const sourceUrl of LEAGUE_SOURCE_URLS) {
    try {
      const leagues = await fetchJson<LeagueCandidate[]>(proxyUrl(sourceUrl));
      const currentLeague = leagues.find((league) => !isExcludedLeague(league)) ?? leagues[0];
      const id = currentLeague?.id ?? currentLeague?.name;
      const name = currentLeague?.name ?? currentLeague?.id;

      if (id && name) {
        return { id, name };
      }
    } catch (error: unknown) {
      lastError = error;
    }
  }

  const reason = lastError instanceof Error ? `: ${lastError.message}` : '';
  throw new Error(`Unable to determine the current PoE league${reason}`);
};

const getTransfiguredBaseCandidates = (name: string): string[] => {
  const candidates = new Set<string>();
  const parenthesizedName = name.match(/\(([^)]*?\bof\b[^)]*)\)/)?.[1];
  const sources = [parenthesizedName, name].filter((source): source is string => Boolean(source));

  sources.forEach((source) => {
    const parts = source.split(/\s+of\s+/);
    if (parts.length > 1) {
      candidates.add(parts.slice(0, -1).join(' of ').trim());
      candidates.add(parts[0].trim());
    }
  });

  return [...candidates].filter(Boolean);
};

const normalizeBaseCandidate = (candidate: string): string => (
  candidate.replace(/^Vaal\s+/, '').trim()
);

const matchesKnownGemName = (candidate: string, allGemNames: Set<string>): boolean => {
  const normalized = normalizeBaseCandidate(candidate);
  return allGemNames.has(candidate)
    || allGemNames.has(normalized)
    || allGemNames.has(`Vaal ${normalized}`);
};

const isTransfiguredGem = (name: string, allGemNames: Set<string>): boolean => (
  getTransfiguredBaseCandidates(name).some((candidate) => matchesKnownGemName(candidate, allGemNames))
);

const getBaseGemName = (
  name: string,
  baseType: string | undefined,
  allGemNames: Set<string>,
): string => {
  const knownCandidate = getTransfiguredBaseCandidates(name)
    .find((candidate) => matchesKnownGemName(candidate, allGemNames));

  if (knownCandidate) return normalizeBaseCandidate(knownCandidate);
  return baseType?.trim() || name;
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

export const fetchAndProcessGemData = async (): Promise<GemDataResult> => {
  try {
    const league = await resolveCurrentLeague();
    const skillGemUrl = `${SKILL_GEM_API_URL}?league=${encodeURIComponent(league.id)}&type=SkillGem`;

    const [ninjaData, colorData] = await Promise.all([
      fetchJson<{ lines?: PoeNinjaGem[] }>(proxyUrl(skillGemUrl)),
      fetchJson<GemColorData>(GEM_COLORS_URL),
    ]);

    const colorMap = createColorMap(colorData);
    const rawGems = (ninjaData.lines ?? []).filter((gem) => !gem.name.endsWith(' Support'));

    if (rawGems.length === 0) {
      throw new Error(`No Skill Gem prices were returned for ${league.name}`);
    }

    const allGemNames = new Set(rawGems.map((gem) => gem.name));
    const gems = rawGems.map((gem) => {
      const baseName = getBaseGemName(gem.name, gem.baseType, allGemNames);
      const color = getGemColor(gem.name, baseName, colorMap);

      return {
        ...gem,
        color,
        isTransfigured: isTransfiguredGem(gem.name, allGemNames),
        baseName,
      };
    });

    return { league: league.name, gems };
  } catch (error: unknown) {
    console.error('Error in fetchAndProcessGemData:', error);
    if (error instanceof Error) {
      throw new Error(`Network or parsing error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching gem data.');
  }
};
