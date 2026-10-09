import '@tingard/ictk-svelte/style.css';
// maplibre-gl v6 dropped the default `maplibregl` export in favor of named
// exports (Map, Marker, ...) — no more `import maplibregl from 'maplibre-gl'`.
import { Map as MapLibreMap, Marker, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// Under Vite, MapLibre's own worker-resolution fails silently (the error
// surfaces in the worker's own DevTools console context, not the main
// page's) — no style/tile requests ever fire and there's no visible error
// on the page. `?worker&url` is Vite's built-in query for "give me the URL
// of this as a bundled worker script"; setWorkerUrl points MapLibre at it
// explicitly instead of letting it guess.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { mount } from 'svelte';
import MovingUnit from './MovingUnit.svelte';
import ReceiverNode from './Receiver.svelte';
import { type LngLat, bearingBetween, lerpLngLat } from './geo';
import { movingUnit } from './movingUnit.svelte';

setWorkerUrl(workerUrl);

// The whole point of this example: ICTK's <Icon /> mounts as a plain DOM
// node inside maplibregl.Marker's `element` — no rasterization, no texture
// atlas, just a real Svelte component tree that MapLibre repositions on pan/zoom. This
// scenario: a Meshtastic-style LoRa mesh of fixed receiver nodes scattered
// over Dartmoor, each showing live-looking signal/battery status via
// amplifier slots, plus one moving unit which has updating amplifiers and an
// animated frame which rotates to match its bearing in real time.

const statusEl = document.createElement('div');
statusEl.id = 'status';
statusEl.textContent = 'Click a node for its status';
Object.assign(statusEl.style, {
  position: 'fixed',
  top: '12px',
  left: '12px',
  zIndex: '1',
  font: '13px system-ui, sans-serif',
  background: '#fff',
  padding: '6px 10px',
  borderRadius: '4px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  maxWidth: '260px',
});
document.body.appendChild(statusEl);

// Dartmoor National Park, Devon, UK — centered roughly on Princetown.
const map = new MapLibreMap({
  container: 'map',
  style: {
    version: 8,
    sources: {
      satellite: {
        type: 'raster',
        tiles: [
          'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'satellite',
        type: 'raster',
        source: 'satellite',
      },
    ],
  },
  center: [-3.9, 50.58],
  zoom: 10.4,
});

// --- Receiver grid -----------------------------------------------------

interface Receiver {
  id: string;
  lngLat: LngLat;
  signal: number; // 0-4 bars
  battery: number; // 0-100
}

function makeReceiverGrid(): Receiver[] {
  const lons = [-4.02, -3.94, -3.86, -3.78];
  const lats = [50.5, 50.57, 50.64];
  const receivers: Receiver[] = [];
  let n = 1;
  for (const lat of lats) {
    for (const lon of lons) {
      // Small jitter so the grid reads as an organic node deployment
      // rather than a perfectly regular lattice.
      const jitterLon = (Math.random() - 0.5) * 0.03;
      const jitterLat = (Math.random() - 0.5) * 0.02;
      receivers.push({
        id: String(n),
        lngLat: [lon + jitterLon, lat + jitterLat],
        signal: 1 + Math.floor(Math.random() * 4),
        battery: 15 + Math.floor(Math.random() * 85),
      });
      n++;
    }
  }
  return receivers;
}

for (const receiver of makeReceiverGrid()) {
  const el = document.createElement('div');
  el.style.cursor = 'pointer';
  el.dataset.testUnit = `receiver-${receiver.id}`;
  el.addEventListener('click', () => {
    statusEl.textContent = `Node ${receiver.id}: signal ${receiver.signal}/4, battery ${receiver.battery}%`;
  });

  mount(ReceiverNode, {
    target: el,
    props: { id: receiver.id, signal: receiver.signal, battery: receiver.battery },
  });

  new Marker({ element: el, anchor: 'center' }).setLngLat(receiver.lngLat).addTo(map);
}

// --- Moving unit ---------------------------------------------------------

const route: LngLat[] = [
  [-3.98, 50.6],
  [-3.88, 50.63],
  [-3.78, 50.6],
  [-3.78, 50.53],
  [-3.88, 50.5],
  [-3.98, 50.53],
];

const movingEl = document.createElement('div');
movingEl.dataset.testUnit = 'moving-unit';
// Mounted once; the component reads `movingUnit.bearing`, so assigning to it
// below updates the live component in place rather than re-mounting.
mount(MovingUnit, { target: movingEl, props: movingUnit });
const movingMarker = new Marker({ element: movingEl, anchor: 'center' })
  .setLngLat(route[0] as LngLat) // route is a non-empty literal
  .addTo(map);

let segment = 0;
let t = 0;

const STEP = 0.01; // fraction of the current route segment per tick

setInterval(() => {
  const from = route[segment % route.length];
  const to = route[(segment + 1) % route.length];
  if (!from || !to) return;

  movingMarker.setLngLat(lerpLngLat(from, to, t));
  movingUnit.bearing = bearingBetween(from, to);

  t += STEP;
  if (t >= 1) {
    t = 0;
    segment = (segment + 1) % route.length;
  }
}, 100);
