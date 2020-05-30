import Stats from './three.js-master/examples/jsm/libs/stats.module.js';

import { GUI } from './three.js-master/examples/jsm/libs/dat.gui.module.js';
import { EffectComposer } from './three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './three.js-master/examples/jsm/postprocessing/RenderPass.js';
import { TexturePass } from './three.js-master/examples/jsm/postprocessing/TexturePass.js';
import { CubeTexturePass } from './three.js-master/examples/jsm/postprocessing/CubeTexturePass.js';
import { ShaderPass } from './three.js-master/examples/jsm/postprocessing/ShaderPass.js';
import { ClearPass } from './three.js-master/examples/jsm/postprocessing/ClearPass.js';
import { CopyShader } from './three.js-master/examples/jsm/shaders/CopyShader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

var scene, renderer, composer;
var clearPass, texturePass, renderPass;
var cameraP, cubeTexturePassP;
var gui, stats;

var params = {

	clearPass: true,
	clearColor: 'white',
	clearAlpha: 1.0,

	texturePass: true,
	texturePassOpacity: 1.0,

	cubeTexturePass: true,
	cubeTexturePassOpacity: 1.0,

	renderPass: true
};

init();
animate();

clearGui();

function clearGui() {

	if ( gui ) gui.destroy();

	gui = new GUI();

	gui.add( params, "clearPass" );
	gui.add( params, "clearColor", [ 'black', 'white', 'blue', 'green', 'red' ] );
	gui.add( params, "clearAlpha", 0, 1 );

	gui.add( params, "texturePass" );
	gui.add( params, "texturePassOpacity", 0, 1 );

	gui.add( params, "cubeTexturePass" );
	gui.add( params, "cubeTexturePassOpacity", 0, 1 );

	gui.add( params, "renderPass" );

	gui.open();

}

function init() {

	var container = document.getElementById( "container" );

	var width = window.innerWidth || 1;
	var height = window.innerHeight || 1;
	var aspect = width / height;
	var devicePixelRatio = window.devicePixelRatio || 1;

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( devicePixelRatio );
	renderer.setSize( width, height );
	document.body.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );

	//

	cameraP = new THREE.PerspectiveCamera( 65, aspect, 1, 10 );
	cameraP.position.z = 7;

	scene = new THREE.Scene();

	var group = new THREE.Group();
	scene.add( group );

	var light = new THREE.PointLight( 0xddffdd, 1.0 );
	light.position.z = 70;
	light.position.y = - 70;
	light.position.x = - 70;
	scene.add( light );

	var light2 = new THREE.PointLight( 0xffdddd, 1.0 );
	light2.position.z = 70;
	light2.position.x = - 70;
	light2.position.y = 70;
	scene.add( light2 );

	var light3 = new THREE.PointLight( 0xddddff, 1.0 );
	light3.position.z = 70;
	light3.position.x = 70;
	light3.position.y = - 70;
	scene.add( light3 );

	var geometry = new THREE.SphereBufferGeometry( 1, 48, 24 );

	var material = new THREE.MeshStandardMaterial();
	material.roughness = 0.5 * Math.random() + 0.25;
	material.metalness = 0;
	material.color.setHSL( Math.random(), 1.0, 0.3 );

	var mesh = new THREE.Mesh( geometry, material );
	group.add( mesh );

	// postprocessing

	var genCubeUrls = function ( prefix, postfix ) {

		return [
			prefix + 'px' + postfix, prefix + 'nx' + postfix,
			prefix + 'py' + postfix, prefix + 'ny' + postfix,
			prefix + 'pz' + postfix, prefix + 'nz' + postfix
		];

	};

	composer = new EffectComposer( renderer );

	clearPass = new ClearPass( params.clearColor, params.clearAlpha );
	composer.addPass( clearPass );

	texturePass = new TexturePass();
	composer.addPass( texturePass );

	var textureLoader = new THREE.TextureLoader();
	textureLoader.load( "/js/three.js-master/examples/textures/hardwood2_diffuse.jpg", function ( map ) {

		texturePass.map = map;

	} );

	cubeTexturePassP = null;

	var ldrUrls = genCubeUrls( "/js/three.js-master/examples/textures/cube/pisa/", ".png" );
	new THREE.CubeTextureLoader().load( ldrUrls, function ( ldrCubeMap ) {

		cubeTexturePassP = new CubeTexturePass( cameraP, ldrCubeMap );
		composer.insertPass( cubeTexturePassP, 2 );

	} );

	renderPass = new RenderPass( scene, cameraP );
	renderPass.clear = false;
	composer.addPass( renderPass );

	var copyPass = new ShaderPass( CopyShader );
	composer.addPass( copyPass );

	var controls = new OrbitControls( cameraP, renderer.domElement );
	controls.enableZoom = false;

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	var width = window.innerWidth;
	var height = window.innerHeight;
	var aspect = width / height;

	cameraP.aspect = aspect;
	cameraP.updateProjectionMatrix();

	renderer.setSize( width, height );
	composer.setSize( width, height );

}

function animate() {

	requestAnimationFrame( animate );

	stats.begin();

	cameraP.updateMatrixWorld( true );

	var newColor = clearPass.clearColor;
	switch ( params.clearColor ) {

		case 'blue': newColor = 0x0000ff; break;
		case 'red': newColor = 0xff0000; break;
		case 'green': newColor = 0x00ff00; break;
		case 'white': newColor = 0xffffff; break;
		case 'black': newColor = 0x000000; break;

	}

	clearPass.enabled = params.clearPass;
	clearPass.clearColor = newColor;
	clearPass.clearAlpha = params.clearAlpha;

	texturePass.enabled = params.texturePass;
	texturePass.opacity = params.texturePassOpacity;

	if ( cubeTexturePassP != null ) {
		cubeTexturePassP.enabled = params.cubeTexturePass;
		cubeTexturePassP.opacity = params.cubeTexturePassOpacity;
	}

	renderPass.enabled = params.renderPass;

	composer.render();

	stats.end();

}
