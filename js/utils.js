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
    }
};

function CheckRequired(form) {
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
