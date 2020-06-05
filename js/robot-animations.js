import './tween/tween.esm.js'
let position = {
  cannonRot : 0
}
var tween = new TWEEN.Tween(position)
.to({ cannonRot: 10 * Math.PI/180 }, 2000)
.start();

var tweenTwo = new TWEEN.Tween(position)
.to({ cannonRot: -20 * Math.PI/180 }, 2000)

tween.chain(tweenTwo);
tweenTwo.chain(tween);

let AnimateRobot = function(root){
  root.traverse(function(child){
    movingCannon(true, child);
    rotatingWheel(true, child);
  })
}

function movingCannon(flagVar, child){
  if(flagVar){
    if(child.name == "robotShooter"){
      child.rotation.x = position.cannonRot;
    }
    if(child.name == "robotShooterViewFinder"){
      child.rotation.y = position.cannonRot;
    }
  }
}

function rotatingWheel(flagVar, child){
  if(flagVar){
    if(child.name == "robotWheel"){
      child.rotation.x += 0.05;
    }
  }
}

export { AnimateRobot };
