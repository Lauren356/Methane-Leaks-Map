mapboxgl.accessToken = 'pk.eyJ1IjoibGF1cmVuMTMiLCJhIjoiY21oanFyNjYzMWJ1MzJxcTN0NmJrY3docCJ9.Ow6JUEnq9DDndoAwu9p3Zw';

// Left map = emissions points
const leftMap = new mapboxgl.Map({
  container: 'left',
  style: 'mapbox://styles/lauren13/cmhuvkpxt00cu01sugbxo5q8d',
  center: [-122.27, 37.8],
  zoom: 9
});

// Right map = exposure polygons
const rightMap = new mapboxgl.Map({
  container: 'right',
  style: 'mapbox://styles/lauren13/cmhuvkpxt00cu01sugbxo5q8d',
  center: [-122.27, 37.8],
  zoom: 9
});

// Slider
new mapboxgl.Compare(leftMap, rightMap, '#comparison-container', {});

// ---- LEFT: points (emission_auto) ----
leftMap.on('load', () => {
  leftMap.addSource('points-data', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/Lauren356/Methane-Leaks-Map/refs/heads/main/data/sources_2025-11-11T10_28_07.821Z.json'
  });

  leftMap.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'points-data',
    filter: ['all',
      ['==', ['get', 'sector'], '1B2'],
      ['==', ['get', 'gas'], 'CH4']
    ],
    paint: {
      // two colors: <100 (teal), ≥100 (deep purple)
      'circle-color': [
        'step',
        ['to-number', ['get', 'emission_auto']],
        '#16c5b9',   // < 100  (good/ok)
        100, '#6C00FF' // ≥ 100 (bad but not red)
      ],

      // keep rich size variation
      'circle-radius': [
        'step',
        ['to-number', ['get', 'emission_auto']],
        2,
        100,   4,
        300,   8,
        600,  12,
        1300, 16,
        3500, 20
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.85
}
  });

  // Popup for LEFT (emissions)
  leftMap.on('click', 'points-layer', (e) => {
    const p = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    const num = v => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const fmt2 = v => num(v).toFixed(2);
    const fmt3 = v => num(v).toFixed(3);

    const html = `
      <div style="max-width:320px">
        <h3 style="margin:0 0 6px 0; font-size:14px; line-height:1.2; word-break:break-word;">
          ${p.source_name ?? ''}
        </h3>
        <p>Gas: ${p.gas} (Methane)</p>
        <p>Sector: Oil & Gas</p>
        <p>Plume Count: ${p.plume_count ?? '—'}</p>
        <p>Methane Emissions: ${fmt2(p.emission_auto)} kg/hr</p>
        <p>Uncertainty of Emissions: ±${fmt2(p.emission_uncertainty_auto)} kg/hr</p>
        <p>Published At (max): ${p.published_at_max ?? '—'}</p>
        <p>Published At (min): ${p.published_at_min ?? '—'}</p>
        <p>Timestamp (max): ${p.timestamp_max ?? '—'}</p>
        <p>Timestamp (min): ${p.timestamp_min ?? '—'}</p>
        <p>Persistence: ${fmt3(p.persistence)}</p>
      </div>
    `;
    new mapboxgl.Popup({ maxWidth: '360px' })
    .setLngLat(coordinates)
    .setHTML(html)
    .addTo(leftMap);
  });

// --- LEFT LEGEND ---
  const leftLegend = document.createElement('div');
  leftLegend.style.cssText = `
    position:absolute; right:12px; bottom:12px; z-index:1;
    background:rgba(255,255,255,.9); padding:8px 10px; border-radius:6px;
    font:12px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#222; box-shadow:0 0 6px rgba(0,0,0,.15);
  `;
  leftLegend.innerHTML = `
    <div style="font-weight:600; margin-bottom:6px;">Methane Emissions (kg/hr)</div>
    <div style="display:grid; grid-template-columns:auto 1fr; gap:4px 8px;">
      <span style="width:12px;height:12px;background:#16c5b9;border-radius:50%;display:inline-block"></span><span>&lt; 100</span>
      <span style="width:12px;height:12px;background:#6C00FF;border-radius:50%;display:inline-block"></span><span>&ge; 100 (Super Emitter)</span>
    </div>
  `;
  leftMap.getContainer().appendChild(leftLegend);
});

// ---- RIGHT: polygons (Total_Population) ----
rightMap.on('load', () => {
  rightMap.addSource('exposure-polys', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/Lauren356/Methane-Leaks-Map/refs/heads/main/data/Exposure_Race_ALL_US_states.geojson'
  });

  rightMap.addLayer({
    id: 'exposure-polys',
    type: 'fill',
    source: 'exposure-polys',
    paint: {
      'fill-color': [
        'step',
        ['to-number', ['get', 'Total_Population']],
        '#fff5eb',
        215.47, '#fdd0a2',
        949.89, '#fdae6b',
        2162.56, '#fd8d3c',
        3764.45, '#f16913',
        5713.55, '#d94801'
      ],
      'fill-opacity': 0.85,
      'fill-outline-color': '#000000'
    }
  });

  rightMap.on('click', 'exposure-polys', (e) => {
  const p = e.features?.[0]?.properties;
  if (!p) return;

  const { lng, lat } = e.lngLat;
  const num = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const fmt = v => num(v).toFixed(0); // round to 1 decimal
  const fmt2 = v => num(v).toFixed(2);

  const labels = [
    'White',
    'Black',
    'Native',
    'Asian',
    'Pacific Islander',
    'Other',
    'Hispanic or Latino'
  ];
  const data = [
    num(p.White),
    num(p.Black),
    num(p.Native),
    num(p.Asian),
    num(p.Pacific_Islander),
    num(p.Other),
    num(p.Hispanic_or_Latino)
  ];

  const canvasId = `bar-${Date.now()}`;
  const html = `
    <div style="width:480px; padding:10px;">
      <div><strong>Total Population Exposed to Methane Leak:</strong> ${fmt(p.Total_Population)}</div>
      <div><strong>Combined Methane Emissions:</strong> ${fmt2(p.combined_emissions)} kg/hr</div>
      <div style="margin-top:8px;">
        <canvas id="${canvasId}" width="460" height="260"></canvas>
      </div>
    </div>
  `;

  new mapboxgl.Popup({ maxWidth: '520px' })   // wider popup
    .setLngLat([lng, lat])
    .setHTML(html)
    .addTo(rightMap);

  requestAnimationFrame(() => {
    const el = document.getElementById(canvasId);
    if (!el) return;
    new Chart(el.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'People',
          data: data.map(v => Number(v.toFixed(0))), // ensure chart values rounded too
          backgroundColor: [
            '#fff5eb','#fee6ce','#fdd0a2','#fdae6b',
            '#fd8d3c','#f16913','#d94801'
          ]
        }]
      },
      options: {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { autoSkip: false, maxRotation: 35 } },
          y: { beginAtZero: true }
          }
        }
      });
    });
  });
  const rightLegend = document.createElement('div');
  rightLegend.style.cssText = `
    position:absolute; right:12px; bottom:12px; z-index:1;
    background:rgba(255,255,255,.9); padding:8px 10px; border-radius:6px;
    font:12px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#222; box-shadow:0 0 6px rgba(0,0,0,.15);
  `;
  rightLegend.innerHTML = `
    <div style="font-weight:600; margin-bottom:6px;">Total Population</div>
    <div style="display:grid; grid-template-columns:auto 1fr; gap:4px 8px;">
      <span style="width:14px;height:10px;background:#fff5eb;display:inline-block;border:1px solid #ccc"></span><span>&lt; 215</span>
      <span style="width:14px;height:10px;background:#fdd0a2;display:inline-block;border:1px solid #ccc"></span><span>215–950</span>
      <span style="width:14px;height:10px;background:#fdae6b;display:inline-block;border:1px solid #ccc"></span><span>950–2163</span>
      <span style="width:14px;height:10px;background:#fd8d3c;display:inline-block;border:1px solid #ccc"></span><span>2163–3764</span>
      <span style="width:14px;height:10px;background:#f16913;display:inline-block;border:1px solid #ccc"></span><span>3764–5714</span>
      <span style="width:14px;height:10px;background:#d94801;display:inline-block;border:1px solid #ccc"></span><span>&ge; 5714</span>
    </div>
  `;
  rightMap.getContainer().appendChild(rightLegend);




});