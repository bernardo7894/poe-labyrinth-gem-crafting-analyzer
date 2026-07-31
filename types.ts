
// Raw data structure from the poe.ninja API
export interface PoeNinjaGem {
  id: number;
  name: string;
  icon: string;
  baseType?: string;
  chaosValue: number;
  divineValue: number;
  detailsId: string;
}

// Our processed gem object with additional properties
export interface ProcessedGem extends PoeNinjaGem {
  color: 'Red' | 'Green' | 'Blue' | 'White'; // 'White' for unclassified gems like support gems
  isTransfigured: boolean;
  baseName: string;
}

// Data structure for the "Transform by Color" analysis
export interface ColorAnalysisResult {
  color: 'Red' | 'Green' | 'Blue';
  expectedValue: number;
  inputCost: number;
  expectedProfit: number;
  gemCount: number;
}

// Data structure for the "Transform Specific Gem" analysis
export interface IndividualGemAnalysisResult {
  id: string; // Using detailsId for a stable key
  name: string;
  icon: string;
  inputCost: number;
  transfiguredVersions: ProcessedGem[];
  avgTransfiguredValue: number;
  expectedProfit: number;
}
