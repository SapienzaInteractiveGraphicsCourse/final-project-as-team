import * as THREE from './three.js-master/build/three.module.js';
import {OrbitControls} from './three.js-master/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import {AnimateRobot} from './robot-animations.js';
import {KillingRobot} from './robot.js'

var scene, camera, robot;

var keyboard = {};
var player = { height:5, speed:0.3, turnSpeed:Math.PI*0.01 };
var USE_WIREFRAME = false;


const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
	  
function init(){


	scene = new THREE.Scene();
	scene.background = new THREE.Color('white');
	const fov = 45;
	const aspect = 2;  // the canvas default
	const near = 1;
	const far = 10000;
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 10, 20);
	
	/*mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshBasicMaterial({color:0xff4444, wireframe:USE_WIREFRAME})
	);
	mesh.position.y += 1; // Move the mesh up 1 meter
	scene.add(mesh);*/
	
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
    
    robot = new KillingRobot();
    robot.castShadow = true;
    robot.receiveShadow = true;
    scene.add(robot);
	
	var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
    light.position.set(10, 10, 10); 			//default; light shining from top
    light.castShadow = true;            // default false
	scene.add( light );
	
	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0,player.height, 0));

	{
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	
		// Create a DirectionalLight and turn on shadows for the light
		var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
		light.position.set(10, 10, 10); 			//default; light shining from top
		light.castShadow = true;            // default false
		scene.add( light );
	
		// Set up shadow properties for the light
		light.shadow.mapSize.width = 512;  // default
		light.shadow.mapSize.height = 512; // default
		light.shadow.camera.near = 0.5;    // default
		light.shadow.camera.far = 500;     // default
	
		//Create a helper for the shadow camera (optional)
		var helper = new THREE.CameraHelper( light.shadow.camera );
		scene.add( helper );
	}

	let materialArray = [];

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
	
	if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}


	animate();
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
	
	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;
	
	// Keyboard movement inputs
	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		// Redirect motion by 90 degrees
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	// Keyboard turn inputs
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}

	AnimateRobot(robot);

	TWEEN.update();
	
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;