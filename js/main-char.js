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
    hand        : {h: 0.8, w: 0.3, d: 0.8},
    // Each finger is composed by two parts. The hand has a more simple
    // geometry since we have just three fingers: the thumb, the index
    // and the others are included in one single geometry.
    thumb       : {
                    lower: {rTop: 0.2, rBot: 0.1, h: 0.4, radialSeg: 4},
                    upper: {rTop: 0.08, rBot: 0.1, h: 0.25, radialSeg: 4}
                  },
    index       : {
                    lower: {rTop: 0.175, rBot: 0.1, h: 0.4, radialSeg: 4},
                    upper: {rTop: 0.08, rBot: 0.1, h: 0.3, radialSeg: 4}
                  },
    fingers     : {
                    lower: {h: 0.4, w: 0.1, d: 0.4},
                    upper: {h: 0.35, w: 0.1, d: 0.3}
                  },
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
  const leftHand = createLeftHand(heroSizes);
  const thumbFinger = createFinger(heroSizes, "thumb", "left");
  const indexFinger = createFinger(heroSizes, "index", "left");
  const otherFinger = createFinger(heroSizes, "other", "left");

  leftHand.add(thumbFinger);
  leftHand.add(indexFinger);
  leftHand.add(otherFinger);
  leftArm.add(leftHand);

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
  const width = sizes.hand.w;
  const depth = sizes.hand.d;

  const torsoHeight = sizes.torso.h;
  const torsoWidth = sizes.torso.w;

  const handObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(width, height, depth);
  const cubeMat = new THREE.MeshToonMaterial( {
    color: '#BFB7B7',
    flatShading: true,
    // map: texture
  } );
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.position.set(torsoWidth - 7.5, torsoHeight - 0.7, 5.0);
  cube.name = "heroLeftHand";
  cube.rotation.z = 130 * Math.PI/180;
  cube.rotation.x = 55 * Math.PI/180;
  handObj.add(cube);

  return handObj;
}

/**
 * This function is used to create the fingers of the hero. Instead of doing
 * one function for each part of the finger, since each king of finger is
 * made up of two parts (and this for every hand!), we built a simple function
 * that depending on the input parameters allow to build one particular finger
 * on a specific hand.
 * @param  {object} sizes    The sizes of the hero.
 * @param  {string} type     This is the type of the finger that we want to built
 * @param  {string} position This is the hand on which the finger is
 * @return {object}          The function returns the finger object
 */
function createFinger(sizes, type, position){
  const fingerObj = new THREE.Object3D();
  let fingerLowerGeo, fingerUpperGeo;

  // Same material of the hand
  const cubeMat = new THREE.MeshToonMaterial( {
    color: '#BFB7B7',
    flatShading: true,
    // map: texture
  });

  // The torso is  always the reference
  const torsoHeight = sizes.torso.h;
  const torsoWidth = sizes.torso.w;

  // Depending on the type of the fingers we have a different geometry
  if(type == "thumb" || type == "index"){
    // Each type of finger has an upper part and a lower part
    let lowerFingerHeight = sizes[type].lower.h;
    let lowerFingerRtop = sizes[type].lower.rTop;
    let lowerFingerRbot = sizes[type].lower.rBot;
    let lowerFingerRadSeg = sizes[type].lower.radialSeg;

    let upperFingerHeight = sizes[type].upper.h;
    let upperFingerRtop = sizes[type].upper.rTop;
    let upperFingerRbot = sizes[type].upper.rBot;
    let upperFingerRadSeg = sizes[type].upper.radialSeg;

    fingerLowerGeo = new THREE.CylinderGeometry(lowerFingerRtop, lowerFingerRbot, lowerFingerHeight, lowerFingerRadSeg);
    fingerUpperGeo = new THREE.CylinderGeometry(upperFingerRtop, upperFingerRbot, upperFingerHeight, upperFingerRadSeg);
  }
  else{
    // Each type of finger has an upper part and a lower part
    let lowerHeight = sizes.fingers.lower.h;
    let lowerWidth = sizes.fingers.lower.w;
    let lowerDepth = sizes.fingers.lower.d;

    let upperHeight = sizes.fingers.upper.h;
    let upperWidth = sizes.fingers.upper.w;
    let upperDepth = sizes.fingers.upper.d;

    fingerLowerGeo = new THREE.BoxGeometry(lowerWidth, lowerHeight, lowerDepth);
    fingerUpperGeo = new THREE.BoxGeometry(upperWidth, upperHeight, upperDepth);
  }

  let fingerLower = new THREE.Mesh(fingerLowerGeo, cubeMat);
  let fingerUpper = new THREE.Mesh(fingerUpperGeo, cubeMat);

  // Set shadows
  fingerLower.castShadow = true;
  fingerLower.receiveShadow = true;
  fingerUpper.castShadow = true;
  fingerUpper.receiveShadow = true;

  // If we have to add the finger to the left hand
  if (position == "left") {
    if(type == "thumb"){
      fingerLower.position.set(torsoWidth - 7.7, torsoHeight - 0.2, 5.0);
      fingerLower.name = "heroLowerLeftThumb";
      fingerLower.rotation.x = -120 * Math.PI/180;
      fingerObj.add(fingerLower);

      fingerUpper.position.set(torsoWidth - 7.7, torsoHeight - 0.2, 5.275);
      fingerUpper.name = "heroUpperLeftThumb";
      fingerUpper.rotation.x = 100 * Math.PI/180;
      fingerObj.add(fingerUpper);
    }

    else if (type == "index") {

      fingerLower.position.set(torsoWidth - 7.3, torsoHeight - 1.125, 5.475);
      fingerLower.name = "heroLowerLeftIndex";
      fingerLower.rotation.x = -30 * Math.PI/180;
      fingerLower.rotation.y = 5 * Math.PI/180;
      fingerObj.add(fingerLower);

      fingerUpper.position.set(torsoWidth - 7.35, torsoHeight - 1.275, 5.645);
      fingerUpper.name = "heroUpperLeftIndex";
      fingerUpper.rotation.x = 110 * Math.PI/180;
      fingerUpper.rotation.y = -50 * Math.PI/180;
      fingerUpper.rotation.z = 60 * Math.PI/180;
      fingerObj.add(fingerUpper);
    }

    else{
      fingerLower.position.set(torsoWidth - 7.6, torsoHeight - 1.275, 5.275);
      fingerLower.name = "heroLowerLeftOther";
      fingerLower.rotation.z = 130 * Math.PI/180;
      fingerLower.rotation.x = 55 * Math.PI/180;
      fingerObj.add(fingerLower);

      fingerUpper.position.set(torsoWidth - 7.655, torsoHeight - 1.453, 5.5);
      fingerUpper.name = "heroUpperLeftOther";
      fingerUpper.rotation.z = 100 * Math.PI/180;
      fingerUpper.rotation.y = -35 * Math.PI/180;
      fingerUpper.rotation.x = -20 * Math.PI/180;

      fingerObj.add(fingerUpper);
    }
  }

  return fingerObj;

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

  // Add details to the gun
  let detailGeo, detailMat, detailMesh;
  detailGeo = new THREE.BoxGeometry(width + 0.1, 0.1, dept + 0.2);
  detailMat = new THREE.MeshToonMaterial({
    color: "#FD0000", // red
    shininess: 200.0,
    specular: 0xf25656,
    emissive: 0xf25656
  });
  detailMesh = new THREE.Mesh(detailGeo, detailMat);
  detailMesh.castShadow = true;
  detailMesh.receiveShadow = true;
  detailMesh.position.set(gunPosX, gunPosY, gunPosZ);
  detailMesh.name = "shiningDetailGun";
  gunObj.add(detailMesh);

  // Another shining detail
  detailGeo = new THREE.BoxGeometry(width + 0.1, 0.1, dept + 0.2);
  detailMat = new THREE.MeshToonMaterial({
    color: "#FD0000", // red
    shininess: 200.0,
    specular: 0xf25656,
    emissive: 0xf25656
  });
  detailMesh = new THREE.Mesh(detailGeo, detailMat);
  detailMesh.castShadow = true;
  detailMesh.receiveShadow = true;
  detailMesh.position.set(gunPosX, gunPosY + 0.2, gunPosZ);
  detailMesh.name = "shiningDetailGun";
  gunObj.add(detailMesh);

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
  handleMesh.position.set(gunPosX, gunPosY - 1, gunPosZ - 0.775);
  handleMesh.name = "gunHandle";
  gunObj.add(handleMesh);

  return gunObj;
}

export {Hero}
