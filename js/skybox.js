import * as THREE from './three.js-master/build/three.module.js';
import {OrbitControls} from './three.js-master/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import {AnimateRobot} from './robot-animations.js';
import {KillingRobot} from './robot.js'

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

  let root;
  let position = { x:0 };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('white');

  const robot = new KillingRobot();
  robot.castShadow = true;
  robot.receiveShadow = true;
  scene.add(robot);



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
  let texture_ft = new THREE.TextureLoader().load( 'js/bg_images/nx.png');
  let texture_bk = new THREE.TextureLoader().load( 'js/bg_images/ny.png');
  let texture_up = new THREE.TextureLoader().load( 'js/bg_images/nz.png');
  let texture_dn = new THREE.TextureLoader().load( 'js/bg_images/px.png');
  let texture_rt = new THREE.TextureLoader().load( 'js/bg_images/py.png');
  let texture_lf = new THREE.TextureLoader().load( 'js/bg_images/pz.png');

  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft, bumpMap: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk, bumpMap: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up, bumpMap:  texture_up}));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn, bumpMap: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt, bumpMap: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf, bumpMap: texture_ft }));

  for (let i = 0; i < 6; i++){
    materialArray[i].side = THREE.BackSide;
  }
  let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
  let skybox = new THREE.Mesh( skyboxGeo, materialArray );
  scene.add( skybox );

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

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    AnimateRobot(robot);

    TWEEN.update();
    requestAnimationFrame(render);
  }

  render();

  //requestAnimationFrame(render);
}

main();
