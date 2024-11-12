// cadastro.js
class GerenciadorCadastro {
  constructor() {
    this.expLevels = {
      0: "Goblin",
      1: "Cavaleiro",
      2: "Mago",
      3: "Dragão",
      4: "Titã",
      5: "Deus Antigo"
    };

    this.elementos = {
      expDots: document.querySelectorAll(".exp-dot"),
      expLevel: document.getElementById("expLevel"),
      decreaseExp: document.getElementById("decreaseExp"),
      increaseExp: document.getElementById("increaseExp"),
      uploadButton: document.getElementById("uploadButton"),
      profilePreview: document.getElementById("profilePreview"),
      form: document.getElementById("registrationForm"),
      senha: document.getElementById("senha"),
      confirmarSenha: document.getElementById("confirmarSenha"),
      submitter: document.getElementById("submitter")
    };

    this.currentExp = 0;

    this.profileInput = document.createElement("input");
    this.profileInput.type = "file";
    this.profileInput.accept = "image/*";
    this.profileInput.style.display = "none";
    document.body.appendChild(this.profileInput);

    this.inicializar();
  }

  inicializar() {
    this.configurarExperiencia();
    this.configurarUploadFoto();
    this.configurarValidacaoFormulario();
  }

  configurarExperiencia() {
    const updateExperience = (level) => {
      this.currentExp = Math.max(0, Math.min(5, level));
      this.elementos.expLevel.textContent = this.expLevels[this.currentExp];
      this.elementos.expDots.forEach((dot, index) => {
        dot.classList.toggle("active", index < this.currentExp);
      });
    };

    this.elementos.decreaseExp.addEventListener("click", () =>
      updateExperience(this.currentExp - 1)
    );
    this.elementos.increaseExp.addEventListener("click", () =>
      updateExperience(this.currentExp + 1)
    );
    this.elementos.expDots.forEach((dot, index) => {
      dot.addEventListener("click", () => updateExperience(index + 1));
    });
  }

  configurarUploadFoto() {
    utils.configurarUploadImagem(
      this.elementos.uploadButton,
      this.profileInput,
      this.elementos.profilePreview
    );
  }

  configurarValidacaoFormulario() {
    this.elementos.submitter.addEventListener("click", (e) => {
      if (!CheckRequired(document.getElementById("mainForm"))) {
        scroll(0, 0);
        return;
      }

      e.preventDefault();

      if (this.elementos.senha.value !== this.elementos.confirmarSenha.value) {
        alert("As senhas não coincidem");
        return;
      }

      const formData = {
        nome: document.getElementById("nome").value,
        sobrenome: document.getElementById("sobrenome").value,
        genero: document.getElementById("genero").value,
        nascimento: document.getElementById("nascimento").value,
        contato: document.getElementById("contato").value,
        experiencia: this.currentExp
      };

      utils.exibirDadosFormulario(formData);
    });
  }
}

window.onload = function () {
  populateMenus();
  const cadastro = new GerenciadorCadastro();
};