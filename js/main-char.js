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
    torso       : {h: 1.8, w: 4.5, d: 1},
    upperArms   : {rTop: 0.8, rBot: 0.6, h: 3, radialSeg: 5},
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
                    lower: {rTop: 0.125, rBot: 0.1, h: 0.4, radialSeg: 4},
                    upper: {rTop: 0.08, rBot: 0.1, h: 0.3, radialSeg: 4}
                  },
    fingers     : {
                    lower: {h: 0.4, w: 0.1, d: 0.4},
                    upper: {h: 0.35, w: 0.1, d: 0.3}
                  },
    upperFinger : {rTop: 0.4, rBot: 0.4, h: 0.5, radialSeg: 32},
    gun         : {h: 1.2, w: 0.5, d: 5},
    gunHandle   : {h: 1.2, w: 0.4, d: 0.7},
    gunCharge   : {h: 0.25, w: 3, d: 0.8},
    gunShooter  : {h: 0.6, w: 0.3, d: 2.5},
    gunUpShoot  : {rTop: 0.35, rBot: 0.35, h: 2.5, radialSeg: 3},
    gunFire     : {rTop: 0.28, rBot: 0.28, h: 0.2, radialSeg: 3},
    gunTarget   : {
                    support: {h: 0.1, w: 0.6, d: 0.3},
                    window : {h: 0.7, w: 0.4, d: 0.1},
                    last   : {h: 0.5, w: 0.06, d: 0.1}
                  }
  }

  // Creating the root element of the robot
  const hero = new THREE.Object3D();
  hero.position.set(6, 1, -3);

  const heroTorso = createTorso(heroSizes);
  hero.add(heroTorso);

  heroTorso.rotation.y = Math.PI;

  const leftArm = createArm(heroSizes, "left");
  const leftLowerArm = createLowerArm(heroSizes, "left");

  const leftHand = createHand(heroSizes, "left");
  // Creating the fingers for the left hand
  const thumbFingerLx = createFinger(heroSizes, "thumb", "left");
  const indexFingerLx = createFinger(heroSizes, "index", "left");
  const otherFingerLx = createFinger(heroSizes, "other", "left");
  // Adding the fingers to the left hand
  leftHand.add(thumbFingerLx);
  leftHand.add(indexFingerLx);
  leftHand.add(otherFingerLx);
  // Adding the left hand to the left arm
  leftLowerArm.add(leftHand);
  leftArm.add(leftLowerArm);
  // Rotate the arm
  leftArm.name = "heroLeftArm";
  leftArm.rotation.x = -60 * Math.PI/180;
  leftArm.rotation.y = -60 * Math.PI/180;
  leftArm.position.set(1,3.5,7);

  const rightArm = createArm(heroSizes, "right");
  const rightLowerArm = createLowerArm(heroSizes, "right");

  const rightHand = createHand(heroSizes, "right");
  // Creating the fingers for the right hand
  const thumbFingerRx = createFinger(heroSizes, "thumb", "right");
  const indexFingerRx = createFinger(heroSizes, "index", "right");
  const otherFingerRx = createFinger(heroSizes, "other", "right");
  // Adding the fingers to the right hand
  rightHand.add(thumbFingerRx);
  rightHand.add(indexFingerRx);
  rightHand.add(otherFingerRx);

  // Adding the right hand to the right arm
  rightLowerArm.add(rightHand);
  rightArm.add(rightLowerArm);
  // Rotate the arm
  rightArm.name = "heroRightArm";
  rightArm.rotation.x = -135 * Math.PI/180;
  rightArm.rotation.z = 45 * Math.PI/180;
  rightArm.rotation.y = 70 * Math.PI/180;
  rightArm.position.set(-7.4, -4, 8.5);

  // Adding the arms to the torso
  heroTorso.add(rightArm);
  heroTorso.add(leftArm);
  heroTorso.add(createGun(heroSizes));
  heroTorso.name = "torso";

  // Attach the camera to the torso
  hero.add(createCamera(heroSizes));
  var cubeGeometry = new THREE.CubeGeometry(20,20,10,1,1,1);
	var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );
  let box = new THREE.Mesh(
			cubeGeometry,
			wireMaterial
		);
  box.position.set(-5,2, 20);
  box.name = "transparentBox";
  heroTorso.add(box)

  return hero;
}

// Variables for the materials of the hero character
// Colors of the various hero's parts.
const heroColors = {
  brownGrey: "#5E4E4E",
  blue: "#00009F",
  grey: "#BFB7B7",
  darkGrey: "#4F4C4C",
  brown: "#AE4C4C",
  red: "#FD0000",
  pseudoWhite: "#E3DFDA",
  shinyRed: 0xf25656,
}

// These are the textures paths that will be loaded by the loaders
// for each component of the hero
const heroTextures = {
  gunBody: "js/m-textures/gun-body.jpg",
  gunHandle: "js/m-textures/gun-handle.jpeg",
  gunMagazine: "js/m-textures/gun-magazine.jpg",
  leather: "js/m-textures/leather.jpg",
  metal: "js/m-textures/starwars.jpg"
}

/**
 * Function to create the camera to add to the hero, the camera then is
 * added to the torso in the Hero() function. Thanks to this view we can
 * have a first person perspective.
 * @param  {object} sizes  The sizes of the hero
 * @return {object}        The perspective camera created.
 */
function createCamera(sizes){
  const torsoHeight = sizes.torso.h;
  const torsoWidth =  sizes.torso.w;
  // Adding the camera
  const fov = 80;
  const aspect = 2;  // the canvas default
  const zNear = 0.1;
  const zFar = 10000000000000;
  const heroCamera = new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
  heroCamera.position.set(torsoWidth + 2, torsoHeight + 3.7, - 2.5);
  //heroCamera.lookAt(0, 0, 20);
  //heroCamera.rotation.y = - Math.PI;
  heroCamera.name = "heroCamera";

  return heroCamera
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
    color: heroColors.blue,
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(width - 10, height + 3, 2);
  mesh.name = "heroTorso";
  torsoObj.add(mesh);

  // Create outline object
  const outlineW = width * 0.05;
  const outlineH = height * 0.05;
  const outlineD = dept * 0.05;

  const outline_geo = new THREE.BoxGeometry(width + outlineW, height + outlineH, dept + outlineD);
  const outline_mat = new THREE.MeshBasicMaterial({ color : 0x0000000, side: THREE.BackSide });
  const outline = new THREE.Mesh( outline_geo, outline_mat );
  mesh.add(outline);

  return torsoObj;
}
/**
 * This function creates the upper arm of the hero
 * @param  {object} heroSizes Sizes of the character
 * @param  {string} position  Left or right depending on which arm we are creating
 * @return {object}           The function returns the arm.
 */
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
  const texture = loader.load(heroTextures.metal);
  texture.minFilter = THREE.NearestFilter;

  const cylGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  const cylMat = new THREE.MeshToonMaterial( {
    color: heroColors.blue,
    flatShading: true,
    map: texture
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
    cyl.position.set(torsoWidth - 12.5, torsoHeight + 2.5, 2.4);
    cyl.name = "heroRightUpperArm";
  }
  armObj.add(cyl);

  // Create outline object
  const outlineRtop = radiusTop * 0.05;
  const outlineRbot = radiusBottom * 0.05;
  const outlineH = height * 0.05;

  const outline_geo = new THREE.CylinderGeometry(
    radiusTop + outlineRtop,
    radiusBottom + outlineRbot,
    height + outlineH,
    radialSegments
  );
  const outline_mat = new THREE.MeshBasicMaterial({ color : 0x0000000, side: THREE.BackSide });
  const outline = new THREE.Mesh( outline_geo, outline_mat );
  cyl.add(outline);

  return armObj;
}

/**
 * This function creates the lower arm of the hero
 * @param  {object} heroSizes Sizes of the character
 * @param  {string} position  As in the case of the upper arm, its value is either left or right.
 * @return {object}           Lower arm object.
 */
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
  const texture = loader.load(heroTextures.metal);
  texture.minFilter = THREE.NearestFilter;

  const cylGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  const cylMat = new THREE.MeshToonMaterial( {
    color: heroColors.blue,
    flatShading: true,
    map: texture
  } );
  const cyl = new THREE.Mesh(cylGeo, cylMat);
  cyl.castShadow = true;
  cyl.receiveShadow = true;

  // Create outline object
  const outlineRtop = radiusTop * 0.05;
  const outlineRbot = radiusBottom * 0.05;
  const outlineH = height * 0.05;

  const outline_geo = new THREE.CylinderGeometry(
    radiusTop + outlineRtop,
    radiusBottom + outlineRbot,
    height + outlineH,
    radialSegments
  );
  const outline_mat = new THREE.MeshBasicMaterial({ color : 0x0000000, side: THREE.BackSide });
  const outline = new THREE.Mesh( outline_geo, outline_mat );
  cyl.add(outline);

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
/**
 * This function creates the hand of the hero that are just box
 * geometries where later the fingers will be attached.
 * @param  {object} heroSizes Sizes of the character
 * @param  {string} position  This value is either left or right
 * @return {object}           The hand object.
 */
function createHand(sizes, position){
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
  const texture = loader.load(heroTextures.metal);
  texture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(width, height, depth);
  const cubeMat = new THREE.MeshToonMaterial( {
    color: "#FFFFFF",
    flatShading: true,
    map: texture,
  } );
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.castShadow = true;
  cube.receiveShadow = true;

  // Create outline object
  const outlineW = width * 0.05;
  const outlineH = height * 0.05;
  const outlineD = depth * 0.05;

  const outline_geo = new THREE.BoxGeometry(width + outlineW, height + outlineH, depth + outlineD);
  const outline_mat = new THREE.MeshBasicMaterial({ color : 0x0000000, side: THREE.BackSide });
  const outline = new THREE.Mesh( outline_geo, outline_mat );
  cube.add(outline);

  if(position == "left"){
    cube.position.set(torsoWidth - 7.5, torsoHeight - 0.7, 5.0);
    cube.name = "heroLeftHand";
    cube.rotation.z = 130 * Math.PI/180;
    cube.rotation.x = 55 * Math.PI/180;
    handObj.add(cube);
  }
  else{
    cube.position.set(torsoWidth - 12.5, torsoHeight - 1.6, 3.3);
    cube.name = "heroRightHand";
    cube.rotation.y = 10 * Math.PI/180;
    cube.rotation.x = 20 * Math.PI/180;
    handObj.add(cube);
  }

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
  let outlineLower, outlineUpper;

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load(heroTextures.leather);

  // Same material of the hand
  const cubeMat = new THREE.MeshToonMaterial( {
    color: heroColors.grey,
    flatShading: true,
    map: texture
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

    // Create lower outline object
    let outlineRtop = lowerFingerRtop * 0.05;
    let outlineRbot = lowerFingerRbot * 0.05;
    let outlineH = lowerFingerHeight * 0.05;

    let outline_geo = new THREE.CylinderGeometry(
      lowerFingerRtop + outlineRtop,
      lowerFingerRbot + outlineRbot,
      lowerFingerHeight + outlineH,
      lowerFingerRadSeg
    );
    const outline_mat = new THREE.MeshBasicMaterial({ color : 0x0000000, side: THREE.BackSide });
    outlineLower = new THREE.Mesh( outline_geo, outline_mat );

    // Create upper outline object
    outlineRtop = upperFingerRtop * 0.05;
    outlineRbot = upperFingerRbot * 0.05;
    outlineH = upperFingerHeight * 0.05;

    outline_geo = new THREE.CylinderGeometry(
      upperFingerRtop + outlineRtop,
      upperFingerRbot + outlineRbot,
      upperFingerHeight + outlineH,
      upperFingerRadSeg
    );
    outlineUpper = new THREE.Mesh( outline_geo, outline_mat );

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

    // Create outline object
    let outlineW = lowerWidth * 0.05;
    let outlineH = lowerHeight * 0.05;
    let outlineD = lowerDepth * 0.05;

    let outline_geo = new THREE.BoxGeometry(lowerWidth + outlineW, lowerHeight + outlineH, lowerDepth + outlineD);
    const outline_mat = new THREE.MeshBasicMaterial({ color : 0x0000000, side: THREE.BackSide });
    outlineLower = new THREE.Mesh( outline_geo, outline_mat );

    // Create outline object
    outlineW = upperWidth * 0.05;
    outlineH = upperHeight * 0.05;
    outlineD = upperDepth * 0.05;

    outline_geo = new THREE.BoxGeometry(lowerWidth + outlineW, lowerHeight + outlineH, lowerDepth + outlineD);
    outlineUpper = new THREE.Mesh( outline_geo, outline_mat );

  }

  let fingerLower = new THREE.Mesh(fingerLowerGeo, cubeMat);
  fingerLower.add(outlineLower);
  let fingerUpper = new THREE.Mesh(fingerUpperGeo, cubeMat);
  fingerUpper.add(outlineUpper);

  // Set shadows
  fingerLower.castShadow = true;
  fingerLower.receiveShadow = true;
  fingerUpper.castShadow = true;
  fingerUpper.receiveShadow = true;

  // Defining poisitions of the fingers
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

  // In the right case
  else{
    if(type == "thumb"){
      fingerLower.position.set(torsoWidth - 12.5, torsoHeight - 1.7, 2.675);
      fingerLower.name = "heroLowerRightThumb";
      // fingerLower.rotation.y = 120 * Math.PI/180;
      fingerLower.rotation.x = 90 * Math.PI/180;
      fingerObj.add(fingerLower);

      fingerUpper.position.set(torsoWidth - 12.5, torsoHeight - 1.7, 2.375);
      fingerUpper.name = "heroUpperRightThumb";
      //fingerUpper.rotation.x = 100 * Math.PI/180;
      fingerUpper.rotation.x = 90 * Math.PI/180;
      fingerObj.add(fingerUpper);
    }

    else if (type == "index") {

      fingerLower.position.set(torsoWidth - 12.5, torsoHeight - 2.1, 2.985);
      fingerLower.name = "heroLowerRightIndex";
      fingerLower.rotation.x = 20 * Math.PI/180;
      //fingerLower.rotation.y = 5 * Math.PI/180;
      fingerObj.add(fingerLower);

      fingerUpper.position.set(torsoWidth - 12.7, torsoHeight - 2.225, 2.95);
      fingerUpper.name = "heroUpperRightIndex";
      fingerUpper.rotation.x = 20 * Math.PI/180;
      //fingerUpper.rotation.y = -50 * Math.PI/180;
      fingerUpper.rotation.z = 90 * Math.PI/180;
      fingerObj.add(fingerUpper);
    }

    else{
      fingerLower.position.set(torsoWidth - 12.5, torsoHeight - 2.1, 3.3);
      fingerLower.name = "heroLowerRightOther";
      //fingerLower.rotation.z = 130 * Math.PI/180;
      fingerLower.rotation.x = 20 * Math.PI/180;
      fingerObj.add(fingerLower);

      fingerUpper.position.set(torsoWidth - 12.7, torsoHeight - 2.275, 3.255);
      fingerUpper.name = "heroUpperRightOther";
      fingerUpper.rotation.z = 90 * Math.PI/180;
      //fingerUpper.rotation.y = -35 * Math.PI/180;
      fingerUpper.rotation.x = 20 * Math.PI/180;

      fingerObj.add(fingerUpper);
    }
  }

  return fingerObj;

}

/**
 * This is the function that will create the gun used by the hero to
 * destroy killing robots. This gun is made up of many different pieces
 * all of them are created in this function
 * @param  {object} sizes The sizes of the hero
 * @return {object}       The function returns the gun
 */
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
  const bodyTexture = loader.load(heroTextures.gunBody);
  bodyTexture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(width, height, dept);
  const cubeMat = new THREE.MeshToonMaterial({
    map: bodyTexture,
    shininess: 0.0,
  });

  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(gunPosX, gunPosY, gunPosZ);
  mesh.name = "gunBody";
  gunObj.add(mesh);

  // Create outline object
  let outlineW = width * 0.02;
  let outlineH = height * 0.02;
  let outlineD = dept * 0.02;

  let outline_geo = new THREE.BoxGeometry(width + outlineW, height + outlineH, dept + outlineD);
  const outline_mat = new THREE.MeshBasicMaterial({ color : 0x0000000, side: THREE.BackSide });
  const outline = new THREE.Mesh( outline_geo, outline_mat );
  mesh.add(outline);

  // Charger of the gun
  const wChar = sizes.gunCharge.w;
  const hChar = sizes.gunCharge.h;
  const dChar = sizes.gunCharge.d;
  const chargerGeo = new THREE.BoxGeometry(wChar, hChar, dChar);
  const chargerText = loader.load(heroTextures.gunMagazine);
  const chargerMat = new THREE.MeshToonMaterial({
    color: heroColors.darkGrey,
    map: chargerText,
  });
  const charger = new THREE.Mesh(chargerGeo, chargerMat);
  charger.castShadow = true;
  charger.receiveShadow = true;
  charger.position.set(gunPosX - 1.4, gunPosY - 0.1, gunPosZ + 1);
  charger.name = "gunCharger";
  gunObj.add(charger);

  // Create outline object
  outlineW = wChar * 0.05;
  outlineH = hChar * 0.05;
  outlineD = dChar * 0.05;

  outline_geo = new THREE.BoxGeometry(wChar + outlineW, hChar + outlineH, dChar + outlineD);
  const outlineCharger = new THREE.Mesh( outline_geo, outline_mat );
  charger.add(outlineCharger);

  // Gun handle
  // Sizes
  const handleWidth = sizes.gunHandle.w;
  const handleHeight = sizes.gunHandle.h;
  const handleDepth = sizes.gunHandle.d;
  // Wood texture for the handle of the gun
  const handleTexture = loader.load(heroTextures.gunHandle);
  handleTexture.minFilter = THREE.NearestFilter;

  const handleGeo = new THREE.BoxGeometry(handleWidth, handleHeight, handleDepth);
  const handleMat = new THREE.MeshToonMaterial({
    color: heroColors.brown,
    map: handleTexture,
  });
  const handleMesh = new THREE.Mesh(handleGeo, handleMat);
  handleMesh.castShadow = true;
  handleMesh.receiveShadow = true;
  handleMesh.position.set(gunPosX, gunPosY - 1, gunPosZ - 0.775);
  handleMesh.name = "gunHandle";
  gunObj.add(handleMesh);

  // Create outline object
  outlineW = handleWidth * 0.05;
  outlineH = handleHeight * 0.05;
  outlineD = handleDepth * 0.05;

  outline_geo = new THREE.BoxGeometry(handleWidth + outlineW, handleHeight + outlineH, handleDepth + outlineD);
  const outlineHandle = new THREE.Mesh( outline_geo, outline_mat );
  handleMesh.add(outlineHandle);

  // Gun shooter part
  const shooterWidth = sizes.gunShooter.w;
  const shooterHeight = sizes.gunShooter.h;
  const shooterDepth = sizes.gunShooter.d;
  // Wood texture for the shooter of the gun
  const shooterTexture = loader.load(heroTextures.gunBody);
  shooterTexture.minFilter = THREE.NearestFilter;

  // We use the same material of the gun body
  const shooterGeo = new THREE.BoxGeometry(shooterWidth, shooterHeight, shooterDepth);
  const shooterMesh = new THREE.Mesh(shooterGeo, cubeMat);
  shooterMesh.castShadow = true;
  shooterMesh.receiveShadow = true;
  shooterMesh.position.set(gunPosX, gunPosY + 0.2, gunPosZ + 3.7);
  shooterMesh.name = "gunShooter";
  gunObj.add(shooterMesh);

  // Create outline object
  outlineW = shooterWidth * 0.05;
  outlineH = shooterHeight * 0.05;
  outlineD = shooterDepth * 0.05;

  outline_geo = new THREE.BoxGeometry(shooterWidth + outlineW, shooterHeight + outlineH, shooterDepth + outlineD);
  const outlineShooter = new THREE.Mesh( outline_geo, outline_mat );
  shooterMesh.add(outlineShooter);

  // The shooting element of the gun
  // No shadows for these two parts of the gun
  const rT = sizes.gunUpShoot.rTop;
  const rB = sizes.gunUpShoot.rBot;
  const radS = sizes.gunUpShoot.radialSeg;
  const h = sizes.gunUpShoot.h;
  const shootLastGeo = new THREE.CylinderGeometry(rT, rB, h, radS);
  const shootLastMat = new THREE.MeshToonMaterial({
    color: heroColors.brownGrey,
    map: bodyTexture,
  });
  const shootMesh = new THREE.Mesh(shootLastGeo, shootLastMat);
  shootMesh.position.set(gunPosX, gunPosY + 0.25, gunPosZ + 4);
  shootMesh.rotation.x = 90 * Math.PI/180;
  shootMesh.name = "gunShooterLast";
  gunObj.add(shootMesh);

  // This last part of the gun should give the idea of laser beam
  const rTf = sizes.gunFire.rTop;
  const rBf = sizes.gunFire.rBot;
  const radSf = sizes.gunFire.radialSeg;
  const hF = sizes.gunFire.h;
  const fireLastGeo = new THREE.CylinderGeometry(rTf, rBf, hF, radSf);
  const fireLastMat = new THREE.MeshToonMaterial({
    color: heroColors.red, // red
    shininess: 200.0,
    emissive: heroColors.shinyRed,
    specular: heroColors.shinyRed
  });
  const fireMesh = new THREE.Mesh(fireLastGeo, fireLastMat);
  fireMesh.position.set(gunPosX, gunPosY + 0.25, gunPosZ + 5.2);
  fireMesh.rotation.x = 90 * Math.PI/180;
  fireMesh.name = "gunFireLast";
  gunObj.add(fireMesh);


  // In this part we add some custom details to the gun, some shiny red
  // part, that make everything more scifi and some elements that characterize
  // a gun.
  //
  // Add details to the gun
  let detailGeo, detailMat, detailMesh, detailTexture;
  detailGeo = new THREE.BoxGeometry(width + 0.1, 0.1, dept - 0.5);
  detailMat = new THREE.MeshToonMaterial({
    color: heroColors.red, // red
    shininess: 200.0,
    emissive: heroColors.shinyRed,
    specular: heroColors.shinyRed
  });
  detailMesh = new THREE.Mesh(detailGeo, detailMat);
  detailMesh.castShadow = true;
  detailMesh.receiveShadow = true;
  detailMesh.position.set(gunPosX, gunPosY + 0.4, gunPosZ);
  detailMesh.name = "shiningUpperDetailGun";
  gunObj.add(detailMesh);

  // Another shining detail
  detailGeo = new THREE.BoxGeometry(width + 0.1, 0.1, dept - 1.5);
  detailMesh = new THREE.Mesh(detailGeo, detailMat);
  detailMesh.castShadow = true;
  detailMesh.receiveShadow = true;
  detailMesh.position.set(gunPosX, gunPosY + 0.2, gunPosZ - 0.7);
  detailMesh.name = "shiningLowerDetailGun";
  gunObj.add(detailMesh);

  // This is another detail and is in the lower part of gun's body
  detailGeo = new THREE.BoxGeometry(width + 0.1, 0.4, dept - 2.7);
  detailTexture = loader.load(heroTextures.gunHandle);
  detailMat = new THREE.MeshToonMaterial({
    color: heroColors.brown, // red
    shininess: 0.0,
    map: detailTexture,
  });
  detailMesh = new THREE.Mesh(detailGeo, detailMat);
  detailMesh.castShadow = true;
  detailMesh.receiveShadow = true;
  detailMesh.position.set(gunPosX, gunPosY - 0.6, gunPosZ + 1.25);
  detailMesh.name = "brownDetailGun";
  gunObj.add(detailMesh);

  // Other shining details to add to the shooter part of the gun
  detailGeo = new THREE.BoxGeometry(width - 0.1, 0.1, dept + 0.2);
  detailMat = new THREE.MeshToonMaterial({
    color: heroColors.red, // red
    shininess: 200.0,
    emissive: heroColors.shinyRed,
    specular: heroColors.shinyRed
  });
  detailMesh = new THREE.Mesh(detailGeo, detailMat);
  detailMesh.castShadow = true;
  detailMesh.receiveShadow = true;
  detailMesh.position.set(gunPosX, gunPosY + 0.185, gunPosZ + 1.7);
  detailMesh.name = "shiningShooterDetailGun";
  gunObj.add(detailMesh);

  // Create the target of the gun, that is made up of two parts
  // Support of the target
  const targetSupW = sizes.gunTarget.support.w;
  const targetSupH = sizes.gunTarget.support.h;
  const targetSupD = sizes.gunTarget.support.d;

  // Window of the target
  const targetW = sizes.gunTarget.window.w;
  const targetH = sizes.gunTarget.window.h;
  const targetD = sizes.gunTarget.window.d;

  // Window of the target
  const targetLastW = sizes.gunTarget.last.w;
  const targetLastH = sizes.gunTarget.last.h;
  const targetLastD = sizes.gunTarget.last.d;

  // Building and adding the support
  const targetGeoSupport = new THREE.BoxGeometry(targetSupW, targetSupH, targetSupD);
  const targetSupMap = new THREE.MeshToonMaterial({
    color: heroColors.darkGrey,
    map: bodyTexture,
    shininess: 0.0,
  });
  const target = new THREE.Mesh(targetGeoSupport, targetSupMap);
  target.castShadow = true;
  target.receiveShadow = true;
  target.position.set(gunPosX, gunPosY + 0.65, gunPosZ);
  target.name = "gunTargetSupport";
  gunObj.add(target);

  // Building and adding the window
  const targetGeoWindow = new THREE.BoxGeometry(targetW, targetH, targetD);
  const targetWindowMap = new THREE.MeshToonMaterial({
    color: heroColors.shinyRed,
    map: bodyTexture,
    opacity: 0.5,
    transparent: true,
  });
  const targetWindow = new THREE.Mesh(targetGeoWindow, targetWindowMap);
  targetWindow.castShadow = true;
  targetWindow.receiveShadow = true;
  targetWindow.position.set(gunPosX, gunPosY + 0.65, gunPosZ);
  targetWindow.name = "gunTargetWindow";
  gunObj.add(targetWindow);

  // Building the last part of the target
  const targetGeoLast = new THREE.BoxGeometry(targetLastW, targetLastH, targetLastD);
  const targetLast = new THREE.Mesh(targetGeoLast, targetSupMap);
  targetLast.castShadow = true;
  targetLast.receiveShadow = true;
  targetLast.position.set(gunPosX, gunPosY + 0.5, gunPosZ + 5);
  targetLast.name = "gunTargetLast";
  gunObj.add(targetLast);

  return gunObj;
}

export {Hero}
