/**
 * Function to create the einvirorment of the scene
 * @param {[type]} scene              [description]
 * @param {[type]} collidableMeshList [description]
 */
var AddBoxes = function(scene, collidableMeshList, manager){
  var cubeGeometry = new THREE.BoxGeometry(50, 50, 500 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent:true } );
  let box = new THREE.Mesh(
      cubeGeometry,
      fakeMaterial
    );
  box.geometry.computeBoundingBox();
  box.material.transparent = true;
  box.position.set(-2310, 0, 130);
  box.visible = false;
  scene.add(box);
  collidableMeshList.push(box);

  var cubeGeometry2 = new THREE.BoxGeometry(2350, 50, 50 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial2 = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent:true} );
  let box2 = new THREE.Mesh(
      cubeGeometry2,
      fakeMaterial2
    );
  box2.geometry.computeBoundingBox();
  box2.material.transparent = true;
  box2.position.set(-2100, 0, 130);
  box2.rotation.set(0, -0.2999, 0);
  box2.visible = false;
  scene.add(box2);
  collidableMeshList.push(box2);

  var cubeGeometry3 = new THREE.BoxGeometry(50, 50, 1400 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial3 = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent:true} );
  let box3 = new THREE.Mesh(
      cubeGeometry3,
      fakeMaterial3
    );
  box3.geometry.computeBoundingBox();
  box3.material.transparent = true;
  box3.position.set(-1700, 0, 495);
  box3.rotation.set(0, 1.28, 0);
  box3.visible = false;
  scene.add(box3);
  collidableMeshList.push(box3);

  var cubeGeometry4 = new THREE.BoxGeometry(190, 50, 50 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial4 = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent:true} );
  let box4 = new THREE.Mesh(
      cubeGeometry4,
      fakeMaterial4
    );
  box4.geometry.computeBoundingBox();
  box4.material.transparent = true;
  box4.position.set(-1100, 0, 820);
  box4.rotation.set(0, 1.28, 0);
  box4.visible = false;
  scene.add(box4);
  collidableMeshList.push(box4);

  var cubeGeometry5 = new THREE.BoxGeometry(500, 50, 50 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial5 = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent:true} );
  let box5 = new THREE.Mesh(
      cubeGeometry5,
      fakeMaterial5
    );
  box5.geometry.computeBoundingBox();
  box5.material.transparent = true;
  box5.position.set(-930, 0, 230);
  box5.rotation.set(0, 1.28, 0);
  box5.visible = false;
  scene.add(box5);
  collidableMeshList.push(box5);

  var cubeGeometry6 = new THREE.BoxGeometry(50, 50, 300 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial6 = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent:true} );
  let box6 = new THREE.Mesh(
      cubeGeometry6,
      fakeMaterial6
    );
  box6.geometry.computeBoundingBox();
  box6.material.transparent = true;
  box6.position.set(-960, 0, 940);
  box6.rotation.set(0, 1.16, 0);
  box6.visible = false;
  scene.add(box6);
  collidableMeshList.push(box6);

  var cubeGeometry7 = new THREE.BoxGeometry(5, 50, 1150 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial7 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box7 = new THREE.Mesh(
      cubeGeometry7,
      fakeMaterial7
    );
  box7.geometry.computeBoundingBox();
  box7.material.transparent = true;
  box7.position.set(-280, 0, 1130);
  box7.rotation.set(0, 1.48, 0);
  box7.visible = false;
  scene.add(box7);
  collidableMeshList.push(box7);

  var textureLoad = new THREE.TextureLoader(manager);
  var textures = [];
  var materials = [];

  var cubeGeometry8 = new THREE.BoxGeometry(5, 25, 1150 , 1, 1, 1 );
  for(var counter = 0; counter < 6; counter ++) {

    // loads and stores a texture (you might run into some problems with loading images directly from a source because of security protocols, so copying the image data is a for sure way to get the image to load)
    textures[counter] = textureLoad.load('./js/images/textures/bush.jpg');

    textures[counter].wrapS = THREE.RepeatWrapping;
    textures[counter].wrapT = THREE.RepeatWrapping;
    textures[counter].repeat.set( 4, 4 );
    // creates material from previously stored texture
    materials.push(new THREE.MeshBasicMaterial({map: textures[counter]}));
  }
  let box8 = new THREE.Mesh(
      cubeGeometry8,
      materials
    );


  box8.geometry.computeBoundingBox();
  box8.material.transparent = true;
  box8.position.set(-280, 0, 1160);
  box8.rotation.set(0, 1.48, 0);
  box7.visible = false;
  scene.add(box8);
  collidableMeshList.push(box8);

  var cubeGeometry9 = new THREE.BoxGeometry(5, 50, 650 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial9 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box9 = new THREE.Mesh(
      cubeGeometry9,
      fakeMaterial9
    );
  box9.geometry.computeBoundingBox();
  box9.material.transparent = true;
  box9.position.set(550, 0, 1027);
  box9.rotation.set(0, 2.01, 0);
  box9.visible = false;
  scene.add(box9);
  collidableMeshList.push(box9);

  var cubeGeometry10 = new THREE.BoxGeometry(5, 50, 25 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial10 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box10 = new THREE.Mesh(
      cubeGeometry10,
      fakeMaterial10
    );
  box10.geometry.computeBoundingBox();
  box10.material.transparent = true;
  box10.position.set(860, 0, 890);
  box10.rotation.set(0, 1.65, 0);
  box10.visible = false;
  scene.add(box10);
  collidableMeshList.push(box10);

  var cubeGeometry11 = new THREE.BoxGeometry(190, 50, 10 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial11 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box11 = new THREE.Mesh(
      cubeGeometry11,
      fakeMaterial11
    );
  box11.geometry.computeBoundingBox();
  box11.material.transparent = true;
  box11.position.set(865, 0, 990);
  box11.rotation.set(0, 1.6, 0);
  box11.visible = false;
  scene.add(box11);
  collidableMeshList.push(box11);

  var cubeGeometry12 = new THREE.BoxGeometry(10, 50, 350 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial12 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box12 = new THREE.Mesh(
      cubeGeometry12,
      fakeMaterial12
    );
  box12.geometry.computeBoundingBox();
  box12.material.transparent = true;
  box12.position.set(1050, 0, 1055);
  box12.rotation.set(0, 1.6, 0);
  box12.visible = false;
  scene.add(box12);
  collidableMeshList.push(box12);

  var textures2 = [];
  var materials2 = [];

  var cubeGeometry13 = new THREE.BoxGeometry(2000, 25, 10 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  for(var counter = 0; counter < 6; counter ++) {

    // loads and stores a texture (you might run into some problems with loading images directly from a source because of security protocols, so copying the image data is a for sure way to get the image to load)
    textures2[counter] = textureLoad.load('./js/images/textures/bush.jpg');

    textures2[counter].wrapS = THREE.RepeatWrapping;
    textures2[counter].wrapT = THREE.RepeatWrapping;
    textures2[counter].repeat.set( 4, 4 );
    // creates material from previously stored texture
    materials2.push(new THREE.MeshBasicMaterial({map: textures[counter]}));
  }
  let box13 = new THREE.Mesh(
      cubeGeometry13,
      materials2
    );
  box13.geometry.computeBoundingBox();
  box13.material.transparent = true;
  box13.position.set(1250, 0, 800);
  box13.rotation.set(0, 1.6, 0);
  //box13.visible = false;
  scene.add(box13);
  collidableMeshList.push(box13);

  var cubeGeometry14 = new THREE.BoxGeometry(2000, 50, 10 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial14 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box14 = new THREE.Mesh(
      cubeGeometry14,
      fakeMaterial14
    );
  box14.geometry.computeBoundingBox();
  box14.material.transparent = true;
  box14.position.set(1225, 0, 800);
  box14.rotation.set(0, 1.6, 0);
  box14.visible = false;
  scene.add(box14);
  collidableMeshList.push(box14);

  var cubeGeometry15 = new THREE.BoxGeometry(25, 50, 650 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial15 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box15 = new THREE.Mesh(
      cubeGeometry15,
      fakeMaterial15
    );
  box15.geometry.computeBoundingBox();
  box15.material.transparent = true;
  box15.position.set(900, 0, -220);
  box15.rotation.set(0, 1.11, 0);
  box15.visible = false;
  scene.add(box15);
  collidableMeshList.push(box15);

  var textures3 = [];
  var materials3 = [];

  var cubeGeometry16 = new THREE.BoxGeometry(25, 25, 1000 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  for(var counter = 0; counter < 6; counter ++) {

    // loads and stores a texture (you might run into some problems with loading images directly from a source because of security protocols, so copying the image data is a for sure way to get the image to load)
    textures3[counter] = textureLoad.load('./js/images/textures/bush.jpg');

    textures3[counter].wrapS = THREE.RepeatWrapping;
    textures3[counter].wrapT = THREE.RepeatWrapping;
    textures3[counter].repeat.set( 4, 4 );
    // creates material from previously stored texture
    materials3.push(new THREE.MeshBasicMaterial({map: textures[counter]}));
  }
  let box16 = new THREE.Mesh(
      cubeGeometry16,
      materials3
    );
  box16.geometry.computeBoundingBox();
  box16.material.transparent = true;
  box16.position.set(110, 0, -360);
  box16.rotation.set(0, 1.6, 0);
  //box16.visible = false;
  scene.add(box16);
  collidableMeshList.push(box16);

  var cubeGeometry17 = new THREE.BoxGeometry(25, 50, 1000 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial17 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box17 = new THREE.Mesh(
      cubeGeometry17,
      fakeMaterial17
    );
  box17.geometry.computeBoundingBox();
  box17.material.transparent = true;
  box17.position.set(110, 0, -360);
  box17.rotation.set(0, 1.6, 0);
  box17.visible = false;
  scene.add(box17);
  collidableMeshList.push(box17);

  var cubeGeometry18 = new THREE.BoxGeometry(25, 50, 200 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial18 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box18 = new THREE.Mesh(
      cubeGeometry18,
      fakeMaterial18
    );
  box18.geometry.computeBoundingBox();
  box18.material.transparent = true;
  box18.position.set(-355, 0, -240);
  box18.rotation.set(0, 2.7, 0);
  box18.visible = false;
  scene.add(box18);
  collidableMeshList.push(box18);

  var cubeGeometry19 = new THREE.BoxGeometry(25, 50, 450 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial19 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box19 = new THREE.Mesh(
      cubeGeometry19,
      fakeMaterial19
    );
  box19.geometry.computeBoundingBox();
  box19.material.transparent = true;
  box19.position.set(-600, 0, -60);
  box19.rotation.set(0, 2.05, 0);
  box19.visible = false;
  scene.add(box19);
  collidableMeshList.push(box19);

  var cubeGeometry20 = new THREE.BoxGeometry(25, 50, 50 , 1, 1, 1 );
  // The material will be not so useful since the cube will be transparent
  var fakeMaterial20 = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent:true} );
  let box20 = new THREE.Mesh(
      cubeGeometry20,
      fakeMaterial20
    );
  box20.geometry.computeBoundingBox();
  box20.material.transparent = true;
  box20.position.set(-830, 0, 40);
  box20.rotation.set(0, 1.4, 0);
  box20.visible = false;
  scene.add(box20);
  collidableMeshList.push(box20);
}

export {AddBoxes};
