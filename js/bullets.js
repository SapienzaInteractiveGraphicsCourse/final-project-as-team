var Bullet = function(rootHero){
  const bulletGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
  const bulletMaterial = new THREE.MeshToonMaterial({
    color: 0x124212, // red
    shininess: 200.0,
    emissive: 0xdb55,
    specular: 0xdb55,
    flatShading: true
  });

  let time = Date.now();
  const camera = rootHero;

  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
	// Position the bullet at the end of player's gun
	const r = rootHero.getObjectByName("heroTorso");
  r.add(bullet);
  bullet.rotation.y = r.rotation.y;
  bullet.rotation.x = r.rotation.x;
  bullet.rotation.z = r.rotation.z;

	bullet.position.set(
    r.position.x,
		r.position.y,
		r.position.z
	);

	// set the velocity of the bullet
	bullet.velocity = new THREE.Vector3(
		-Math.sin(rootHero.getObjectByName("heroCamera").rotation.y), //-Math.sin(camera.rotation.y),
		0,
		-Math.cos(rootHero.getObjectByName("heroCamera").rotation.y) //Math.cos(camera.rotation.y)
	);

  return bullet;
}

export {Bullet}
