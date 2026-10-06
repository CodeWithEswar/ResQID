// Natural Earth 1:110m land geometry is public domain.
// Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson
// Run from web/: node scripts/generate-globe.mjs
import { readFile, writeFile } from "node:fs/promises";

const source = JSON.parse(await readFile(new URL("../public/assets/world-land.geojson", import.meta.url), "utf8"));
const polygons = source.features.flatMap(({ geometry }) => geometry.type === "MultiPolygon" ? geometry.coordinates : [geometry.coordinates]);
const rings = polygons.map(([outline, ...holes]) => ({
  outline, holes,
  bounds: [Math.min(...outline.map(p => p[0])), Math.min(...outline.map(p => p[1])), Math.max(...outline.map(p => p[0])), Math.max(...outline.map(p => p[1]))],
}));
function inside(lon, lat, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
const points = [];
for (let lat = -84; lat <= 84; lat += 1.65) {
  const step = 1.65 / Math.cos(lat * Math.PI / 180);
  for (let lon = -180 + step / 2; lon < 180; lon += step) {
    if (rings.some(({ outline, holes, bounds: [west, south, east, north] }) => lon >= west && lon <= east && lat >= south && lat <= north && inside(lon, lat, outline) && !holes.some(hole => inside(lon, lat, hole)))) {
      points.push([Number(lon.toFixed(3)), Number(lat.toFixed(3))]);
    }
  }
}
const coasts = polygons.flatMap(polygon => polygon.map(ring => ring.map(([lon, lat]) => [Number(lon.toFixed(3)), Number(lat.toFixed(3))])));
await writeFile(new URL("../src/components/landing/globe-data.json", import.meta.url), JSON.stringify({ points, coasts }));

// An authentic orthographic globe also remains visible without WebGL or JavaScript.
const centerLat = 15 * Math.PI / 180;
function project([lon, lat]) {
  const a = (lon - 25) * Math.PI / 180, b = lat * Math.PI / 180;
  const x = Math.cos(b) * Math.sin(a);
  const y = Math.cos(centerLat) * Math.sin(b) - Math.sin(centerLat) * Math.cos(b) * Math.cos(a);
  const z = Math.sin(centerLat) * Math.sin(b) + Math.cos(centerLat) * Math.cos(b) * Math.cos(a);
  return [(160 + x * 137).toFixed(2), (160 - y * 137).toFixed(2), z];
}
const dots = points.map(project).filter(p => p[2] > 0).map(([x, y, z]) => `<circle cx="${x}" cy="${y}" r=".72" opacity="${(.35 + z * .6).toFixed(2)}"/>`).join("");
const outlines = coasts.map(ring => {
  let path = "", visible = false;
  for (const point of ring) {
    const [x, y, z] = project(point);
    if (z <= 0) { visible = false; continue; }
    path += `${visible ? "L" : "M"}${x} ${y}`;
    visible = true;
  }
  return `<path d="${path}"/>`;
}).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><radialGradient id="ocean" cx="32%" cy="25%" r="80%"><stop stop-color="#20182e"/><stop offset="1" stop-color="#0a0910"/></radialGradient><radialGradient id="halo"><stop offset=".84" stop-color="#8b5cf6" stop-opacity="0"/><stop offset=".9" stop-color="#8b5cf6" stop-opacity=".12"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs><circle cx="160" cy="160" r="155" fill="url(#halo)"/><circle cx="160" cy="160" r="137" fill="url(#ocean)" stroke="#a78bfa" stroke-opacity=".3"/><g fill="#c4b5fd">${dots}</g><g fill="none" stroke="#c4b5fd" stroke-width=".35" opacity=".25">${outlines}</g></svg>`;
await writeFile(new URL("../public/assets/world-globe.svg", import.meta.url), svg);
console.log(`Globe generated: ${points.length} land points, ${coasts.length} coastline rings.`);
