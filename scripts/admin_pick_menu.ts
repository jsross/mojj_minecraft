import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";

import * as mcui from "@minecraft/server-ui";

export class CustomModalForm {
    private player: any;
    private modalForm: any;

    constructor(player: any) {
        this.player = player;
        this.modalForm = new mcui.ModalFormData().title("Example Modal Controls for ModalFormData");
        // ... (rest of your modal form definition)
    }

    public show() {
        this.modalForm
            .show(this.player)
            .then((formData:any) => {
                this.player.sendMessage(`Modal form results: ${JSON.stringify(formData.formValues, undefined, 2)}`);
            })
            .catch((error: Error) => {
                console.log("Failed to show form: " + error);
            });
    }
}
