export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum DefectVerdict {
  PASS = 'PASS',
  FAIL = 'FAIL',
  UNCERTAIN = 'UNCERTAIN',
}

export interface Defect {
  description: string;
  box_2d?: number[]; // [ymin, xmin, ymax, xmax] on 0-1000 scale
}

export interface AnalysisResult {
  verdict: DefectVerdict;
  confidence: number; // 0 to 100
  reasoning: string;
  defects: Defect[];
}

export interface ImageAsset {
  id: string;
  url: string; // Data URL (base64)
  file?: File;
}