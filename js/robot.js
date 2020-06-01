
var KillingRobot = function(){
  // Sizes of the various robot parts
  var robotSizes = {
    torso : {h: 3, w: 4.5},
    head  : {h: 1, w: 4},
    eye   : {r: 6, s: 1},
    waist : {rTop: 2.5, rBot: 0.5, h: 2, radialSeg: 32}
  }
  // Creating the root element of the robot
  const robot = new THREE.Object3D();

  robot.add(createTorso(robotSizes));

  robot.add(createHead(robotSizes));

  robot.add(createWaist(robotSizes));

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

  const radius = 1.8;
  const wSeg = 35;
  const hSeg = 35;
  const sphereGeo = new THREE.SphereGeometry( radius, wSeg, hSeg);

  const rightShoulderMesh = new THREE.Mesh(sphereGeo, cubeMat);
  const leftShoulderMesh = new THREE.Mesh(sphereGeo, cubeMat);

  rightShoulderMesh.castShadow = true;
  rightShoulderMesh.receiveShadow = true;
  rightShoulderMesh.position.set(3.5, height + 2, 0);

  leftShoulderMesh.castShadow = true;
  leftShoulderMesh.receiveShadow = true;
  leftShoulderMesh.position.set(3 + width, height + 2, 0);

  torsoObj.add(rightShoulderMesh);
  torsoObj.add(leftShoulderMesh);

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
