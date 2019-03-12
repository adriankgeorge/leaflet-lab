/* Stylesheet by Anna E. George, 2019 */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [50, -80],
        zoom: 3.5
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    //call getData function
    getData(map);
};


$(document).ready(createMap);



//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 10;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map){

  //Determine which attribute to visualize with proportional symbols
  var attribute = "yr250";

    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#228B22",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
          //Step 5: For each feature, determine its value for the selected attribute
          var attValue = Number(feature.properties["yr250 "]);

          //Step 6: Give each feature's circle marker a radius based on its attribute value
          geojsonMarkerOptions.radius = calcPropRadius(attValue);

          //examine the attribute value to check that it is correct
          console.log(feature.properties, attValue);

            // Create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/NeotomaLeaflet.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};

// //function to retrieve the data and place it on the map
// function getData(map){
//
//   //load the data
//   $.ajax("data/NeotomaLeaflet.geojson", {
//       dataType: "json",
//       success: function(response){
//           //create marker options
//           var geojsonMarkerOptions = {
//               radius: 8,
//               fillColor: "#ff7800",
//               color: "#000",
//               weight: 1,
//               opacity: 1,
//               fillOpacity: 0.8
//           };
//
//           //create a Leaflet GeoJSON layer and add it to the map
//           L.geoJson(response, {
//               pointToLayer: function (feature, latlng){
//                   return L.circleMarker(latlng, geojsonMarkerOptions);
//               }
//           }).addTo(map);
//       }
//   });
//   //
//   // //Example 2.3 line 22...load the data
//   // $.ajax("data/NeotomaLeaflet.geojson", {
//   //     dataType: "json",
//   //     success: function(response){
//   //
//   //         //create a Leaflet GeoJSON layer and add it to the map
//   //         L.geoJson(response, {
//   //             //use filter function to only show cities with 2015 populations greater than 20 million
//   //             filter: function(feature, layer) {
//   //                 return feature.properties.yr250 > 20;
//   //             }
//   //         }).addTo(map);
//   //     }
//   // });
// };

// //added at Example 2.3 line 20...function to attach popups to each mapped feature
// function onEachFeature(feature, layer) {
//     //no property named popupContent; instead, create html string with all properties
//     var popupContent = "";
//     if (feature.properties) {
//         //loop to add feature property names and values to html string
//         for (var property in feature.properties){
//             popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
//         }
//         layer.bindPopup(popupContent);
//     };
// };

//
// //function to retrieve the data and place it on the map
// function getData(map){
//     //load the data
//     $.ajax("data/NeotomaLeaflet.geojson", {
//         dataType: "json",
//         success: function(response){
//
//             //create a Leaflet GeoJSON layer and add it to the map
//             L.geoJson(response, {
//                 onEachFeature: onEachFeature
//             }).addTo(map);
//         }
//     });
// };
