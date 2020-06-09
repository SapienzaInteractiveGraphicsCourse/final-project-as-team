import * as THREE from './three.js-master/build/three.module.js';
import {OrbitControls} from './three.js-master/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import {AnimateRobot} from './robot-animations.js';
import {KillingRobot} from './robot.js';
import {Hero} from './main-char.js';
import {AnimateHero} from './main-char-animations.js';

// Add event listener for pressing the keys on the keyboard
let keyboard = {};

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 1;
  const far = 10000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  // Init the robot and then add it to the scene
  const robot = new KillingRobot();
  robot.castShadow = true;
  robot.receiveShadow = true;
  // scene.add(robot);

  // Init the main character
  const mainChar = new Hero();
  mainChar.castShadow = true;
  mainChar.receiveShadow = true;
  const mainCharCamera = mainChar.getObjectByName("heroCamera");
  scene.add(mainChar);

  {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    // Create a DirectionalLight and turn on shadows for the light
    var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
    light.position.set(2, 10, 20); 			//default; light shining from top
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

  /*
  No need to load an external model for the moment

  const gltfLoader = new GLTFLoader();
  gltfLoader.load('js/m4a1_reload_animation/scene.gltf', (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    root.scale.multiplyScalar(0.1);
    root.traverse(function(child){
      console.log(child.name);
    })
    // compute the box that contains all the stuff
    // from root and below
  });*/
  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
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

  // instantiate the class for animations
  let heroAnimation = new AnimateHero(mainChar);

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, mainCharCamera);
    //renderer.render(scene, camera);
    heroAnimation.reload();
    heroAnimation.walking();

    if(keyboard[82]){ // R - for reload
      // If the reload flag is false
      if(!heroAnimation.reloadFlag){
        heroAnimation.reloadFlag = true;
      }
    }

    // Calling the function to animate the robot
    AnimateRobot(robot);
    TWEEN.update();
    requestAnimationFrame(render);
  }

  render();

}

// Thanks to https://www.youtube.com/watch?v=UUilwGxIj_Q
function keyDown(event){
  keyboard[event.keyCode] = true;
}

function keyUp(event){
  keyboard[event.keyCode] = false;
}
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);


main();
