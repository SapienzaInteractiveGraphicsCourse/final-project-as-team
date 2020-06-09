
/**
 * This will be the exported module where all animations take place
 * thanks to the different functions in order to move the various parts.
 * In this we created a class, because the animations are not handled
 * with Tween.js, because we have to trigger this animation only when
 * needed.
 *
 */
class AnimateHero {
  constructor(root){
    this.root = root;

    // Flags for triggering animations
    // Reload
    this.reloadFlag = true;
    // Look through the target
    this.activateTargetMode = false;

    // Original position used for animations
    this.startingArmPos = root.getObjectByName("heroRightArm").position.z;
    this.startingGunMagazinePos = root.getObjectByName("gunCharger").position.z;
    this.cameraOriginalPos = {
      x: this.root.getObjectByName("heroCamera").position.x,
      y: this.root.getObjectByName("heroCamera").position.y,
      z: this.root.getObjectByName("heroCamera").position.z
    };

    console.log(this.cameraOriginalPos);
  }
  // This variables are used for the animations (for sinusoids)
  verticalPosition = 0;
  horizontalPosition = 0;

  cameraDestPos = {x: -5.5, y: 5.8, z: 5};

  /**
   * This is the function for getting the animation of the reload action once
   * munitions are over.
   * @return {void} The function does not return anithing.
   */
  reload(){
    if(this.reloadFlag){
      if(this.root.getObjectByName("heroRightArm").position.z.toPrecision(2) != this.startingArmPos - 1){
        this.root.getObjectByName("heroRightArm").position.z -= 0.05;
        this.root.getObjectByName("gunCharger").position.z -= 0.05;
      }
      else{
        this.reloadFlag = false;
      }
    }
    else{
      if(this.root.getObjectByName("heroRightArm").position.z.toPrecision(2) != this.startingArmPos){
        this.root.getObjectByName("heroRightArm").position.z += 0.05;
        this.root.getObjectByName("gunCharger").position.z += 0.05;
      }
    }
  }

  /**
   * This the function for recreating the walking movement of the hero, that
   * is sinusoid which increments and decrements the y coordinate.
   * @return {void} The function just updates the position .
   */
  walking(){
    this.root.position.y += Math.sin(this.verticalPosition) * 0.015;
    this.verticalPosition += Math.PI/32;
  }

  /**
   * This function is used to simulate the shooting action.
   * @return {void} The function simply applies a sinusoid on the z axis.
   */
  shooting(){
    this.root.position.z += Math.sin(this.horizontalPosition) * 0.1;
    this.horizontalPosition += Math.PI/8;
  }

  /**
   * Change the view in order to look through the target on the gun.
   * @return {void} Just change the coordinates of hero camera.
   */
  targetMode(){
    // Go in target mode
    if(this.activateTargetMode){
      if(this.root.getObjectByName("heroCamera").position.x.toPrecision(2) != this.cameraDestPos.x.toPrecision(2)){
        this.root.getObjectByName("heroCamera").position.x += 0.1;
      }
      if(this.root.getObjectByName("heroCamera").position.y.toPrecision(2) != this.cameraDestPos.y.toPrecision(2)){
        this.root.getObjectByName("heroCamera").position.y += 0.1;
      }
      if(this.root.getObjectByName("heroCamera").position.z.toPrecision(2) != this.cameraDestPos.z.toPrecision(2)){
        this.root.getObjectByName("heroCamera").position.z += 0.5;
      }
    }
    // Came back to the orginal view
    else{
      if(this.root.getObjectByName("heroCamera").position.x.toPrecision(2) != this.cameraOriginalPos.x.toPrecision(2)){
        this.root.getObjectByName("heroCamera").position.x -= 0.1;
      }
      if(this.root.getObjectByName("heroCamera").position.y.toPrecision(2) != this.cameraOriginalPos.y.toPrecision(2)){
        this.root.getObjectByName("heroCamera").position.y -= 0.1;
      }
      if(this.root.getObjectByName("heroCamera").position.z.toPrecision(2) != this.cameraOriginalPos.z.toPrecision(2)){
        this.root.getObjectByName("heroCamera").position.z -= 0.5;
      }
    }
  }

}

export { AnimateHero };
