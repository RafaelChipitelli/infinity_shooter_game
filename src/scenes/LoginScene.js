import Phaser from "phaser";
import { db } from "../firebase";
import CryptoJS from "crypto-js";

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super("Login");
  }

  create() {
    this.nicknameInput = this.add.dom(400, 200, "input", { placeholder: "Nickname" });
    this.passwordInput = this.add.dom(400, 260, "input", {
      type: "password",
      placeholder: "Senha",
    });
    this.feedback = this.add.text(400, 380, "", { color: "#f00" }).setOrigin(0.5);

    this.add
      .text(400, 320, "Entrar", { cursor: "pointer" })
      .setInteractive()
      .on("pointerup", () => this.handleLogin());
  }

  async handleLogin() {
    const nick = this.nicknameInput.node.value.trim();
    const pass = this.passwordInput.node.value;
    if (!nick || !pass) {
      return this.feedback.setText("Preencha todos os campos");
    }

    try {
      const doc = await db.collection("users").doc(nick).get();
      if (!doc.exists) {
        return this.feedback.setText("Nickname inválido");
      }

      const data = doc.data();
      const hash = CryptoJS.SHA256(pass).toString();
      if (hash !== data.passwordHash) {
        return this.feedback.setText("Senha incorreta");
      }

      this.registry.set("currentUser", { nick });
      localStorage.setItem("currentUser", nick);

      this.scene.start("game");
    } catch (err) {
      console.error(err);
      this.feedback.setText("Erro ao logar");
    }
  }
}
