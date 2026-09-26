import { NextResponse } from 'next/server';
import { demoPlayers, type LivePayload, type PlayerStats } from '@/lib/data';

export const dynamic = 'force-dynamic';

function n(v: unknown) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

function demoPayload(): LivePayload {
  const now = Date.now();
  const tick = Math.floor(now / 15000);
  const minute = 55 + (tick % 30);

  const players: PlayerStats[] = demoPlayers.map((p, i) => ({
    ...p,
    minutes: minute,
    shotsOn: p.shotsOn + ((tick + i) % 5 === 0 ? 1 : 0),
    keyPasses: p.keyPasses + ((tick + i * 2) % 7 === 0 ? 1 : 0),
    tackles: p.tackles + ((tick + i * 3) % 8 === 0 ? 1 : 0),
    dribbles: p.dribbles + ((tick + i) % 6 === 0 ? 1 : 0),
  }));

  return {
    source: 'demo',
    updatedAt: new Date().toISOString(),
    minute,
    status: 'LIVE DEMO',
    home: { name: 'Barcelona', score: 2 },
    away: { name: 'Real Madrid', score: 1 },
    players,
  };
}

async function apiFootballPayload(): Promise<LivePayload | null> {
  const key = process.env.API_FOOTBALL_KEY;
  const fixture = process.env.API_FOOTBALL_FIXTURE_ID;
  if (!key || !fixture) return null;

  const headers = { 'x-apisports-key': key };
  const [fixtureRes, playerRes] = await Promise.all([
    fetch(`https://v3.football.api-sports.io/fixtures?id=${encodeURIComponent(fixture)}`, { headers, cache: 'no-store' }),
    fetch(`https://v3.football.api-sports.io/fixtures/players?fixture=${encodeURIComponent(fixture)}`, { headers, cache: 'no-store' }),
  ]);

  if (!fixtureRes.ok || !playerRes.ok) throw new Error('API-Football request failed');

  const fixtureJson = await fixtureRes.json();
  const playerJson = await playerRes.json();
  const f = fixtureJson?.response?.[0];
  if (!f) return null;

  const players: PlayerStats[] = (playerJson?.response ?? []).flatMap((team: any) =>
    (team?.players ?? []).map((entry: any) => {
      const s = entry?.statistics?.[0] ?? {};
      const rating = Number.parseFloat(s?.games?.rating ?? '');
      return {
        name: entry?.player?.name ?? 'Unknown player',
        number: n(s?.games?.number),
        pos: s?.games?.position ?? '-',
        minutes: n(s?.games?.minutes),
        goals: n(s?.goals?.total),
        assists: n(s?.goals?.assists),
        shotsOn: n(s?.shots?.on),
        keyPasses: n(s?.passes?.key),
        tackles: n(s?.tackles?.total),
        interceptions: n(s?.tackles?.interceptions),
        dribbles: n(s?.dribbles?.success),
        yellow: n(s?.cards?.yellow),
        red: n(s?.cards?.red),
        providerRating: Number.isFinite(rating) ? rating : null,
      } satisfies PlayerStats;
    })
  );

  return {
    source: 'api-football',
    updatedAt: new Date().toISOString(),
    minute: n(f?.fixture?.status?.elapsed),
    status: f?.fixture?.status?.short ?? 'LIVE',
    home: { name: f?.teams?.home?.name ?? 'Home', score: n(f?.goals?.home) },
    away: { name: f?.teams?.away?.name ?? 'Away', score: n(f?.goals?.away) },
    players,
  };
}

export async function GET() {
  try {
    const live = await apiFootballPayload();
    return NextResponse.json(live ?? demoPayload(), {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(demoPayload(), {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }
}
