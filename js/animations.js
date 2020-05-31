import './tween/tween.esm.js'
function walkingAnimation(root){
  let position = { x:0 };
  var tween = new TWEEN.Tween(position)
  .to({ x: 30 * Math.PI/180 }, 2000)
  .start();

  var tweenTwo = new TWEEN.Tween(position).to({ x: -20 * Math.PI/180 }, 2000)
  .start();

  tween.chain(tweenTwo);
  tweenTwo.chain(tween);

  root.traverse((o) => {
    if(o.name.includes("LeftUpLeg_")){
      o.rotation.x=position.x;
    }
  });
}

export { walkingAnimation };
