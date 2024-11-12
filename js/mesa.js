// mesa.js

class GerenciadorMesa {
    constructor() {
        this.elementos = {
            form: document.getElementById("mesaForm"),

            nomeMesa: document.getElementById("nomeMesa"),

            sistema: document.getElementById("sistema"),

            qtdJogadores: document.getElementById("qtdJogadores"),

            autor: document.getElementById("autor"),

            publico: document.getElementById("publico"),

            publicoLabel: document.getElementById("publicoLabel"),

            descricao: document.getElementById("descricao"),

            botaoUpload: document.getElementById("uploadButton"),

            previewCapa: document.getElementById("campaignPreview"),

            inputCapa: document.getElementById("campaignInput"),

            botaoEnviar: document.getElementById("submitter")
        };

        this.maxDescricaoLength = 1000;

        this.inputCapa = document.createElement("input");
        this.inputCapa.type = "file";
        this.inputCapa.accept = "image/*";
        this.inputCapa.style.display = "none";
        document.body.appendChild(this.inputCapa);

        this.inicializar();
    }

    inicializar() {
        this.configurarAutor();

        this.configurarTogglePublico();

        this.configurarUploadCapa();

        this.configurarValidacaoFormulario();

        this.configurarLimiteDescricao();
    }

    configurarAutor() {
        this.elementos.autor.value = "Player";
    }

    configurarTogglePublico() {
        this.elementos.publico.addEventListener("change", (e) => {
            this.elementos.publicoLabel.textContent = e.target.checked ?
                "Sim" :
                "Não";
        });
    }

    configurarUploadCapa() {
        utils.configurarUploadImagem(
            this.elementos.botaoUpload,

            this.inputCapa,

            this.elementos.previewCapa
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
                [this.elementos.nomeMesa]: {
                    mensagem: "Por favor, insira o nome da mesa"
                },

                [this.elementos.sistema]: {
                    mensagem: "Por favor, selecione um sistema"
                },

                [this.elementos.qtdJogadores]: {
                    mensagem: "Por favor, selecione a quantidade de jogadores"
                },

                [this.elementos.descricao]: {
                    mensagem: "Por favor, adicione uma descrição para a campanha"
                }
            };

            // if (!utils.validarCamposObrigatorios(camposObrigatorios)) return;

            const dadosMesa = {
                nomeMesa: this.elementos.nomeMesa.value.trim(),

                sistema: this.elementos.sistema.value,

                qtdJogadores: parseInt(this.elementos.qtdJogadores.value),

                autor: this.elementos.autor.value,

                publico: this.elementos.publico.checked,

                descricao: this.elementos.descricao.value.trim(),

                imagem: this.elementos.previewCapa.src
            };

            utils.exibirDadosFormulario(dadosMesa);
        });
    }

    configurarLimiteDescricao() {
        this.elementos.descricao.addEventListener("input", (e) => {
            if (e.target.value.length > this.maxDescricaoLength) {
                e.target.value = e.target.value.slice(0, this.maxDescricaoLength);

                alert(
                    `A descrição deve ter no máximo ${this.maxDescricaoLength} caracteres`
                );
            }
        });
    }
}

window.onload = function() {
    populateMenus();
    const mesa = new GerenciadorMesa();
};