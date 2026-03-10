//WELCOME SCREEN
document.getElementById('hideButton').addEventListener('click', function() {
    var overlay = document.getElementById('welcome-overlay');
    overlay.classList.add('hidden');

    // After the fade-out effect completes, set display to none
    overlay.addEventListener('transitionend', function() {
        overlay.style.display = 'none';
    }, { once: true }); // Ensures the event listener is called only once
});

//MEnu sidebar
function clickedMenu(){
    if(myMenu==1){
        document.getElementById('myMenu').style.width="0%"
        return myMenu=0;
    }else{
        document.getElementById('myMenu').style.width="100%"
        return myMenu=1;
  }
};

  function changeImage(image) {
      let displayImage = document.getElementById('btn')
      if(displayImage.src.match('icons/menu.svg')){
          displayImage.src = 'icons/closemenu.svg'
      }else {
          displayImage.src = 'icons/menu.svg'
      }
}

// Loads the 3d modesl
function loadScript(src) {
    const script = document.createElement("script");
    script.src = src;
    document.body.prepend(script);
}

//Map Boundaries sa camalig heritage zone
const bounds = [
    [123.6512380, 13.1784505], // Southwest coordinates
    [123.6602559, 13.1845864] // Northeast coordinates
];

//MAP
const map = (window.map = new maplibregl.Map({
    container: 'map',
    zoom: 17,
    center: [123.655755, 13.181266],
    pitch: 60,
    bearing: 0,
    hash: true,
    style: 'https://tiles.openfreemap.org/styles/bright',
    maxZoom: 19,
    maxBounds: bounds, // Sets bounds as max
    attributionControl: false,
}));

function rotateCamera(timestamp) {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((timestamp / 100) % 360, {duration: 0});
    // Request the next frame of the animation.
    requestAnimationFrame(rotateCamera);
}

//MAP LOAD
map.on('load', () => {

    //HERITAGE ZONE TILESET
    map.addSource('heritage-zone', {
        type: 'raster',
        tiles: [
            'https://api.maptiler.com/tiles/e81e9577-2d84-47b2-950f-024cd913175c/{z}/{x}/{y}.png?key=OsbXNA3CCOF24WC77qI4'
        ],
        tileSize: 256
    });

    map.addLayer({
        id: 'heritage-zone-layer',
        type: 'raster',
        source: 'heritage-zone',
        paint: {
            'raster-opacity': 0.55
        }
    });

    //LOAD 3D MODELS 
    loadScript("script.js");

});

// Map Navigation Buttons
map.addControl(
    new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
    }),
);









