import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

export class AdminPickConfigModalForm extends ModalFormData {
  private readonly _width: number;
  private readonly _height: number;
  private readonly _length: number;

  constructor(width: number, height: number, length: number) {
    super();

    this._width = width;
    this._height = height;
    this._length = length;

    this.init();
  }

  private init() {
    this.title("Example Modal Controls for ModalFormData");

    this.slider("Width", 1, 51, 2, this._width);
    this.slider("Height", 1, 51, 2, this._height);
    this.slider("Length", 1, 51, 2, this._length);
  }
}
