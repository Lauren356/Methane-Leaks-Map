mapboxgl.accessToken = 'pk.eyJ1IjoibGF1cmVuMTMiLCJhIjoiY21oanFyNjYzMWJ1MzJxcTN0NmJrY3docCJ9.Ow6JUEnq9DDndoAwu9p3Zw';

const map = new mapboxgl.Map({
  container: 'map', // this is the container ID that we set in the HTML
  style: 'mapbox://styles/lauren13/cmhtzpuag00cr01sse6fc3c66', // Your Style URL goes here
  center: [-122.27, 37.8], // starting position [lng, lat]. Note that lat must be set between -90 and 90. You can choose what you'd like.
  zoom: 9 // starting zoom, again you can choose the level you'd like.
    });