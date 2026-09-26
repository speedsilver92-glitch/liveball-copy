'use client';
import { useEffect, useMemo, useState } from 'react';
import { Play, Search, Star, Volume2, X } from 'lucide-react';
import { events, leagues, table, type LivePayload } from '@/lib/data';
import { calculateRating, compactStats } from '@/lib/rating';

function youtubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1`;
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
  } catch {}
  return null;
}

function twitchEmbed(url: string) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('twitch.tv')) return null;
    const bits = u.pathname.split('/').filter(Boolean);
    const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (bits[0] === 'videos' && bits[1]) return `https://player.twitch.tv/?video=${bits[1]}&parent=${parent}&autoplay=true`;
    if (bits[0]) return `https://player.twitch.tv/?channel=${bits[0]}&parent=${parent}&autoplay=true`;
  } catch {}
  return null;
}

function StreamPlayer() {
  const [input, setInput] = useState('');
  const [streamUrl, setStreamUrl] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('pitchpulse-stream-url');
    if (saved) { setInput(saved); setStreamUrl(saved); }
  }, []);

  const connect = () => {
    const v = input.trim();
    setStreamUrl(v);
    if (v) localStorage.setItem('pitchpulse-stream-url', v);
  };

  const clear = () => {
    setStreamUrl(''); setInput(''); localStorage.removeItem('pitchpulse-stream-url');
  };

  const embed = streamUrl ? youtubeEmbed(streamUrl) || twitchEmbed(streamUrl) : null;
  const isDirectVideo = /\.(m3u8|mp4)(\?|$)/i.test(streamUrl);

  return <div className="stream">
    {streamUrl && embed ? (
      <iframe className="streamFrame" src={embed} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Match stream" />
    ) : streamUrl && isDirectVideo ? (
      <video className="streamVideo" src={streamUrl} controls autoPlay playsInline />
    ) : (
      <div className="streamInner">
        <Play size={42}/><h2>Watch the match</h2>
        <p>Paste an authorized HLS (.m3u8), MP4, YouTube, or Twitch stream URL.</p>
        <div className="streamConnect">
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="https://..." />
          <button className="primary" onClick={connect}><Volume2 size={16}/> Connect</button>
          {(input || streamUrl) && <button className="iconBtn" onClick={clear} title="Clear stream"><X size={17}/></button>}
        </div>
      </div>
    )}
    {streamUrl && <button className="changeStream" onClick={()=>setStreamUrl('')}>Change stream</button>}
  </div>;
}

export default function Home(){
  const [tab,setTab]=useState<'Events'|'Stats'|'Lineups'>('Events');
  const [fav,setFav]=useState(true);
  const [query,setQuery]=useState('');
  const [live,setLive]=useState<LivePayload | null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/live', { cache: 'no-store' });
        const json = await res.json();
        if (alive) setLive(json);
      } finally { if (alive) setLoading(false); }
    };
    load();
    const id=setInterval(load,15000);
    return ()=>{ alive=false; clearInterval(id); };
  },[]);

  const livePlayers=useMemo(()=>(live?.players ?? [])
    .filter(p=>p.name.toLowerCase().includes(query.toLowerCase()))
    .map(p=>({...p,rating:calculateRating(p)}))
    .sort((a,b)=>b.rating-a.rating),[live,query]);

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="brandMark">PP</div>PitchPulse Live</div>
      <nav className="nav"><button className="active">Live</button><button>Matches</button><button>Leagues</button><button>Favorites</button></nav>
      <button className="pill"><Search size={16}/></button>
    </header>

    <div className="layout">
      <aside className="card side"><h3>Competitions</h3>{leagues.map(([name,count])=><div className="league" key={name}><span>{name}</span><span className="count">{count}</span></div>)}</aside>

      <section>
        <div className="card hero">
          <div className="heroTop"><span className="liveDot"><span className="dot"/>{live?.status ?? 'CONNECTING'} · {live?.source === 'api-football' ? 'Live data' : 'Demo data'}</span><button className="fav" onClick={()=>setFav(!fav)}>{fav?'★':'☆'}</button></div>
          <div className="scoreboard">
            <div className="team"><div className="badge">{(live?.home.name ?? 'HOME').slice(0,3).toUpperCase()}</div><b>{live?.home.name ?? 'Home'}</b></div>
            <div><div className="score">{live?.home.score ?? '-'} - {live?.away.score ?? '-'}</div><div className="minute">{loading ? '…' : `${live?.minute ?? 0}'`}</div></div>
            <div className="team"><div className="badge">{(live?.away.name ?? 'AWAY').slice(0,3).toUpperCase()}</div><b>{live?.away.name ?? 'Away'}</b></div>
          </div>

          <StreamPlayer />

          <div className="tabs">{(['Events','Stats','Lineups'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={tab===t?'active':''}>{t}</button>)}</div>
          {tab==='Events' && <div className="events">{events.map(e=><div className="event" key={e.m}><span className="m">{e.m}</span><span>{e.kind} {e.text}</span><span className="muted">Live</span></div>)}</div>}
          {tab==='Stats' && <div className="statsGrid"><div className="stat"><b>58%</b><span>Possession</span></div><div className="stat"><b>14</b><span>Shots</span></div><div className="stat"><b>6</b><span>Shots on target</span></div><div className="stat"><b>5</b><span>Corners</span></div><div className="stat"><b>11</b><span>Fouls</span></div><div className="stat"><b>2.1</b><span>xG</span></div></div>}
          {tab==='Lineups' && <div className="events"><div className="event"><span>LIVE</span><span>Player list and ratings come from the connected live-data fixture.</span></div></div>}
        </div>

        <div className="card hero" style={{marginTop:18}}><div className="heroTop"><h3 className="sectionTitle" style={{margin:0}}>League table</h3><span className="muted">Demo</span></div><table className="table"><thead><tr><th>#</th><th>Team</th><th>P</th><th>Pts</th></tr></thead><tbody>{table.map((r,i)=><tr key={r[0]}><td>{i+1}</td><td>{r[0]}</td><td>{r[1]}</td><td><b>{r[2]}</b></td></tr>)}</tbody></table></div>
      </section>

      <aside className="card ratingPanel">
        <div className="heroTop"><h3 className="sectionTitle" style={{margin:0}}>Live player ratings</h3><span className="liveDot"><span className="dot"/></span></div>
        <input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search player..."/>
        {livePlayers.map(p=><div className="player" key={`${p.name}-${p.number}`}><div className="avatar">{p.number || '?'}</div><div><b>{p.name}</b><div className="muted" style={{fontSize:12}}>{p.pos} · {compactStats(p)}</div></div><div className={'rating '+(p.rating>=7.5?'hot':'')}>{p.rating.toFixed(1)}</div></div>)}
        {!livePlayers.length && <div className="empty">Waiting for live player data…</div>}
        <div className="ratingMeta"><span>Auto refresh: 15s</span><span>{live?.source === 'api-football' ? 'API-Football' : 'Demo engine'}</span></div>
      </aside>
    </div>
  </main>
}
