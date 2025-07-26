import Phaser from "phaser";
import { db, FieldValue } from "../firebase";
import CryptoJS from "crypto-js";

export default class RegisterScene extends Phaser.Scene {
  constructor() {
    super("Register");
  }

  create() {
    this.nicknameInput = this.add.dom(400, 200, "input", {
      placeholder: "Nickname",
    });
    this.passwordInput = this.add.dom(400, 260, "input", {
      type: "password",
      placeholder: "Senha (min 6 chars)",
    });
    this.feedback = this.add.text(400, 380, "", { color: "#f00" }).setOrigin(0.5);

    this.add
      .text(400, 320, "Registrar", { cursor: "pointer" })
      .setInteractive()
      .on("pointerup", () => this.handleRegister());
  }

  async handleRegister() {
    const nick = this.nicknameInput.node.value.trim();
    const pass = this.passwordInput.node.value;
    if (!nick || pass.length < 6) {
      return this.feedback.setText("Nickname vazio ou senha muito curta");
    }

    try {
      const doc = await db.collection("users").doc(nick).get();
      if (doc.exists) {
        return this.feedback.setText("Nickname já existe");
      }

      const hash = CryptoJS.SHA256(pass).toString();
      await db.collection("users").doc(nick).set({
        passwordHash: hash,
        money: 0,
        skin: "default",
        createdAt: FieldValue.serverTimestamp(),
      });

      this.scene.start("Login");
    } catch (err) {
      console.error(err);
      this.feedback.setText("Erro ao registrar");
    }
  }
}
