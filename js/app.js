////////////// Map stuff

L.mapbox.accessToken = 'pk.eyJ1Ijoid2lsbC1icmVpdGtyZXV0eiIsImEiOiItMTJGWEF3In0.HEvuRMMVxBVR5-oDYvudxw';

var map = L.map('map')
  .setView([5, 20], 3);

//Streetmap base layer
var streetmap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
})

//Darkmatter base layer
var darkStreetmap =
L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map)

//Imagery base layer
var mapquestPhoto = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
maxZoom: 18,
subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});

var mapquestPhotoLabel = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
maxZoom: 18,
subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
maxZoom: 19,
subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);


var basemaps = {
	"Street Map":streetmap,
  "Darkmatter":darkStreetmap,
	"Aerial Photo":mapquestPhoto,
	"Aerial Photo with Streets":mapquestPhotoLabel
}

L.control.layers(basemaps).addTo(map);

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.5
};

var detailSwitch = document.getElementById('detailSwitch')
var tweetPoints = L.geoJson(null,  {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, geojsonMarkerOptions);
  },
  onEachFeature: function(feature, layer){
    layer.bindPopup(feature.properties.text);
    if(detailSwitch.checked){
      map.fitBounds(layer.getBounds())
      setTimeout(function(){layer.openPopup()},200)
    }
  },
  onAdd: function(map){
    map.fitBounds(this.getBounds());
    console.log('added one')
  }
}).addTo(map)

///////////// Search stuff

var submitButton = document.getElementById('submitBtn')
var clearButton = document.getElementById('clearBtn')
var searchBar = document.getElementById('searchBar')

var searchValue = ''
var tracked = []

submitButton.addEventListener('click', function(e){
  e.preventDefault()
  searchValue = searchBar.value
  if(searchValue !== ''){
    changeTrack(searchValue)
  }
})

clearButton.addEventListener('click', function(e){
  e.preventDefault()
  clearTrack()
})

searchBar.addEventListener('keyup', function(e){
  e.preventDefault()
  if(e.keyCode === 13){
    searchValue = searchBar.value
    if(searchValue !== ''){
      changeTrack(searchValue)
    }
  }
})

function changeTrack(value){
  clearButton.classList.remove('hidden')
  tweetSocket.emit('changeTrack',value.replace(/, /g,','))
}

function clearTrack(){
  searchValue = ''
  searchBar.value = ''
  tracked = []
  clearButton.classList.add('hidden')
  tweetPoints.clearLayers()
  tweetSocket.emit('clearTrack')
}

///////////////// Socket stuff
tracked = []

var tweetSocket = io.connect('http://localhost:3000');
tweetSocket.on('tweet', function (data) {

  if(data.coordinates && tracked.indexOf(data.text) === -1){
    tracked.push(data.text)

    var geoJson = {
        "type": "Feature",
        "properties": data,
        "geometry": data.coordinates
    };

    tweetPoints.addData(geoJson)

  }
});
