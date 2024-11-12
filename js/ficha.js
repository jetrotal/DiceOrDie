// ficha.js
class GerenciadorFicha {
  constructor() {
    this.elementos = {
      nomeJogador: document.getElementById("playerName"),
      nomePersonagem: document.getElementById("characterName"),
      nivel: document.getElementById("level"),
      raca: document.getElementById("race"),
      classe: document.getElementById("class"),
      pontosVida: document.getElementById("hp"),
      classeArmadura: document.getElementById("ac"),
      forca: document.getElementById("strength"),
      destreza: document.getElementById("dexterity"),
      constituicao: document.getElementById("constitution"),
      inteligencia: document.getElementById("intelligence"),
      sabedoria: document.getElementById("wisdom"),
      carisma: document.getElementById("charisma"),
      botaoUpload: document.getElementById("uploadButton"),
      previewPerfil: document.getElementById("profilePreview"),
      botaoEnviar: document.getElementById("submitter")
    };

    this.inputPerfil = document.createElement("input");
    this.inputPerfil.type = "file";
    this.inputPerfil.accept = "image/*";
    this.inputPerfil.style.display = "none";
    document.body.appendChild(this.inputPerfil);

    this.inicializar();
  }

  inicializar() {
    this.configurarUploadAvatar();
    this.configurarValidacaoFormulario();
    this.configurarValidacaoAtributos();
  }

  configurarUploadAvatar() {
    utils.configurarUploadImagem(
      this.elementos.botaoUpload,
      this.inputPerfil,
      this.elementos.previewPerfil
    );
  }

  configurarValidacaoFormulario() {
    this.elementos.botaoEnviar.addEventListener("click", (e) => {
      if (!CheckRequired(document.getElementById("mainForm"))) {
        scroll(0, 0);
        return;
      }

      e.preventDefault();

      const camposObrigatorios = {
        [this.elementos.nomePersonagem]: {
          mensagem: "Por favor, insira o nome do personagem"
        },
        [this.elementos.raca]: {
          mensagem: "Por favor, selecione a raça"
        },
        [this.elementos.classe]: {
          mensagem: "Por favor, selecione a classe"
        }
      };

      //            if (!utils.validarCamposObrigatorios(camposObrigatorios)) return;

      const dadosPersonagem = {
        nomeJogador: this.elementos.nomeJogador.value,
        nomePersonagem: this.elementos.nomePersonagem.value,
        nivel: this.elementos.nivel.value,
        raca: this.elementos.raca.value,
        classe: this.elementos.classe.value,
        pontosVida: this.elementos.pontosVida.value,
        classeArmadura: this.elementos.classeArmadura.value,
        atributos: {
          forca: this.elementos.forca.value,
          destreza: this.elementos.destreza.value,
          constituicao: this.elementos.constituicao.value,
          inteligencia: this.elementos.inteligencia.value,
          sabedoria: this.elementos.sabedoria.value,
          carisma: this.elementos.carisma.value
        }
      };

      utils.exibirDadosFormulario(dadosPersonagem);
    });
  }

  configurarValidacaoAtributos() {
    const atributos = [
      this.elementos.forca,
      this.elementos.destreza,
      this.elementos.constituicao,
      this.elementos.inteligencia,
      this.elementos.sabedoria,
      this.elementos.carisma
    ];

    atributos.forEach((atributo) => {
      atributo.addEventListener("change", (e) => {
        const valor = parseInt(e.target.value);
        e.target.value = Math.max(1, Math.min(20, valor));
      });
    });
  }
}

window.onload = function () {
  populateMenus();
  const ficha = new GerenciadorFicha();
};