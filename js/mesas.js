// Definição da estrutura dos dados das mesas
let mesasData = [];

class GerenciadorCards {
    constructor() {
        this.containerCards = document.querySelector(".tables-container");
        this.searchInput = document.querySelector(".search-input");
        this.mesas = mesasData;
        this.inicializar();
    }

    inicializar() {
        this.renderizarCards();
        this.configurarBusca();
    }

    criarCardHTML(mesa) {
        return `
      <div class="table-card section" 
           onclick="window.location = '${mesa.url}'">
        <img src="${mesa.imagem}" class="table-banner" alt="${mesa.nomeMesa}">
        <div class="table-content">
          <div class="table-header">
            <h2 class="table-title">${mesa.nomeMesa}</h2>
            <span class="status-tag ${
              mesa.status === "Lotado" ? "status-full" : "status-available"
            }">${mesa.status}</span>
          </div>
          <p class="table-description">${mesa.descricao}</p>
          <div class="table-footer">
            <span class="tag">${mesa.sistema}</span>
            <span class="tag">Até ${mesa.qtdJogadores} jogadores</span>
            <span class="tag author-tag">Mesa criada por ${mesa.autor}</span>
          </div>
        </div>
      </div>
    `;
    }

    renderizarCards(mesasFiltradas = this.mesas) {
        this.containerCards.innerHTML = mesasFiltradas
            .map((mesa) => this.criarCardHTML(mesa))
            .join("");
    }

    configurarBusca() {
        this.searchInput.addEventListener("input", (e) => {
            const termoBusca = e.target.value.toLowerCase();
            const mesasFiltradas = this.mesas.filter(
                (mesa) =>
                mesa.nomeMesa.toLowerCase().includes(termoBusca) ||
                mesa.sistema.toLowerCase().includes(termoBusca) ||
                mesa.descricao.toLowerCase().includes(termoBusca)
            );
            this.renderizarCards(mesasFiltradas);
        });
    }

    adicionarMesa(novaMesa) {
        this.mesas.push(novaMesa);
        this.renderizarCards();
    }

    atualizarMesa(id, dadosAtualizados) {
        const index = this.mesas.findIndex((mesa) => mesa.id === id);
        if (index !== -1) {
            this.mesas[index] = {...this.mesas[index], ...dadosAtualizados };
            this.renderizarCards();
        }
    }

    removerMesa(id) {
        this.mesas = this.mesas.filter((mesa) => mesa.id !== id);
        this.renderizarCards();
    }
}

// Inicialização
window.onload = function() {
    mesasData = populateMesasData(db.mesas);
    populateMenus();
    const gerenciadorCards = new GerenciadorCards();
};

function populateMesasData(dbMesas) {
    return dbMesas.map((mesa, index) => ({
        id: index + 1,
        nomeMesa: mesa.Nome_Mesa || "Nome não definido",
        sistema: mesa.Sistema || "Sistema não especificado",
        qtdJogadores: parseInt(mesa.Qtd_Jogadores) || 0,
        autor: mesa.Autor || "Autor desconhecido",
        publico: mesa.Vagas === "true",
        descricao: mesa.Descricao || "Descrição não disponível",
        imagem: mesa['Banner [image]'] || "../img/placeholder.png",
        status: mesa.Vagas === "false" ? "Lotado" : "Disponível",
        url: `mesa.html?session=${session}&view=${mesa.__PowerAppsId__}` || "../img/placeholder.png"
    }));
};