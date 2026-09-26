export type PlayerStats = {
  name: string;
  number: number;
  pos: string;
  minutes: number;
  goals: number;
  assists: number;
  shotsOn: number;
  keyPasses: number;
  tackles: number;
  interceptions: number;
  dribbles: number;
  yellow: number;
  red: number;
  providerRating?: number | null;
};

export type LivePayload = {
  source: 'demo' | 'api-football';
  updatedAt: string;
  minute: number;
  status: string;
  home: { name: string; score: number };
  away: { name: string; score: number };
  players: PlayerStats[];
};

export const leagues = [
  ['Champions League',8],['Premier League',6],['La Liga',5],['Serie A',4],['Bundesliga',4],['Ligue 1',3]
] as const;

export const demoPlayers: Omit<PlayerStats, 'minutes'>[] = [
  {name:'Lamine Yamal',number:10,pos:'RW',goals:0,assists:1,shotsOn:1,keyPasses:3,tackles:0,interceptions:0,dribbles:4,yellow:0,red:0},
  {name:'Pedri',number:8,pos:'CM',goals:0,assists:0,shotsOn:1,keyPasses:3,tackles:2,interceptions:1,dribbles:2,yellow:0,red:0},
  {name:'Raphinha',number:11,pos:'LW',goals:1,assists:0,shotsOn:2,keyPasses:1,tackles:1,interceptions:0,dribbles:2,yellow:0,red:0},
  {name:'Frenkie de Jong',number:21,pos:'CM',goals:0,assists:0,shotsOn:0,keyPasses:1,tackles:3,interceptions:2,dribbles:1,yellow:0,red:0},
  {name:'Pau Cubarsí',number:2,pos:'CB',goals:0,assists:0,shotsOn:0,keyPasses:0,tackles:2,interceptions:3,dribbles:0,yellow:1,red:0},
];

export const events = [
  {m:"68'",text:'Big chance created',kind:'⚡'},
  {m:"61'",text:'Substitution',kind:'🔁'},
  {m:"53'",text:'Yellow card',kind:'🟨'},
  {m:"37'",text:'GOAL',kind:'⚽'},
  {m:"12'",text:'Big save from goalkeeper',kind:'🧤'},
];

export const table = [
  ['Barcelona',24,58],['Real Madrid',24,55],['Atlético',24,49],['Villarreal',24,44],['Athletic Club',24,41]
];
