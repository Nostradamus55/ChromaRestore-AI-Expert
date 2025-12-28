
export interface ColorInfo {
  hex: string;
  label: string;
  description: string;
}

export interface RestorationStep {
  step: string;
  action: string;
  details: string;
}

export interface AnalysisResponse {
  sceneDetection: {
    description: string;
    objects: string[];
    era: string;
    context: string;
    textAnalysis?: string;
  };
  colorPalette: ColorInfo[];
  restorationGuide: RestorationStep[];
  imagenPrompt: string;
}

export interface ImageFile {
  base64: string;
  preview: string;
  type: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
