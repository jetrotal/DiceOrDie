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

let cadastro;
window.onload = function() {

    if (session == "new") {
        document.getElementById("sidemenu").style.display = "none";
        document.getElementsByClassName('deco-axe')[0].style.display = "none";
        document.body.style.paddingLeft = "0";

        const menuData = {
            top: [{
                url: `../index.html`,
                text: `Home `
            }],
            side: []
        };
        populateMenus(menuData);
    } else populateMenus();

    cadastro = new GerenciadorCadastro();

    if (session == target && target != "new") {
        const usuario = getDataById(target, db.cadastros);
        console.log(usuario);

        // Fill in basic form fields
        document.getElementById("nome").value = usuario.Nome;
        document.getElementById("sobrenome").value = usuario.Sobrenome;
        const generoSelect = document.getElementById("genero");
        if (generoSelect) {
            Array.from(generoSelect.options).forEach(option => {
                option.selected = false;
                if (option.text === usuario.Genero) {
                    option.selected = true;
                }
            });
        }
        const dataNascimento = usuario.Data_Nascimento; // Exemplo: "5/30/1989"
        const partesData = dataNascimento.split('/'); // Divide em ["5", "30", "1989"]

        // Reorganiza para o formato yyyy-MM-dd
        const dataFormatada = `${partesData[2]}-${partesData[0].padStart(2, '0')}-${partesData[1].padStart(2, '0')}`;

        document.getElementById("nascimento").value = dataFormatada;
        document.getElementById("contato").value = usuario.Email; // Email is used as login
        document.getElementById("senha").value = usuario.Senha;
        document.getElementById("confirmarSenha").value = usuario.Senha;

        // Set experience level
        const expLevel = parseInt(usuario.Experiencia);
        cadastro.currentExp = expLevel;
        cadastro.elementos.expLevel.textContent = cadastro.expLevels[expLevel];
        cadastro.elementos.expDots.forEach((dot, index) => {
            dot.classList.toggle("active", index < expLevel);
        });

        // Set profile picture
        const profilePreview = document.getElementById("profilePreview");
        if (usuario["Foto_perfil [image]"] && profilePreview) {
            profilePreview.src = usuario["Foto_perfil [image]"];
            profilePreview.alt = "Profile Picture";
        }

        // Lock elements to prevent editing if needed
        if (typeof lockElements === "function") {
            //lockElements(cadastro);
        }

        // Modify submit button behavior
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]') ||
            document.querySelector('.btn-primary') ||
            cadastro.elementos.submitter;

        if (submitButton) {
            submitButton.classList.remove("disabled");
            submitButton.innerText = "Atualizar";
            submitButton.removeAttribute("disabled");

            // Create clone of submit button
            const newButton = submitButton.cloneNode(true);

            // Add event listener to the new button
            newButton.addEventListener("click", (e) => {
                e.preventDefault();
                window.location.href = `../html/perfil.html?session=${session}&view=${usuario.__PowerAppsId__}`;
            });

            // Replace old button with new one
            submitButton.parentNode.replaceChild(newButton, submitButton);

            // Update the reference
            if (cadastro.elementos.submitter === submitButton) {
                cadastro.elementos.submitter = newButton;
            }
        }
    }
};