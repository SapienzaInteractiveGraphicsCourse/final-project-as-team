
var KillingRobot = function(){
  // Sizes of the various robot parts
  var robotSizes = {
    torso : {h: 0.8, w: 2.5},
    head  : {rTop: 0.4, rBot: 0.8, h: 3, radialSeg: 32},
    eye   : {r: 6, s: 1},
    leg   : {distance: 2.5},
    upLeg : {h: 0.25, w: 0.25},
    midLeg: {h: 2, w: 0.2},
    lowLeg: {r: 0.2, radialSeg: 35, h: 2.8},
    wheel : {r: 0.4, t: 0.8, radialSeg: 14, tubularSeg: 81}
  }
  // Creating the root element of the robot
  const robot = new THREE.Object3D();

  // Add head
  robot.add(createHead(robotSizes));

  // Create torso. To the torso will be connected the single leg that will be
  // then attacched to the wheel
  const robotTorso = createTorso(robotSizes);

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

function createHead(robotSizes) {
  const height = robotSizes.head.h;
  const width =  robotSizes.head.w;
  const radiusTop = robotSizes.head.rTop;
  const radiusBottom = robotSizes.head.rBot;
  const radialSegments = robotSizes.head.radialSeg;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  const headObj = new THREE.Object3D();

  const headGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments );
  const headMat = new THREE.MeshBasicMaterial( {color: '#139E4D'} ); // green
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
 * Function to create the torso of the robot
 * @param  {object} robotSizes Sizes of the robot
 * @return {object}            The torso object
 */
function createTorso(robotSizes){
  const height = robotSizes.torso.h;
  const width =  robotSizes.torso.w;

  const torsoObj = new THREE.Object3D();

  const cubeGeo = new THREE.BoxBufferGeometry(width, height, width + 0.5);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#E23C19'});
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
  // The upper leg part is just a little cube attached to the cylinder inside
  // the torso.
  const cubeGeo = new THREE.BoxGeometry(width, height, width + 0.1);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#858382'}); // grey
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

  // The middle leg part is just a little cube attached to the upper leg
  const cubeGeo = new THREE.BoxGeometry(width, height, width);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#858382'}); // grey
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

  const lowerLegObj = new THREE.Object3D();
  const cylinderGeo = new THREE.CylinderGeometry(radius, radius, heightCyl, radialSegments);
  const cylinderMat = new THREE.MeshPhongMaterial({color: '#858382'}); // grey
  // This will be used as support for the connection to the wheel
  const mesh = new THREE.Mesh(cylinderGeo, cylinderMat);

  // Set the shadows and position
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth + d - 1.2, torsoHeight + 0.25, 0);
  mesh.rotation.z = 90 * Math.PI/180;
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

  const wheelGeo = new THREE.TorusGeometry(radius, tube, radialSeg, tubularSeg);
  const wheelMat = new THREE.MeshPhongMaterial({color: '#1E1C1A'}); // pseudo-black
  const mesh = new THREE.Mesh(wheelGeo, wheelMat);

  // Set the shadows and position
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth + 1, torsoHeight + 0.25, 0);
  mesh.rotation.y = 90 * Math.PI/180;

  return mesh;
}

function createWaist(robotSizes){

}


export {KillingRobot};
