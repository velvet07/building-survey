export type BuildingType = 'family' | 'apartment' | 'historic' | 'commercial' | 'industrial';

export type BasementType = 'none' | 'partial' | 'full';

export type VentilationQuality = 'good' | 'average' | 'poor';

export type SaltContentLevel = 'low' | 'medium' | 'high';

export type InterventionUrgency = 'monitor' | 'normal' | 'urgent';

export interface AquapolDiagnostics {
  inspectionDate: string;
  wallMoisture: string;
  floorMoisture: string;
  relativeHumidity: string;
  saltContent: SaltContentLevel;
  ventilation: VentilationQuality;
  ingressSources: string[];
  notes: string;
}

export interface AquapolClientInfo {
  contactName: string;
  phone: string;
  email: string;
}

export interface AquapolPropertyInfo {
  address: string;
  buildingType: BuildingType;
  constructionYear: string;
  basement: BasementType;
  floorArea: string;
}

export interface AquapolRecommendation {
  summary: string;
  urgency: InterventionUrgency;
  followUpDate: string;
  responsiblePerson: string;
}

export interface AquapolFormData {
  client: AquapolClientInfo;
  property: AquapolPropertyInfo;
  diagnostics: AquapolDiagnostics;
  recommendation: AquapolRecommendation;
  additionalNotes: string;
}

export interface AquapolFormRecord {
  id: string;
  project_id: string;
  data: AquapolFormData;
  created_at: string;
  updated_at: string;
}
