
//MODELS ON MAP

// Adding the 3d models
  function create3DModelLayer(id, modelOrigin, modelPath) {
    let modelRotate = [Math.PI / 2, 0, 0];
    let modelScale = 1;

    return {
        id: id,
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
            this.camera = new THREE.PerspectiveCamera();
            this.scene = new THREE.Scene();

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambientLight);

            const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight1.position.set(1, 1, 1);
            this.scene.add(directionalLight1);

            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight2.position.set(-1, 1, 1);
            this.scene.add(directionalLight2);

            const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.4);
            directionalLight3.position.set(0, -1, 1);
            this.scene.add(directionalLight3);

           //ground reflection light
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
            hemiLight.position.set(0, 1, 0);
            this.scene.add(hemiLight);

            // Load the model
            const loader = new THREE.GLTFLoader();
            loader.load(
                modelPath,
                (gltf) => {
                    this.model = gltf.scene;
                
                    this.model.traverse((child) => {
                        if (child.isMesh) {
                            
                            child.material.needsUpdate = true;
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            if (child.material) {
                                child.material.roughness = 0.7;
                                child.material.metalness = 0.3;
                            }
                        }
                    });
                    
                    this.scene.add(this.model);
                },
                undefined,
                (error) => {
                    console.error(error);
                }
            );

            this.map = map;

            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });

            this.renderer.autoClear = false;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.physicallyCorrectLights = true;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
        },
        render: function (gl, matrix) {
            const terrainElevation = this.map.queryTerrainElevation(modelOrigin, { exaggerated: true }) || 0;

            const mercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(
                modelOrigin,
                terrainElevation
            );

            const rotationX = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(1, 0, 0),
                modelRotate[0]
            );
            const rotationY = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 1, 0),
                modelRotate[1]
            );
            const rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                modelRotate[2]
            );

            const m = new THREE.Matrix4().fromArray(matrix);
            const l = new THREE.Matrix4()
                .makeTranslation(
                    mercatorCoordinate.x,
                    mercatorCoordinate.y,
                    mercatorCoordinate.z
                )
                .scale(
                    new THREE.Vector3(
                        mercatorCoordinate.meterInMercatorCoordinateUnits(),
                        -mercatorCoordinate.meterInMercatorCoordinateUnits(),
                        mercatorCoordinate.meterInMercatorCoordinateUnits()
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);
            
            // Update lights to follow camera
            if (this.model) {
                const cameraPosition = new THREE.Vector3();
                cameraPosition.setFromMatrixPosition(this.camera.matrixWorld);
                this.scene.traverse((object) => {
                    if (object.isDirectionalLight) {
                        object.position.copy(cameraPosition);
                    }
                });
            }

            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };
  }

// 3D Model Layers
const customLayer1 = create3DModelLayer('3d-model-1', [123.654800, 13.182250], 'models/Parish/Parish.glb');
const customLayer2 = create3DModelLayer('3d-model-2', [123.65569, 13.18209], 'models/Municipal/MunicipalHall.glb');
const customLayer3 = create3DModelLayer('3d-model-3', [123.656253, 13.180231], 'models/Nuyda/Nuyda.glb');
const customLayer4 = create3DModelLayer('3d-model-4', [123.656015, 13.182045], 'models/Melba Moyo/MelbaMoyo.glb');
const customLayer5 = create3DModelLayer('3d-model-5', [123.656327, 13.182555], 'models/Gonzales/Gonzales.glb');
const customLayer6 = create3DModelLayer('3d-model-6', [123.65534, 13.18119], 'models/Rizal/Rizal.glb');

// Add models to map
function addCustomLayers() {
  if (!map.getLayer('3d-model-1')) map.addLayer(customLayer1);
  if (!map.getLayer('3d-model-2')) map.addLayer(customLayer2);
  if (!map.getLayer('3d-model-3')) map.addLayer(customLayer3);
  if (!map.getLayer('3d-model-4')) map.addLayer(customLayer4);
  if (!map.getLayer('3d-model-5')) map.addLayer(customLayer5);
  if (!map.getLayer('3d-model-6')) map.addLayer(customLayer6);
}
map.on('style.load', () => {
  addCustomLayers();
});

map.on('idle', () => {
  addCustomLayers();
});

function ensureLayersLoaded() {
  if (map.loaded()) {
    addCustomLayers();
  } else {
    setTimeout(ensureLayersLoaded, 100); 
  }
}
ensureLayersLoaded();


// OnClick Map and Menu Interactions
const THRESHOLD = 20;

const mapModels = [
  {
    id: 'menuCMG1',
    origin: [123.65485509515524, 13.182299451890474],
    name: 'St. John The Baptist Church',
    modelPath: 'models/Parish/Parish_HQ.glb',        // Low poly version
    modelPathHQ: 'models/Parish/Parish_HQ.glb',   // Should be the High quality version(500mb~1GB) but im having a hard time uploading it *anyhelp?                                                      
    description: 'Evangelization of Camalig began with  the Augustinian Fray Alonso de Jimenez in 1569 but it was 10 years later that it was founded as a Franciscan Parish. A stone church was built from 1605 but this was destroyed when the town was buried in the 1814 Mayon eruption. After transferring to Tondol, Quilaponte and Baligang, the residents returned to the old townsite in 1837 and rebuilt their church. This present church was finished in 1848. The design of St. John the Baptist Church is a hybrid of Renaissance and Gothic with a little touch of Romanesque. <br> <br> The National Historical Commision of the Philippines through NHCP Board of Directors declaring Camalig Church (St. John the Baptist Church) as heritage structure recognizing the church historical significance and cultural value. In December 2016, the National Museum declared Camalig Church as one of the significant structures of the Philippines under the category of Important Cultural Property.',  
    interact: (map) => {
      map.flyTo({
        center: [123.65485509515524, 13.182299451890474],
        zoom: 18,
        speed: 0.7
      });
      map.once('moveend', () => {
        showModelViewer('St. John The Baptist Church');
      });
    }
  },
  {
    id: 'menuCMG2',
    origin: [123.65569, 13.18209],
    name: 'Camalig Municipal Hall',
    modelPath: 'models/Municipal/MunicipalHall.glb',
    modelPathHQ: 'models/Municipal/MunicipalHall.glb',
    description: 'The Camalig Municipal Hall, a significant heritage asset, stands as a symbol of the town’s rich history and cultural heritage. This iconic structure, with its colonial architecture, serves as the administrative center of Camalig, Albay. It plays a crucial role in local governance while also acting as a focal point for the town’s economic activities, reflecting the dynamic blend of tradition and progress. As the heart of Camalig\’s businesses, the Municipal Hall is both a historical landmark and a hub for the town\’s civic and commercial life.',
    interact: (map) => {
      map.flyTo({
        center: [123.65569, 13.18209],
        zoom: 20,
        speed: 0.7
      });
      map.once('moveend', () => {
        showModelViewer('Camalig Municipal Hall');
      });
    }
  },
  {
    id: 'menuCMG3',
    origin: [123.656253, 13.180231],
    name: 'Nuyda Ancestral House',
    modelPath: 'models/Nuyda/Nuyda.glb',
    modelPathHQ: 'models/Nuyda/Nuyda_HQ.glb',
    description: 'The Nuyda House was built in the 19th century by Doroteo Iglesia Moya Jr., who was mayor (capitan municipal) of Camalig from 1877 to 1878. The Nuydas are a family affiliated through Moya\'s nephew Marcos Obligacion, who took a Nuyda wife. The house is built in the Geometric Style of bahay na bato and can be entered through a uniquely designed porch stone that corresponds to the gililan of traditional Filipino pile houses or bahay kubo. <br> <br> It is also an exemplary showcase of the diamond-patterned concha(shell-paned sliding windows), a design said to originate from Bicol. The Nuyda House was the former resident of Albay Second District\'s first congressman Justino Nuyda, a renowed politician',
    interact: (map) => {
      map.flyTo({
        center: [123.656253, 13.180231],
        zoom: 20,
        speed: 0.7
      });
      map.once('moveend', () => {
        showModelViewer('Nuyda Ancestral House');
      });
    }
  },
  {
    id: 'menuCMG4',
    origin: [123.656145, 13.182045],
    name: 'Melba Moyo Ancestral House',
    modelPath: 'models/Melba Moyo/MelbaMoyo_HQ.glb',
    modelPathHQ: 'models/Melba Moyo/MelbaMoyo_HQ.glb',
    description: 'Built in 1932, the Melba Moyo House was first owned by Barbara Nieves Moyo and bequeathed to her son, Teodoro Moyo. After the latter\'s death, the house was managed by his wife, its Melba Grageda Moyo. It is said to have been used as a shelter for high-ranking Japanese officials during the Japanese period in Camalig. Its exterior is marked by decorated woden panels (bandejo) which surround its capiz-shell widows',
    interact: (map) => {
      map.flyTo({
        center: [123.656145, 13.182045],
        zoom: 20,
        speed: 0.7
      });
      map.once('moveend', () => {
        showModelViewer('Melba Moyo Ancestral House');
      });
    }
  },
  {
    id: 'menuCMG5',
    origin: [123.656327, 13.182555],
    name: 'Gonzales Ancestral House',
    modelPath: 'models/Gonzales/Gonzales.glb',
    modelPathHQ: 'models/Gonzales/Gonzales.glb',
    description: 'Designed in the Floral Style of Bahay na bato, the Gonzales House presently owned by Niniveth Gonzales was built in 1920. Its exterior features include a wrap-around transom (espejo) of capiz-shell panels (concha) alternating with louvered panels (persiana), a wrap-around awning (media-agua) supported by ornate iron braces, and decorative panels (bandejado) flanking its windows. The continous application of transom is a feature it shares with the Manalang-Gloria House in Tabaco and bahay na bato houses of Ermita and San Miguel in Manila. Compared with the Spanish period houses in Albay, it has a narrower window opening.',
    interact: (map) => {
      map.flyTo({
        center: [123.656327, 13.182555],
        zoom: 20,
        speed: 0.7
      });
      map.once('moveend', () => {
        showModelViewer('Gonzales Ancestral House');
      });
    }
  },
  {
    id: 'menuCMG6',
    origin: [123.65534, 13.18119],
    name: 'Rizal Monument',
    modelPath: 'models/Rizal/Rizal_HQ.glb',
    modelPathHQ: 'models/Rizal/Rizal_HQ.glb',
    description: 'On 28 September 1901, the Philippine Commission passed Act No. 243, authorizing the construction of a National Monument for Filipino patriot and reformist, Jose Rizal (June 19, 1861–December 30, 1896). This marker unveiled by the Most Worshipful Grand Lodge of Free and Accepted Masons of the Philippines in April 25, 2015 by MW Tomas G. Rentoy III, Grand Master of Masons, with the assistance of Mayon Lodge No. 61 under the leadership of WB Jerome Co Lee, Worshipful Master and Bagong Buhay Lodge No. 17 under the leadership WB Henry N. Nagano, Worshipful Master.',
    interact: (map) => {
      map.flyTo({
        center: [123.65534, 13.18119],
        zoom: 20,
        speed: 0.7
      });
      map.once('moveend', () => {
        showModelViewer('Rizal Monument');
      });
    }
  }
];



// model viewer
function showModelViewer(modelName) {
  const model = mapModels.find(m => m.name === modelName);
  if (!model) return;

  const modelViewerContainer = document.getElementById('model-viewer-container');
  hideModelInfo();
  
  modelViewerContainer.innerHTML = `
    <model-viewer
      src="${model.modelPathHQ}"
      alt="${model.name} 3D model"
      camera-controls
      disable-tap
      min-camera-orbit="-Infinity 90deg 50%"
      max-camera-orbit="Infinity 90deg 100%"
      camera-orbit="0deg 90deg 70%"
      camera-target="0m 0m 0m"
      environment-image="neutral"
      shadow-intensity="1"
      shadow-softness="0.5"
      exposure="0.7"
      style="--poster-color: #ffffff00;"
    ></model-viewer>
    <div id="model-description" class="model-description">
      <h2>${model.name}</h2>
      <p>${model.description}</p>
    </div>
    <div id="close-button-container">
      <img src="icons/map.svg" id="close-button" class="close-button" alt="Close" />
    </div>
  `;
  modelViewerContainer.style.display = 'flex';
  modelViewerContainer.style.opacity = '0';
  
  // Fade in epekz
  setTimeout(() => {
    modelViewerContainer.style.opacity = '1';
    modelViewerContainer.style.transition = 'opacity 0.5s ease-in-out';
  }, 100);

  const modelViewer = modelViewerContainer.querySelector('model-viewer');

  // Set up custom lighting
  modelViewer.addEventListener('load', () => {
    const scene = modelViewer.model.scene;
    
    scene.traverse((child) => {
      if (child.isLight) {
        scene.remove(child);
      }
    });

    //Ilaw ng Tahanan
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Center the model
    const box = new THREE.Box3().setFromObject(modelViewer.model);
    const center = box.getCenter(new THREE.Vector3());
    modelViewer.cameraTarget = `${center.x}m ${center.y}m ${center.z}m`;
    
    // Optimize performance
    modelViewer.maxPixelRatio = 1;
  });

  //Pause Map render sa twing may viewer
  map.stop();

  document.getElementById('close-button').addEventListener('click', () => {
    // Fade out
    modelViewerContainer.style.opacity = '0';
    setTimeout(() => {
      modelViewerContainer.style.display = 'none';

      // Resume map rendering
      map.start();
    }, 500);
  });
}

function hideModelInfo() {
  const modelInfoDiv = document.getElementById('model-info');
  modelInfoDiv.classList.remove('show');
  modelInfoDiv.classList.add('hide');
}




// Calculates for the the distance of the cursor
function distanceToPoint(origin, point) {
  return turf.distance(turf.point(origin), turf.point([point.lng, point.lat]), {units: 'meters'});
}

// Initializes the click interactions
function handleModelInteraction(point, isMapClick = false) {
  for (const model of mapModels) {
    if (isMapClick) {
      if (distanceToPoint(model.origin, point) < THRESHOLD) {
        model.interact(map);
        return true;
      }
    } else if (point === model.id) {
      model.interact(map);
      toggleMenu();
      return true;
    }
  }
  return false;
}

// Event Handlers
function onMapClick(e) {
  handleModelInteraction(e.lngLat, true);
}

const modelInfoDiv = document.getElementById('model-info');
const modelNameDiv = document.getElementById('model-name');

// Updates the onMouseMove function
function onMouseMove(e) {
    let isNearModel = false;
    const modelViewerContainer = document.getElementById('model-viewer-container');

    // Check if model viewer is currently displayed
    if (modelViewerContainer.style.display === 'flex') {
      return; // Exit the function if model viewer is open
  }

    for (const model of mapModels) {
        const distance = distanceToPoint(model.origin, e.lngLat);
        if (distance < THRESHOLD) {
            // Show the div with the model's name
            modelNameDiv.textContent = model.name;
            
            if (!modelInfoDiv.classList.contains('show')) {
                modelInfoDiv.classList.remove('hide'); // Remove 'hide' class if present
                modelInfoDiv.classList.add('show');    // Add 'show' class for fade-in
            }

            isNearModel = true;
            break;
        }
    }

    // If not near any model, fade-out the div
    if (!isNearModel && modelInfoDiv.classList.contains('show')) {
        modelInfoDiv.classList.remove('show');   // Remove 'show' class
        modelInfoDiv.classList.add('hide');      // Add 'hide' class for fade-out
    }

    // Update cursor style
    map.getCanvas().style.cursor = isNearModel ? 'pointer' : '';
}

// Menu Functions
function toggleMenu() {
  const menuButton = document.getElementById('btn');
  if (menuButton) {
    menuButton.click();
  }
}

// Setup the events
function setupMapEvents() {
  map.on('click', onMapClick);
  map.on('mousemove', onMouseMove);
}

function setupMenuEvents() {
  mapModels.forEach(model => {
    const element = document.getElementById(model.id);
    if (element) {
      element.addEventListener('click', () => handleModelInteraction(model.id));
    }
  });
}

setupMapEvents();
setupMenuEvents();