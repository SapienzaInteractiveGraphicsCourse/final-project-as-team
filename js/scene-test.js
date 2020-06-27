import * as THREE from './three.js-master/build/three.module.js';
import {PointerLockControls} from './three.js-master/examples/jsm/controls/PointerLockControls.js';
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import {MTLLoader} from './three.js-master/examples/jsm/loaders/MTLLoader.js';
import {OBJLoader} from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import {OBJLoader2} from './three.js-master/examples/jsm/loaders/OBJLoader2.js';
import {MtlObjBridge} from './three.js-master/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';
import {AnimateRobot} from './robot-animations.js';
import {KillingRobot} from './robot.js';
import {SkeletonUtils} from './three.js-master/examples/jsm/utils/SkeletonUtils.js';
import {Hero} from './main-char.js';
import {AnimateHero} from './main-char-animations.js';
import {Bullet} from './bullets.js';
import {SoundManager} from './sound-manager.js'

//retrieve difficulty level choosen in the menu page
const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

const level = urlParams.get('lvl')


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

// Instantiate the sound manager for the effects of the game
const soundManager = new SoundManager();
// Create the audio Listener
const listener = new THREE.AudioListener();
//list of collidable objects
var collidableMeshList = [];
// This object is used to understand in which direction the main char is going
var directionOfMovement = {w: 0, s: 0, r:0, l:0};
// These are flags to stop the movement of the main char
var stopW, stopS, stopR, stopL;
stopL = stopR = stopW = stopS = false;

var robotLife = 4;
//var mtlLoader = new MTLLoader();
//var objLoader = new OBJLoader2();

// Configure the Physijs physic engine scripts
//Physijs.scripts.worker = './js/physijs/physijs_worker.js';
//Physijs.scripts.ammo = './ammo.js';


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

const progressbarElem = document.querySelector('#progressbar');
const manager = new THREE.LoadingManager();

manager.onStart = function() {
  instructions.style.display = 'none';
}
manager.onLoad = function() {
  init();
  instructions.style.display = '';
}


manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
};

//models details for background
var models = {
  1: {
    obj: "./js/models/Organodron City/Organodron City.obj",
    mtl: "./js/models/Organodron City/Organodron_City.mtl",
    x: 2500,
    y: 200,
    z: 2500,
    size1: 9,
    size2: 9,
    size3: 9,
    rotation1: 0,
    rotation2: Math.PI,
    rotation3: 0,
    mesh: null,
    nameMesh: "buildingCorridorOpen",
    internal: false
  },
  2: {
    obj: "./js/models/Scifi Floating City/Scifi Floating City.obj",
    mtl: "./js/models/Scifi Floating City/Scifi_Floating_City.mtl",
    x: 0,
    y: -100,
    z: 600,
    size1: 9,
    size2: 9,
    size3: 9,
    rotation1: 0,
    rotation2: -Math.PI/2,
    rotation3: 0,
    mesh: null,
    nameMesh: "floating_city",
    internal: false
  },
  3: {
    obj: "./js/models/Center city Sci-Fi/Center city Sci-Fi.obj",
    mtl: "./js/models/Center city Sci-Fi/Center_city_Sci-Fi.mtl",
    x: -1700,
    y: 20,
    z: -250,
    size1: 4,
    size2: 4,
    size3: 4,
    rotation1: 0,
    rotation2: 70.4,
    rotation3: 0,
    mesh: null,
    nameMesh: "buil2",
    internal: false
  },
  /*4: {
    obj: "./js/models/debris/debris.obj",
    mtl: "",
    x: 300,
    y: 0,
    z: 300,
    size1: 0.3,
    size2: 0.3,
    size3: 0.3,
    rotation1: 0,
    rotation2: 0,
    rotation3: 0,
    mesh: null,
    nameMesh: "buil2",
    internal: false
  },*/
  4: {
    obj: "./js/models/barrier/road barrier.obj",
    mtl: "./js/models/barrier/road barrier.mtl",
    x: -2300,
    y: -1,
    z: 182,
    size1: 2,
    size2: 2,
    size3: 2,
    rotation1: 0,
    rotation2: 0,
    rotation3: 0,
    mesh: null,
    nameMesh: "buil2",
    internal: false
  },
  5: {
    obj: "./js/models/barrier/road barrier.obj",
    mtl: "./js/models/barrier/road barrier.mtl",
    x: -2300,
    y: -1,
    z: 130,
    size1: 2,
    size2: 2,
    size3: 2,
    rotation1: 0,
    rotation2: -0.0,
    rotation3: 0,
    mesh: null,
    nameMesh: "buil2",
    internal: false
  },
  6: {
    obj: "./js/models/barrier/road barrier.obj",
    mtl: "./js/models/barrier/road barrier.mtl",
    x: -2300,
    y: -1,
    z: 235,
    size1: 2,
    size2: 2,
    size3: 2,
    rotation1: 0,
    rotation2: 0,
    rotation3: 0,
    mesh: null,
    nameMesh: "buil2",
    internal: false
  },
  7: {
    obj: "./js/models/barrier/road barrier.obj",
    mtl: "./js/models/barrier/road barrier.mtl",
    x: -2300,
    y: -1,
    z: 287,
    size1: 2,
    size2: 2,
    size3: 2,
    rotation1: 0,
    rotation2: 0,
    rotation3: 0,
    mesh: null,
    nameMesh: "buil2",
    internal: false
  },
  8: {
    obj: "./js/models/barrier/road barrier.obj",
    mtl: "./js/models/barrier/road barrier.mtl",
    x: -2300,
    y: -1,
    z: 340,
    size1: 2,
    size2: 2,
    size3: 2,
    rotation1: 0,
    rotation2: 0,
    rotation3: 0,
    mesh: null,
    nameMesh: "buil2",
    internal: false
  },
}

  var models_gltf = {
    railing:    { url: './js/models/railing/scene.gltf' },
    railing2:    { url: './js/models/railing/scene.gltf' },
    railing3:    { url: './js/models/railing/scene.gltf' },
    railing4:    { url: './js/models/railing/scene.gltf' },
    railing5:    { url: './js/models/railing/scene.gltf' },
  };


  scene = new THREE.Scene();
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

  mainChar.rotation.y = Math.PI;
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
  mesh = new THREE.Mesh(planeGeo, planeMat);
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

  /*for (const model of Object.values(models_gltf)) {
    const gltfLoader = new GLTFLoader(manager);
    gltfLoader.load(model.url, (gltf) => {
      gltf.scene.position.set(100, 5, 0);
      gltf.scene.scale.set(10, 10, 10);
      scene.add(gltf.scene);
    });
  }*/

//load the models of the background (city, towers, ...)
var mtlLoader;
  var objLoader;
  for (var _key in models) {
      (function (key) {
          mtlLoader  = new MTLLoader(manager);
                mtlLoader.load(models[key].mtl, (mtlParseResult) => {

                var materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
                for (var material of Object.values(materials)) {
                  material.side = THREE.DoubleSide;
                }

                objLoader  = new OBJLoader2(manager);
                objLoader.addMaterials(materials);
                objLoader.load(models[key].obj, (root) => {
                  root.position.set(models[key].x, models[key].y, models[key].z);
                  root.scale.set(models[key].size1, models[key].size2, models[key].size3);
                  root.rotation.x = models[key].rotation1;
                  root.rotation.y = models[key].rotation2;
                  root.rotation.z = models[key].rotation3;

                  collidableMeshList.push(root);

                  scene.add(root);

                });
              });
      })(_key);
  }


  /*var cubeGeometry = new THREE.BoxGeometry(50, 50, 500 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
	var fakeMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent:true } );
  let box = new THREE.Mesh(
			cubeGeometry,
			fakeMaterial
		);
  box.geometry.computeBoundingBox();
  box.material.transparent = true;
  box.position.set(-2300, 0, 130);
  scene.add(box);
  collidableMeshList.push(box);*/



var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var rotation = new THREE.Vector3();
var isWalking = false;

//variable for robots spawn
var robotsAlive = 0;
var robotsArray = [];



function init() {

  // hide the loading bar
  const loadingElem = document.querySelector('#loading');
  loadingElem.style.display = 'none';


  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  document.body.appendChild( renderer.domElement );



  // Load all the sounds
  soundManager.loadSounds(listener);

  // Listener for resize
  window.addEventListener( 'resize', onWindowResize, false );

  animate();
}

//get random int number between min and max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// load models and set position/size
function loadModels() {

  var mtlLoader;
  var objLoader;
  for (var _key in models) {
      (function (key) {
          mtlLoader  = new MTLLoader();
                mtlLoader.load(models[key].mtl, (mtlParseResult) => {

                var materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
                for (var material of Object.values(materials)) {
                  material.side = THREE.DoubleSide;
                }

                objLoader  = new OBJLoader2();
                objLoader.addMaterials(materials);
                objLoader.load(models[key].obj, (root) => {
                  root.position.set(models[key].x, models[key].y, models[key].z);
                  root.scale.set(models[key].size1, models[key].size2, models[key].size3);
                  root.rotation.x = models[key].rotation1;
                  root.rotation.y = models[key].rotation2;
                  root.rotation.z = models[key].rotation3;

                  scene.add(root);

                });
              });
      })(_key);
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

//variable for setting framerate
var dt=1000/50;
var timeTarget=0;

var nToSpawn = 0;
var newSpawn = false;

function animate() {

  //limitate the framerate
  if(Date.now()>=timeTarget){

    //check the number of robots alive
    if(robotsArray.length == 0) newSpawn = true;
    if(nToSpawn == 7) {
      nToSpawn = 0;
      newSpawn = false;
    }

    //spawn the robots models
    if(newSpawn == true && nToSpawn <= 0) {
          var robot = new KillingRobot();
          robot.scale.set(3, 3, 3);
          var positionX = getRandomInt(50, 1000);
          var positionZ = getRandomInt(0, 1000);
          robot.position.set(positionX, 0, positionZ);
          robotsAlive += 1;
          robotsArray.push(robot);
          scene.add(robot);
          nToSpawn += 1;
    }

    //animate the robot (wheel, weapon and walking towards the mainChar)
    robotsArray.forEach((robot, i) => {
        new TWEEN.Tween(robot.position)
          .to({x: mainChar.position.x, z: mainChar.position.z}, 1500)
          .onUpdate(function (object) {
          robot.lookAt(mainChar.position.x, 0, mainChar.position.z);
          AnimateRobot(robot);

          })
          //.start()
    });

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
          // Play the reload sound
          soundManager.soundEffects["reload"].sound.context.resume().then(() => {
            soundManager.soundEffects["reload"].sound.play();
          });
        }
      }
  		// 	collision detection:
  		//  determines if any of the rays from the cube's origin to each vertex
  		//	intersects any face of a mesh in the array of target meshes
  		//  for increased collision accuracy, add more vertices to the cube;
  		//	for example, new THREE.CubeGeometry( 64, 64, 64, 8, 8, 8, wireMaterial )
  		//  HOWEVER: when the origin of the ray is within the target mesh, collisions do not occur
  		mainChar.updateMatrixWorld();
  		var cube = mainChar.getObjectByName("transparentBox");
  		var originPoint = new THREE.Vector3();
  		originPoint.setFromMatrixPosition(cube.matrixWorld);

  		for (var vertexIndex = 0; vertexIndex < cube.geometry.vertices.length; vertexIndex++){
  			var localVertex = cube.geometry.vertices[vertexIndex].clone();
  			var globalVertex = localVertex.applyMatrix4(cube.matrix);
  			var directionVector = globalVertex.sub(cube.position);

  			var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
  			var collisionResults = ray.intersectObjects(collidableMeshList);
  			if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
  				// We get the max of the directions both W/S direction and left/right direction
  				var maxUpDown = Math.max(directionOfMovement.w, directionOfMovement.s);
  				var maxRightLeft = Math.max(directionOfMovement.r, directionOfMovement.l);

  				// The max will tell in which direction the main char is moving and so which is the
  				// movement to stop. In this way if the main char is colliding in front by pressing W,
  				// he can go back by pressing S.
  				if(maxUpDown == directionOfMovement.w){
  					stopW = true;
  				}
  				else{
  					stopS = true;
  				}

  				if(maxRightLeft == directionOfMovement.r){
  					stopR = true;
  				}
  				else{
  					stopL = true;
  				}
  			} // End if collision detected
  			else{
  				stopL = stopR = stopW = stopS = false;
  			}
  		} // End for loop

  		// If W or Up are pressed
  		if((keyboard[87] || keyboard[38]) && !stopW){
  			velocity.z -= 2000.0 * delta;
  			directionOfMovement.w += 1;
  			isWalking = true;
  		}
  		// If S or Down are pressed
  		if((keyboard[83] || keyboard[40]) && !stopS){
  			velocity.z += 400.0 * delta;
  			directionOfMovement.s += 1;
  			isWalking = true;
  		}
  		// If A or Left are pressed
  		if((keyboard[65] || keyboard[37]) && !stopR){
  			velocity.x -= 400.0 * delta;
  			directionOfMovement.r += 1;
  			isWalking = true;
  		}
  		// If D or Right are pressed
  		if((keyboard[68] || keyboard[39]) && !stopL){
  			 velocity.x += 400.0 * delta;
  			 directionOfMovement.l += 1;
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
    collidableMeshList.push(bullet);

    if(robotsArray[0].position.distanceTo(bullet.position) < 1){
      robotLife -=1;
      console.log(robotLife);
      if(robotLife == 3){
        robotsArray[0].getObjectByName("robotTorso").material.color.setHex("#FF0000");
      }
      if(robotLife == 0){
        scene.remove(robotsArray[0]);
      }
    }

    // If the bullet is not disappear we play the sound
    if(bullet.alive){
      soundManager.soundEffects["blaster"].sound.context.resume().then(() => {
        soundManager.soundEffects["blaster"].sound.play();
      });
    }

    setTimeout(function () {
      bullet.alive = false;
      //collidableMeshList.remove(bullet);
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

  timeTarget+=dt;
    if(Date.now()>=timeTarget){
      timeTarget=Date.now();
    }
  TWEEN.update();
}
  requestAnimationFrame(animate);


}
