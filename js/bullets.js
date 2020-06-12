var Bullet = function(rootHero){
  const bulletGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
  const bulletMaterial = new THREE.MeshToonMaterial({
    color: 0x124212, // red
    shininess: 200.0,
    emissive: 0xdb55,
    specular: 0xdb55,
    flatShading: true
  });
  let camera = rootHero.getObject();
  let v = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
	// Position the bullet at the end of player's gun
	bullet.position.set(
		camera.position.x + 6,
		camera.position.y + 2,
		camera.position.z - 10
	);

  bullet.rotation.set(
    rootHero.getObject().rotation.x,
    rootHero.getObject().rotation.y,
    rootHero.getObject().rotation.z
  )

	// set the velocity of the bullet
	bullet.velocity = rootHero.getDirection(v);
  console.log(bullet.velocity);
  return bullet;
}

export {Bullet}
