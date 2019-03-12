/* Stylesheet by Anna E. George, 2019 */

// Leaflet Quickstart Guide
// Returns map object and sets view by coordinates and zoom level
var mymap = L.map('mymap').setView([51.505, -0.09], 13);

// Adds tile layer from Mapbox Streets to map object
//Sets max zoom and attribution
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiYW5uYWVnZW9yZ2UiLCJhIjoiY2pzZGk2YmRrMDgxZTQzbWZ2eWFoZXhqMSJ9.0pJS7HuJDVB-NPZchNHr8w'
}).addTo(mymap);


// Adds a marker to the map
var marker = L.marker([51.5, -0.09]).addTo(mymap);

// Ads a circle to map
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

// Adds polygon to map
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

// Attaches pop up to marker that opens when page loads
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

// Attaches clickable popups to circle and polygon
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// Adds a popup as a layer
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap); // Handles automatic close of previiously opened pop up when opening new one


    // Defines popup variable
    var popup = L.popup();

    // Creates a function that adds a popup with lat and long coordinates
    // based on where user clicks on map
    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(mymap);
    }
    // Runs popup map click function
    mymap.on('click', onMapClick);


    // Using GeoJSON with Leaflet

    // Defines variable as simple GeoJSON feature
    var geojsonFeature = {
        "type": "Feature",
        "properties": {
            "name": "Coors Field",
            "amenity": "Baseball Stadium",
            "popupContent": "This is where the Rockies play!"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-104.99404, 39.75621]
        }
    };

    // Add GeoJSON Feature to map
    L.geoJSON(geojsonFeature).addTo(mymap);

    // Creates empty GeoJSON layer and assigns to variable
    var myLayer = L.geoJSON().addTo(mymap);
    myLayer.addData(geojsonFeature);

    // style options
    // Adds GeoJSON object as an array & assigns to variable
    var myLines = [{
        "type": "LineString",
        "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
    }, {
        "type": "LineString",
        "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
    }];

    // Sets style of GeoJSON object
    var myStyle = {
        "color": "#ff7800",
        "weight": 5,
        "opacity": 0.65
    };

    // Adds styled GeoJSON object to map object
    L.geoJSON(myLines, {
        style: myStyle
    }).addTo(mymap);

    // Sets variable equal to GeoJSON features
    var states = [{
        "type": "Feature",
        "properties": {"party": "Republican"},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-104.05, 48.99],
                [-97.22,  48.98],
                [-96.58,  45.94],
                [-104.03, 45.94],
                [-104.05, 48.99]
            ]]
        }
    }, {
        "type": "Feature",
        "properties": {"party": "Democrat"},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-109.05, 41.00],
                [-102.06, 40.99],
                [-102.03, 36.99],
                [-109.04, 36.99],
                [-109.05, 41.00]
            ]]
        }
    }];

    // Styles policial party GeoJSON features
    L.geoJSON(states, {
        style: function(feature) {
            switch (feature.properties.party) {
                case 'Republican': return {color: "#ff0000"};
                case 'Democrat':   return {color: "#0000ff"};
            }
        }
    }).addTo(mymap);

    //pointToLayer
    // Sets style for GeoJSON point markers
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // Creates layer feature from GeoJSON points
    // So that you can style markers
    L.geoJSON(someGeojsonFeature, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(mymap);

    //onEachFeature
    // Gets called on each feature before adding to GeoJSON myLayer
    // Commonly used to attach popup to features when clicked
    function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    }

    // Creates GeoJSON features and assigns them to variable
    var geojsonFeature = {
        "type": "Feature",
        "properties": {
            "name": "Coors Field",
            "amenity": "Baseball Stadium",
            "popupContent": "This is where the Rockies play!"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-104.99404, 39.75621]
        }
    };

    // Calls function onEachFeature
    L.geoJSON(geojsonFeature, {
        onEachFeature: onEachFeature
    }).addTo(mymap);

    // filter
    // Used to control visibility of GeoJSON features
    // Creates GeoJSON features and assigns to variable
    var someFeatures = [{
        "type": "Feature",
        "properties": {
            "name": "Coors Field",
            "show_on_map": true
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-104.99404, 39.75621]
        }
    }, {
        "type": "Feature",
        "properties": {
            "name": "Busch Field",
            "show_on_map": false
        },
        "geometry": {
            "type": "Point",
            "coordinates": [-104.98404, 39.74621]
        }
    }];

    // Filters one feature from map
    L.geoJSON(someFeatures, {
        filter: function(feature, layer) {
            return feature.properties.show_on_map;
        }
    }).addTo(mymap);
