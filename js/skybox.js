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
import {EffectComposer} from './three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './three.js-master/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from './three.js-master/examples/jsm/postprocessing/ShaderPass.js';
import {PixelShader} from './three.js-master/examples/jsm/shaders/PixelShader.js';
import {AddBoxes, OBJSketchFabModels} from './building-einv.js';

// retrieve difficulty level choosen in the menu page
const queryString = window.location.search;
// Get the level value from the url
const urlParams = new URLSearchParams(queryString);
const level = urlParams.get('lvl');
// Pixel effect parameters for post processing
var composer, pixelPass, params;

// Audio variales
// Variable to stop the audio
var stopAudio = false;
// Variable telling if the audio has already been played
var theTrackIsOn = false;
var audio, analyser;
var stream = "js/sounds/loveIsAnywhere.mp3";

// Variable for pausing the game
var pauseGame = false;

// Get the instructions and hide it
const instructionsText = document.getElementById("display-instructions");

// Get and hide the player informations
const playerInfo = document.getElementById("player-info");
const backgroundInfo = document.getElementById("transparent-background");

// Reload message: tells to the user to reload the weapon
const reloadMessage = document.getElementById("reload-message");
reloadMessage.style.visibility = "hidden";
// Get the score element of the player
const scoreElement = document.getElementById("score");
let score = 0;

// Retry and back button
const retryButton = document.getElementById("retry");
const backButton = document.getElementById("back");
const menu = document.getElementById("menu");

// Element for stop the music
const stopMusicElement = document.getElementById("stopMusic");
const pauseElement = document.getElementById("pause");

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

// Robot boss and robots variables
let robotBoss,robotBossLife, bossLife, robotBossSpeed;
let robotsSpeed, robotLife;

// Depeding on the choosen level the boss and the robots will have
// different settings, they can be faster or live for longer
if(level == "easy"){
  bossLife = 40;
  robotBossSpeed = 8000;
  robotLife = 4;
  robotsSpeed = 5000;
}
else if(level == "medium"){
  bossLife = 60;
  robotBossSpeed = 6000;
  robotLife = 8;
  robotsSpeed = 3000;
}
else{
  bossLife = 100;
  robotBossSpeed = 1000;
  robotLife = 50;
  robotsSpeed = 500;
}
robotBossLife = bossLife;

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

// Get the elements in the html page for the pointer lock
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
// https://www.html5rocks.com/en/tutorials/pointerlock/intro/
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
  var element = document.body;
  var pointerlockchange = function ( event ) {
      if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
        controlsEnabled = true;
        controls.enabled = true;
        blocker.style.display = 'none';
        // The player has the control
        pauseGame = false;
        pauseElement.style.visibility = "visible";
      } else {
        controls.enabled = false;
        blocker.style.display = '-webkit-box';
        blocker.style.display = '-moz-box';
        blocker.style.display = 'box';
        instructions.style.display = '';
        // The game is paused if the player exits from the pointer lock
        pauseGame = true;
        pauseElement.style.visibility = "hidden";
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
}
else {
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
var models = new OBJSketchFabModels();

scene = new THREE.Scene();
var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
light.position.set( 0.5, 1, 0.75 );
scene.add(light);

// Create a DirectionalLight and turn on shadows for the light
var light2 = new THREE.DirectionalLight( 0xffffff, 1, 100 );
light2.position.set(-2000, 3000, 6000); 			//default; light shining from top
light2.castShadow = true;            // default false
scene.add(light2);

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
                  root.castShadow = true;
                  root.receiveShadow = true;

                  collidableMeshList.push(root);

                  scene.add(root);

                });
              });
      })(_key);
  }

var addBoxes = new AddBoxes(scene, collidableMeshList, manager);
var controlsEnabled = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var rotation = new THREE.Vector3();
var isWalking = false;

// variable for robots spawn
var robotsAlive = 0;
var robotsArray = [];
var robotsAreDead = false;

/**
 * Function that set all the variables and starts the game, calling the animate
 * function
 * @return {void} The function does not return anything
 */
function init() {
  // Now we can show the instructions
  instructions.style.visibility = "visible";
  // Now the stop music instruction is visible
  stopMusicElement.style.visibility = "visible";
  pauseElement.style.visibility = "visible";

  // AUDIO
	var fftSize = 2048;
	var audioLoader = new THREE.AudioLoader();
	var listener = new THREE.AudioListener();
	audio = new THREE.Audio(listener);
	audio.crossOrigin = "anonymous";
	audioLoader.load(stream, function(buffer) {
		audio.setBuffer(buffer);
		audio.setLoop(true);
		audio.play();
	});
  theTrackIsOn = true;

	analyser = new THREE.AudioAnalyser(audio, fftSize);

  // hide the loading bar
  const loadingElem = document.querySelector('#loading');
  loadingElem.style.display = 'none';

  // Once everything is loaded display the player information
  playerInfo.style.visibility = "visible";
  backgroundInfo.style.visibility = "visible";

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, mainCharCamera));

	pixelPass = new ShaderPass(PixelShader);
	pixelPass.uniforms["resolution"].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
	pixelPass.uniforms["resolution"].value.multiplyScalar(window.devicePixelRatio);
	composer.addPass(pixelPass);

	params = {
		pixelSize: 2.5,
		postprocessing: true
	};
  pixelPass.uniforms[ "pixelSize" ].value = params.pixelSize;

  document.body.appendChild(renderer.domElement);

  // Load all the sounds
  soundManager.loadSounds(listener);

  // Listener for resize
  window.addEventListener('resize', onWindowResize, false);

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
 * Function that is called once the windonw is resized and adapt the aspect
 * @return {void} Just change the aspect
 */
function onWindowResize() {
    mainCharCamera.aspect = window.innerWidth / window.innerHeight;
    mainCharCamera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

    pixelPass.uniforms["resolution"].value.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);
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
  // If the WASD is pressed, the walking sound is triggered
  if(keyboard[87] || keyboard[65] || keyboard[83] || keyboard[68]){
    soundManager.soundEffects["walking"].sound.context.resume().then(() => {
      soundManager.soundEffects["walking"].sound.play();
    });
  }
  // Stop the sountrack music
  if(keyboard[78]){
    stopAudio = !stopAudio;
    theTrackIsOn = false;
  }

}
/**
 * Function to handle the un-click on a key
 * @param  {object} event The event triggered by the click
 * @return {void}         The function simply assign that value to the keyboad obj
 */
function keyUp(event){
  keyboard[event.keyCode] = false;
  // If the WASD is not pressed, the walking sound is turned off
  if(!keyboard[87] || !keyboard[65] || !keyboard[83] || !keyboard[68]){
    soundManager.soundEffects["walking"].sound.context.resume().then(() => {
      soundManager.soundEffects["walking"].sound.stop();
    });
  }
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
  // The score change color only when it is updated, otherwise it should be
  // white all the time
  scoreElement.style.color = "#FFFFFF";

  // Stop the audio
  if(stopAudio){
    audio.pause();
  }

  // If the track is not on, we play it
  if(!theTrackIsOn){
    if(!stopAudio){
      audio.play();
      theTrackIsOn = true;
    }
  }

  if(pauseGame){
    menu.style.visibility = "visible";
  }
  if(!pauseGame){
    if(!dead){
      menu.style.visibility = "hidden";
    }
  }

  // limitate the framerate
  if(Date.now()>=timeTarget){

    //check the number of robots alive
    if(robotsAlive == 0) newSpawn = true;
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

      // The boss came into play
      if(scene.getObjectByName("robotBoss") == null && newSpawn == true && nToSpawn == 7){
        scene.add(robotBoss);
        robotBossLife = bossLife;
        robotBoss.getObjectByName("robotTorso")
        .material
        .color.set('#6A645F');

        robotBoss.getObjectByName("robotHead")
        .material
        .color.set('#6A645F');
      }
    }


    // Animate the robot (wheel, weapon and walking towards the mainChar)
    // Every robot will go to the main chart
    robotsArray.forEach((elem, i) => {
      // Check if the current robot hurts the main char
      if(elem.robot.position.distanceTo(mainChar.position) <= 15 && robotsAlive > 0){
        // If the character is not dead
        if(!dead){
          score -= 2;
          scoreElement.innerHTML = "SCORE: " + score;
          scoreElement.style.color = "#FF0303";

          mainCharLife -= 1;
          progressBarHealth.value -=1;
          progressBarValue.innerHTML = mainCharLife + "%";
        }
      }
      // Set the animation for the robot
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
            score -= 25;
            scoreElement.innerHTML = "SCORE: " + score;
            scoreElement.style.color = "#FF0303";

            mainCharLife -= 1;
            progressBarHealth.value -= 1;
            progressBarValue.innerHTML = mainCharLife + "%";
          }
        } // End outer if
    } // End Loop

    // If there are no more shoots we have to notify the user
    if(shoots == 0){
      reloadMessage.style.visibility = "visible";
      reloadMessage.className = "pulsate";
      backgroundInfo.style.height = "36vh";
    }

    // Reload animation.
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
          // Change the style of the elements in the player info
          reloadMessage.style.visibility = "hidden";
          reloadMessage.className = "";
          backgroundInfo.style.height = "28vh";

          var divs = document.getElementsByClassName('shot');
          for (var i = 0; i < divs.length; i++) {
            divs[i].classList.toggle("appear");
            divs[i].className = "shot";
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
  			if(keyboard[32]){
          velocity.z -= 2000.0 * delta;
        }
        else{
          velocity.z -= 400.0 * delta;
        }
  			directionOfMovement.w += 1;
  			isWalking = true;
  		}
  		// If S or Down are pressed
  		if((keyboard[83] || keyboard[40]) && !stopS){
        if(keyboard[32]){
          velocity.z += 2000.0 * delta;
        }
        else{
          velocity.z += 400.0 * delta;
        }
  			directionOfMovement.s += 1;
  			isWalking = true;
  		}
  		// If A or Left are pressed
  		if((keyboard[65] || keyboard[37]) && !stopR){
        if(keyboard[32]){
          velocity.x -= 2000.0 * delta;
        }
        else{
          velocity.x -= 400.0 * delta;
        }
  			directionOfMovement.r += 1;
  			isWalking = true;
  		}
  		// If D or Right are pressed
  		if((keyboard[68] || keyboard[39]) && !stopL){
        if(keyboard[32]){
          velocity.x += 2000.0 * delta;
        }
        else{
          velocity.x += 400.0 * delta;
        }
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

  // If the robot boss is too close to the main char he will be hit
  if(scene.getObjectByName("robotBoss") != null){
    if(scene.getObjectByName("robotBoss").position.distanceTo(mainChar.position) <= 25 && robotsAlive > 0){
      // If the character is not dead
      if(!dead){
        score -= 15;
        scoreElement.innerHTML = "SCORE: " + score;
        scoreElement.style.color = "#FF0303";

        mainCharLife -= 1;
        progressBarHealth.value -=1;
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
    // Set the game over text
    instructions.innerHTML = "GAME OVER. <br />The robots won."
    document.exitPointerLock();
    menu.style.visibility = "visible";
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
        robotBossLife -= 4;
        score += 10;
        scoreElement.innerHTML = "SCORE: " + score;
        scoreElement.style.color = "#66F800";

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
          score += 2;
          scoreElement.innerHTML = "SCORE: " + score;
          scoreElement.style.color = "#66F800";

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
              robotsArray = [];
            }
          }
        }
      });
  }

  if ( params.postprocessing ) {

		composer.render();

	} else {

		renderer.render( scene, mainCharCamera );

	}

  //renderer.render(scene, mainCharCamera);

  timeTarget+=dt;
  if(Date.now()>=timeTarget){
    timeTarget=Date.now();
  }

  // If the game is not paused the robots allow to move
  if(!pauseGame){
    TWEEN.update();
  }
}
  requestAnimationFrame(animate);


}
