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

var models = {
  1: {
      obj: "./js/models/Kameri lunar colony/Kameri lunar colony.obj",
      mtl: "./js/models/Kameri lunar colony/Kameri_lunar_colony.mtl",
      x: -1000,
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
    x: 2500,
    y: 250,
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
  3: {
    obj: "./js/models/Scifi Floating City/Scifi Floating City.obj",
    mtl: "./js/models/Scifi Floating City/Scifi_Floating_City.mtl",
    x: 0,
    y: -80,
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
}

const gltf_models = {
  bb8:    { url: './js/models/bb8_gltf/scene.gltf' },
};

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
                  
                  scene.add(root);

                });
              });
      })(_key);
  }

  const gltfLoader = new GLTFLoader(manager);
  for (const model of Object.values(gltf_models)) {
    gltfLoader.load(model.url, (gltf) => {
      model.gltf = gltf;
    });
  }

  //var robot = new KillingRobot();

  /*Object.values(gltf_models).forEach((model, ndx) => {
    const clonedScene = SkeletonUtils.clone(model.gltf.scene);
    const root = new THREE.Object3D();
    root.add(clonedScene);
    scene.add(root);
    root.scale.set(0.1, 0.1, 0.1);
    root.position.set(getRandomInt(50, 1000), 12, getRandomInt(0, 1000));
  });*/

var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var rotation = new THREE.Vector3();
var isWalking = false;

var robotsAlive = 0;


//spawnRobots(level);

var tweenStart;
var cubeTween;


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

  //loadLandscapeModels();
  //loadModels();

  //add a single robot to test animation with tween
  robot = new KillingRobot();
    

  robot.scale.set(3, 3, 3);
  var positionX = getRandomInt(50, 1000);
  var positionZ = getRandomInt(0, 1000);
  robot.position.set(positionX, 0, positionZ);
  robotsAlive += 1;
  scene.add(robot);

  /*tweenStart = { value: 0 };
  var finish = { value: Math.PI };

  cubeTween = new TWEEN.Tween(tweenStart);
  cubeTween.to(finish, 3000)
  
  cubeTween.onUpdate(function() {
      robot.position.set(0.0, 0.0, 0.0);
      robot.rotation.y = tweenStart.value;
      robot.translateZ( 2.0 );
  });
  
  cubeTween.onComplete( function() {
      tweenStart.value = 0;
      requestAnimationFrame(function() {
          cubeTween.start();
      });
  });
  cubeTween.start();*/

  

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

//genereta robots depending on the selected level
function spawnRobots(lvl) {
  var res = new THREE.Object3D();
  switch (lvl) {
    case 'easy':
      
      break;
    case 'medium':
        const interval = window.setInterval(function () {
          for (var i=0; i<3; i++) {
            const clonedScene = SkeletonUtils.clone(robot);
            console.log("---" + clonedScene);
            
            const root = new THREE.Object3D();
            root.add(clonedScene);
            robot.castShadow = true;
            robot.receiveShadow = true;
            scene.add(root);
            root.scale.set(3, 3, 3);
            root.position.set(getRandomInt(50, 1000), 0, getRandomInt(0, 1000));
            robotsAlive += i;
            console.log(robotsAlive); 
            if (robotsAlive > 5) clearInterval(interval);
          };
        }, 5000);
      break;
    case 'hard':
      console.log("hard");
      break;      
  }

  
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

var robot;

function animate() {

    /*var path = new THREE.Path();

    //path.lineTo( 1000.0, 0.0 , 1000.0);
    //path.quadraticCurveTo(mainChar.position.x, 0.0 , mainChar.position.z);

    //path.lineTo(mainChar.position.x, 0.0 , mainChar.position.z);
    path.bezierCurveTo(mainChar.position.x/3, mainChar.position.z/3, mainChar.position.x/2, mainChar.position.z/2, mainChar.position.x, mainChar.position.z);

    var points = path.getPoints();

    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { color: 0xffffff } );

    var line = new THREE.Line( geometry, material );
    scene.add( line );*/

    var curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3( mainChar.position.x/4, 0, mainChar.position.z/4 ),
      new THREE.Vector3( mainChar.position.x/3, 0, mainChar.position.z/3 ),
      new THREE.Vector3( mainChar.position.x/2, 0, mainChar.position.z/2 ),
      new THREE.Vector3( mainChar.position.x, 0, mainChar.position.z )
    );
    
    var points = curve.getPoints( 50 );
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    
    // Create the final object to add to the scene
    var curveObject = new THREE.Line( geometry, material );

    //console.log("robot " + robot.position.x);
    
    //console.log(points[50].x);
    
    new TWEEN.Tween(robot.position)
					.to({x: points[50].x - 20, z: points[50].z - 20}, 1000)
					.onUpdate(function (object) {
            robot.lookAt(points[50].x, 0, points[50].z);
            //robot.position.set(points[50].x, 0, points[50].z);
            
					})
					.start()
    //robot.position.set(points[0].x * 2, 0, points[0].z * 2);
    //robot.translate.z = points[0].z;

    //console.log(points);
    
    //scene.add(curveObject);

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

  /*if (robotsAlive < 1) {
    robot = new KillingRobot();
    

    robot.scale.set(3, 3, 3);
    robot.position.set(getRandomInt(50, 1000), 0, getRandomInt(0, 1000));
    robotsAlive += 1;
    
    scene.add(robot);
    /*const clonedScene = SkeletonUtils.clone(robot);
    //AnimateRobot(robot);
    console.log("---" + clonedScene);
    
    const root = new THREE.Object3D();
    root.add(clonedScene);
    robot.castShadow = true;
    robot.receiveShadow = true;
    scene.add(root);
    root.scale.set(3, 3, 3);
    root.position.set(getRandomInt(50, 1000), 0, getRandomInt(0, 1000));
    robotsAlive += 1;
    console.log(robotsAlive); 
  }*/

  renderer.render(scene, mainCharCamera);

  // Calling the function to animate the robot
  //AnimateRobot(robotTest);
  //console.log(robotArray);
  //console.log(robotsAlive + "--" + robot);

  
  //AnimateRobot(robot);
  
  requestAnimationFrame(animate);

	TWEEN.update();
}
