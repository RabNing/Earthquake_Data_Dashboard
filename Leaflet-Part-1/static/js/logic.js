// Store our API endpoint inside queryUrl
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function popUpMsg(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
  // Pick color for the dots by depth of the earthquake
  function getColor(d) {
    return d > 90 ? '#d73027' :
           d > 70 ? '#fc8d59' :
           d > 50 ? '#fee08b' :
           d > 30 ? '#ffffbf' :
           d > 10 ? '#d9ef8b' :
           d > -10 ? '#91cf60' :
                     '#1a9850';
  }

// Part 1: Set up map layers
// Define streetmap and darkmap layers
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 18
});

// Define a baseMaps object to hold our base layers
let baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo
};
  
// Create our map, giving it the streetmap and earthquakes layers to display on load
let myMap = L.map("map", {
    center: [ 37.09, -95.71 ],
    zoom: 5,
    layers: [streetmap]     //default selected layer
    });

// create layer; will attach data later on
let earthquakes = new L.LayerGroup();

// Create overlay object to hold our overlay layer
let overlayMaps = {
  Earthquakes: earthquakes
};

// Create a layer control
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Part 2: Add ed data to the map
// Perform a GET request to the query URL
d3.json(url).then(function(data) {

// Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  // console.log(data.features);

// Create a GeoJSON layer containing the features array on the earthquakeData object 
function createFeatures() {
  
  L.geoJSON(data, {
    // Run the onEachFeature function once for each piece of data in the array
    onEachFeature: popUpMsg,
    // Run the pointToLayer function to create circles
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
        radius: feature.properties.mag*5, 
        fillOpacity: 0.85
      });
    },  
    style: function(feature) {
      return {
        color: getColor(feature.geometry.coordinates[2])
      };
    },
  // Attach data to eq layer
  }).addTo(earthquakes);
}
// Add overlay layer to myMap
earthquakes.addTo(myMap);
})

//Part 3: Create a legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10,10,30,50,70,90];
      
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

// Add legend to the map
legend.addTo(myMap);