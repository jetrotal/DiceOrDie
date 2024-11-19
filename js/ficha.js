// ficha.js

podeVoltar = true;
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
let ficha;
window.onload = function() {
    populateMenus();
    ficha = new GerenciadorFicha();
    if (target) {
        const usuario = getDataById(target, db.fichas);
        console.log(usuario);

        /* 0
: 
Atr_Carisma
: 
8
Atr_Constituicao
: 
12
Atr_Destreza
: 
14
Atr_Forca
: 
13
Atr_Inteligencia
: 
10
Atr_Sabedoria
: 
8
Classe
: 
"Guerreiro"
Classe_Armadura
: 
13
Nivel
: 
"1"
Nome_Jogador
: 
"Marco"
Nome_Personagem
: 
"Mokidesia"
PV
: 
14
Raca
: 
"Anão"
portrait_personagem [image]
: 
"https://ugc-idle.s3-us-west-2.amazonaws.com/94608e854d9747efaa6ef81d7dc7bd36.jpg"
__PowerAppsId__
: 
"5badcee7eeb6496aa999f9e286e31677" */

        ficha.elementos.nomeJogador.value = usuario.Nome_Jogador;
        ficha.elementos.nomePersonagem.value = usuario.Nome_Personagem;
        ficha.elementos.nivel.value = usuario.Nivel;
        ficha.elementos.raca.value = usuario.Raca;
        ficha.elementos.classe.value = usuario.Classe;
        ficha.elementos.pontosVida.value = usuario.PV;
        ficha.elementos.classeArmadura.value = usuario.Classe_Armadura;
        ficha.elementos.forca.value = usuario.Atr_Forca;
        ficha.elementos.destreza.value = usuario.Atr_Destreza;
        ficha.elementos.constituicao.value = usuario.Atr_Constituicao;
        ficha.elementos.inteligencia.value = usuario.Atr_Inteligencia;
        ficha.elementos.sabedoria.value = usuario.Atr_Sabedoria;
        ficha.elementos.carisma.value = usuario.Atr_Carisma;
        ficha.elementos.previewPerfil.src = usuario["portrait_personagem [image]"];

        lockElements(ficha)
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