var Bullet = function(controls){
  const bulletGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
  const bulletMaterial = new THREE.MeshToonMaterial({
    color: 0x124212, // red
    shininess: 200.0,
    emissive: 0xdb55,
    specular: 0xdb55,
    flatShading: true
  });

  let time = Date.now();
  const camera = controls.getObject();

  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
	// Position the bullet at the end of player's gun

	bullet.position.set(
    controls.getObject().position.x,
		controls.getObject().position.y + 2.5,
		controls.getObject().position.z
	);

  // bullet.rotation.y = Math.PI;
  console.log(controls.getObject());
	// set the velocity of the bullet
	bullet.velocity = new THREE.Vector3(
		-Math.sin(controls.getObject().rotation.y), //-Math.sin(camera.rotation.y),
		0,
		Math.cos(controls.getObject().rotation.y) //Math.cos(camera.rotation.y)
	);

  return bullet;
}

export {Bullet}
