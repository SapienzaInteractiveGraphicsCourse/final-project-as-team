import * as THREE from './three.js-master/build/three.module.js';
import {PointerLockControls} from './three.js-master/examples/jsm/controls/PointerLockControls.js';
import {Hero} from './main-char.js';
import {AnimateHero} from './main-char-animations.js';
import {Bullet} from './bullets.js';
import {SoundManager} from './sound-manager.js'
import {EffectComposer} from './three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './three.js-master/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from './three.js-master/examples/jsm/postprocessing/UnrealBloomPass.js';

var camera, scene, renderer;
var geometry, material, mesh;
let mainChar, mainCharCamera, heroAnimation;
var controls;
var objects = [];
var composer;
var params = {
				exposure: 0.0, // 0.7,
				bloomStrength: 0.0, //0.3,
				bloomThreshold: 0,
				bloomRadius: 3
			};

// Add event listener for pressing the keys on the keyboard
let keyboard = {};
// Object of mouse key codes
let mouse = {};

// Add bullet array
let bulletsArray = [];
// Shooting interval (interval between one shot and the next)
let shootingInterval = 0;
// Instantiate the sound manager for the effects of the game
const soundManager = new SoundManager();
// Create the audio Listener
const listener = new THREE.AudioListener();

// Configure the Physijs physic engine scripts
Physijs.scripts.worker = './js/physijs/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

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

var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var rotation = new THREE.Vector3();

function init() {
  scene = new Physijs.Scene();
  scene.setGravity(new THREE.Vector3( 0, -9.8, 0 ));

  // Box
	let box = new Physijs.BoxMesh(
			new THREE.CubeGeometry( 20, 20, 20 ),
			new THREE.MeshPhongMaterial({ color: 0x888888 }),
      300
		);
  box.castShadow = true;
  box.receiveShadow = true;
  box.position.set(0, 50, -60);
  scene.add(box);

  // Box
	let box2 = new Physijs.BoxMesh(
			new THREE.CubeGeometry( 20, 20, 20 ),
      Physijs.createMaterial(
        new THREE.MeshPhongMaterial({
          color: "#00FF00",
          shininess: 100,
        }),
        1,  // Friction
        0.3   // Bounciness - restitution
      ),
      290
		);
  box2.position.set(0, 10, -60);
  box2.castShadow = true;
  box2.receiveShadow = true;
  scene.add(box2);
  box2.collisions = 0;
  box2.addEventListener('collision', function(other_object, relative_velocity, relative_rotation, contact_normal) {
    // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
    if(other_object.name == "laserBeam"){
      box2.collisions++;
      if(box2.collisions == 1){
        box2.material.color.set("#ECA348");
      }
      if(box2.collisions == 2){
        box2.material.color.set("#E56947");
      }
      if(box2.collisions == 3){
        box2.material.color.set("#F93600");
      }
      if(box2.collisions == 4){
        scene.remove(box2);
      }
    }
  });

	// Adding the mountain
	const groundMat = Physijs.createMaterial(
		new THREE.MeshToonMaterial({
			color: "#C56A50"
		}),
		0.1,
		10
	);
	var groundGeo = new THREE.PlaneGeometry(1000, 1000, 100, 100);
	var edges = new THREE.EdgesGeometry(groundGeo);
	// noise.seed(Math.random());

	for (var i = 0; i < groundGeo.vertices.length; i++){
		var vertex = groundGeo.vertices[i];
		// noise.simplex2 and noise.perlin2 for 2d noise
    var value = noise.simplex2(vertex.x / 1000, vertex.y / 1000);
		if((vertex.x != 220 || vertex.x != 0) && (vertex.y != 100 || vertex.y != 0) ){
				groundGeo.vertices[i].z = Math.abs(value) * 100;
		}
	}

	groundGeo.computeFaceNormals();
	groundGeo.computeVertexNormals();

	let ground = new Physijs.HeightfieldMesh(
		groundGeo,
		groundMat,
		0,
		100,
		100
	);

	ground.rotation.x = - Math.PI/2;
	ground.position.y = -5;

	scene.add(ground);

  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set( 0.5, 20, 0.75 );
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

  // Add the listener to the camera
  mainCharCamera.add(listener);
  // Load all the sounds
  soundManager.loadSounds(listener);

  // Use the pointer to rotate the main char
  controls = new PointerLockControls(mainChar);
  scene.add(controls.getObject());

  // Instantiate the class for animations
  heroAnimation = new AnimateHero(mainChar);

  // Create floor and add texture
  const planeSize = 4000;

  const loader = new THREE.TextureLoader();
  const texture = loader.load('js/bg_images/DarkredBlack.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  // Material with friction
  const planeMat = Physijs.createMaterial(
    new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      shininess: 0,
    }),
    0.8,  // Friction
    0.3   // Bounciness - restitution
  );

  // Define the ground
  const mesh = new Physijs.PlaneMesh(
    planeGeo,
    planeMat,
    0
  );
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
  document.body.appendChild( renderer.domElement );

  var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
	bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;
  var renderScene = new RenderPass( scene, mainCharCamera );
	composer = new EffectComposer( renderer );
	composer.addPass( renderScene );
	composer.addPass( bloomPass );

  // Listener for resize
  window.addEventListener( 'resize', onWindowResize, false );

  // Breathing all the time
  soundManager.soundEffects["breath"].sound.context.resume().then(() => {
    soundManager.soundEffects["breath"].sound.play();
  });
}

function onWindowResize() {
    mainCharCamera.aspect = window.innerWidth / window.innerHeight;
    mainCharCamera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

    composer.setSize( window.innerWidth,  window.innerHeight );
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

function animate() {
  // Run Physics
  scene.simulate();
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
    // If W or Up are pressed
    if(keyboard[87] || keyboard[38]){
      velocity.z -= 400.0 * delta;
    }
    // If S or Down are pressed
    if(keyboard[83] || keyboard[40]){
      velocity.z += 400.0 * delta;
    }
    // If A or Left are pressed
    if(keyboard[65] || keyboard[37]){
      velocity.x -= 400.0 * delta;
    }
    // If D or Right are pressed
    if(keyboard[68] || keyboard[39]){
       velocity.x += 400.0 * delta;
    }
    velocity.y = Math.max( 0, velocity.y );
    canJump = true;
    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    if (controls.getObject().position.y < 10 ) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
        canJump = true;
    }
    prevTime = time;
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

    // If the bullet is not disappear we play the sound
    if(bullet.alive){
      soundManager.soundEffects["blaster"].sound.context.resume().then(() => {
        soundManager.soundEffects["blaster"].sound.play();
      });
    }

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
      bulletsArray[index].__dirtyPosition = true;
      //bulletsArray[index]
  }

  renderer.render(scene, mainCharCamera);

  composer.render();

  requestAnimationFrame(animate);

  TWEEN.update();
}

init();
animate();
