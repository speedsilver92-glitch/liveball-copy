import type { PlayerStats } from './data';

export function calculateRating(p: PlayerStats) {
  if (typeof p.providerRating === 'number' && Number.isFinite(p.providerRating)) {
    return Math.max(3, Math.min(10, Number(p.providerRating.toFixed(1))));
  }

  const minutesFactor = Math.min(p.minutes / 90, 1);
  const raw =
    6.0 +
    p.goals * 1.25 +
    p.assists * 0.8 +
    p.shotsOn * 0.12 +
    p.keyPasses * 0.10 +
    p.tackles * 0.06 +
    p.interceptions * 0.07 +
    p.dribbles * 0.08 -
    p.yellow * 0.3 -
    p.red * 1.6 +
    minutesFactor * 0.2;

  return Math.max(3, Math.min(10, Number(raw.toFixed(1))));
}

export function compactStats(p: PlayerStats) {
  const parts: string[] = [];
  if (p.goals) parts.push(`${p.goals} goal${p.goals > 1 ? 's' : ''}`);
  if (p.assists) parts.push(`${p.assists} assist${p.assists > 1 ? 's' : ''}`);
  if (p.keyPasses) parts.push(`${p.keyPasses} key passes`);
  if (p.dribbles) parts.push(`${p.dribbles} dribbles`);
  if (p.tackles) parts.push(`${p.tackles} tackles`);
  return parts.slice(0, 2).join(' · ') || `${p.minutes}' played`;
}
