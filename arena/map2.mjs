// Arena map "Rovine del Mercato" (map id m2, protocol 2). Source of truth for the server and the client (tools/gen-arena-map.mjs
// writes js/80-v4123-arena.js MAP data from this file). Symmetric by x -> -x: team 0 (BLU) west, team 1 (ROSSI) east.
// Zones: spawn courtyards (shield wall, two exits), north Colonnade (long sightlines broken by pillars and a head-height
// low wall), central Plaza (broken fountain ring, statue plinths, side screens), south Market (tight stalls and crate stacks),
// two lane dividers with doorways that make the flank routes, and back connectors from each spawn into both lanes.
export const MAP2_ID = 'm2';
export const MAP2_R = 52;
// [x, z, w, d, h, kind]
const HALF = [
  // spawn courtyard
  [-40, 0, 1.2, 11, 2.8, 'wall'],
  [-44.5, -12, 3, 1, 1.3, 'low'],
  [-44.5, 12, 3, 1, 1.3, 'low'],
  [-38, -22, 1.2, 5, 2.4, 'wall'],
  [-38, 22, 1.2, 5, 2.4, 'wall'],
  // lane dividers (doorway x -25..-19, centre gap -9..9)
  [-30, -15, 10, 1.2, 3.2, 'wall'],
  [-14, -15, 10, 1.2, 3.2, 'wall'],
  [-30, 15, 10, 1.2, 3.2, 'wall'],
  [-14, 15, 10, 1.2, 3.2, 'wall'],
  // north colonnade
  [-36, -27, 1.4, 1.4, 3.6, 'pillar'],
  [-24, -27, 1.4, 1.4, 3.6, 'pillar'],
  [-12, -27, 1.4, 1.4, 3.6, 'pillar'],
  [-30, -36, 4, 0.8, 1.2, 'low'],
  [-18, -21.5, 3, 0.8, 1.2, 'low'],
  [-8, -37, 1.4, 1.4, 3.6, 'pillar'],
  [-17, -34, 2.6, 0.8, 1.3, 'low'],
  [-31, -21, 1, 2.6, 1.6, 'screen'],
  [-37, -33, 1.4, 1.4, 3.6, 'pillar'],
  // plaza
  [-5, 0, 0.8, 4.2, 1.1, 'fountain'],
  [-12, -6, 1, 3, 2.3, 'screen'],
  [-12, 6, 1, 3, 2.3, 'screen'],
  [-20, 0, 2.2, 2.2, 1.4, 'statue'],
  [-27, -8, 2.4, 1, 2.3, 'screen'],
  [-27, 8, 2.4, 1, 2.3, 'screen'],
  // south market
  [-34, 24, 2.4, 2.4, 1.7, 'crate'],
  [-28, 32, 3, 1.2, 1.5, 'stall'],
  [-20, 22.5, 1.6, 1.6, 1.9, 'crate'],
  [-14, 30, 2.6, 1.2, 1.5, 'stall'],
  [-8, 38, 2, 2, 1.7, 'crate'],
  [-6, 21, 1.2, 2.4, 1.4, 'crate'],
  [-22, 40, 2, 1.2, 1.8, 'stall'],
  [-36, 31, 1.4, 1.4, 1.9, 'crate'],
  [-27, 18.6, 1.2, 1.2, 1.9, 'crate'],
  [-12, 44, 1.6, 1.6, 1.9, 'crate']
];
const CENTRE = [
  [0, -5, 4.2, 0.8, 1.1, 'fountain'],
  [0, 5, 4.2, 0.8, 1.1, 'fountain'],
  [0, -30, 0.8, 6, 1.3, 'low'],
  [0, 26, 3.2, 3.2, 2.3, 'crate'],
  [0, 19.6, 1.6, 1.6, 2.4, 'crate'],
  [0, -19.5, 1.2, 4, 3.4, 'wall'],
  [0, 0, 1.6, 1.6, 3.8, 'obelisk']
];
export const MAP2_COVERS = CENTRE.concat(HALF, HALF.map(c => [-c[0], c[1], c[2], c[3], c[4], c[5]]));
export const MAP2_BLOCKS = MAP2_COVERS.map(c => ({ x0: c[0] - c[2] / 2, x1: c[0] + c[2] / 2, z0: c[1] - c[3] / 2, z1: c[1] + c[3] / 2, h: c[4] }));
// fixed team spawns (start) and extra respawn points; a respawn picks the safest one (see logic.mjs safeSpawn)
export const MAP2_SPAWNS = [
  [[-47, -5], [-47, 0], [-47, 5]],
  [[47, -5], [47, 0], [47, 5]]
];
export const MAP2_RESPAWNS = [
  [[-47, -5], [-47, 0], [-47, 5], [-43, -21], [-43, 21], [-45, -8], [-45, 8]],
  [[47, -5], [47, 0], [47, 5], [43, -21], [43, 21], [45, -8], [45, 8]]
];
export const MAP2_SPOTS = [
  [0, 2.6], [0, -38], [0, 38], [-22, -31], [22, -31], [-22, 28], [22, 28],
  [-16, 0], [16, 0], [-34, -9], [34, 9], [-34, 9], [34, -9], [0, -12], [-3, 17.5]
];
