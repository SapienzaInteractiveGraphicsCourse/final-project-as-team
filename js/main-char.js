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
    torso       : {h: 1.8, w: 4.5, d: 2},
    upperArms   : {rTop: 0.8, rBot: 0.6, h: 2.5, radialSeg: 5},
    lowerArms   : {rTop: 0.5, rBot: 0.4, h: 2.5, radialSeg: 5},
    hand        : {rTop: 0.25, rBot: 0.35, h: 0.8, radialSeg: 4},
    lowFinger   : {w: 1.1, h: 0.3, d: 1.65},
    midFinger   : {w: 0.2, h: 0.1, d: 1.5},
    upperFinger : {rTop: 0.4, rBot: 0.4, h: 0.5, radialSeg: 32},
    gun         : {h: 0.8, w: 0.5, d: 5},
    gunHandle   : {h: 1.2, w: 0.4, d: 0.7}
  }

  // Creating the root element of the robot
  const hero = new THREE.Object3D();
  hero.position.set(6, 0, -3);

  const heroTorso = createTorso(heroSizes);
  hero.add(heroTorso);

  const leftArm = createArm(heroSizes, "left");
  const leftLowerArm = createLowerArm(heroSizes, "left");
  leftArm.add(leftLowerArm);
  leftArm.name = "heroLeftArm";
  leftArm.rotation.x = -60 * Math.PI/180;
  leftArm.rotation.y = -60 * Math.PI/180;
  leftArm.position.set(1,3.5,7);
  // Adding the left hand to the left arm
  leftArm.add(createLeftHand(heroSizes));

  const rightArm = createArm(heroSizes, "right");
  const rightLowerArm = createLowerArm(heroSizes, "right");
  rightArm.add(rightLowerArm);
  rightArm.name = "heroRightArm";
  rightArm.rotation.x = -120 * Math.PI/180;
  rightArm.rotation.z = 45 * Math.PI/180;
  rightArm.rotation.y = 70 * Math.PI/180;
  rightArm.position.set(-7.2, -4.4, 6);

  // Adding the arms to the torso
  heroTorso.add(rightArm);
  heroTorso.add(leftArm);
  hero.add(createGun(heroSizes));

  return hero;
}

/**
 * Function to create the torso of the hero
 * @param  {object} heroSizes Sizes of the character
 * @return {object}           The torso object
 */
function createTorso(sizes){
  const height = sizes.torso.h;
  const width =  sizes.torso.w;
  const dept = sizes.torso.d;

  const torsoObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(width, height, dept);
  const cubeMat = new THREE.MeshToonMaterial({
    color: '#0000FF',
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(width - 10, height + 3, 2);
  mesh.name = "heroTorso";
  torsoObj.add(mesh);

  return torsoObj;
}

function createArm(sizes, position){
  // Sizes
  const height = sizes.upperArms.h;
  const radiusTop = sizes.upperArms.rTop;
  const radiusBottom = sizes.upperArms.rBot;
  const radialSegments = sizes.upperArms.radialSeg;

  const torsoHeight = sizes.torso.h;
  const torsoWidth = sizes.torso.w;

  const armObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cylGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  const cylMat = new THREE.MeshToonMaterial( {
    color: '#00009F',
    flatShading: true,
    // map: texture
  } );
  const cyl = new THREE.Mesh(cylGeo, cylMat);
  cyl.castShadow = true;
  cyl.receiveShadow = true;

  // Depending on the value of the position, meaning if we want to build the
  // right arm or the lower one we change the position of the geometry
  if (position == "left") {
    cyl.position.set(torsoWidth - 7.5, torsoHeight + 2, 2.4);
    cyl.name = "heroLeftUpperArm";
  }
  else{
    cyl.position.set(torsoWidth - 12.5, torsoHeight + 2, 2.4);
    cyl.name = "heroRightUpperArm";
  }
  armObj.add(cyl);

  return armObj;
}

function createLowerArm(sizes, position){
  // Sizes
  const height = sizes.lowerArms.h;
  const radiusTop = sizes.lowerArms.rTop;
  const radiusBottom = sizes.lowerArms.rBot;
  const radialSegments = sizes.lowerArms.radialSeg;

  const torsoHeight = sizes.torso.h;
  const torsoWidth = sizes.torso.w;

  const lowerArmObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cylGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  const cylMat = new THREE.MeshToonMaterial( {
    color: '#00009F',
    flatShading: true,
    // map: texture
  } );
  const cyl = new THREE.Mesh(cylGeo, cylMat);
  cyl.castShadow = true;
  cyl.receiveShadow = true;

  // Depending on the value of the position, meaning if we want to build the
  // right arm or the lower one we change the position of the geometry
  if (position == "left") {
    cyl.position.set(torsoWidth - 7.5, torsoHeight, 3.5);
    cyl.name = "heroLowerLeftArm";
    cyl.rotation.x = -70 * Math.PI/180;
  }
  else{
    cyl.position.set(torsoWidth - 12.5, torsoHeight, 2.8);
    cyl.name = "heroLowerRightArm";
    cyl.rotation.x = -20 * Math.PI/180;
  }

  lowerArmObj.add(cyl);

  return lowerArmObj;
}

function createLeftHand(sizes){
  // Sizes
  const height = sizes.hand.h;
  const radiusTop = sizes.hand.rTop;
  const radiusBottom = sizes.hand.rBot;
  const radialSegments = sizes.hand.radialSeg;

  const torsoHeight = sizes.torso.h;
  const torsoWidth = sizes.torso.w;

  const handObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cylGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  const cylMat = new THREE.MeshToonMaterial( {
    color: '#BFB7B7',
    flatShading: true,
    // map: texture
  } );
  const cyl = new THREE.Mesh(cylGeo, cylMat);
  cyl.castShadow = true;
  cyl.receiveShadow = true;
  cyl.position.set(torsoWidth - 7.5, torsoHeight - 0.5, 5.0);
  cyl.name = "heroLeftHandArm";
  cyl.rotation.x = -50 * Math.PI/180;
  handObj.add(cyl);

  return handObj;
}

function createGun(sizes){
  const height = sizes.gun.h;
  const width =  sizes.gun.w;
  const dept = sizes.gun.d;

  const torsoHeight = sizes.torso.h;
  const torsoWidth = sizes.torso.w;

  const gunPosX = torsoWidth - 10;
  const gunPosY = torsoHeight + 3;
  const gunPosZ = 7;

  const gunObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(width, height, dept);
  const cubeMat = new THREE.MeshToonMaterial({
    color: '#000000',
  });

  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(gunPosX, gunPosY, gunPosZ);
  mesh.name = "gunBody";
  gunObj.add(mesh);

  // Gun handle
  // Sizes
  const handleWidth = sizes.gunHandle.w;
  const handleHeight = sizes.gunHandle.h;
  const handleDepth = sizes.gunHandle.d;

  const handleGeo = new THREE.BoxGeometry(handleWidth, handleHeight, handleDepth);
  const handleMat = new THREE.MeshToonMaterial({
    color: '#DFF900',
  });
  const handleMesh = new THREE.Mesh(handleGeo, handleMat);
  handleMesh.castShadow = true;
  handleMesh.receiveShadow = true;
  handleMesh.position.set(gunPosX, gunPosY - 1, gunPosZ - 1);
  handleMesh.name = "gunHandle";
  gunObj.add(handleMesh);

  return gunObj;
}

export {Hero}
