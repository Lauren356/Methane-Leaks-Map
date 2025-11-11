mapboxgl.accessToken = 'pk.eyJ1IjoibGF1cmVuMTMiLCJhIjoiY21oanFyNjYzMWJ1MzJxcTN0NmJrY3docCJ9.Ow6JUEnq9DDndoAwu9p3Zw';
// ---- Replace this with your short-lived token (better: proxy it server-side) ----
const CM_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzNDM2OTgyLCJpYXQiOjE3NjI4MzIxODIsImp0aSI6IjEyNjJkZjNlMGJhZjQ0YzViY2Y3ZmM2NWM0YjRhNmM2Iiwic2NvcGUiOiJzdGFjIGNhdGFsb2c6cmVhZCIsImdyb3VwcyI6IlB1YmxpYyIsImFsbF9ncm91cF9uYW1lcyI6eyJjb21tb24iOlsiUHVibGljIl19LCJvcmdhbml6YXRpb25zIjoiIiwic2V0dGluZ3MiOnt9LCJpc19zdGFmZiI6ZmFsc2UsImlzX3N1cGVydXNlciI6ZmFsc2UsInVzZXJfaWQiOjIxOTZ9.detUM3qPLthAZgB9V6tsHinmiuXqwe7ZWRWVn5w-FcQ";

const map = new mapboxgl.Map({
  container: 'map', // this is the container ID that we set in the HTML
  style: 'mapbox://styles/lauren13/cmhtzpuag00cr01sse6fc3c66', // Your Style URL goes here
  center: [-122.27, 37.8], // starting position [lng, lat]. Note that lat must be set between -90 and 90. You can choose what you'd like.
  zoom: 9 // starting zoom, again you can choose the level you'd like.
    });


    map.on("load", async () => {
  try {
    // 1) Fetch with Authorization header
    const resp = await fetch("https://api.carbonmapper.org/api/v1/catalog/sources.geojson", {
      headers: { Authorization: `Bearer ${CM_API_TOKEN}` }
    });
    if (!resp.ok) throw new Error(`Carbon Mapper API error: ${resp.status} ${resp.statusText}`);

    const geojson = await resp.json();

    // 2) (Client-side) Filter for Oil & Gas (1B2) and CH4
    //    (You can also skip this and use a Mapbox layer filter instead—see below.)
    const filtered = {
      type: "FeatureCollection",
      features: geojson.features.filter(f =>
        f?.properties?.sector === "1B2" && f?.properties?.gas === "CH4"
      )
    };

    // 3) Add as a GeoJSON source (must be WGS84 coordinates)
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: filtered
    });

    // 4) Add a circle layer (you can also add a layer filter instead of pre-filtering)
    map.addLayer({
      id: LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      // If you DIDN'T pre-filter above, uncomment the filter below:
      // filter: ["all",
      //   ["==", ["get", "sector"], "1B2"],
      //   ["==", ["get", "gas"], "CH4"]
      // ],
      paint: {
        "circle-color": "#4264FB",
        "circle-radius": 6,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff"
      }
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load Carbon Mapper data. See console for details.");
  }
});
