import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";

export class TestActionFormFactory extends ModalFormData {
  constructor(teleporterName: string) {
    super();
    this.init();
  }

  private init() {
    this.title("Teleport Block");
    this.textField("Name", "Name");
  }
}
