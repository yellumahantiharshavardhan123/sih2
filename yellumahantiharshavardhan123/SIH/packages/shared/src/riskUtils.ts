import type { RiskLevel, TouristLocation } from './types.js';

export const riskWeights: Record<RiskLevel, number> = {
  low: -10,
  medium: -20,
  high: -40,
  restricted: -60
};

export function computeSafetyScore(params: {
  zoneLevel: RiskLevel | null;
  timestamp?: Date | string | null;
  speedKmh?: number | null;
}): { score: number; parts: { zone: number; night: number; speed: number } } {
  const zone = params.zoneLevel ? riskWeights[params.zoneLevel] : 0;
  let night = 0;
  if (params.timestamp) {
    const d = typeof params.timestamp === 'string' ? new Date(params.timestamp) : params.timestamp;
    const h = d.getHours();
    if (h >= 19 || h < 6) night = -10;
  }
  const speed = params.speedKmh && params.speedKmh > 60 ? -5 : 0;
  let score = 100 + zone + night + speed;
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return { score, parts: { zone, night, speed } };
}
