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

function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>Site ID:</b> " + properties.DatasetID + "</p>";
    //add formatted attribute to panel content string
    var year = attribute.substring(2);
    popupContent += "<p><b>Spruce Percent " + year + " years ago:</b> " + Math.floor(properties[attribute]*100) / 100 + "%</p>";

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

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

    // Calls popup function
    createPopup(feature.properties, attribute, layer, options.radius);

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
  var SequenceControl = L.Control.extend({
      options: {
          position: 'bottomleft'
      },
      onAdd: function (map) {
                  // create the control container div with a particular class name
                  var container = L.DomUtil.create('div', 'sequence-control-container');
                  //create range input element (slider)
                  $(container).append('<input class="range-slider" type="range">');
                  // ... initialize other DOM elements, add listeners, etc.

                  //2. Create skip buttons
                  $(container).append('<button class="skip" id="reverse">Reverse</button>');
                  $(container).append('<button class="skip" id="forward">Skip</button>');



                  //disable any mouse event listeners for the container
L.DomEvent        .disableClickPropagation(container);
                  return container;
              }
          });

          map.addControl(new SequenceControl());
          //set slider attributes
          $('.range-slider').attr({
              max: 29,
              min: 0,
              value: 0,
              step: 1
            });
            // Adds button images
            $('#reverse').html('<img src="img/back.png">');
            $('#forward').html('<img src="img/next.png">');
    //create range input element (slider)
    //$('#panel').append('<input class="range-slider" type="range">');
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

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // Calls popup function
            createPopup(props, attribute, layer, radius);
            updateLegend(map, attribute)
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


//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Example 2.7 line 1...function to create the legend
function createLegend(map, attributes, attribute){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">');

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            //array of circle names to base loop on
            var circles = {
              max: 20,
              mean: 40,
              min: 60
          };

            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#228B22" fill-opacity="0.8" stroke="#000000" cx="30"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
};

//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.substring(2);
    var content = ("Spruce " + year + " years ago").bold().fontsize(3);
    var titlecontent = ("Where do the trees go?").bold().fontsize(4);
    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    for (var key in circleValues){
      //get the radius
      var radius = calcPropRadius(circleValues[key]);

      //Step 3: assign the cy and r attributes
      $('#'+key).attr({
        cy: 59 - radius,
        r: radius
      });

      //Step 4: add legend text
      $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + "%");
};
};

function createTitleBox(map){
    var TitleControl = L.Control.extend({
        options: {
            position: 'topright'
        },

        onAdd: function (map) {
            // create container with a class name
            var container = L.DomUtil.create('div', 'title-control-container');

            //add title legend div to container
            $(container).append('<div id="title-legend">')

            //legend string
            var svg = '<svg id="attribute-legend" width="80px" height="15px">';

            var titlecontent = ("Where did the trees go?<\p>").bold().fontsize(4);
            var explanation = ("Spruce trees have moved a lot since the last Ice Age!<br> Click the forward button to move through time and see <br> how the spruce pollen percentage changes.")

            //replace legend content
            $(container).append(titlecontent);
            $(container).append(explanation);

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new TitleControl());
};




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
          createLegend(map,attributes);
          updateLegend(map, attributes[0]);
          createTitleBox(map);
        }
    });
};
