import * as THREE from './three.js-master/build/three.module.js';
import {PointerLockControls} from './three.js-master/examples/jsm/controls/PointerLockControls.js';
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import {AnimateRobot} from './robot-animations.js';
import {KillingRobot} from './robot.js';
import {Hero} from './main-char.js';
import {AnimateHero} from './main-char-animations.js';

let scene, camera, robot;
let mainChar, mainCharCamera, heroAnimation;

// Add event listener for pressing the keys on the keyboard
let keyboard = {};

let player = { height:5, speed:0.3, turnSpeed:Math.PI*0.01 };
let USE_WIREFRAME = false;

// Variables for mouse camera rotation
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );


const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
	  
function init(){

	scene = new THREE.Scene();
	scene.background = new THREE.Color('white');

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
	
	// Init the main character
    mainChar = new Hero();
	mainChar.castShadow = true;
	mainChar.receiveShadow = true;
	mainCharCamera = mainChar.getObjectByName("heroCamera");
	scene.add(mainChar);
	
	// instantiate the class for animations
	heroAnimation = new AnimateHero(mainChar);
	

	{
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	
		// Create a DirectionalLight and turn on shadows for the light
		let light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
		light.position.set(10, 10, 10); 			//default; light shining from top
		light.castShadow = true;            // default false
		scene.add( light );
	
		// Set up shadow properties for the light
		light.shadow.mapSize.width = 512;  // default
		light.shadow.mapSize.height = 512; // default
		light.shadow.camera.near = 0.5;    // default
		light.shadow.camera.far = 500;     // default
	
		// Create a helper for the shadow camera (optional)
		let helper = new THREE.CameraHelper( light.shadow.camera );
		scene.add( helper );
	}


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

	let worldAxis = new THREE.AxesHelper(20);
  	scene.add(worldAxis);
	
	// Event listener for mouse movements
	document.addEventListener( 'mousemove', onMouseMove, false );

	animate();
}


// Capture mouse movements
function onMouseMove( event ) {

	mouse.x = ( event.clientX - windowHalf.x );
	mouse.y = ( event.clientY - windowHalf.x );

}


function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}

function normalize(val, max, min) { 
	return (val - min) / (max - min); 
}

function animate(){

	requestAnimationFrame(animate);

	if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	  }
	
	
	// Keyboard movement inputs
	if(keyboard[87]){ // W key
		// walk forward	
		if(keyboard[16]) mainChar.position.z += 0.3;
		else mainChar.position.z += 0.1;
	}
	if(keyboard[83]){ // S key
		// walk back
		mainChar.position.z -= 0.1;
	}
	if(keyboard[65]){ // A key
		// walk left
		mainChar.position.x += 0.1;
		
	}
	if(keyboard[68]){ // D key
		// walk right
		mainChar.position.x -= 0.1;
	}	
	
	renderer.render(scene, mainCharCamera);

	heroAnimation.reload();

    if(keyboard[82]){ // R - for reload
      // If the reload flag is false
      if(!heroAnimation.reloadFlag){
        heroAnimation.reloadFlag = true;
      }
	}

	TWEEN.update();
}

// Capture key pressure
function keyDown(event){
	keyboard[event.keyCode] = true;
}

// Capture key release
function keyUp(event){
	keyboard[event.keyCode] = false;
}

// Listerners for keys pressure
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;