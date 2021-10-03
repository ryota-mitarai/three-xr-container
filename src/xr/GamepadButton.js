export default class GamepadButton {
  constructor(gamepadButton) {
    this.pressed = gamepadButton.pressed;
    this.touched = gamepadButton.touched;
    this.value = gamepadButton.value;
  }
}
