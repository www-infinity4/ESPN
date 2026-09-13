window.ESPN_FULL_GAMES = [
  { id:"nfl-sb45", title:"Super Bowl XLV — Packers vs Steelers", league:"NFL", season:2011, teams:["Green Bay Packers","Pittsburgh Steelers"], videoId:"WdakQksuoBg", source:"NFL", fullGame:true },
  { id:"nfl-sb54", title:"Super Bowl LIV — Chiefs vs 49ers", league:"NFL", season:2020, teams:["Kansas City Chiefs","San Francisco 49ers"], videoId:"jQ1l5zenaKY", source:"NFL", fullGame:true },
  { id:"nfl-sb42", title:"Super Bowl XLII — Giants vs Patriots", league:"NFL", season:2008, teams:["New York Giants","New England Patriots"], videoId:"S1QkoOUEgyc", source:"NFL", fullGame:true },
  { id:"nfl-sb49", title:"Super Bowl XLIX — Patriots vs Seahawks", league:"NFL", season:2015, teams:["New England Patriots","Seattle Seahawks"], videoId:"0RFXLwZV_fA", source:"NFL", fullGame:true },
  { id:"nba-2013-finals-g6", title:"2013 NBA Finals Game 6 — Spurs vs Heat", league:"NBA", season:2013, teams:["San Antonio Spurs","Miami Heat"], videoId:"JOLD8XXh78A", source:"ESPN", fullGame:true },
  { id:"nba-2016-finals-g7", title:"2016 NBA Finals Game 7 — Cavaliers vs Warriors", league:"NBA", season:2016, teams:["Cleveland Cavaliers","Golden State Warriors"], videoId:"EoVTttvKfRs", source:"ESPN", fullGame:true },
  { id:"nhl-2023-scf-g5", title:"2023 Stanley Cup Final Game 5 — Golden Knights vs Panthers", league:"NHL", season:2023, teams:["Vegas Golden Knights","Florida Panthers"], videoId:"eWaZO5cz1YA", source:"NHL", fullGame:true },
  { id:"nhl-2006-scf-g7", title:"2006 Stanley Cup Final Game 7 — Hurricanes vs Oilers", league:"NHL", season:2006, teams:["Carolina Hurricanes","Edmonton Oilers"], videoId:"OcU8IxgT6TQ", source:"NHL", fullGame:true }
];

window.ESPN_HIGHLIGHTS = [
  { id:"nba-2026-finals-movie", title:"2026 NBA Finals — Chasing History", league:"NBA", videoId:"S-ResPY3CGA", source:"NBA", durationSeconds:600 },
  { id:"nba-2026-finals-g2", title:"2026 NBA Finals Game 2 — Knicks at Spurs Highlights", league:"NBA", videoId:"yqoCezBgPdk", source:"NBA", durationSeconds:600 },
  { id:"nhl-2026-cup-rewind", title:"2026 Stanley Cup Playoffs Rewind", league:"NHL", videoId:"KKlX9nDp_D0", source:"NHL", durationSeconds:600 },
  { id:"mlb-2026-rays-redsox", title:"Rays vs Red Sox — July 18, 2026 Highlights", league:"MLB", videoId:"_34vVQVQbbA", source:"MLB", durationSeconds:600 },
  { id:"mlb-2026-sox-guardians", title:"White Sox vs Guardians — July 2, 2026 Highlights", league:"MLB", videoId:"Kd83N9uJSpU", source:"MLB", durationSeconds:600 },
  { id:"mls-2026-miami-philly", title:"Inter Miami vs Philadelphia Union Highlights", league:"MLS", videoId:"_5WAS24LWCA", source:"Major League Soccer", durationSeconds:600 },
  { id:"mls-2026-min-lafc", title:"Minnesota United vs LAFC Highlights", league:"MLS", videoId:"MVPx63FUeR0", source:"Major League Soccer", durationSeconds:600 }
];

window.ESPN_DAY_PLAN = [
  { type:"game", hours:3 },
  { type:"game", hours:3 },
  { type:"highlights", hours:1, label:"Morning Highlights" },
  { type:"game", hours:3 },
  { type:"game", hours:3 },
  { type:"highlights", hours:1, label:"Midday Highlights" },
  { type:"game", hours:3 },
  { type:"highlights", hours:1, label:"Prime Highlights" },
  { type:"game", hours:3 },
  { type:"game", hours:3 }
];

window.ESPN_SEASON_RULES = {
  footballMonths:[9,10,11,12,1,2],
  baseballMonths:[3,4,5,6,7,8,9,10],
  basketballMonths:[10,11,12,1,2,3,4,5,6],
  hockeyMonths:[10,11,12,1,2,3,4,5,6],
  highlightSegmentSeconds:600,
  fullGameBlockHours:3
};
