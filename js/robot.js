
var KillingRobot = function(){
  // Sizes of the various robot parts
  var robotSizes = {
    torso : {h: 0.5, w: 3.5},
    head  : {h: 1, w: 4},
    eye   : {r: 6, s: 1},
    waist : {rTop: 2.5, rBot: 0.5, h: 2, radialSeg: 32}
  }
  // Creating the root element of the robot
  const robot = new THREE.Object3D();

  robot.add(createTorso(robotSizes));

  robot.add(createHead(robotSizes));

  return robot;
}

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

  //torsoObj.position.set(width + 1, height + 2, 0);

  return torsoObj;
}

function createHead(robotSizes) {
  const height = robotSizes.head.h;
  const width =  robotSizes.head.w;
  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  const headObj = new THREE.Object3D();

  const cubeGeo = new THREE.BoxBufferGeometry(width, height, width);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(torsoWidth + 1, torsoHeight + 5, 0);
  mesh.name = "robotHead";
  headObj.add(mesh);

  /*
  const radius = robotSizes.eye.r;
  const segments = robotSizes.eye.s;
  const triangleGeo = new THREE.CircleBufferGeometry(radius, segments);
  const triangleMat = new THREE.MeshBasicMaterial({color: ' 0xff0000 '});
  const triangle = new THREE.Mesh(triangleGeo, triangleMat);
  triangle.position.set(torsoWidth + 1, torsoHeight + 5, 1);
  mesh.name = "eye";
  headObj.add(triangle);*/

  return headObj;
}

function createWaist(robotSizes){
  const height = robotSizes.waist.h;
  const width =  robotSizes.waist.w;
  const radiusTop = robotSizes.waist.rTop;
  const radiusBottom = robotSizes.waist.rBot;
  const radialSegments = robotSizes.waist.radialSeg;

  const torsoHeight = robotSizes.torso.h;
  const torsoWidth = robotSizes.torso.w;

  const waistObj = new THREE.Object3D();

  const waistGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments );
  const waistMat = new THREE.MeshBasicMaterial( {color: '#000000'} );
  const waist = new THREE.Mesh(waistGeo, waistMat);
  waist.castShadow = true;
  waist.receiveShadow = true;
  waist.position.set(torsoWidth + 1, torsoHeight - 0.5, 0);
  waist.name = "robotWaist";
  waistObj.add(waist);

  return waistObj;
}


export {KillingRobot};
