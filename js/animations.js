import './tween/tween.esm.js'

let WalkingAnimation = function(root, position){

  var tween = new TWEEN.Tween(position)
  .to({ x: 5 * Math.PI/180 }, 2000)
  .start();

  var tweenTwo = new TWEEN.Tween(position).to({ x: -20 * Math.PI/180 }, 2000)
  .start();

  tween.chain(tweenTwo);
  tweenTwo.chain(tween);
}

export { WalkingAnimation };
