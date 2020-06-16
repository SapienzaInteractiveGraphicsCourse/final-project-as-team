/**
 * This is the class for defining the bullegs fired by the hero gun. Creates the
 * geometry of the bullet, assign a shining material since the bullets are more
 * like laser beams.
 * @param  {object} rootHero This is the root object of the hero moved by the pointer
 * @return {object}          The function returns the bullet object.
 */
var Bullet = function(rootHero){
  const bulletGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
  const bulletMaterial = new THREE.MeshToonMaterial({
    color: 0x124212, // red
    shininess: 200.0,
    emissive: 0xdb55,
    specular: 0xdb55,
    flatShading: true
  });
  let shiningShooterDetailGun = rootHero.getObject().getObjectByName("shiningShooterDetailGun");

  // We get the position of the last part of the gun, the one where the bullets came from,
  // in order to assign it to the the bullet.
  let position = new THREE.Vector3();
  // The position is the world space
  position.setFromMatrixPosition(shiningShooterDetailGun.matrixWorld);

  // The velocity is just the direction of the radius of the goniometric circumference
  // in the plaze XZ, since we rotate along the Y axis. The radius is given by
  // the cosine and the sine. When we rotate up or down the direction is always the same
  // what changes is just the position.
  let vel = new THREE.Vector3(-Math.sin(shiningShooterDetailGun.rotation.y), 0, Math.cos(shiningShooterDetailGun.rotation.y));
  const bullet = new Physijs.BoxMesh(
		  bulletGeometry,
			bulletMaterial,
			300 // mass
		);//new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.name = "laserBeam";
  // We copy the position
  bullet.position.copy(position);

  // The bullet should always be straight, so should follow the rotation
  // of the hero, which is controlled by the pointer.
  bullet.rotation.set(
    rootHero.getObject().rotation.x,
    rootHero.getObject().rotation.y,
    rootHero.getObject().rotation.z
  )

	// Assign the velocity to the bullet, this will be used to increment the
	// position once the user will fire the shoot.
	bullet.velocity = new THREE.Vector3(
    rootHero.getDirection(vel).x,
    rootHero.getDirection(vel).y,
    rootHero.getDirection(vel).z
  );

  // Return the bullet mesh
  return bullet;
}

export {Bullet}
