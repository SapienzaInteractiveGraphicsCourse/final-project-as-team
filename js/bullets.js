/**
 * This is the class for defining the bullegs fired by the hero gun. Creates the
 * geometry of the bullet, assign a shining material since the bullets are more
 * like laser beams.
 * @param  {object} root This is the root object which perform the shooting either robot or the game hero
 * @return {object}      The function returns the bullet object.
 */
var Bullet = function(root, target){
  let bulletMaterial, bulletGeometry;
  let startingPoint;

  if(root.name == "robotBoss"){
    bulletGeometry = new THREE.BoxGeometry(3, 3, 3);
    bulletMaterial = new THREE.MeshToonMaterial({
      color: 0xff0000, // red
      shininess: 200.0,
      emissive: 0xf25656,
      specular: 0xf25656,
      flatShading: true
    });
    startingPoint = root.getObjectByName("robotShooterOuterPart");
  }
  else{
    bulletGeometry = new THREE.BoxGeometry(0.6, 0.6, 2);
    bulletMaterial = new THREE.MeshToonMaterial({
      color: 0x124212, // green
      shininess: 200.0,
      emissive: 0xdb55,
      specular: 0xdb55,
      flatShading: true
    });
    startingPoint = root.getObject().getObjectByName("shiningShooterDetailGun");
  }

  // We get the position of the last part of the gun, the one where the bullets came from,
  // in order to assign it to the the bullet.
  let position = new THREE.Vector3();
  // The position is the world space
  position.setFromMatrixPosition(startingPoint.matrixWorld);

  // The velocity is just the direction of the radius of the goniometric circumference
  // in the plaze XZ, since we rotate along the Y axis. The radius is given by
  // the cosine and the sine. When we rotate up or down the direction is always the same
  // what changes is just the position.
  let vel = new THREE.Vector3(-Math.sin(startingPoint.rotation.y), 0, Math.cos(startingPoint.rotation.y));
  const bullet = new THREE.Mesh(
		  bulletGeometry,
			bulletMaterial,
		);

  // Depending on the who is shooting the bullet will have a different name
  if(root.name == "robotBoss"){
    bullet.name == "killingBeam";
    // We copy the position
    bullet.position.copy(position);

    // The bullet should always be straight, so should follow the rotation
    // of the hero, which is controlled by the pointer.
    bullet.rotation.set(
      root.rotation.x,
      root.rotation.y,
      root.rotation.z
    )
    bullet.velocity = new THREE.Vector3(
      -(target.getDirection(vel).x + 0.5),
      target.getDirection(vel).y,
      -target.getDirection(vel).z
    );
  }
  else{
    bullet.name = "laserBeam";
    // We copy the position
    bullet.position.copy(position);

    // The bullet should always be straight, so should follow the rotation
    // of the hero, which is controlled by the pointer.
    bullet.rotation.set(
      root.getObject().rotation.x,
      root.getObject().rotation.y,
      root.getObject().rotation.z
    )

    // Assign the velocity to the bullet, this will be used to increment the
  	// position once the user will fire the shoot.
  	bullet.velocity = new THREE.Vector3(
      root.getDirection(vel).x * 5,
      root.getDirection(vel).y * 5,
      root.getDirection(vel).z * 5
    );
  }

  // Return the bullet mesh
  return bullet;
}

export {Bullet}
