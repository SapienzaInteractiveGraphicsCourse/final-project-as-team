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
  position.getPositionFromMatrix(shiningShooterDetailGun.matrixWorld);


  let vel = new THREE.Vector3(-Math.sin(camera.rotation.y), 0, Math.cos(camera.rotation.y));
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

  // We copy the position
  bullet.position.copy(position);

  // The bullet should always be straight, so should follow the rotation
  // of the hero, which is controlled by the pointer.
  bullet.rotation.set(
    rootHero.getObject().rotation.x,
    rootHero.getObject().rotation.y,
    rootHero.getObject().rotation.z
  )

	// set the velocity of the bullet
	bullet.velocity = new THREE.Vector3(
    rootHero.getDirection(v).x,
    rootHero.getDirection(v).y,
    rootHero.getDirection(v).z
  );
  return bullet;
}

export {Bullet}
