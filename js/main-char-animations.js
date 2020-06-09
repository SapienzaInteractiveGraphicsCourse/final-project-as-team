
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
    this.reloadFlag = true;
    this.walkingFlag = true;
    this.startingArmPos = root.getObjectByName("heroRightArm").position.z;
    this.startingGunMagazinePos = root.getObjectByName("gunCharger").position.z;
  }

  verticalPosition = 0;

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
   * is just an increment and a decrement of the y coordinate.
   * @return {[type]} [description]
   */
  walking(){
    if(this.walkingFlag){
      if(this.verticalPosition.toPrecision(4) != 0.009){
        this.verticalPosition += 0.0005;
        this.root.position.y += this.verticalPosition;
      }
      else{
        this.walkingFlag = false;
      }
    }
    else{
      if(this.verticalPosition.toPrecision(4) != -0.01){
        this.verticalPosition -= 0.0005;
        this.root.position.y += this.verticalPosition;
        console.log(this.verticalPosition);
      }
      else{
        this.walkingFlag = true;
      }
    }
  }

}

export { AnimateHero };
