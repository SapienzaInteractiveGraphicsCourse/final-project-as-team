// This file is used for making the movements of the robot, by building
// animations using Tween.js for smooth animations.

// Position is the object with the variables to update in order to animate
// the various parts of the robot

let position = {
  cannonRot : 0,
  headRot   : 0,
  legsRot   : 0
}
// Defining two tween for incrementing and decrementing the values
// in the position objec

// Incrementing
var tween = new TWEEN.Tween(position)
.to({ cannonRot: 100 * Math.PI/180,
      headRot  : 5 * Math.PI/180,
      legsRot  : 5 * Math.PI/180
    }, 2000)
.start();

// Decrementing
var tweenTwo = new TWEEN.Tween(position)
.to({ cannonRot: -100 * Math.PI/180,
      headRot  : -5 * Math.PI/180,
      legsRot  : -5 * Math.PI/180
    }, 2000);


// Chanining the tweens
tween.chain(tweenTwo);
tweenTwo.chain(tween);

/**
 * This will be the exported module where all animations take place
 * thanks to the different functions in order to move the various parts.
 * @param  {Object} root  This is the root element of the object
 * @return {void}         Not return anything, just build the animations
 */
let AnimateRobot = function(root){
  // Methods providing animations
  movingCannon(true, root);
  rotatingWheel(true, root);
  movingHead(true, root);
}
/**
 * Function to rotate the cannon parts
 * @param  {bool}   flagVar Set to true to switch on the animation
 * @param  {object} root    This is the root element of the object
 * @return {void}           The function does not return anything
 */
function movingCannon(flagVar, root){
  if(flagVar){
    root.getObjectByName("robotShooter").rotation.y = position.cannonRot;
    root.getObjectByName("robotShooterViewFinder").rotation.z = position.cannonRot;
  }
}

/**
 * Function to rotate the wheel of the robot
 * @param  {bool}   flagVar Set to true to switch on the animation
 * @param  {object} root    This is the root element of the object
 * @return {void}           The function does not return anything
 */
function rotatingWheel(flagVar, root){
  if(flagVar){
    root.getObjectByName("robotWheel").rotation.x += 0.05;
  }
}
/**
 * This function is used to move up and down the robot head, while is
 * moving
 * @param  {bool}   flagVar Set to true to switch on the animation
 * @param  {object} root    This is the root element of the object
 * @return {void}           The function does not return anything
 */
function movingHead(flagVar, root){
  if(flagVar){
    root.getObjectByName("robotHead").rotation.x = (110 * Math.PI/180) - position.headRot;
  }
}

export { AnimateRobot };
