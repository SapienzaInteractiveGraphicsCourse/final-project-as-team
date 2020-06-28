import * as THREE from './three.js-master/build/three.module.js';
import {PointerLockControls} from './three.js-master/examples/jsm/controls/PointerLockControls.js';
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import {MTLLoader} from './three.js-master/examples/jsm/loaders/MTLLoader.js';
import {OBJLoader} from './three.js-master/examples/jsm/loaders/OBJLoader.js';
import {OBJLoader2} from './three.js-master/examples/jsm/loaders/OBJLoader2.js';
import {MtlObjBridge} from './three.js-master/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';
import {AnimateRobot} from './robot-animations.js';
import {KillingRobot} from './robot.js';
import {RobotBoss} from './robot-boss.js';
import {SkeletonUtils} from './three.js-master/examples/jsm/utils/SkeletonUtils.js';
import {Hero} from './main-char.js';
import {AnimateHero} from './main-char-animations.js';
import {Bullet} from './bullets.js';
import {SoundManager} from './sound-manager.js'

// retrieve difficulty level choosen in the menu page
const queryString = window.location.search;
// Get the level value from the url
const urlParams = new URLSearchParams(queryString);
const level = urlParams.get('lvl')

// Get and hide the player informations
const playerInfo = document.getElementById("player-info");
playerInfo.style.visibility = "hidden";

var camera, scene, renderer;
var geometry, material, mesh;
var loadingManager = null;
var controls;
var objects = [];
var step = 1;

// Main character variables and life, the camera is attached to him
let mainChar, mainCharCamera, heroAnimation;
let mainCharLife = 100;
// Progressbar
let progressBarHealth = document.getElementById("health");
let progressBarValue = document.getElementById("health-value");
let dead = false;
let shoots = 24;

// Robot boss variable and life
let robotBoss;
let robotBossLife = 50;
// Add event listener for pressing the keys on the keyboard
let keyboard = {};
// Object of mouse key codes
let mouse = {};
// Add bullet array, one for the main char and one for the robots
let bulletsArray = [];
let robotBulletsArray = [];
// Shooting interval (interval between one shot and the next)
let shootingInterval = 0;
let robotShootingInterval = 0;
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
// The life of the robots
var robotLife = 8;

// Get the elements in the html page for the pointer lock
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
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

// Progressbar
manager.onProgress = (url, itemsLoaded, itemsTotal) => {
  progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
};

//models details for background
var models = {
  1: {
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
  2: {
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

// Init the robot boss and its position
robotBoss = new RobotBoss();
robotBoss.castShadow = true;
robotBoss.receiveShadow = true;
robotBoss.scale.multiplyScalar(5);
var positionX = getRandomInt(50, 1000);
var positionZ = getRandomInt(0, 1000);
robotBoss.position.set(positionX, 0, positionZ);
scene.add(robotBoss);

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

var controlsEnabled = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var rotation = new THREE.Vector3();
var isWalking = false;

// variable for robots spawn
var robotsAlive = 0;
var robotsArray = [];
var robotsAreDead = false;

function init() {

  // hide the loading bar
  const loadingElem = document.querySelector('#loading');
  loadingElem.style.display = 'none';

  // Once everything is loaded display the player information
  playerInfo.style.visibility = "visible";

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  document.body.appendChild(renderer.domElement);

  var wallGeometry = new THREE.CubeGeometry(100, 100, 20, 1, 1, 1 );
	var wallMaterial = new THREE.MeshBasicMaterial( {color: 0x8888ff} );
	var wireMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe:true } );

	var wall = new THREE.Mesh(wallGeometry, wallMaterial);
	wall.position.set(100, 50, -100);
	scene.add(wall);
	collidableMeshList.push(wall);

  // Load all the sounds
  soundManager.loadSounds(listener);

  // Listener for resize
  window.addEventListener( 'resize', onWindowResize, false );

  animate();
}

/**
 * Function to get the random numer among the range of min e max
 * @param  {float} min The minimum number of the range
 * @param  {float} max The max number of the range
 * @return {float}     The random number in the range
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Function to load the models of the background such as the skyscraper. The
 * function simply load the obj models, scale, rotate and position them in the
 * scene.
 * @return {void} The function does not return anything.
 */
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

  // limitate the framerate
  if(Date.now()>=timeTarget){

    //check the number of robots alive
    if(robotsArray.length == 0) newSpawn = true;
    if(nToSpawn == 7) {
      nToSpawn = 0;
      newSpawn = false;
    }

    //spawn the robots models
    if(newSpawn == true && nToSpawn <= 7) {
      var robot = new KillingRobot();
      robot.scale.set(3, 3, 3);
      // Assign a random position to the current robot
      var positionX = getRandomInt(50, 1000);
      var positionZ = getRandomInt(0, 1000);
      robot.position.set(positionX, 0, positionZ);
      robotsAlive += 1;

      // Push the the robot inside the array together with
      // its life value, that will be decremented if the
      // robot will be hit
      robotsArray.push({robot: robot, robotLife: robotLife});
      // Robots can collide
      collidableMeshList.push(robot)
      scene.add(robot);
      nToSpawn += 1;
    }


    // Animate the robot (wheel, weapon and walking towards the mainChar)
    // Every robot will go to the main chart
    robotsArray.forEach((elem, i) => {
      new TWEEN.Tween(elem.robot.position)
        .to({x: mainChar.position.x + (i * 20) , z: mainChar.position.z + (i * 5)}, 3000)
        .onUpdate(function (object) {
        elem.robot.lookAt(mainChar.position.x, 0, mainChar.position.z);
        AnimateRobot(elem.robot);
        })
        .start();
    });

    // Animate the big robot boss
    let robotBossMovement = new TWEEN.Tween(robotBoss.position)
      .to({x: mainChar.position.x , z: mainChar.position.z}, 6000)
      .onUpdate(function (object) {
      robotBoss.lookAt(mainChar.position.x, 0, mainChar.position.z);
      AnimateRobot(robotBoss);
      })
      .start();

    // Here the boss will shoot the main character
    if(robotShootingInterval <= 0 &&
      robotBoss.position.distanceTo(mainChar.position) < 250 &&
      scene.getObjectByName("robotBoss") != null){
      // Create the bullet
      let robotBullet = new Bullet(robotBoss, controls);
      robotBullet.alive = true;
      collidableMeshList.push(robotBullet);

      setTimeout(function () {
        robotBullet.alive = false;
        //collidableMeshList.remove(robotBullet);
        scene.remove(robotBullet);
      }, 2000);

      // Add the robotBullet to the scene and to the robotBullets array and
      // then set the robotShootingInterval to 10, meaning that every 10
      // frames there will be another robotBullet.
      robotBulletsArray.push(robotBullet);
      scene.add(robotBullet);
      robotShootingInterval = 20;
    }

    if(robotShootingInterval > 0) robotShootingInterval -=1;

    // go through bullets array and update position
    // remove bullets when appropriate
    for(var index=0; index<robotBulletsArray.length; index+=1){
        if(robotBulletsArray[index] === undefined ) continue;
        if(robotBulletsArray[index].alive == false ){
            robotBulletsArray.splice(index,1);
            continue;
        }
        robotBulletsArray[index].position.add(robotBulletsArray[index].velocity);

        // Case in which the robot boss is hidden
        if(mainChar.position.distanceTo(robotBulletsArray[index].position) <= 15){
          // If the character is not dead
          if(!dead){
            mainCharLife -= 2;
            progressBarHealth.value -=2;
            progressBarValue.innerHTML = mainCharLife + "%";
          }
        } // End outer if
    } // End Loop


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
          // Munitions are fully loaded
          shoots = 24;
          var divs = document.getElementsByClassName('shot');
          for (var i = 0; i < divs.length; i++) {
            divs[i].classList.toggle("appear");
            divs[i].className = "shot";
            console.log(divs[i]);
          }

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

      // Animations for doing the target mode
      heroAnimation.targetMode();
      heroAnimation.returnFromTargetMode();

      // We need a separate if condition, otherwise the shooting animation
      // will go ten frames slower.
      if(mouse[0] && shoots > 0){ // Left-click of the mouse
        heroAnimation.shooting();
      }

      // Here the bullets will go (if there are ...)
      if(mouse[0] && shootingInterval <= 0 && shoots > 0){ // Left-click of the mouse
        // Create the bullet
        let bullet = new Bullet(controls, null);
        bullet.alive = true;
        collidableMeshList.push(bullet);
        // Decrement the shoot number
        document.getElementById(shoots.toString()).classList.toggle("fade");
        shoots--;

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

      prevTime = time;
    }

  if (isWalking) mainChar.position.y = 10;

  if(shootingInterval > 0) shootingInterval -=1;

  // If the robots are too close to the main char he will be hit
  if(scene.getObjectByName("robot") != null){
    if(scene.getObjectByName("robot").position.distanceTo(mainChar.position) <= 25 && robotsAlive > 0){
      // If the character is not dead
      if(!dead){
        mainCharLife -= 2;
        progressBarHealth.value -=2;
        progressBarValue.innerHTML = mainCharLife + "%";
      }
    }
  }

  // If the robot boss is too close to the main char he will be hit
  if(scene.getObjectByName("robotBoss") != null){
    if(scene.getObjectByName("robotBoss").position.distanceTo(mainChar.position) <= 25 && robotsAlive > 0){
      // If the character is not dead
      if(!dead){
        mainCharLife -= 2;
        progressBarHealth.value -=2;
        progressBarValue.innerHTML = mainCharLife + "%";
      }
    }
  }

  // Depeding on the value of the main character life the color of the
  // arms will be different
  if(mainCharLife == 30){
    mainChar.getObjectByName("heroRightUpperArm")
    .material
    .color.set('#F1BD14');

    mainChar.getObjectByName("heroLeftUpperArm")
    .material
    .color.set('#F1BD14');

    mainChar.getObjectByName("heroLowerRightArm")
    .material
    .color.set('#F1BD14');

    mainChar.getObjectByName("heroLowerLeftArm")
    .material
    .color.set('#F1BD14');
  }
  if(mainCharLife == 20){
    mainChar.getObjectByName("heroRightUpperArm")
    .material
    .color.set('#F17414');

    mainChar.getObjectByName("heroLeftUpperArm")
    .material
    .color.set('#F17414');

    mainChar.getObjectByName("heroLowerRightArm")
    .material
    .color.set('#F17414');

    mainChar.getObjectByName("heroLowerLeftArm")
    .material
    .color.set('#F17414');
  }
  if(mainCharLife == 10){
    mainChar.getObjectByName("heroRightUpperArm")
    .material
    .color.set('#FF0000');

    mainChar.getObjectByName("heroLeftUpperArm")
    .material
    .color.set('#FF0000');

    mainChar.getObjectByName("heroLowerRightArm")
    .material
    .color.set('#FF0000');

    mainChar.getObjectByName("heroLowerLeftArm")
    .material
    .color.set('#FF0000');
  }
  // The boss is dead !
  if(mainCharLife == 0){
    scene.remove(mainChar);
    controlsEnabled = false;
    dead = true;
  }

  // go through bullets array and update position
  // remove bullets when appropriate
  for(var index=0; index<bulletsArray.length; index+=1){
      if(bulletsArray[index] === undefined ) continue;
      if(bulletsArray[index].alive == false ){
          bulletsArray.splice(index,1);
          continue;
      }
      bulletsArray[index].position.add(bulletsArray[index].velocity);

      // Case in which the robot boss is hidden
      if(robotBoss.position.distanceTo(bulletsArray[index].position) <= 15){
        robotBossLife -= 2;
        if(robotBossLife == 30){
          robotBoss.getObjectByName("robotTorso")
          .material
          .color.set('#F1BD14');

          robotBoss.getObjectByName("robotHead")
          .material
          .color.set('#F1BD14');
        }
        if(robotBossLife == 20){
          robotBoss.getObjectByName("robotTorso")
          .material
          .color.set("#F17414");

          robotBoss.getObjectByName("robotHead")
          .material
          .color.set("#F17414");
        }
        if(robotBossLife == 10){
          robotBoss.getObjectByName("robotTorso")
          .material
          .color.set("#FF0000");

          robotBoss.getObjectByName("robotHead")
          .material
          .color.set("#FF0000");
        }
        // The boss is dead !
        if(robotBossLife == 0){
          scene.remove(robotBoss);
        }
      }

      // Check if the other robots are hidden
      robotsArray.forEach((item, i) => {
        if(item.robot.position.distanceTo(bulletsArray[index].position) <= 15){
          // If the robot is hit, then its life is decremented and depending on
          // its life value the robot will have a different color
          item.robotLife -= 1;
          if(item.robotLife == 3){
            item.robot.getObjectByName("robotTorso")
            .material
            .color.set('#F1BD14');

            item.robot.getObjectByName("robotHead")
            .material
            .color.set('#F1BD14');
          }
          if(item.robotLife == 2){
            item.robot.getObjectByName("robotTorso")
            .material
            .color.set("#F17414");

            item.robot.getObjectByName("robotHead")
            .material
            .color.set("#F17414");
          }
          if(item.robotLife == 1){
            item.robot.getObjectByName("robotTorso")
            .material
            .color.set("#FF0000");

            item.robot.getObjectByName("robotHead")
            .material
            .color.set("#FF0000");
          }
          // The robot is dead !
          if(item.robotLife == 0){
            robotsAlive -= 1;
            scene.remove(item.robot);
            // Now the boss will came into play
            if(robotsAlive == 0){
              robotsAreDead = true;
            }
          }
        }
      });
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
