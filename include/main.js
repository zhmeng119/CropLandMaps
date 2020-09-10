mapboxgl.accessToken = 'pk.eyJ1IjoibWFwcGluZ2FmcmljYSIsImEiOiJjazh2emcxamQwNDJrM3ByemgybW5zN2c1In0.PLmPEbjp5KugFpdCcR-8YQ';

var bug;

var centersAOI = [
    [-1.95,10.27],[-0.98,10.23],[-0.36,10.40],[-2.21,9.13],
    [-1.10,9.07],[0.08,9.08],[-1.97,8.03],[-0.94,8.08],
    [0.086,8.05],[-2.21,7.01],[-1.02,7.07],[0.092,7.02],
    [-2.28,6.13],[-1.11,6.12],[0.16,6.14],[-1.82,5.32]
]

var path_CSV = "Tile_resource/aoi_tms_final.csv";
var identifyStatus = false;
var currentAOI = 0;
var currentVCT;
var curvctSourceID = [];
var curVCT_Instance;
var currstSourceID = [];
var csvOBJ;
var csvINFO;
var mapbrother;
var maptemp;
var hoverField = null;
var map;

// Source buckets
var curOSsourceID = [];
var curGSsourceID = [];
var curPsourceID = [];
var curOSFCCsourceID = [];
var curGSFCCsourceID = [];
// Layer buckets
var curOSlayerID = [];
var curGSlayerID = [];
var curPlayerID = [];
var curOSFCClayerID = [];
var curGSFCClayerID = [];


///////////////////////// Activities - Start //////////////////////////////
// Fire up the website
initial();
var overlay = document.getElementById('map-overlay');


///////////////////////// Activities - End //////////////////////////////


///////////////////////// Functions - Start //////////////////////////////

// Part - 1
// Create basemap
function addBasemap() {
    var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [-1.2, 9], // starting position [lng, lat]
    zoom: 10 // starting zoom
    });

    return map;
}

// Initiate the website
function initial(){
    map = addBasemap();
    // Add eventlistener
    $(".select").on("click",_selectAOI);
    _checkboxHandler();
    // Read tile url from local csv file 
    _readtileCSV(path_CSV);

}

// Count checkbox
function _countChecked() {
    var obj = $( "input:checked" );
    var n = obj.length;
    var text = n + (n === 1 ? " is" : " are") + " checked!" ;
    console.log(text);
    // console.log(obj.val())
};


// Top-Right UI Logic: Start 
function _selectAOI() {
    var obj = $( "option:selected" );
    var slctAOI = obj.val();

    // remove previous layer and add new layer
    if(slctAOI!=currentAOI){
        _removeVctLayer(currentAOI);
        _removeVctSource(currentAOI);
        _removeallRstLayer();
        _removeallRstSource();
        resetSelection();
        // console.log(slctAOI)
        currentAOI=slctAOI;
        _showOptions();
        // pan to current aoi
        map.panTo(centersAOI[slctAOI-1]);
        _addVctSource(slctAOI)
        _addVctLayer(slctAOI);

    }
}

// Display 
function _showOptions() {
    var obj = $(".check-bowl")
    obj[0].style.display="inline-block";
}

// Assign function to checkbox
function _checkboxHandler() {
    var obj = $( ".check-bowl" )
    // console.log(obj)
    var childs = obj.find("input")
    // console.log(childs)
    
    // assign function to onlick propertity of each checkbox
    for(var i=0, len=childs.length; i<len; i++){
        if(childs[i].type === "checkbox"){
            childs[i].onclick = updateLoading;
        }
    }

}

// Checkbox events
function updateLoading(e) {
    // console.log(this)
    var clickedOBJ = this.id;
    console.log(clickedOBJ)
    // load data based on the selection
    if(clickedOBJ=="fieldPoly") {
        if(currentVCT == 0){
            _addVctLayer(currentAOI)
        }else {
            _removeVctLayer(currentAOI)
        };
    }else if(clickedOBJ=="GS") {
        if(curGSlayerID.length == 0) {
            _addRstSource(currentAOI,clickedOBJ)
            _addRstLayer(currentAOI,clickedOBJ)
        }else {
            _removeRstLayer(clickedOBJ)
            _removeRstSource(clickedOBJ)
        };
    }else if(clickedOBJ=="OS") {
        if(curOSlayerID.length == 0) {
            _addRstSource(currentAOI,clickedOBJ)
            _addRstLayer(currentAOI,clickedOBJ)
        }else {
            _removeRstLayer(clickedOBJ)
            _removeRstSource(clickedOBJ)
        };
    }else if(clickedOBJ=="Prob") {
        if(curPlayerID.length == 0) {
            _addRstSource(currentAOI,clickedOBJ)
            _addRstLayer(currentAOI,clickedOBJ)
        }else {
            _removeRstLayer(clickedOBJ)
            _removeRstSource(clickedOBJ)
        };
    }else if(clickedOBJ=="GS-FCC") {
        if(curGSFCClayerID.length==0) {
            _addFCCRstSource(currentAOI,clickedOBJ)
            _addFCCRstLayer(currentAOI, clickedOBJ)
        }else {
            _removeFCCRstLayer(clickedOBJ)
            _removeFCCRstSource(clickedOBJ)
        };
    }else if(clickedOBJ=="OS-FCC") {
        if(curOSFCClayerID.length==0) {
            _addFCCRstSource(currentAOI,clickedOBJ)
            _addFCCRstLayer(currentAOI, clickedOBJ)
        }else {
            _removeFCCRstLayer(clickedOBJ)
            _removeFCCRstSource(clickedOBJ)
        };
    }else if(clickedOBJ=="Prob-CP") {
        if($('#'+clickedOBJ).prop("checked")) {
            console.log("ON")
            // make the div availabel
            $("#map-brother").removeClass("cpmap-reset")
            $("#map-brother").addClass("cpmap")
            var container = '#comparison-container';
            mapbrother = createbortherMap(map)
            maptemp = new mapboxgl.Compare(map, mapbrother, container, {
                // Set this to enable comparing two maps by mouse movement:
                // mousemove: true
            });
        }else {
            $("#map-brother").removeClass("cpmap")
            $("#map-brother").addClass("cpmap-reset")
            console.log('OFF')
            mapbrother.remove();
            maptemp.remove();

        }

    }
}

// Reset checkbox
function resetSelection() {
    $("#GS").prop("checked", false);
    $("#OS").prop("checked", false);
    $("#Prob").prop("checked", false);

}
// Top-Right UI Logic: End 


// Vector Data Management: Start
// Add vector layer with style
function _addVctLayer(aoi) {
    // add vct layer
    var source =  "aoi" + aoi + "-vct";
    var id_2 = "aoi" + aoi + "-vct-layer-viz";

    map.addLayer({
        'id':id_2,
        'type':'fill',
        'source':source,
        'paint': {
            'fill-outline-color': '#993300',
            'fill-color': '#993300',
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0.5
            ],
            // 'fill-antialias': false
        }
    });

    // auto check for Field Polygon
    $("#fieldPoly").prop("checked", true);
    // record the current vct layer
    currentVCT = aoi;
    // turn on the function identifyField()
    identifyStatus = true;
    identifyField(aoi, overlay);

}

// Remove vector layer
function _removeVctLayer(aoi) {
    if(aoi!=0 && currentVCT!=0){
        console.log("AOI"+aoi+" will be removed!!!")
        // var id_1 = "aoi" + aoi + "-vct-layer";
        var id_2 = "aoi" + aoi + "-vct-layer-viz";
        // map.removeLayer(id_1);
        map.removeLayer(id_2);
        currentVCT = 0 ;
    }else {
        console.log("There is no vector layer can be removed!!!")
    }

    // close the function identifyField()
    identifyStatus = false;
}

// Add vector source
function _addVctSource(aoi) {
    var source = "aoi" + aoi + "-vct";
    var data = "geojson_aoi/aoi" + aoi + "_boundarymerge.geojson"
    map.addSource(source, {
        'type': 'geojson',
        'data': data,
        'generateId': true
    })
    curvctSourceID.push(source);
}

// remove vector source
function _removeVctSource(aoi) {
    if(aoi!=0) {
        console.log("The source of AOI "+aoi+" will be removed!!!");
        map.removeSource(curvctSourceID[0]);
        curvctSourceID = [];
    }

}
// Vector Data Management: End


// Raster Data Management: Start
// Read in csv
function _readtileCSV(path) {
    d3.csv(path, function(err, data){
        // console.log(data)
        csvOBJ = data
        csvINFO = _extractINFO(data)

    });
}

// Reformat tile info from csv
function _extractINFO(data) {
    var temp = data[0].aoi
    var gs = []
    var os = []
    var prob = []
    var all = []

    for(var i=0; i<data.length; i++) {
        // console.log(data[i].aoi_sub)
        if(data[i].aoi == temp && i != data.length-1) {
            if(data[i].gs_tms_url != 'NA'){
                gs.push(data[i].gs_tms_url)
            };

            if(data[i].os_tms_url != 'NA'){
                os.push(data[i].os_tms_url)
            };

            if(data[i].prob_tms_url != ''){
                if(!prob.includes(data[i].prob_tms_url)){
                    prob.push(data[i].prob_tms_url)
                }
            };
            
        }else if(i == data.length){
            // push the last aoi sub group into csvINFO
            let obj = {
                aoi: temp,
                tiles:{
                    OS: os,
                    GS: gs,
                    Prob: prob
                }

            }
            all.push(obj);

        }else {
            let obj = {
                aoi: temp,
                tiles: {
                    OS: os,
                    GS: gs,
                    Prob: prob
                }
            }
            all.push(obj)

            // reset variables
            temp = data[i].aoi
            gs = []
            os = []
            prob = []
            if(data[i].gs_tms_url != 'NA'){
                gs.push(data[i].gs_tms_url)
            };

            if(data[i].os_tms_url != 'NA'){
                os.push(data[i].os_tms_url)
            };

            if(data[i].prob_tms_url != ''){
                prob.push(data[i].prob_tms_url)
            };
        }


    }

    return all;
}

// Add raster source
function _addRstSource(aoi, clickedfield) {
    var ind = aoi-1;
    if(clickedfield == 'OS') {
        for(var i=0; i<csvINFO[ind].tiles[clickedfield].length; i++) {
            var id = 'aoi'+ aoi + '-rst-' + clickedfield + '-' + i;
            map.addSource(id, {
                'type': 'raster',
                'tiles': [
                    csvINFO[ind].tiles[clickedfield][i]
                ],
                'tileSize': 256
            });
            curOSsourceID.push(id);
        };
    }else if(clickedfield == 'GS') {
        for(var i=0; i<csvINFO[ind].tiles[clickedfield].length; i++) {
            var id = 'aoi'+ aoi + '-rst-' + clickedfield + '-' + i;
            map.addSource(id, {
                'type': 'raster',
                'tiles': [
                    csvINFO[ind].tiles[clickedfield][i]
                ],
                'tileSize': 256
            });
            curGSsourceID.push(id);
        };
    }else if(clickedfield == 'Prob'){
        for(var i=0; i<csvINFO[ind].tiles[clickedfield].length; i++) {
            var id = 'aoi'+ aoi + '-rst-' + clickedfield + '-' + i;
            map.addSource(id, {
                'type': 'raster',
                'tiles': [
                    csvINFO[ind].tiles[clickedfield][i]
                ],
                'tileSize': 256
            });
            curPsourceID.push(id);
        };
    }
}

// Add FCC raster source
function _addFCCRstSource(aoi, clickedfield) {
    var ind = aoi-1;
    var option = "&redBand=3&blueBand=2&greenBand=1"
    if(clickedfield == 'OS-FCC') {
        for(var i=0; i<csvINFO[ind].tiles['OS'].length; i++) {
            var id = 'aoi'+ aoi + '-fccrst-' + clickedfield + '-' + i;
            map.addSource(id, {
                'type': 'raster',
                'tiles': [
                    csvINFO[ind].tiles['OS'][i] + option
                ],
                'tileSize': 256
            });
            curOSFCCsourceID.push(id);
        };
    }else if(clickedfield == 'GS-FCC') {
        for(var i=0; i<csvINFO[ind].tiles['GS'].length; i++) {
            var id = 'aoi'+ aoi + '-fccrst-' + clickedfield + '-' + i;
            map.addSource(id, {
                'type': 'raster',
                'tiles': [
                    csvINFO[ind].tiles['GS'][i] + option
                ],
                'tileSize': 256
            });
            curGSFCCsourceID.push(id);
        };
    }

}

// Remove raster source from the map
function _removeRstSource(clickedfield) {
    // clear the sources stored in curOSsourceID, curGSsourceID, curPsourceID
    if(clickedfield == 'OS') {
        removeSrc(curOSsourceID);
        curOSsourceID = [];
    }else if(clickedfield == 'GS') {
        removeSrc(curGSsourceID);
        curGSsourceID = [];
    }else if(clickedfield == 'Prob') {
        removeSrc(curPsourceID);
        curPsourceID = [];
    }

}

// Remove FCC raster source from the map
function _removeFCCRstSource(clickedfield) {
    // clear the sources stored in curOSsourceID, curGSsourceID, curPsourceID
    if(clickedfield == 'OS-FCC') {
        removeSrc(curOSFCCsourceID);
        curOSFCCsourceID = [];
    }else if(clickedfield == 'GS-FCC') {
        removeSrc(curGSFCCsourceID);
        curGSFCCsourceID = [];
    }

}

// Remove all raster source from the map
function _removeallRstSource() {
    removeSrc(curOSsourceID);
    removeSrc(curGSsourceID);
    removeSrc(curPsourceID);
    removeSrc(curOSFCCsourceID);
    removeSrc(curGSFCCsourceID);
    // reset record
    curOSsourceID = [];
    curGSsourceID = [];
    curPsourceID = [];
    curOSFCCsourceID = [];
    curGSFCCsourceID = [];
}

// Remove source
function removeSrc(x) {
    for(let i=0; i<x.length; i++) {
        map.removeSource(x[i]);
    };
}

// Add raster layers on the map
function _addRstLayer(aoi, clickedfield) {

    // Find the index of the first symbol layer in the map style
    var firstSymbolId = findcurVctViz()

    if(clickedfield == 'OS') {
        for(var i=0; i<curOSsourceID.length; i++) {
            var sourceID = curOSsourceID[i];
            var layerID = 'aoi'+ aoi + '-rst-' + clickedfield + '-' + i + '-layer';
            map.addLayer({
                'id': layerID,
                'type': 'raster',
                'source': sourceID,
                'layout': {
                    // make layer visible by default
                    'visibility': 'visible'
                    },
            },firstSymbolId);
            curOSlayerID.push(layerID);
        };
    }else if(clickedfield == 'GS') {
        for(var i=0; i<curGSsourceID.length; i++) {
            var sourceID = curGSsourceID[i];
            var layerID = 'aoi'+ aoi + '-rst-' + clickedfield + '-' + i + '-layer';
            map.addLayer({
                'id': layerID,
                'type': 'raster',
                'source': sourceID,
                'layout': {
                    // make layer visible by default
                    'visibility': 'visible'
                    },
            },firstSymbolId);
            curGSlayerID.push(layerID);
        };
    }else if(clickedfield == 'Prob') {
        for(var i=0; i<curPsourceID.length; i++) {
            var sourceID = curPsourceID[i];
            var layerID = 'aoi'+ aoi + '-rst-' + clickedfield + '-' + i + '-layer';
            map.addLayer({
                'id': layerID,
                'type': 'raster',
                'source': sourceID,
                'layout': {
                    // make layer visible by default
                    'visibility': 'visible'
                    },
            },firstSymbolId);
            curPlayerID.push(layerID);
        };
    }

    map.zoomTo(13);
}

// Add False Color Composite raster layers on the map
function _addFCCRstLayer(aoi, clickedfield) {

    // Find the index of the first symbol layer in the map style
    var firstSymbolId = findcurVctViz()

    if(clickedfield == 'OS-FCC') {
        for(var i=0; i<curOSFCCsourceID.length; i++) {
            var sourceID = curOSFCCsourceID[i];
            var layerID = 'aoi'+ aoi + '-fccrst-' + clickedfield + '-' + i + '-layer';
            map.addLayer({
                'id': layerID,
                'type': 'raster',
                'source': sourceID,
                'layout': {
                    // make layer visible by default
                    'visibility': 'visible'
                    },
            },firstSymbolId);
            curOSFCClayerID.push(layerID);
        };
    }else if(clickedfield == 'GS-FCC') {
        for(var i=0; i<curGSFCCsourceID.length; i++) {
            var sourceID = curGSFCCsourceID[i];
            var layerID = 'aoi'+ aoi + '-fccrst-' + clickedfield + '-' + i + '-layer';
            map.addLayer({
                'id': layerID,
                'type': 'raster',
                'source': sourceID,
                'layout': {
                    // make layer visible by default
                    'visibility': 'visible'
                    },
            },firstSymbolId);
            curGSFCClayerID.push(layerID);
        };
    }


    map.zoomTo(13);
}

// Remove raster layers from the map
function _removeRstLayer(clickedfield) {
    if(clickedfield == 'OS') {
        removeLyr(curOSlayerID)
        curOSlayerID = [];
    }else if(clickedfield == 'GS') {
        removeLyr(curGSlayerID)
        curGSlayerID = [];
    }else if(clickedfield == 'Prob') {
        removeLyr(curPlayerID)
        curPlayerID = [];
    };
}

// Remove False Color Composite raster layers from the map
function _removeFCCRstLayer(clickedfield) {
    if(clickedfield == 'OS-FCC') {
        removeLyr(curOSFCClayerID)
        curOSFCClayerID = [];
    }else if(clickedfield == 'GS-FCC') {
        removeLyr(curGSFCClayerID)
        curGSFCClayerID = [];
    }

}

// Remove all raster layers from the map
function _removeallRstLayer() {
    removeLyr(curOSlayerID)
    removeLyr(curGSlayerID)
    removeLyr(curPlayerID)
    removeLyr(curOSFCClayerID)
    removeLyr(curGSFCClayerID)
    // turn off the slider
    $('#OS-FCC').prop("checked", false)
    $('#GS-FCC').prop("checked", false)
    // reset record
    curOSlayerID = [];
    curGSlayerID = [];
    curPlayerID = [];
    curOSFCClayerID = [];
    curGSFCClayerID = [];
}

// Remove layers from the given list
function removeLyr(x) {
    for(let i=0; i<x.length; i++) {
        map.removeLayer(x[i]);
    };
}

// Raster Data Management: End


// Part - 2
// Identify function for fields
function identifyField(aoi, overlay){
    var vizID = "aoi" + aoi + "-vct-layer-viz";
    var vctSource =  "aoi" + aoi + "-vct";
    map.on('mousemove', vizID, function(e) {
        // activate field identification when aoi layer is turned on
        if(identifyStatus==true){

            // Part a: polygon info
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';
            
            // Single out the first found feature.
            var feature = e.features[0];
            // console.log(e.features)
            // bug = feature;
            
            // Render found features in an overlay.
            overlay.innerHTML = '';

            var title = document.createElement('strong');
            title.textContent =
            'Properties:';

            var field = document.createElement('div');
            field.textContent =
            'Field ID: ' +
            // feature.properties.id;
            feature.id;

            var tile = document.createElement('div');
            tile.textContent =
            'Tile ID: ' +
            feature.properties.tile;

            overlay.appendChild(title);
            overlay.appendChild(field);
            overlay.appendChild(tile);
            overlay.style.display = 'block';
            
            // Part b: highlight effect
            if (e.features.length > 0) {
                if (hoverField) {
                        map.removeFeatureState(
                            { source: vctSource, id: hoverField }
                        );
                }

                // hoverField = e.features[0].properties.id;
                hoverField = e.features[0].id;

                map.setFeatureState(
                    { source: vctSource, id: hoverField },
                    { hover: true }
                );
            }
        }
        
    });
    map.on('mouseleave', vizID, function() {
        map.getCanvas().style.cursor = '';
        // popup.remove();
        overlay.style.display = 'none';

        // reset highlight effect
        if (hoverField) {
            map.setFeatureState(
                { source: vctSource, id: hoverField },
                { hover: false }
            );
        }
        hoverField = null;
    });
}

// Create a new map for comparison
function createbortherMap(map) {
    var brothermap = new mapboxgl.Map({
        container: 'map-brother', // container id
        style: 'mapbox://styles/mapbox/satellite-streets-v11', // stylesheet location
        center: map.getCenter(), // starting position [lng, lat]
        zoom: map.getZoom() // starting zoom
        });
    // console.log("current map center: ", map.getCenter())

    return brothermap;
}

// Find the index of the visuallized vctor layer in the map style
function findcurVctViz() {
    var layers = map.getStyle().layers;
    var firstSymbolId = "";
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].id === curvctSourceID+"-layer-viz") {
            firstSymbolId = layers[i].id;
            break;
        }
    }
    if(firstSymbolId) {
        console.log("firstSymbolId: ", firstSymbolId)
    }else {
        console.log("No AOI-VIZ, add layer as you want.")
    }


    return firstSymbolId
}

///////////////////////// Functions - End //////////////////////////////