/* Stylesheet by Anna E. George, 2019 */

//function to initiate Leaflet map
function createMap(){
    //creates map & set center/zoom
    var map = L.map('mapid', {
        center: [50, -80],
        zoom: 3.8
    });

    //add OSM base tilelayer w/attribution
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    //call getData function
    getData(map);
};

//Puts map on webpage
$(document).ready(createMap);

// Function to create popups
function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>Site ID:</b> " + properties.DatasetID + "</p>";
    //add formatted attribute to panel content string
    var year = attribute.substring(2);
    //Creates spruce data content string
    popupContent += "<p><b>Spruce Percent:</b> " + Math.floor(properties[attribute]*100) / 100 + "%</p>";

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

//function to calculate the radius of each proportional symbol
function calcPropRadius(attribute) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 30;
    //area based on attribute value and scale factor
    var area = attribute * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    // radius returned
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
//1. Create slider widget
// Create new sequence controls function
function createSequenceControls(map, attributes){
  // sets SequenceControl variable
  var SequenceControl = L.Control.extend({
      options: {
          position: 'bottomleft' //control panel position
      },
      onAdd: function (map) {
                  // create the control container div with a particular class name
                  var container = L.DomUtil.create('div', 'sequence-control-container');
                  //create range input element (slider)
                  $(container).append('<input class="range-slider" type="range">');

                  // Create skip buttons
                  $(container).append('<button class="skip" id="reverse">Reverse</button>');
                  $(container).append('<button class="skip" id="forward">Skip</button>');

                  //disable any mouse event listeners for the container
                  L.DomEvent.disableClickPropagation(container);
                  return container;
              }
          });
  // Adds control to map
  map.addControl(new SequenceControl());
  //set slider attributes
  $('.range-slider').attr({
      max: 29,
      min: 0,
      value: 0,
      step: 1
    });
    // Adds forward/backward button images
    $('#reverse').html('<img src="img/back.png">');
    $('#forward').html('<img src="img/next.png">');

    //Creates click listener for buttons
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

      //update slider
      $('.range-slider').val(index);

      //pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
    });

  //input listener for slider
  $('.range-slider').on('input', function(){
      //get the new index value
      var index = $(this).val();
      //pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
  });

};

// Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        // If the feature exists
        if (layer.feature){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // Calls popup and update legend functions
            createPopup(props, attribute, layer, radius);
            updateLegend(map, attribute);
        };
    });
};

// Function to create an array of the sequential attributes
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with spruce values
        if (attribute.indexOf("yr") > -1){
            attributes.push(attribute);
        };
    };
    // return attributes as object
    return attributes;
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;
    // Sets function to retrieve data from each layer
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

// function to create the legend
function createLegend(map, attributes, attribute){
    // Creates legend control variable
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright' // sets position on screen
        },
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">');

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            //variable for circle names and positions
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
            // return container as object
            return container;
        }
    });
    // adds to map
    map.addControl(new LegendControl());
    // calls update legend function
    updateLegend(map, attributes[0]);
};

//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.substring(2);
    var content = ("Spruce " + year + " years ago").bold().fontsize(3);
    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

    // for loop through mean, max, min circle values
    for (var key in circleValues){
      //get the radius
      var radius = calcPropRadius(circleValues[key]);

      // assign the cy and r attributes
      $('#'+key).attr({
        cy: 59 - radius,
        r: radius
      });

      // add legend text
      $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + "%");
};
};

// Function to create title box
function createTitleBox(map){
    //sets TitleControl variable
    var TitleControl = L.Control.extend({
        options: {
            position: 'topright' //position on screen
        },
        // adds to map
        onAdd: function (map) {
            // create container with a class name
            var container = L.DomUtil.create('div', 'title-control-container');

            //add title legend div to container
            $(container).append('<div id="title-legend">')

            //legend dimensions
            var svg = '<svg id="title-legend" width="80px" height="15px">';
            // Legend content
            var titlecontent = ("Where did the trees go?<\p>").bold().fontsize(4);
            var explanation = ("Spruce trees have moved a lot since the last Ice Age!<br> Click the forward button to move through time and see <br> how the spruce pollen percentage changes.<br>");
            var buttonatt = ("Buttons: Next and Back by Kumar from the Noun Project").italics().fontsize(1);

            //replace legend content
            $(container).append(titlecontent);
            $(container).append(explanation);
            $(container).append(buttonatt)
            //add attribute legend svg to container
            $(container).append(svg);
            // returns container as object
            return container;
        }
    });
    // adds new variable to map
    map.addControl(new TitleControl());
};

// Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/NeotomaLeaflet.geojson", {
        dataType: "json",
        success: function(response){

          //create an attributes array
          var attributes = processData(response);
          //call followning functions
          createPropSymbols(response, map, attributes);
          createSequenceControls(map, attributes);
          createLegend(map,attributes);
          updateLegend(map, attributes[0]);
          createTitleBox(map);
        }
    });
};
