// utils.js
const utils = {
    // Gerenciador de upload de imagens
    configurarUploadImagem: (botaoUpload, inputArquivo, previewImagem, limiteMB = 5) => {
        botaoUpload.addEventListener('click', () => inputArquivo.click());

        inputArquivo.addEventListener('change', (e) => {
            const arquivo = e.target.files[0];
            if (!arquivo) return;

            if (!arquivo.type.startsWith('image/')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            if (arquivo.size > limiteMB * 1024 * 1024) {
                alert(`A imagem deve ter no máximo ${limiteMB}MB.`);
                return;
            }

            const leitor = new FileReader();
            leitor.onload = (e) => {
                previewImagem.src = e.target.result;
            };
            leitor.readAsDataURL(arquivo);
        });
    },

    // Validador de campos obrigatórios
    validarCamposObrigatorios: (campos) => {
        for (const [campo, config] of Object.entries(campos)) {
            if (!campo.value.trim()) {
                alert(config.mensagem);
                campo.focus();
                return false;
            }
        }
        return true;
    },

    // Formatador de dados para exibição
    exibirDadosFormulario: (dados) => {
        console.log('Dados:', dados);
        alert('Dados salvos com sucesso!\n' + JSON.stringify(dados, null, 2));
    },

    // Função para obter usuário do db.cadastros pelo ID
    getDataById: (id, tipo) => {
        return tipo.find(item => item.__PowerAppsId__ === id);
    },

    // Função para calcular idade
    calcularIdade: (dataNascimento) => {
        const hoje = new Date(); // Data atual
        const nascimento = new Date(dataNascimento); // Converter para objeto Date

        let idade = hoje.getFullYear() - nascimento.getFullYear(); // Diferença de anos
        const mesAtual = hoje.getMonth();
        const diaAtual = hoje.getDate();

        // Ajusta a idade se o aniversário ainda não ocorreu no ano atual
        if (
            mesAtual < nascimento.getMonth() ||
            (mesAtual === nascimento.getMonth() && diaAtual < nascimento.getDate())
        ) {
            idade--;
        }

        return idade;
    },

    // Função para bloquear elementos
    lockElements: (target) => {
        for (var chave in target.elementos) {
            if (target.elementos[chave]) {
                target.elementos[chave].readOnly = true;
                target.elementos[chave].disabled = true; // adiciona disabled
                target.elementos[chave].classList.add('disabled'); // adiciona classe CSS
            }
        }
    },

    // Função para verificar campos obrigatórios
    CheckRequired: (form) => {
        const requiredInputs = form.querySelectorAll("[required]");
        let allFilled = true;

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                allFilled = false;
                input.classList.add("error");
            } else {
                input.classList.remove("error");
            }
        });

        return allFilled;
    }
};