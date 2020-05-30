import * as THREE from './three.js-master/build/three.module.js';
//import * from './three.js-master/examples/jsm/loaders/GLTFLoader.js';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );
//
var loader = new THREE.GLTFLoader();
var pathGLTF = './clone_trooper_phase1_shiny_updated/scene.gltf';

loader.load( pathGLTF, function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {
  console.log("Import not working");
	console.error( error );

} );

camera.position.z = 5;

var animate = function () {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );
};

animate();
