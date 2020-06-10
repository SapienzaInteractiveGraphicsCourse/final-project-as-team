import * as THREE from './three.js-master/build/three.module.js';
import {PointerLockControls} from './three.js-master/examples/jsm/controls/PointerLockControls.js';
//import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
//import {AnimateRobot} from './robot-animations.js';
//import {KillingRobot} from './robot.js';
import {Hero} from './main-char.js';
import {AnimateHero} from './main-char-animations.js';
import {Bullet} from './bullets.js';

var camera, scene, renderer;
var geometry, material, mesh;
let mainChar, mainCharCamera, heroAnimation;
var controls;
var objects = [];
let keyboard = {};

// Add bullet array
let bulletsArray = [];
// Shooting interval (interval between one shot and the next)
let shootingInterval = 0;

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
init();
animate();
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
function init() {
    //camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    scene = new THREE.Scene();
    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    // Init the main character
    mainChar = new Hero();
	mainChar.castShadow = true;
	mainChar.receiveShadow = true;
	mainCharCamera = mainChar.getObjectByName("heroCamera");
	scene.add(mainChar);
	
	// instantiate the class for animations
    heroAnimation = new AnimateHero(mainChar);
    
    controls = new PointerLockControls( mainChar );
    scene.add( controls.getObject() );
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true; 
                break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
            case 32: // space
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;
            case 82:
                if(!heroAnimation.reloadFlag) heroAnimation.reloadFlag = true;
                break;
        }
    };
    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    // create floor and add texture
	const planeSize = 4000;

	const loader = new THREE.TextureLoader();
	const texture = loader.load('js/bg_images/DarkredBlack.jpg');
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
    

    //
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize, false );
}


function onWindowResize() {
    mainCharCamera.aspect = window.innerWidth / window.innerHeight;
    mainCharCamera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// Capture mouse click event
window.onmousedown = function(e) {
    switch(e.button) {
        // Right click with aiming animation
        case 2:	
            heroAnimation.activateTargetMode = !heroAnimation.activateTargetMode;
            heroAnimation.targetMode();
            break;
        // Left click with shooting animation
        case 0:
            if(shootingInterval <= 0){

                let bullet = new Bullet(mainChar);
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
    }
}


function animate() {
    requestAnimationFrame( animate );
    if ( controlsEnabled ) {
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        if ( moveForward ) velocity.z -= 400.0 * delta;
        if ( moveBackward ) velocity.z += 400.0 * delta;
        if ( moveLeft ) velocity.x -= 400.0 * delta;
        if ( moveRight ) velocity.x += 400.0 * delta;
        //if ( isOnObject === true) {
            velocity.y = Math.max( 0, velocity.y );
            canJump = true;
        //}
        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );
        if ( controls.getObject().position.y < 10 ) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
        }
        prevTime = time;
    }

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

    if(shootingInterval > 0) shootingInterval -=1;

    //mainChar.getObjectByName('heroCamera').rotation.x+=0.01;
    renderer.render( scene, mainCharCamera );

    heroAnimation.reload();

	TWEEN.update();
}