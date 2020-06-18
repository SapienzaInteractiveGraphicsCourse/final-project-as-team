import * as THREE from './three.js-master/build/three.module.js';
import {PointerLockControls} from './three.js-master/examples/jsm/controls/PointerLockControls.js';
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import {MTLLoader} from './three.js-master/examples/jsm/loaders/MTLLoader.js';
import {OBJLoader} from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import {OBJLoader2} from './three.js-master/examples/jsm/loaders/OBJLoader2.js';
import {MtlObjBridge} from './three.js-master/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';
//import {AnimateRobot} from './robot-animations.js';
//import {KillingRobot} from './robot.js';
import {SkeletonUtils} from './three.js-master/examples/jsm/utils/SkeletonUtils.js';
import {Hero} from './main-char.js';
import {AnimateHero} from './main-char-animations.js';
import {Bullet} from './bullets.js';

var camera, scene, renderer;
var geometry, material, mesh;
let mainChar, mainCharCamera, heroAnimation;
var controls;
var objects = [];
var step = 1;

// Add event listener for pressing the keys on the keyboard
let keyboard = {};
// Object of mouse key codes
let mouse = {};

var loadingManager = null;

// Add bullet array
let bulletsArray = [];
// Shooting interval (interval between one shot and the next)
let shootingInterval = 0;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

//var mtlLoader = new MTLLoader();
//var objLoader = new OBJLoader2();

// Configure the Physijs physic engine scripts
Physijs.scripts.worker = './js/physijs/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';


// https://www.html5rocks.com/en/tutorials/pointerlock/intro/
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
    var element = document.body;
    var pointerlockchange = function ( event ) {
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            controlsEnabled = true;
            controls.enabled = true;
            blocker.style.display = 'none';
        } else {
            controls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
        }
    };
    var pointerlockerror = function ( event ) {
        instructions.style.display = '';
    };
    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
    instructions.addEventListener( 'click', function ( event ) {
        instructions.style.display = 'none';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        if ( /Firefox/i.test( navigator.userAgent ) ) {
            var fullscreenchange = function ( event ) {
                if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                    document.removeEventListener( 'fullscreenchange', fullscreenchange );
                    document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                    element.requestPointerLock();
                }
            };
            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
            element.requestFullscreen();
        } else {
            element.requestPointerLock();
        }
    }, false );
} else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

const manager = new THREE.LoadingManager();
manager.onLoad = init;

const progressbarElem = document.querySelector('#progressbar');
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
};

const models = {
  /*1: {
      obj: "./js/models/platform/tech_pedestal.obj",
      mtl: "./js/models/platform/tech_pedestal.mtl",
      x: -10,
      y: 0,
      z: -10,
      size1: 1,
      size2: 1,
      size3: 1,
      mesh: null,
      nameMesh: "scene",
      internal: false
  },*/

  1: {
      obj: "./js/models/Kameri lunar colony/Kameri lunar colony.obj",
      mtl: "./js/models/Kameri lunar colony/Kameri_lunar_colony.mtl",
      x: 0,
      y: 140,
      z: 500,
      size1: 1,
      size2: 1,
      size3: 1,
      rotation1: 0,
      rotation2: Math.PI/2,
      rotation3: 0,
      mesh: null,
      nameMesh: "Kameri_lunar_colony",
      internal: false
  },
  
  2: {
    obj: "./js/models/Organodron City/Organodron City.obj",
    mtl: "./js/models/Organodron City/Organodron_City.mtl",
    x: 1500,
    y: 0,
    z: 600,
    size1: 9,
    size2: 9,
    size3: 9,
    rotation1: 0,
    rotation2: 0,
    rotation3: 0,
    mesh: null,
    nameMesh: "buildingCorridorOpen",
    internal: false
  },
  3: {
    obj: "./js/models/Scifi Floating City/Scifi Floating City.obj",
    mtl: "./js/models/Scifi Floating City/Scifi_Floating_City.mtl",
    x: 1500,
    y: -55,
    z: 600,
    size1: 9,
    size2: 9,
    size3: 9,
    rotation1: 0,
    rotation2: -Math.PI/2,
    rotation3: 0,
    mesh: null,
    nameMesh: "buildingCorridorOpen",
    internal: false
  },

  /*4: {
    obj: "./js/models/tunnel/tunnel-obj.obj",
    mtl: "./js/models/tunnel/tunnel-obj.mtl",
    x: -40,
    y: 0,
    z: -50,
    size1: 3,
    size2: 3,
    size3: 3,
    mesh: null,
    nameMesh: "itemWeapon",
    internal: false
  },

  5: {
    obj: "./js/models/space-kit/stairsLong.obj",
    mtl: "./js/models/space-kit/stairsLong.mtl",
    mesh: null,
    x: -50,
    y: 0,
    z: -60,
    size1: 1,
    size2: 1,
    size3: 1,
    nameMesh: "stairsLong",
    internal: false
  },

  6: {
    obj: "./js/models/space-kit/pipeStand.obj",
    mtl: "./js/models/space-kit/pipeStand.mtl",
    x: -60,
    y: 0,
    z: -70,
    size1: 2,
    size2: 2,
    size3: 2,
    mesh: null,
    nameMesh: "pipeStand",
    internal: false
  },

  7: {
    obj: "./js/models/marsCapsule/Mars Lander Space Capsule.obj",
    mtl: "./js/models/marsCapsule/Mars_Lander_Space_Capsule.mtl",
    x: -70,
    y: 0,
    z: -80,
    size1: 1,
    size2: 1,
    size3: 1,
    mesh: null,
    nameMesh: "Mars_Lander_Space_Capsule",
    internal: false
  },

  8: {
    obj: "./js/models/vot/VoT_PatrikRoy_b03_sketchfab.obj",
    mtl: "./js/models/vot/VoT_PatrikRoy_b03_sketchfab.mtl",
    x: 10,
    y: -64,
    z: 10,
    size1: 10,
    size2: 10,
    size3: 10,
    mesh: null,
    nameMesh: "VoT_PatrikRoy_b03_sketchfab",
    internal: false
  },

  9: {
    obj: "./js/models/relay/source/VoT_PatrikRoy_b02_sketchfab.obj",
    mtl: "./js/models/relay/source/VoT_PatrikRoy_b02_sketchfab.mtl",
    x: 6000,
    y: 0,
    z: 1000,
    size1: 100,
    size2: 100,
    size3: 100,
    mesh: null,
    nameMesh: "relay",
    internal: false
  },

  10: {
    obj: "./js/models/bigPharma/source/VoT_PatrikRoy_b04_sketchfab.obj",
    mtl: "./js/models/bigPharma/source/VoT_PatrikRoy_b04_sketchfab.mtl",
    x: -200,
    y: 0,
    z: 200,
    size1: 10,
    size2: 10,
    size3: 10,
    mesh: null,
    nameMesh: "bigPharma",
    internal: false
  },


  11: {
    obj: "./js/models/space-kit/spaceCraft1.obj",
    mtl: "./js/models/space-kit/spaceCraft1.mtl",
    x: 140,
    y: 0,
    z: 160,
    size1: 10,
    size2: 10,
    size3: 10,
    mesh: null,
    nameMesh: "spaceCraft1",
    internal: false
  },

  12: {
    obj: "./js/models/martian/city colony.obj",
    mtl: "./js/models/martian/city_colony.mtl",
    x: 500,
    y: 0,
    z: 500,
    size1: 2,
    size2: 2,
    size3: 2,
    mesh: null,
    nameMesh: "city_colon",
    internal: false
  },

  13: {
    obj: "./js/models/space-kit/stationLarge.obj",
    mtl: "./js/models/space-kit/stationLarge.mtl",
    x: -400,
    y: 0,
    z: -400,
    size1: 50,
    size2: 50,
    size3: 50,
    mesh: null,
    nameMesh: "stationLarge",
    internal: false
  },

  14: {
    obj: "./js/models/space-kit/portal.obj",
    mtl: "./js/models/space-kit/portal.mtl",
    x: -400,
    y: 0,
    z: 400,
    size1: 20,
    size2: 20,
    size3: 20,
    mesh: null,
    nameMesh: "portal",
    internal: false
  },*/
}

init();

var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var rotation = new THREE.Vector3();
var isWalking = false;

var cam;

function init() {

  // hide the loading bar
  const loadingElem = document.querySelector('#loading');
  loadingElem.style.display = 'none';

  scene = new Physijs.Scene();
  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set( 0.5, 1, 0.75 );
  scene.add(light);

  // Create a DirectionalLight and turn on shadows for the light
  var light2 = new THREE.DirectionalLight( 0xffffff, 1, 100 );
  light2.position.set(-5, 10, 20); 			//default; light shining from top
  light2.castShadow = true;            // default false
  scene.add( light2 );

  // Set up shadow properties for the light
  light2.shadow.mapSize.width = 512;  // default
  light2.shadow.mapSize.height = 512; // default
  light2.shadow.camera.near = 0.5;    // default
  light2.shadow.camera.far = 500;     // default

  // Init the main character
  mainChar = new Hero();
  mainChar.castShadow = true;
  mainChar.receiveShadow = true;
  mainCharCamera = mainChar.getObjectByName("heroCamera");
  
  scene.add(mainChar);


  // Use the pointer to rotate the main char
  controls = new PointerLockControls(mainChar);
  scene.add(controls.getObject());

  // Instantiate the class for animations
  heroAnimation = new AnimateHero(mainChar);

  // Create floor and add texture
  const planeSize = 6000;

  const loader = new THREE.TextureLoader();
  const texture = loader.load('js/bg_images/sabbia2.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
  shininess: 0,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Create skybox effect with cube
  {

  const path = "js/bg_images/"
  const ls = [
  	"arid2_ft.jpg",
  	"arid2_bk.jpg",
  	"arid2_up.jpg",
  	"arid2_dn.jpg",
  	"arid2_rt.jpg",
  	"arid2_lf.jpg",

  ].map(x => path + x)

  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load(ls);
  scene.background = texture;

  }

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  document.body.appendChild( renderer.domElement );

  //loadLandscapeModels();

  {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(models[3].mtl, (mtlParseResult) => {
    const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
    for (const material of Object.values(materials)) {
      material.side = THREE.DoubleSide;
    }
    const objLoader = new OBJLoader2();
    objLoader.addMaterials(materials);
    objLoader.load(models[3].obj, (root) => {
      root.position.set(models[3].x, models[3].y, models[3].z);
      root.scale.set(models[3].size1, models[3].size2, models[3].size3);
      root.rotation.x = models[3].rotation1;
      root.rotation.y = models[3].rotation2;
      root.rotation.z = models[3].rotation3;
      scene.add(root);
    });
  });
  }

  {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(models[2].mtl, (mtlParseResult) => {
    const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
    for (const material of Object.values(materials)) {
      material.side = THREE.DoubleSide;
    }
    const objLoader = new OBJLoader2();
    objLoader.addMaterials(materials);
    objLoader.load(models[2].obj, (root) => {
      root.position.set(models[2].x, models[2].y, models[2].z);
      root.scale.set(models[2].size1, models[2].size2, models[2].size3);
      root.rotation.x = models[2].rotation1;
      root.rotation.y = models[2].rotation2;
      root.rotation.z = models[2].rotation3;
      scene.add(root);
    });
  });
  }

  {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(models[1].mtl, (mtlParseResult) => {
    const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
    for (const material of Object.values(materials)) {
      material.side = THREE.DoubleSide;
    }
    const objLoader = new OBJLoader2();
    objLoader.addMaterials(materials);
    objLoader.load(models[1].obj, (root) => {
      root.position.set(models[1].x, models[1].y, models[1].z);
      root.scale.set(models[1].size1, models[1].size2, models[1].size3);
      root.rotation.x = models[1].rotation1;
      root.rotation.y = models[1].rotation2;
      root.rotation.z = models[1].rotation3;
      scene.add(root);
    });
  });
  }

  

  

  // Listener for resize
  window.addEventListener( 'resize', onWindowResize, false );

  animate();
}

// load models and set position/size
function loadLandscapeModels() {  
  for (var key in models) {          
          const mtlLoader = new MTLLoader();
          mtlLoader.load(models[key].mtl, (mtlParseResult) => {
          const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
          for (const material of Object.values(materials)) {
            material.side = THREE.DoubleSide;
          }
          const objLoader = new OBJLoader2();
          objLoader.addMaterials(materials);
          objLoader.load(models[key].obj, (root) => {
            root.position.set(models[key].x, models[key].y, models[key].z);
            root.scale.set(models[key].size1, models[key].size2, models[key].size3);
            root.rotation.x = models[key].rotation1;
            root.rotation.y = models[key].rotation2;
            root.rotation.z = models[key].rotation3;
            console.log(root);
            
            scene.add(root);
          });
        });
  }
}


function onWindowResize() {
    mainCharCamera.aspect = window.innerWidth / window.innerHeight;
    mainCharCamera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// Functions for click listener
/**
 * Function to handle the click of the mouse
 * @param  {object} event The event triggered by the click
 * @return {void}         The function simply assign that value to the mouse obj
 */
function mouseDown(event){
  mouse[event.button] = true;
}

/**
 * Function to handle the un-click of the mouse
 * @param  {object} event The event triggered by the click
 * @return {void}         The function simply assign that value to the mouse obj
 */
function mouseUp(event){
  mouse[event.button] = false;
}

// Listeners
window.addEventListener('mousedown', mouseDown);
window.addEventListener('mouseup', mouseUp);

// Thanks to https://www.youtube.com/watch?v=UUilwGxIj_Q
/**
 * Function to handle the click on a key
 * @param  {object} event The event triggered by the click
 * @return {void}         The function simply assign that value to the keyboad obj
 */
function keyDown(event){
  keyboard[event.keyCode] = true;
}
/**
 * Function to handle the un-click on a key
 * @param  {object} event The event triggered by the click
 * @return {void}         The function simply assign that value to the keyboad obj
 */
function keyUp(event){
  keyboard[event.keyCode] = false;
}


// Listeners
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

function animate() {
    // Start with the reload animation, initially this is done once.
    heroAnimation.reload();

    if(controlsEnabled){
      var time = performance.now();
      var delta = ( time - prevTime ) / 1000;
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 100.0 * delta;

      // R - for reload the gun
      if(keyboard[82]){
        // If the reload flag is false
        if(!heroAnimation.reloadFlag){
          heroAnimation.reloadFlag = true;
        }
      }
      // If W or Up are pressed
      if(keyboard[87] || keyboard[38]){
        velocity.z -= 10000.0 * delta;
        isWalking = true;
      }
      // If S or Down are pressed
      if(keyboard[83] || keyboard[40]){
        velocity.z += 400.0 * delta;
        isWalking = true;
      }
      // If A or Left are pressed
      if(keyboard[65] || keyboard[37]){
        velocity.x -= 400.0 * delta;
        isWalking = true;
      }
      // If D or Right are pressed
      if(keyboard[68] || keyboard[39]){
         velocity.x += 400.0 * delta;
         isWalking = true;
      }
      velocity.y = Math.max( 0, velocity.y );
      controls.getObject().translateX( velocity.x * delta );
      controls.getObject().translateY( velocity.y * delta );
      controls.getObject().translateZ( velocity.z * delta );

      if (controls.getObject().position.y < 10 ) {
          velocity.y = 0;
          controls.getObject().position.y = 10;
      }
      prevTime = time;
  }

  if (isWalking) mainChar.position.y = 10;
  

  // If the WASD is pressed, the walking animation is triggered
  if(keyboard[87] || keyboard[65] || keyboard[83] || keyboard[68]){
    heroAnimation.walking();  
  }
  // If UpDownLeftRight is pressed, the walking animation is triggered
  if(keyboard[38] || keyboard[40] || keyboard[37] || keyboard[39]){
    heroAnimation.walking();
  }

  // Activate the target mode if we right-click once
  if(keyboard[16]){
    heroAnimation.activateTargetMode = true;
  }
  else{
    heroAnimation.activateTargetMode = false;
  }

  heroAnimation.targetMode();
  heroAnimation.returnFromTargetMode();

  // We need a separate if condition, otherwise the shooting animation
  // will go ten frames slower.
  if(mouse[0]){ // Left-click of the mouse
    heroAnimation.shooting();
  }

  // Here the bullets will go
  if(mouse[0] && shootingInterval <= 0){ // Left-click of the mouse
    // Create the bullet
    let bullet = new Bullet(controls);
    bullet.alive = true;

    setTimeout(function () {
      bullet.alive = false;
      scene.remove(bullet);
    }, 1000);

    // Add the bullet to the scene and to the bullets array and
    // then set the shootingInterval to 10, meaning that every 10
    // frames there will be another bullet.
  	bulletsArray.push(bullet);
  	scene.add(bullet);
  	shootingInterval = 10;
  }

  if(shootingInterval > 0) shootingInterval -=1;

  // go through bullets array and update position
  // remove bullets when appropriate
  for(var index=0; index<bulletsArray.length; index+=1){
      if( bulletsArray[index] === undefined ) continue;
      if( bulletsArray[index].alive == false ){
          bulletsArray.splice(index,1);
          continue;
      }
      bulletsArray[index].position.add(bulletsArray[index].velocity);
  }

  renderer.render(scene, mainCharCamera);

  requestAnimationFrame(animate);

	TWEEN.update();
}
