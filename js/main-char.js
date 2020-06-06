/**
 * This is the class for instantiate the hero model, here we have
 * the various parts of the hero that are created by using the functions
 * defined below. Since this will be a first persion game, the hero
 * will just have a torso, arms, hands and a gun for shooting robots.
 *
 * @return {object} Killing robot object
 */
var Hero = function(){
  // Sizes of the various robot parts. In this way everytime there is
  // something to change we just have to modify this object.
  let heroSizes = {
    torso       : {h: 0.8, w: 2.5},
    arms        : {rTop: 0.4, rBot: 0.8, h: 3, radialSeg: 32},
    hand        : {r: 0.3, t: 0.2, radialSeg: 14, tubularSeg: 81},
    lowFinger   : {w: 1.1, h: 0.3, d: 1.65},
    midFinger   : {w: 0.2, h: 0.1, d: 1.5},
    upperFinger : {rTop: 0.4, rBot: 0.4, h: 0.5, radialSeg: 32},
  }

  // Creating the root element of the robot
  const hero = new THREE.Object3D();
  const heroTorso = createTorso(heroSizes);

  return hero;
}

/**
 * Function to create the torso of the robot
 * @param  {object} heroSizes Sizes of the character
 * @return {object}           The torso object
 */
function createTorso(hero){
  const height = hero.torso.h;
  const width =  hero.torso.w;

  const torsoObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(width, height, width + 0.5);
  const cubeMat = new THREE.MeshToonMaterial({
    color: '#FF00FF', // white
    // map: texture,
    // bumpMap: texture,
    shininess: 0.0
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(width + 5, height + 2, 2);
  mesh.name = "robotTorso";
  torsoObj.add(mesh);

  const radius = 0.2;
  const heightCyl = width;
  const radialSegments = 35;
  const cylinderGeo = new THREE.CylinderGeometry(radius, radius, heightCyl, radialSegments );

  // This will be used as pivot for the connection to the wheel
  const torsoAxis = new THREE.Mesh(cylinderGeo, cubeMat);

  // Set the shadows and position
  torsoAxis.castShadow = true;
  torsoAxis.receiveShadow = true;
  torsoAxis.position.set(width + 1.5, height + 2, 0);
  torsoAxis.rotation.z = 90 * Math.PI/180;
  // Add to the torso
  torsoObj.add(torsoAxis);

  return torsoObj;
}

export {Hero}
