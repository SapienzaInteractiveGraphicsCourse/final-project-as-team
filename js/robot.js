
var KillingRobot = function(){
  // Sizes of the various robot parts. In this way everytime there is
  // something to change we just have to modify this object.
  let robotSizes = {
    torso       : {h: 0.8, w: 2.5},
    head        : {rTop: 0.4, rBot: 0.8, h: 3, radialSeg: 32},
    neck        : {r: 0.3, t: 0.2, radialSeg: 14, tubularSeg: 81},
    eyeSupport  : {w: 1.1, h: 0.3, d: 1.65},
    eyeBar      : {w: 0.2, h: 0.1, d: 1.5},
    ear         : {rTop: 0.4, rBot: 0.4, h: 0.5, radialSeg: 32},
    ant         : {h: 1, w: 0.05},
    shoulder    : {h: 0.2, w: 0.5, d: 3},
    shouldCyl   : {rTop: 0.2, rBot: 0.2, h: 3, radialSeg: 32},
    arm         : {h: 1, w: 0.2},
    cannon      : {rTop: 0.5, rBot: 0.4, h: 2.25, radialSeg: 32},
    shooter     : {radius: 0.3, h: 2, radialSeg: 32},
    finder      : {h: 0.8, w: 0.2, d: 1.75},
    leg         : {distance: 2.5},
    upLeg       : {h: 0.25, w: 0.25},
    midLeg      : {h: 2, w: 0.2},
    lowLeg      : {r: 0.2, radialSeg: 35, h: 2.8},
    wheel       : {r: 0.4, t: 0.8, radialSeg: 14, tubularSeg: 81}
  }

  // Creating the root element of the robot
  const robot = new THREE.Object3D();
  const robotHead = createHead(robotSizes);
  // Add the neck to the head
  robotHead.add(createNeck(robotSizes));
  // Add the details to the head, such as the ear with the antenna
  robotHead.add(createEar(robotSizes));
  // Add the eye
  robotHead.add(createEye(robotSizes));

  // Add head
  robot.add(robotHead);

  // Create torso. To the torso will be connected the single leg that will be
  // then attacched to the wheel
  const robotTorso = createTorso(robotSizes);
  // Create the robot shoulder
  const robotShoulder = createShoulder(robotSizes);
  const robotArms = createArm(robotSizes);
  const robotCannon = createCannon(robotSizes);
  // Add the cannon to the arm
  robotArms.add(robotCannon);
  // Add the arms to the shoulder
  robotShoulder.add(robotArms);
  // Add the shoulder to the torso
  robotTorso.add(robotShoulder);

  // Creating the leg with its various parts, the upper, the middle and the
  // the lower part. Middle and lower part are CHILDREN of the upper one.
  const robotUpperLeg = createUpperLeg(robotSizes);
  const robotMiddleLeg = createMidLeg(robotSizes);
  const robotLowerLeg = createLowerLeg(robotSizes);

  // Add the wheel
  robotLowerLeg.add(createWheel(robotSizes));
  robotMiddleLeg.add(robotLowerLeg);
  robotUpperLeg.add(robotMiddleLeg);
  // All the leg is children of the torso, so we just add the upper leg.
  robotTorso.add(robotUpperLeg);
  // Finally we add torso
  robot.add(robotTorso);


  return robot;
}
/**
 * This is the function to create the head of the robot, that
 * is just a cone.
 * @param  {object} robotSizes The robot sizes
 * @return {object}            The robot head
 */
function createHead(robotSizes) {
  const height = robotSizes.head.h;
  const radiusTop = robotSizes.head.rTop;
  const radiusBottom = robotSizes.head.rBot;
  const radialSegments = robotSizes.head.radialSeg;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  const headObj = new THREE.Object3D();

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const headGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments );
  const headMat = new THREE.MeshToonMaterial( {
    color: '#FFFFFF',
    shininess: 0,
    map:texture,
    //bumpMap: texture
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.castShadow = true;
  head.receiveShadow = true;
  head.position.set(torsoWidth + 1, torsoHeight + 3.5, 1);
  head.name = "robotHead";
  head.rotation.x = 110* Math.PI/180;
  headObj.add(head);

  return headObj;
}

/**
 * This function creates the ear of the robot, that is made up of the ear block
 * and of the antenna, giving a more tactical look to the robot.
 * @param  {object} robotSizes The robot sizes
 * @return {object}            The ear object
 */
function createEar(robotSizes){
  // Spatial coordinates to add in order to set the position
  const addX = 1.75;
  const addY = 3.7;
  const addZ = 0.5;

  // Sizes
  // Ear
  const height = robotSizes.ear.h;
  const radiusTop = robotSizes.ear.rTop;
  const radiusBottom = robotSizes.ear.rBot;
  const radialSegments = robotSizes.ear.radialSeg;

  // Antenna
  const antennaHeigh = robotSizes.ant.h;
  const antennaWidth = robotSizes.ant.w;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  // The ear will be composed by the ear that is a cylinder and one antenna, so
  // we created an object that will be later inserted in the head details.
  const earObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  // Ear
  const earGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  const earMat = new THREE.MeshToonMaterial( {
    color: '#99A89F', // light grey
    map: texture
  } );
  const ear = new THREE.Mesh(earGeo, earMat);
  ear.castShadow = true;
  ear.receiveShadow = true;
  ear.position.set(torsoWidth + addX, torsoHeight + addY, addZ);
  ear.name = "robotEar";
  ear.rotation.z = 90* Math.PI/180;
  earObj.add(ear);

  // Antenna
  const cubeGeo = new THREE.BoxBufferGeometry(antennaWidth, antennaHeigh,antennaWidth);
  const cubeMat = new THREE.MeshToonMaterial({color: '#1E1C1A'}); // pseudo-black
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth + addX + 0.1, torsoHeight + addY + 0.8, addZ);
  mesh.name = "robotTorso";
  earObj.add(mesh);

  return earObj;
}
/**
 * This function creates the eye of the robot, it has two main parts that
 * are the eye support and a red line bar.
 * @param  {object} robotSizes The robot sizes.
 * @return {object}            The eye object.
 */
function createEye(robotSizes){
  const eyeObj = new THREE.Object3D();

  // References
  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  // Sizes of the support of the eye
  const wEyeSup = robotSizes.eyeSupport.w;
  const hEyeSup = robotSizes.eyeSupport.h;
  const dEyeSup = robotSizes.eyeSupport.d;

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  // The eye support will have the same texture of the ear, so they
  // will seem connected
  const eyeSuppGeo = new THREE.BoxGeometry(wEyeSup, hEyeSup, dEyeSup);
  const eyeSuppMat = new THREE.MeshToonMaterial({
          color: '#99A89F', // black
          map: texture
        });
  const eyeSuppMesh = new THREE.Mesh(eyeSuppGeo, eyeSuppMat);
  eyeSuppMesh.castShadow = true;
  eyeSuppMesh.receiveShadow = true;
  eyeSuppMesh.position.set(torsoWidth + 1.174, torsoHeight + 3.8, 1.375);
  eyeSuppMesh.rotation.y = 90 * Math.PI/180
  eyeSuppMesh.name = "robotEyeSupport";
  eyeObj.add(eyeSuppMesh);

  // Sizes of the eye bar
  const wEyeBar = robotSizes.eyeBar.w;
  const hEyeBar = robotSizes.eyeBar.h;
  const dEyeBar = robotSizes.eyeBar.d;

  const barGeo = new THREE.BoxGeometry(wEyeBar, hEyeBar, dEyeBar);
  const barMaterial = new THREE.MeshToonMaterial({
          color: "#FD0000", // red
          shininess: 200.0,
          specular: 0xf25656,
          emissive: 0xf25656
        });
  const eyeBarMesh = new THREE.Mesh(barGeo, barMaterial);
  eyeBarMesh.castShadow = true;
  eyeBarMesh.receiveShadow = true;
  eyeBarMesh.position.set(torsoWidth + 1.174, torsoHeight + 3.8, 1.875);
  eyeBarMesh.rotation.y = 90 * Math.PI/180
  eyeBarMesh.name = "roboteyeBar";
  eyeObj.add(eyeBarMesh);

  return eyeObj;
}

/**
 * This function creates the neck of the robot that is made up of three different
 * components, giving an effect of mobility and flexibility.
 * @param  {object} robotSizes The robot sizes
 * @return {object}            Return the neck of the robot
 */
function createNeck(robotSizes){
  const radius = robotSizes.neck.r;
  const tube = robotSizes.neck.t;
  const radialSeg = robotSizes.neck.radialSeg;
  const tubularSeg = robotSizes.neck.tubularSeg;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/neck.jpeg');
  texture.minFilter = THREE.NearestFilter;

  const neckObj = new THREE.Object3D();
  const neckGeo = new THREE.TorusGeometry(radius, tube, radialSeg, tubularSeg);
  const neckMat = new THREE.MeshToonMaterial({
    color: '#534D4D',  // grey/black
    map: texture,
    bumpMap: texture
  });

  const upperNeck = new THREE.Mesh(neckGeo, neckMat);
  const middleNeck = new THREE.Mesh(neckGeo, neckMat);
  const lowerNeck = new THREE.Mesh(neckGeo, neckMat);

  // Set the shadows and position
  // Upper Neck
  upperNeck.castShadow = true;
  upperNeck.receiveShadow = true;
  upperNeck.position.set(torsoWidth + 1, torsoHeight + 3, 0);
  upperNeck.name = "robotUpperNeck";
  upperNeck.rotation.x = 90 * Math.PI/180;

  // Middle neck
  middleNeck.castShadow = true;
  middleNeck.receiveShadow = true;
  middleNeck.position.set(torsoWidth + 1, torsoHeight + 2.75, 0);
  middleNeck.name = "robotMiddleNeck";
  middleNeck.rotation.x = 90 * Math.PI/180;

  // Lower Neck
  lowerNeck.castShadow = true;
  lowerNeck.receiveShadow = true;
  lowerNeck.position.set(torsoWidth + 1, torsoHeight + 2.5, 0);
  lowerNeck.name = "robotLowerNeck";
  lowerNeck.rotation.x = 90 * Math.PI/180;

  // Adding the varius neck parts
  neckObj.add(upperNeck);
  neckObj.add(middleNeck);
  neckObj.add(lowerNeck);

  return neckObj;
}

/**
 * This function will create an object to attach to the torso, that will be the
 * shoulder of the robot.
 * @param  {object} robotSizes The robot sizes.
 * @return {object}            The shoulder object
 */
function createShoulder(robotSizes){
  const shoulderObj = new THREE.Object3D();

  // The shoulder will be composed of two different pieces
  const h = robotSizes.shoulder.h;
  const w = robotSizes.shoulder.w;
  const d = robotSizes.shoulder.d;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(w, h, d);
  const cubeMat = new THREE.MeshToonMaterial({
    color: '#FFFFFF', // white
    map: texture,
    //bumpMap: texture,
    shininess: 0.0
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth - 0.5, torsoHeight + 2, 0);
  mesh.name = "robotShoulderFirstPArt";
  // Add the first part of the shoulder
  shoulderObj.add(mesh);

  // Cylinder part of the shoulder
  // The radius will be the same both in the top and in the bottom case
  const r = robotSizes.shouldCyl.rTop;
  const height = robotSizes.shouldCyl.h;
  const radialSeg = robotSizes.shouldCyl.radialSeg;

  const cylGeo = new THREE.CylinderGeometry(r, r, height, radialSeg);
  const cylMesh = new THREE.Mesh(cylGeo, cubeMat);
  cylMesh.castShadow = true;
  cylMesh.receiveShadow = true;
  cylMesh.position.set(torsoWidth - 0.875, torsoHeight + 2, 0);
  cylMesh.rotation.x = 90 * Math.PI/180
  cylMesh.name = "robotShoulderSecondPart";
  shoulderObj.add(cylMesh);

  return shoulderObj;
}

/**
 * This function creates the arm that is made up of two different components
 * they hold the cannon for shoothing
 * @param  {object} robotSizes The robot sizes
 * @return {object}            Return the object containg the two mesh
 */
function createArm(robotSizes){
  const armsObject = new THREE.Object3D();
  // The shoulder will be composed of two different pieces
  const h = robotSizes.arm.h;
  const w = robotSizes.arm.w;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(w, h, w);
  const cubeMat = new THREE.MeshToonMaterial({
    color: '#DAD5D5', // very light grey
    map: texture
  });
  // Creating the mesh for the two arms
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  const meshBack = new THREE.Mesh(cubeGeo, cubeMat);
  // First component
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth - 1.3, torsoHeight + 1.55, 1);
  mesh.rotation.z = -45 * Math.PI /180
  mesh.name = "robotFrontArm";
  // Second component
  meshBack.castShadow = true;
  meshBack.receiveShadow = true;
  meshBack.position.set(torsoWidth - 1.3, torsoHeight + 1.55, -1);
  meshBack.rotation.z = -45 * Math.PI /180
  meshBack.name = "robotBackArm";

  armsObject.add(mesh);
  armsObject.add(meshBack);

  return armsObject;
}

/**
 * This function is used to create the cannon of the robot. The cannon
 * is composed by one big part that is attached to the robot arm and
 * the shooter part that has a finder, the shooter and the final
 * shooter piece.
 * @param  {object} robotSizes The robot sizes.
 * @return {object}            The cannon
 */
function createCannon(robotSizes){
  const cannonObj = new THREE.Object3D();

  // The cannon is composed by one main cylinder
  const h = robotSizes.cannon.h;
  const rBot = robotSizes.cannon.rBot;
  const rTop = robotSizes.cannon.rTop;
  const radialSeg = robotSizes.cannon.radialSeg

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/starwars.jpg');
  texture.minFilter = THREE.NearestFilter;

  // Build the geometry
  const cylGeo = new THREE.CylinderGeometry(rTop, rBot, h, radialSeg);
  const cylMat = new THREE.MeshToonMaterial({
    color: '#FFFFFF', // white
    map: texture,
    shininess: 100.0
  });
  const cylMesh = new THREE.Mesh(cylGeo, cylMat);
  cylMesh.castShadow = true;
  cylMesh.receiveShadow = true;
  cylMesh.position.set(torsoWidth - 1.85, torsoHeight + 1, 0);
  cylMesh.rotation.x = 90 * Math.PI/180
  cylMesh.name = "robotCannon";
  cannonObj.add(cylMesh);

  // Get the shooter sizes
  const r = robotSizes.shooter.radius;
  const shotH = robotSizes.shooter.h;
  const shotRadSeg = robotSizes.shooter.radialSeg;

  // The shooter part of the cannon
  const shootGeo = new THREE.CylinderGeometry(r, r, shotH, shotRadSeg);
  const shootMesh = new THREE.Mesh(shootGeo, cylMat);
  shootMesh.castShadow = true;
  shootMesh.receiveShadow = true;
  shootMesh.position.set(torsoWidth - 1.85, torsoHeight + 1, 1);
  shootMesh.rotation.x = 90 * Math.PI/180
  shootMesh.name = "robotShooter";
  cannonObj.add(shootMesh);

  // Get the viewfinder measures
  const fH = robotSizes.finder.h;
  const fW = robotSizes.finder.w;
  const fD = robotSizes.finder.d;

  // Build the view finder of the cannon
  const fGeo = new THREE.BoxGeometry(fW, fH, fD);
  const blackMaterial = new THREE.MeshToonMaterial({
      color: '#000000', // black
      shininess: 100.0
    });
  const fMesh = new THREE.Mesh(fGeo, blackMaterial);
  fMesh.castShadow = true;
  fMesh.receiveShadow = true;
  fMesh.position.set(torsoWidth - 1.85, torsoHeight + 0.95, 1);
  fMesh.name = "robotShooterViewFinder";
  cannonObj.add(fMesh);

  // Code taken from the official documentation of three.js
  // https://threejs.org/docs/#api/en/geometries/LatheGeometry
  // This geomtry will be used for the outer part of the cannon
  const points = [];
  for (let i = 0; i < 10; i ++) {
	   points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
  }
  // Parameters for the geometry
  const segments = 30;
  const phiStart = 0;
  const phiLenght = 6.3;

  const geometry = new THREE.LatheGeometry(points, segments, phiStart, phiLenght);
  const lathe = new THREE.Mesh(geometry, blackMaterial);

  lathe.castShadow = true;
  lathe.receiveShadow = true;
  lathe.position.set(torsoWidth - 1.85, torsoHeight + 1, 2);
  // Make the mesh smaller
  lathe.scale.multiplyScalar(0.0175);
  lathe.rotation.x = -90 * Math.PI / 180;
  lathe.name = "robotShooterOuterPart";
  cannonObj.add(lathe);

  return cannonObj;
}

/**
 * Function to create the torso of the robot
 * @param  {object} robotSizes Sizes of the robot
 * @return {object}            The torso object
 */
function createTorso(robotSizes){
  const height = robotSizes.torso.h;
  const width =  robotSizes.torso.w;

  const torsoObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const cubeGeo = new THREE.BoxGeometry(width, height, width + 0.5);
  const cubeMat = new THREE.MeshToonMaterial({
    color: '#FFFFFF', // white
    map: texture,
    //bumpMap: texture,
    shininess: 0.0
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(width + 1, height + 2, 0);
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

/**
 * Function to create the leg of the robot, that will be composed of various
 * parts. This function will create the upper leg part.
 * @param  {object} robotSizes Sizes of the robot
 * @return {object}            Upper leg object
 */
function createUpperLeg(robotSizes){
  const height = robotSizes.upLeg.h;
  const width =  robotSizes.upLeg.w;
  const d = robotSizes.leg.distance;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  const upperLegObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  // The upper leg part is just a little cube attached to the cylinder inside
  // the torso.
  const cubeGeo = new THREE.BoxGeometry(width, height, width + 0.1);
  const cubeMat = new THREE.MeshToonMaterial({
    color: '#858382', // grey
    map  : texture
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth + d, torsoHeight + 1.8, 0);
  mesh.name = "robotUpperLeg";
  upperLegObj.add(mesh);

  return upperLegObj;
}

/**
 * This function creates the middle leg part of the leg, is very similar
 * to the previous function, the one used to create the upper part, what
 * changes are just the sizes.
 * @param  {object} robotSizes Sizes of the robot
 * @return {object}            Middle leg object
 */
function createMidLeg(robotSizes){
  const height = robotSizes.midLeg.h;
  const width =  robotSizes.midLeg.w;
  const d = robotSizes.leg.distance;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  const midLegObj = new THREE.Object3D();
  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  // The middle leg part is just a little cube attached to the upper leg
  const cubeGeo = new THREE.BoxGeometry(width, height, width);
  const cubeMat = new THREE.MeshToonMaterial({
    color: '#DAD5D5', // very light grey
    map: texture,
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth + d, torsoHeight + 1, 0);
  mesh.name = "robotMiddleLeg";
  midLegObj.add(mesh);

  return midLegObj;
}

/**
 * This function creates the lower leg part of the leg, here we simply create
 * a cylinder that will be the main support for the wheel
 * @param  {object} robotSizes Sizes of the robot
 * @return {object}            Lower leg, support for the wheel
 */
function createLowerLeg(robotSizes){
  // Getting the measures, this time will have different measures
  // since we have a cylinder.
  const radius = robotSizes.lowLeg.r;
  const heightCyl = robotSizes.lowLeg.h;
  const radialSegments = robotSizes.lowLeg.radialSeg;
  const d = robotSizes.leg.distance;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/scratched-metal.png');
  texture.minFilter = THREE.NearestFilter;

  const lowerLegObj = new THREE.Object3D();
  const cylinderGeo = new THREE.CylinderGeometry(radius, radius, heightCyl, radialSegments);
  const cylinderMat = new THREE.MeshToonMaterial({
    color: '#858382', // grey
    map: texture
});
  // This will be used as support for the connection to the wheel
  const mesh = new THREE.Mesh(cylinderGeo, cylinderMat);

  // Set the shadows and position
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth + d - 1.2, torsoHeight + 0.25, 0);
  mesh.rotation.z = 90 * Math.PI/180;
  mesh.name = "robotLowerLeg";
  // Add to the torso
  lowerLegObj.add(mesh);

  return lowerLegObj;
}

/**
 * This is the function to create the wheel of the robot. Since we have no
 * more child to add, the wheel will be just a mesh.
 * @param  {object} robotSizes Sizes of the robot
 * @return {object}            The wheel that allows the robot to move
 */
function createWheel(robotSizes){
  const radius = robotSizes.wheel.r;
  const tube = robotSizes.wheel.t;
  const radialSeg = robotSizes.wheel.radialSeg;
  const tubularSeg = robotSizes.wheel.tubularSeg;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  // Texture loader
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);
  const texture = loader.load('js/m-textures/wheel.jpeg');
  texture.minFilter = THREE.NearestFilter;

  const wheelGeo = new THREE.TorusGeometry(radius, tube, radialSeg, tubularSeg);
  const wheelMat = new THREE.MeshToonMaterial({
    map: texture,
    bumpMap: texture
  });
  const mesh = new THREE.Mesh(wheelGeo, wheelMat);

  // Set the shadows and position
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth + 1, torsoHeight + 0.25, 0);
  mesh.rotation.y = 90 * Math.PI/180;
  mesh.name = "robotWheel";

  return mesh;
}

export {KillingRobot};
