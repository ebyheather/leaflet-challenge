// Initialize the map
const map = L.map('map').setView([0, 0], 2);

// Add the base tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Function to get marker color based on depth
function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' :
                        '#1a9850';
}

// Function to style markers based on magnitude and depth
function styleMarker(feature) {
    const magnitude = feature.properties.mag;
    const depth = feature.geometry.coordinates[2];
    return {
        radius: magnitude * 2, // Scale radius by magnitude
        fillColor: getColor(depth), // Color by depth
        color: '#000', // Black outline
        weight: 1, // Border thickness
        opacity: 1,
        fillOpacity: 0.8,
    };
}

// Load the earthquake data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(data => {
    // Add GeoJSON layer to the map
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, styleMarker(feature)); // Use circle markers
        },
        onEachFeature: function (feature, layer) {
            // Add popup to each feature
            layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3>
                             <p>Depth: ${feature.geometry.coordinates[2]} km</p>
                             <p>Location: ${feature.properties.place}</p>`);
        }
    }).addTo(map);

    // Add legend to the map
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const depths = [0, 10, 30, 50, 70, 90];

        div.innerHTML += '<h4>Depth (km)</h4>';
        depths.forEach((depth, i) => {
            div.innerHTML += `
                <i style="background:${getColor(depth)}"></i>
                ${depth}${depths[i + 1] ? `&ndash;${depths[i + 1]}<br>` : '+'}`;
        });

        return div;
    };
    legend.addTo(map);
}).catch(err => console.error('Error loading GeoJSON data:', err));
