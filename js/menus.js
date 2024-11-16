const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const session = urlParams.get('session');
let target = urlParams.get('view');
if (!target) {
    target = session;
}

const defaultMenuData = {
    top: [
        { url: `./mesas.html?session=${session}`, text: `Home` },
        { url: `./perfil.html?session=${session}&view=${target}`, text: `Perfil` },
        { url: `../index.html`, text: `Sair` }
    ],
    side: [
        { url: `./mesas.html?session=${session}`, text: `Mesas` },
        { url: `./mesa.html?session=${session}`, text: `Criar Mesa` },
        { url: `./ficha.html?session=${session}`, text: `Novo Personagem` },
        { url: `./mesas.html?session=${session}`, text: `Abandonar Partida` },
        { url: `./mapa.html?session=${session}`, text: `Mapa` }
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