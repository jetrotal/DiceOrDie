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
let mesa
window.onload = function() {
    populateMenus();




    mesa = new GerenciadorMesa();

    if (target) {
        const usuario = getDataById(target, db.mesas);
        console.log(usuario);

        /* usuario:
        Autor
: 
"teste"
Banner [image]
: 
"https://marilianoticia.com.br/wp-content/uploads/2024/08/17159145166646c714af352_1715914516_3x2_lg-256x256.jpg"
Chat
: 
""
Descricao
: 
"Revivendo uma aventura de Arton! \n\nJogadores interessados devem entrar em contato com email@gmail.com\n\nData limite: 25/08/1994 \nHorario das partidas: 22 horas."
Nome_Mesa
: 
"Aventura em Tormenta"
Qtd_Jogadores
: 
"7"
Sistema
: 
"3D&T"
Vagas
: 
"true"
__PowerAppsId__
: 
"83a3fc4b33ae4667b1e3090f9ecd71a2" */

        mesa.elementos.nomeMesa.value = usuario.Nome_Mesa;
        mesa.elementos.sistema.value = usuario.Sistema;
        mesa.elementos.qtdJogadores.value = usuario.Qtd_Jogadores;
        mesa.elementos.descricao.value = usuario.Descricao;
        mesa.elementos.previewCapa.src = usuario["Banner [image]"];
        mesa.elementos.autor.value = usuario.Autor;
        mesa.elementos.publico.checked = usuario.Vagas === "true";
        mesa.elementos.publicoLabel.textContent = usuario.Vagas === "true" ? "Sim" : "Não";
        lockElements(mesa)
            //add button
        if (usuario.Vagas === "true") {
            mesa.elementos.botaoEnviar.classList.remove("disabled");
            mesa.elementos.botaoEnviar.innerText = "Participar";
            mesa.elementos.botaoEnviar.removeAttribute("disabled");

            // Create clone
            var new_element = mesa.elementos.botaoEnviar.cloneNode(true);

            // Add the event listener to the new element
            new_element.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `../html/chat.html?session=${session}&view=${usuario.__PowerAppsId__}`;
            });

            // Replace the old element with the new one
            mesa.elementos.botaoEnviar.parentNode.replaceChild(new_element, mesa.elementos.botaoEnviar);

            // Update the reference to point to the new element
            mesa.elementos.botaoEnviar = new_element;
        }
    }
};