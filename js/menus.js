const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let podeVoltar = false


const session = urlParams.get('session');
let target = urlParams.get('view');
if (!target) {
    target = session;
}

const defaultMenuData = {
    top: [
        { url: `./mesas.html?session=${session}`, text: `Home` },
        { url: `./loja.html?session=${session}`, text: `Loja` },
        { url: `./perfil.html?session=${session}&view=${target}`, text: `Perfil` },
        { url: `../index.html`, text: `Sair` }
    ],
    side: [
        { url: `./mesas.html?session=${session}`, text: `Lista de Mesas` },
        { url: `./mesa.html?session=${session}`, text: `Criar Mesa` }
    ]
};

function populateMenus(data = defaultMenuData) {
    // Populate top menu
    const topMenu = document.getElementById('topContent');
    if (topMenu) {
        topMenu.innerHTML = data.top.map(item =>
            `<li><a ${ item.type && item.type === "popup" ? 'target="_blank"' : '' }  href="${item.url}">${item.text}</a></li>`
        ).join('');
    }

    // Populate side menu
    const sideMenu = document.getElementById('sideContent');
    if (sideMenu) {
        if (podeVoltar) sideMenu.innerHTML = `<li><a onclick="history.back()" >Voltar</a></li>`
        sideMenu.innerHTML += data.side.map(item =>
                `<li><a ${item.text === "Detalhes do Personagem" ? `id="detalheChar" class='disabled'` : ''} ${ item.type && item.type === "popup" ? 'target="_blank"' : '' } href="${item.url}">${item.text}</a></li>`
        ).join('');
    }
}