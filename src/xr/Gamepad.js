import GamepadButton from './GamepadButton';

export default class Gamepad {
  constructor(gamepad) {
    if (!gamepad) return;

    this.axes = gamepad.axes;
    this.id = gamepad.id;
    this.index = gamepad.index;
    this.mapping = gamepad.mapping;
    this.timestamp = gamepad.timestamp;
    this.vibrationActuator = gamepad.vibrationActuator;

    this.buttons = gamepad.buttons.map((button) => {
      return new GamepadButton(button);
    });
  }
}
