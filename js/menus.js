const defaultMenuData = {
    top: [
        { url: "./mesas.html", text: "Home" },
        { url: "./conta.html", text: "Perfil" },
        { url: "./conta.html", text: "Configurações" },
        { url: "/mesas.html", text: "Sair" }
    ],
    side: [
        { url: "./mesas.html", text: "Mesas" },
        { url: "./mesa.html", text: "Criar Mesa" },
        { url: "./fichas.html", text: "Fichas" },
        { url: "./ficha.html", text: "Novo Personagem" },
        { url: "./mesas.html", text: "Abandonar Partida" },
        { url: "./mapa.html", text: "Mapa" }
    ]
};

function populateMenus(data = defaultMenuData) {
    // Populate top menu
    const topMenu = document.getElementById('topContent');
    if (topMenu) {
        topMenu.innerHTML = data.top.map(item =>
            `<li><a href="${item.url}">${item.text}</a></li>`
        ).join('');
    }

    // Populate side menu
    const sideMenu = document.getElementById('sideContent');
    if (sideMenu) {
        sideMenu.innerHTML = data.side.map(item =>
            `<li><a href="${item.url}">${item.text}</a></li>`
        ).join('');
    }
}