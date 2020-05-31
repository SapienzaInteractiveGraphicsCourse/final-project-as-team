import * as THREE from './three.js-master/build/three.module.js';
import {OrbitControls} from './three.js-master/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import {SkeletonUtils} from './three.js-master/examples/jsm/utils/SkeletonUtils.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 20, 40);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  function addLight(...pos) {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...pos);
    scene.add(light);
    scene.add(light.target);
  }
  addLight(5, 5, 2);
  addLight(-5, 5, 5);

  const manager = new THREE.LoadingManager();
  manager.onLoad = init;

  const progressbarElem = document.querySelector('#progressbar');
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
  };

	// Loading the models
  const models = {
    pig:    { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Pig.gltf' },
    cow:    { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Cow.gltf' },
    llama:  { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Llama.gltf' },
    pug:    { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Pug.gltf' },
    sheep:  { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Sheep.gltf' },
    zebra:  { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Zebra.gltf' },
    horse:  { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Horse.gltf' },
    knight: { url: 'https://threejsfundamentals.org/threejs/resources/models/knight/KnightCharacter.gltf' },
		clone:  {url:  "js/clone_trooper_phase1_shiny_updated/scene.gltf"}
  };
  {
    const gltfLoader = new GLTFLoader(manager);
    for (const model of Object.values(models)) {
      gltfLoader.load(model.url, (gltf) => {
        model.gltf = gltf;
      });
    }
  }

  function prepModelsAndAnimations() {
    Object.values(models).forEach(model => {
      const animsByName = {};
      model.gltf.animations.forEach((clip) => {
        animsByName[clip.name] = clip;
      });
      model.animations = animsByName;
    });
  }

  const mixers = [];

  function init() {
    // hide the loading bar
    const loadingElem = document.querySelector('#loading');
    loadingElem.style.display = 'none';

    prepModelsAndAnimations();

    Object.values(models).forEach((model, ndx) => {
      const clonedScene = SkeletonUtils.clone(model.gltf.scene);
      const root = new THREE.Object3D();
      root.add(clonedScene);
      scene.add(root);

			// In the case of the clone guy we have to rescale
			// https://stackoverflow.com/questions/52271397/centering-and-resizing-gltf-models-automatically-in-three-js
			if(model.url.includes("clone_trooper_phase1_shiny_updated")){
				var bbox = new THREE.Box3().setFromObject(root);
				var cent = bbox.getCenter(new THREE.Vector3());
				var size = bbox.getSize(new THREE.Vector3());
				//Rescale the object to normalized space
				var maxAxis = Math.max(size.x, size.y, size.z);
				root.scale.multiplyScalar(10.0 / maxAxis);
				bbox.setFromObject(root);
				bbox.getCenter(cent);
				bbox.getSize(size);
			}

			root.position.x = (ndx - 3) * 3;
      const mixer = new THREE.AnimationMixer(clonedScene);
      const firstClip = Object.values(model.animations)[0];
      const action = mixer.clipAction(firstClip);
      action.play();
      mixers.push(mixer);
    });
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

  let then = 0;
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    for (const mixer of mixers) {
      mixer.update(deltaTime);
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
