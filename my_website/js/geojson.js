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
function calcPropRadius(attribute) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 30;
    //area based on attribute value and scale factor
    var area = attribute * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Assign the current attribute based on the first index of the attributes array
    let attribute = attributes[0];
    //create marker options
    var options = {
        fillColor: "#228B22",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>Site ID:</b> " + feature.properties.DatasetID + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
      offset: new L.Point(0,-options.radius) // Offset popup from symbol
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};


//GOAL: Allow the user to sequence through the attributes and resymbolize the map
//   according to each attribute
//STEPS:
//1. Create slider widget
// Create new sequence controls
function createSequenceControls(map, attributes){

    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 29 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 29 : index;
      };

      //Step 8: update slider
      $('.range-slider').val(index);

      //Step 9: pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
    });

  //Step 5: input listener for slider
  $('.range-slider').on('input', function(){
      //Step 6: get the new index value
      var index = $(this).val();
      //Step 9: pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
  });

};

//set slider attributes
$('.range-slider').attr({
    max: 29,
    min: 0,
    value: 0,
    step: 1
});
//2. Create skip buttons
$('#panel').append('<button class="skip" id="reverse">Reverse</button>');
$('#panel').append('<button class="skip" id="forward">Skip</button>');
// Replace text with images on buttons
$('#reverse').html('<img src="img/back.png">');
$('#forward').html('<img src="img/next.png">');


//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>DatasetID:</b> " + props.DatasetID + "</p>";

            //add formatted attribute to panel content string
            var year = attribute[1];
            popupContent += "<p><b>Pollen Percentage in" + year + ":</b> " + props[attribute] + "%</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};

//3. Create an array of the sequential attributes to keep track of their order
// Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("yr") > -1){
            attributes.push(attribute);
        };
    };
    return attributes;
};

//5. Listen for user input via affordances

//6. For a forward step through the sequence, increment the attributes array index;
//   for a reverse step, decrement the attributes array index
//7. At either end of the sequence, return to the opposite end of the seqence on the next step
//   (wrap around)
//8. Update the slider position based on the new index
//9. Reassign the current attribute based on the new attributes array index
//10. Resize proportional symbols according to each feature's value for the new attribute



//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/NeotomaLeaflet.geojson", {
        dataType: "json",
        success: function(response){

          //create an attributes array
          var attributes = processData(response);
          //call functions to create proportional symbols and sequence controls
          createPropSymbols(response, map, attributes);
          createSequenceControls(map, attributes);
        }
    });
};
