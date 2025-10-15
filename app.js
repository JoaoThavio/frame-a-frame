// script.js
// Elementos DOM
const containerFilmes = document.getElementById('containerFilmes');
const secaoDetalhes = document.getElementById('secaoDetalhes');
const campoBusca = document.getElementById('campoBusca');
const botaoBusca = document.getElementById('botaoBusca');
const botaoConfig = document.getElementById('botaoConfig');
const configOverlay = document.getElementById('configOverlay');
const fecharConfig = document.getElementById('fecharConfig');
const chaveApiInput = document.getElementById('chaveApiInput');
const salvarChave = document.getElementById('salvarChave');
const usarChavePadrao = document.getElementById('usarChavePadrao');

// Configurações da API
const CHAVE_API_PADRAO = '6ff1d0f2abc9d86cfa040ed00514fac3'; // Sua chave principal
let chaveApiAtual = localStorage.getItem('chaveApiTMDB') || CHAVE_API_PADRAO;

// URLs da API
const URL_BASE = 'https://api.themoviedb.org/3';
const URL_IMAGEM = 'https://image.tmdb.org/t/p/w500';
const POSTER_PADRAO = 'https://via.placeholder.com/500x750/2d3748/e2e8f0?text=Poster+Não+Disponível';
const FOTO_PADRAO = 'https://via.placeholder.com/80x80/2d3748/e2e8f0?text=?';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
});

function inicializarApp() {
    // Carregar filmes populares
    carregarFilmesPopulares();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Atualizar campo de chave API se existir no localStorage
    if (localStorage.getItem('chaveApiTMDB')) {
        chaveApiInput.value = localStorage.getItem('chaveApiTMDB');
    }
}

function configurarEventListeners() {
    // Busca
    botaoBusca.addEventListener('click', executarBusca);
    campoBusca.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            executarBusca();
        }
    });
    
    // Configurações
    botaoConfig.addEventListener('click', function() {
        configOverlay.classList.add('ativo');
    });
    
    fecharConfig.addEventListener('click', function() {
        configOverlay.classList.remove('ativo');
    });
    
    // Fechar modal ao clicar fora
    configOverlay.addEventListener('click', function(e) {
        if (e.target === configOverlay) {
            configOverlay.classList.remove('ativo');
        }
    });
    
    // Gerenciamento da chave API
    salvarChave.addEventListener('click', function() {
        const novaChave = chaveApiInput.value.trim();
        if (novaChave) {
            localStorage.setItem('chaveApiTMDB', novaChave);
            chaveApiAtual = novaChave;
            configOverlay.classList.remove('ativo');
            carregarFilmesPopulares();
            mostrarNotificacao('Chave API atualizada com sucesso!', 'sucesso');
        } else {
            mostrarNotificacao('Por favor, insira uma chave válida.', 'erro');
        }
    });
    
    usarChavePadrao.addEventListener('click', function() {
        localStorage.removeItem('chaveApiTMDB');
        chaveApiAtual = CHAVE_API_PADRAO;
        chaveApiInput.value = '';
        configOverlay.classList.remove('ativo');
        carregarFilmesPopulares();
        mostrarNotificacao('Usando chave API padrão.', 'info');
    });
}

// Funções da API
async function buscarFilmesPopulares() {
    try {
        const resposta = await fetch(`${URL_BASE}/movie/popular?api_key=${chaveApiAtual}&language=pt-BR`);
        
        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        return dados.results;
    } catch (erro) {
        console.error('Erro ao buscar filmes populares:', erro);
        throw erro;
    }
}

async function buscarFilmes(termo) {
    try {
        const resposta = await fetch(`${URL_BASE}/search/movie?api_key=${chaveApiAtual}&language=pt-BR&query=${encodeURIComponent(termo)}`);
        
        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        return dados.results;
    } catch (erro) {
        console.error('Erro ao buscar filmes:', erro);
        throw erro;
    }
}

async function buscarDetalhesFilme(idFilme) {
    try {
        const resposta = await fetch(`${URL_BASE}/movie/${idFilme}?api_key=${chaveApiAtual}&language=pt-BR`);
        
        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        return dados;
    } catch (erro) {
        console.error('Erro ao buscar detalhes do filme:', erro);
        throw erro;
    }
}

async function buscarElencoFilme(idFilme) {
    try {
        const resposta = await fetch(`${URL_BASE}/movie/${idFilme}/credits?api_key=${chaveApiAtual}&language=pt-BR`);
        
        if (!resposta.ok) {
            throw new Error(`Erro na API: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        return dados.cast.slice(0, 8); // Primeiros 8 membros do elenco
    } catch (erro) {
        console.error('Erro ao buscar elenco do filme:', erro);
        throw erro;
    }
}

// Funções de exibição
async function carregarFilmesPopulares() {
    try {
        containerFilmes.innerHTML = '<div class="carregando">Carregando filmes...</div>';
        
        const filmes = await buscarFilmesPopulares();
        exibirFilmes(filmes);
    } catch (erro) {
        console.error('Erro ao carregar filmes populares:', erro);
        containerFilmes.innerHTML = `
            <div class="erro">
                Erro ao carregar filmes. Verifique sua conexão ou chave da API.
                <button class="botao-principal" style="margin-top: 15px;" onclick="carregarFilmesPopulares()">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

async function executarBusca() {
    const termo = campoBusca.value.trim();
    
    if (!termo) {
        carregarFilmesPopulares();
        return;
    }
    
    try {
        containerFilmes.innerHTML = '<div class="carregando">Buscando filmes...</div>';
        secaoDetalhes.classList.remove('ativo');
        
        const filmes = await buscarFilmes(termo);
        exibirFilmes(filmes);
    } catch (erro) {
        console.error('Erro na busca:', erro);
        containerFilmes.innerHTML = `
            <div class="erro">
                Erro na busca. Verifique sua conexão ou chave da API.
                <button class="botao-principal" style="margin-top: 15px;" onclick="executarBusca()">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

function exibirFilmes(filmes) {
    if (!filmes || filmes.length === 0) {
        containerFilmes.innerHTML = '<div class="erro">Nenhum filme encontrado. Tente outra pesquisa.</div>';
        return;
    }
    
    containerFilmes.innerHTML = filmes.map(filme => `
        <div class="cartao-filme" data-id="${filme.id}">
            <img src="${filme.poster_path ? URL_IMAGEM + filme.poster_path : POSTER_PADRAO}" 
                 alt="${filme.title}" class="poster-filme">
            <div class="info-filme">
                <h3 class="titulo-filme">${filme.title}</h3>
                <p class="ano-filme">${filme.release_date ? filme.release_date.substring(0, 4) : 'N/A'}</p>
                <div class="avaliacao-filme">
                    <span>⭐</span>
                    <span>${filme.vote_average ? filme.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Adicionar event listeners para os cartões de filme
    document.querySelectorAll('.cartao-filme').forEach(cartao => {
        cartao.addEventListener('click', function() {
            const idFilme = this.getAttribute('data-id');
            exibirDetalhesFilme(idFilme);
        });
    });
}

async function exibirDetalhesFilme(idFilme) {
    try {
        secaoDetalhes.innerHTML = '<div class="carregando">Carregando detalhes do filme...</div>';
        secaoDetalhes.classList.add('ativo');
        
        const [filme, elenco] = await Promise.all([
            buscarDetalhesFilme(idFilme),
            buscarElencoFilme(idFilme)
        ]);
        
        if (!filme) {
            secaoDetalhes.innerHTML = '<div class="erro">Erro ao carregar detalhes do filme.</div>';
            return;
        }
        
        // Formatar dados do filme
        const generos = filme.genres ? filme.genres.map(genero => genero.name).join(', ') : 'N/A';
        const anoLancamento = filme.release_date ? filme.release_date.substring(0, 4) : 'N/A';
        const duracao = filme.runtime ? `${filme.runtime} min` : 'N/A';
        
        // Formatar elenco
        const htmlElenco = elenco.length > 0 ? `
            <div class="elenco-detalhes">
                <h3 class="titulo-elenco">Elenco Principal</h3>
                <div class="grid-elenco">
                    ${elenco.map(pessoa => `
                        <div class="membro-elenco">
                            <img src="${pessoa.profile_path ? URL_IMAGEM + pessoa.profile_path : FOTO_PADRAO}" 
                                 alt="${pessoa.name}" class="foto-elenco">
                            <p class="nome-elenco">${pessoa.name}</p>
                            <p class="personagem-elenco">${pessoa.character}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        // Exibir detalhes do filme
        secaoDetalhes.innerHTML = `
            <div class="cabecalho-detalhes">
                <img src="${filme.poster_path ? URL_IMAGEM + filme.poster_path : POSTER_PADRAO}" 
                     alt="${filme.title}" class="poster-detalhes">
                <div class="info-detalhes">
                    <h2 class="titulo-detalhes">${filme.title}</h2>
                    <div class="meta-detalhes">
                        <span>⭐ ${filme.vote_average ? filme.vote_average.toFixed(1) : 'N/A'}</span>
                        <span>${anoLancamento}</span>
                        <span>${duracao}</span>
                        <span>${generos}</span>
                    </div>
                    <p class="sinopse-detalhes">${filme.overview || 'Sinopse não disponível.'}</p>
                </div>
            </div>
            ${htmlElenco}
        `;
        
        // Rolar para a seção de detalhes
        secaoDetalhes.scrollIntoView({ behavior: 'smooth' });
    } catch (erro) {
        console.error('Erro ao exibir detalhes:', erro);
        secaoDetalhes.innerHTML = '<div class="erro">Erro ao carregar detalhes do filme.</div>';
    }
}

// Função auxiliar para notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.textContent = mensagem;
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        transform: translateX(150%);
        transition: transform 0.3s ease;
    `;
    
    // Cor baseada no tipo
    if (tipo === 'sucesso') {
        notificacao.style.backgroundColor = '#38a169';
    } else if (tipo === 'erro') {
        notificacao.style.backgroundColor = '#e53e3e';
    } else {
        notificacao.style.backgroundColor = '#3182ce';
    }
    
    document.body.appendChild(notificacao);
    
    // Animação de entrada
    setTimeout(() => {
        notificacao.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.transform = 'translateX(150%)';
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 300);
    }, 3000);
}