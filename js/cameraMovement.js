import * as THREE from './three.js-master/build/three.module.js';
import {OrbitControls} from './three.js-master/examples/jsm/controls/OrbitControls.js';
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
	let materialArray = [];

	// Apply texture to each face of the cube
	let texture_ft = new THREE.TextureLoader().load( 'js/bg_images/arid2_ft.jpg');
	let texture_bk = new THREE.TextureLoader().load( 'js/bg_images/arid2_bk.jpg');
	let texture_up = new THREE.TextureLoader().load( 'js/bg_images/arid2_up.jpg');
	let texture_dn = new THREE.TextureLoader().load( 'js/bg_images/arid2_dn.jpg');
	let texture_rt = new THREE.TextureLoader().load( 'js/bg_images/arid2_rt.jpg');
	let texture_lf = new THREE.TextureLoader().load( 'js/bg_images/arid2_lf.jpg');

	materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
	
	// Texture filters
	texture_ft.anisotropy = renderer.capabilities.getMaxAnisotropy();
	texture_bk.anisotropy = renderer.capabilities.getMaxAnisotropy();
	texture_up.anisotropy = renderer.capabilities.getMaxAnisotropy();
	texture_dn.anisotropy = renderer.capabilities.getMaxAnisotropy();
	texture_rt.anisotropy = renderer.capabilities.getMaxAnisotropy();
	texture_lf.anisotropy = renderer.capabilities.getMaxAnisotropy();

	materialArray.map.magFilter = THREE.LinearMipMapLinearFilter;
	/*materialArray[0].map.magFilter = THREE.LinearMipMapLinearFilter;
	materialArray[1].map.magFilter = THREE.LinearMipMapLinearFilter;
	materialArray[2].map.magFilter = THREE.LinearMipMapLinearFilter;
	materialArray[3].map.magFilter = THREE.LinearMipMapLinearFilter;
	materialArray[4].map.magFilter = THREE.LinearMipMapLinearFilter;
	materialArray[5].map.magFilter = THREE.LinearMipMapLinearFilter;*/


	for (let i = 0; i < 6; i++){
		materialArray[i].side = THREE.BackSide;;
	}
	let skyboxGeo = new THREE.BoxGeometry( 4000, 4000, 4000);
	let skybox = new THREE.Mesh( skyboxGeo, materialArray );

	scene.add( skybox );

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
		mainChar.position.z += 0.1;
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
	


	target.x = ( mouse.x ) * 0.002;
	target.y = ( mouse.y ) * 0.002;
	
	
	//camera.rotation.x += 0.05 * ( target.x - camera.rotation.x );
	
	//mainChar.rotation.x += ( target.y*2 - mainChar.rotation.x );
	//mainChar.rotation.y += ( target.x*2 - mainChar.rotation.y );
	//console.log("---------- " + camera.rotation.x);
	

	//AnimateRobot(robot);
	
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