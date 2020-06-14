/**
 * This class is used to handle the sound effects of the application.
 * We have an object containing the path of the sound effect, the duration
 * that is -1 if it is not used and the sound, which will contain the
 * buffer once the audio is loaded.
 */
class SoundManager {
  constructor(){
    // Create the audio loader
    this.audioLoader =  new THREE.AudioLoader();
    this.activateWalking = false;
    this.soundEffects = {
      blaster : { path: "js/sounds/blaster.wav", duration: 0.3, loop: false, volume: 0.8, play: true},
      reload  : { path: "js/sounds/reload.wav", duration: -1, loop: false, volume: 0.5, play: true },
      walking : { path: "js/sounds/walking.wav", duration: 0.3, loop: false, volume: 0.5, play: false },
      breath  : { path: "js/sounds/breath.wav", duration: -1, loop: true, volume: 1, play: true}
    }
  }

  /**
   * Methods for loading and then play the sound effects.
   * @return {void} the function just loads the sounds
   */
  playSound(listener, s){
    // Set the listener and the buffer
    let newSound = new THREE.Audio(listener);
    let duration = this.soundEffects[s].duration;
    let loop = this.soundEffects[s].loop;
    let volume = this.soundEffects[s].volume;

    this.audioLoader.load(this.soundEffects[s].path, function(buffer) {
      newSound.setBuffer(buffer);
      // Setting the volume
      newSound.setVolume(1);
      // Check if the duration is set
      if(duration != -1){
          newSound.duration = duration;
      }
      if(volume != null){
        newSound.setVolume = volume;
      }
      // Setting the loop
      newSound.setLoop(loop);
    }); // End audio loader

    return newSound;
  } // End method
}

export {SoundManager}
