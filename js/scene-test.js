import * as THREE from './three.js-master/build/three.module.js';

			import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';
			import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
			import { RGBELoader } from './three.js-master/examples/jsm/loaders/RGBELoader.js';
			import { RoughnessMipmapper } from './three.js-master/examples/jsm/utils/RoughnessMipmapper.js';

			var container, controls;
			var camera, scene, renderer;

			init();
			render();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
				camera.position.set(1000, -100, -3000 );

				scene = new THREE.Scene();

				scene.background = new THREE.Color( 0xffffff );

						// model

						// use of RoughnessMipmapper is optional

						var loader = new GLTFLoader();


						// Load a glTF resource
						loader.load(
							// resource URL
							'./js/clone_trooper_phase1_shiny_updated/scene.gltf',
							// called when the resource is loaded
							function ( gltf ) {

								scene.add( gltf.scene );
								

								gltf.animations; // Array<THREE.AnimationClip>
								gltf.scene; // THREE.Group
								gltf.scenes; // Array<THREE.Group>
								gltf.cameras; // Array<THREE.Camera>
								gltf.asset; // Object

								render();

							},
							// called while loading is progressing
							function ( xhr ) {

								console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

							},
							// called when loading has errors
							function ( error ) {

								console.log( 'An error happened' );

							}
						);


				/*renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.toneMapping = THREE.ACESFilmicToneMapping;
				renderer.toneMappingExposure = 0.8;
				renderer.outputEncoding = THREE.sRGBEncoding;
				container.appendChild( renderer.domElement );*/
				//renderer.setClearColorHex( 0x000000, 1);

				/*var pmremGenerator = new THREE.PMREMGenerator( renderer );
				pmremGenerator.compileEquirectangularShader();*/

				renderer = new THREE.WebGLRenderer();
		   	renderer.setSize( window.innerWidth, window.innerHeight );
		   	document.body.appendChild( renderer.domElement );

				controls = new OrbitControls( camera, renderer.domElement );
				controls.addEventListener( 'change', render ); // use if there is no animation loop
				controls.minDistance = Math.abs(2);
				controls.maxDistance = Math.abs(10);
				controls.target.set( 200, 200, - 800 );
				controls.update();

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				render();

			}

			//

			function render() {

				renderer.render( scene, camera );

			}
