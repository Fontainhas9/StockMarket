// Dados das ações atualizados com os nomes completos
const acoes = [
    { 
        id: 'sp', 
        nome: 'BCP S&P 500', 
        investido: 7957.36, 
        precoCompra: 57.662, 
        icon: 'fa-chart-bar',
        nomeCurto: 'S&P 500'
    },
    { 
        id: 'ouro', 
        nome: 'BCP Ouro', 
        investido: 7982.18, 
        precoCompra: 234.77, 
        icon: 'fa-gem',
        nomeCurto: 'Ouro'
    },
    { 
        id: 'janus', 
        nome: 'Janus Henderson Capital Funds plc - Global Technology and Innovation Fund A2 HEUR', 
        investido: 7999.99, 
        precoCompra: 26.1, 
        icon: 'fa-university',
        nomeCurto: 'Janus'
    },
    { 
        id: 'jpmorgan', 
        nome: 'JPMorgan Investment Funds - US Select Equity Fund A (acc) - EUR', 
        investido: 8000.00, 
        precoCompra: 482.8, 
        icon: 'fa-landmark',
        nomeCurto: 'JP Morgan'
    },
    { 
        id: 'imga', 
        nome: 'IMGA Ações América A – Fundo de Investimento Aberto de Acções', 
        investido: 8000.00, 
        precoCompra: 12.4971, 
        icon: 'fa-industry',
        nomeCurto: 'IMGA'
    }
];

const linksAcoes = {
    'IMGA': 'https://ind.millenniumbcp.pt/pt/Particulares/Investimentos/Pages/FundsDetail.aspx?Isi=PTYAGALM0005',
    'Janus': 'https://markets.ft.com/data/funds/tearsheet/summary?s=IE0002167009:EUR',
    'JPMorgan': 'https://pt.investing.com/funds/lu0218171717',
    'Ouro': 'https://live.euronext.com/en/product/structured-products/PTBCPAYM0053-XMLI',
    'S&P 500': 'https://live.euronext.com/en/product/structured-products/PTBITHYM0080-XMLI'
};

// Sistema de segurança simplificado (sem hash)
const CORRECT_PASSWORD = "Fontainhas#9";

// Elementos DOM
const loginScreen = document.getElementById('login-screen');
const mainContent = document.getElementById('main-content');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const togglePasswordBtn = document.getElementById('toggle-password');
const loginError = document.getElementById('login-error');

const inputsPrecos = {
    sp: document.getElementById('sp-price'),
    ouro: document.getElementById('ouro-price'),
    janus: document.getElementById('janus-price'),
    jpmorgan: document.getElementById('jpmorgan-price'),
    imga: document.getElementById('imga-price')
};

const calcularBtn = document.getElementById('calcular-btn');
const limparBtn = document.getElementById('limpar-btn');
const toggleInvestmentBtn = document.getElementById('toggle-investment');
const tabelaResultados = document.getElementById('tabela-resultados').getElementsByTagName('tbody')[0];
const resultadoConsolidado = document.getElementById('resultado-consolidado');
const investmentSummary = document.getElementById('investment-summary');
const statsAcoes = document.getElementById('stats-acoes');
const backToTopBtn = document.getElementById('back-to-top');
const mobileKeyboardHint = document.querySelector('.mobile-keyboard-hint');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleFooterBtn = document.getElementById('theme-toggle-footer');
const graficoSection = document.getElementById('grafico-section');
const chartCanvas = document.getElementById('portfolio-chart');
const chartLegend = document.getElementById('chart-legend');
const desempenhoSection = document.getElementById('desempenho-section');
const resultadoSection = document.getElementById('resultado-section');
const comparacaoChartCanvas = document.getElementById('comparacao-chart');
const notificationContainer = document.getElementById('notification-container');

// Botões de logout (agora estão no HTML)
const logoutHeaderBtn = document.getElementById('logout-header-btn');
const logoutFooterBtn = document.getElementById('logout-footer-btn');

// Elementos do histórico (novos)
const historicoSection = document.getElementById('historico-section');
const historicoVazio = document.getElementById('historico-vazio');
const historicoLista = document.getElementById('historico-lista');
const limparHistoricoBtn = document.getElementById('limpar-historico');

// Variáveis de estado
let mostrarInvestimento = false;
let resultadosCalculados = [];
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let lastScrollTop = 0;
let chartInstance = null;
let comparacaoChartInstance = null;
let isDarkMode = false;

// Chaves de armazenamento
const AUTH_KEY = 'portfolio_calculator_auth';
const AUTH_TIMESTAMP_KEY = 'portfolio_calculator_auth_timestamp';
const THEME_KEY = 'portfolio_calculator_theme';
const SAVED_PRICES_KEY = 'portfolio_saved_prices';
const KEYBOARD_HINT_SHOWN = 'keyboardHintShown';
const HISTORICO_KEY = 'portfolio_historico'; // Nova chave para o histórico

// Funções de utilidade
function arredondar(valor) {
    return Math.round(valor * 100) / 100;
}

function arredondarPercentagem(valor) {
    return Math.round(valor * 1000) / 1000; // 3 casas decimais
}

function arredondarPercentagemGrafico(valor) {
    return Math.round(valor * 100) / 100; // 2 casas decimais para gráficos
}

// Funções para o histórico
function formatarData(data) {
    const agora = data || new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    
    return {
        data: `${dia}/${mes}/${ano}`,
        hora: `${horas}:${minutos}`,
        timestamp: agora.getTime(),
        dataCompleta: `${dia}/${mes}/${ano} ${horas}:${minutos}`
    };
}

function calcularTempoDecorrido(timestamp) {
    const agora = new Date().getTime();
    const diferenca = agora - timestamp;
    
    const minutos = Math.floor(diferenca / (1000 * 60));
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) return 'Agora mesmo';
    if (minutos < 60) return `${minutos} min atrás`;
    if (horas < 24) return `${horas}h atrás`;
    if (dias === 1) return 'Ontem';
    return `${dias} dias atrás`;
}

function salvarHistorico(totalAtual, lucroTotal, percentagemTotal) {
    try {
        const { data, hora, timestamp, dataCompleta } = formatarData();
        const precos = {};
        
        // Salvar os preços inseridos
        Object.keys(inputsPrecos).forEach(key => {
            if (inputsPrecos[key].value) {
                const valor = formatarNumeroParaCalculo(inputsPrecos[key].value);
                precos[key] = valor;
            }
        });
        
        const historicoItem = {
            id: `hist_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            data: data,
            hora: hora,
            timestamp: timestamp,
            dataCompleta: dataCompleta,
            precos: precos,
            totalAtual: totalAtual,
            lucroTotal: lucroTotal,
            percentagemTotal: percentagemTotal,
            acoesCalculadas: resultadosCalculados.length
        };
        
        let historico = JSON.parse(localStorage.getItem(HISTORICO_KEY)) || [];
        
        // Limitar histórico a 50 entradas (remover as mais antigas)
        historico.unshift(historicoItem); // Adicionar no início
        if (historico.length > 50) {
            historico = historico.slice(0, 50);
        }
        
        localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
        
        // Atualizar exibição do histórico
        setTimeout(() => {
            mostrarHistorico();
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar histórico:', error);
        return false;
    }
}

function mostrarHistorico() {
    try {
        const historico = JSON.parse(localStorage.getItem(HISTORICO_KEY)) || [];
        
        if (historico.length === 0) {
            historicoVazio.style.display = 'block';
            historicoLista.style.display = 'none';
            historicoSection.style.display = 'none';
            return;
        }
        
        historicoVazio.style.display = 'none';
        historicoLista.style.display = 'flex';
        historicoSection.style.display = 'block';
        
        // Ordenar por timestamp (mais recente primeiro)
        historico.sort((a, b) => b.timestamp - a.timestamp);
        
        // Limitar a mostrar 20 entradas
        const historicoMostrar = historico.slice(0, 20);
        
        historicoLista.innerHTML = '';
        
        historicoMostrar.forEach(item => {
            const historicoItem = document.createElement('div');
            historicoItem.className = `historico-item ${item.lucroTotal >= 0 ? 'positivo' : 'negativo'}`;
            historicoItem.dataset.id = item.id;
            
            const tempoDecorrido = calcularTempoDecorrido(item.timestamp);
            
            historicoItem.innerHTML = `
                <div class="historico-item-header">
                    <div class="historico-data">${item.dataCompleta}</div>
                    <div class="historico-tempo">${tempoDecorrido}</div>
                </div>
                <div class="historico-valores">
                    <div class="historico-valor-item">
                        <span class="historico-valor-label">Valor Total</span>
                        <span class="historico-valor">${formatarMoeda(item.totalAtual)}</span>
                    </div>
                    <div class="historico-valor-item">
                        <span class="historico-valor-label">Resultado</span>
                        <span class="historico-valor ${item.lucroTotal >= 0 ? 'positivo' : 'negativo'}">
                            ${formatarMoeda(item.lucroTotal, true)}
                        </span>
                    </div>
                    <div class="historico-valor-item">
                        <span class="historico-valor-label">Rentabilidade</span>
                        <span class="historico-valor ${item.lucroTotal >= 0 ? 'positivo' : 'negativo'}">
                            ${formatarPercentagem(item.percentagemTotal, true)}
                        </span>
                    </div>
                </div>
                <div class="historico-item-footer">
                    <div class="historico-acoes">
                        <span>${item.acoesCalculadas}</span> de 5 ações calculadas
                    </div>
                    <button class="btn-historico-remover" title="Remover do histórico">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            historicoLista.appendChild(historicoItem);
        });
        
        // Adicionar eventos aos botões de remover
        document.querySelectorAll('.btn-historico-remover').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const historicoItem = this.closest('.historico-item');
                const id = historicoItem.dataset.id;
                removerDoHistorico(id);
            });
        });
        
        // Adicionar evento de clique para restaurar preços
        document.querySelectorAll('.historico-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.btn-historico-remover')) {
                    const id = this.dataset.id;
                    restaurarPrecosDoHistorico(id);
                }
            });
        });
        
    } catch (error) {
        console.error('Erro ao mostrar histórico:', error);
        historicoVazio.style.display = 'block';
        historicoLista.style.display = 'none';
    }
}

function removerDoHistorico(id) {
    try {
        let historico = JSON.parse(localStorage.getItem(HISTORICO_KEY)) || [];
        historico = historico.filter(item => item.id !== id);
        localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
        mostrarHistorico();
        mostrarNotificacao('Entrada removida do histórico', 'sucesso', 3000);
    } catch (error) {
        console.error('Erro ao remover do histórico:', error);
        mostrarNotificacao('Erro ao remover do histórico', 'erro', 3000);
    }
}

function restaurarPrecosDoHistorico(id) {
    try {
        const historico = JSON.parse(localStorage.getItem(HISTORICO_KEY)) || [];
        const item = historico.find(item => item.id === id);
        
        if (!item) {
            mostrarNotificacao('Não foi possível restaurar os dados', 'erro', 3000);
            return;
        }
        
        // Restaurar os preços
        Object.keys(item.precos).forEach(key => {
            if (inputsPrecos[key] && item.precos[key]) {
                // Formatar o número para exibição (virgula como separador decimal)
                const valorFormatado = item.precos[key].toString().replace('.', ',');
                inputsPrecos[key].value = valorFormatado;
            }
        });
        
        // Recalcular automaticamente
        setTimeout(() => {
            calcularPortfolio();
        }, 300);
        
        mostrarNotificacao(`Preços de ${item.data} restaurados`, 'sucesso', 3000);
        
        // Scroll para os inputs
        if (isMobile) {
            setTimeout(() => {
                scrollToElement(inputsPrecos.sp);
            }, 500);
        }
        
    } catch (error) {
        console.error('Erro ao restaurar preços:', error);
        mostrarNotificacao('Erro ao restaurar preços', 'erro', 3000);
    }
}

function limparHistoricoCompleto() {
    if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem(HISTORICO_KEY);
        mostrarHistorico();
        mostrarNotificacao('Histórico limpo com sucesso', 'sucesso', 3000);
    }
}

// Sistema de notificações
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 5000) {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    
    const icon = tipo === 'erro' ? 'exclamation-circle' : 
                tipo === 'sucesso' ? 'check-circle' : 
                tipo === 'aviso' ? 'exclamation-triangle' : 'info-circle';
    
    notificacao.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="notificacao-conteudo">
            <div class="notificacao-titulo">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</div>
            <div class="notificacao-mensagem">${mensagem}</div>
        </div>
        <button class="notificacao-fechar"><i class="fas fa-times"></i></button>
    `;
    
    notificationContainer.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => notificacao.classList.add('show'), 10);
    
    // Fechar ao clicar no botão
    notificacao.querySelector('.notificacao-fechar').addEventListener('click', () => {
        fecharNotificacao(notificacao);
    });
    
    // Fechar automaticamente
    if (duracao > 0) {
        setTimeout(() => {
            if (notificacao.parentNode) {
                fecharNotificacao(notificacao);
            }
        }, duracao);
    }
    
    return notificacao;
}

function fecharNotificacao(notificacao) {
    notificacao.classList.remove('show');
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.remove();
        }
    }, 300);
}

// Sistema de autenticação
function checkAuthentication() {
    try {
        const authData = sessionStorage.getItem(AUTH_KEY);
        const authTimestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);
        
        if (authData && authTimestamp) {
            const currentTime = new Date().getTime();
            const sessionAge = currentTime - parseInt(authTimestamp);
            const sessionMaxAge = 8 * 60 * 60 * 1000; // 8 horas
            
            if (sessionAge < sessionMaxAge) {
                return true;
            } else {
                // Sessão expirada
                sessionStorage.removeItem(AUTH_KEY);
                sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
    return false;
}

function showMainContent() {
    loginScreen.style.display = 'none';
    mainContent.style.display = 'block';
    document.body.style.background = 'linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%)';
    
    if (isMobile) {
        document.body.style.minHeight = '100vh';
        document.body.style.minHeight = '-webkit-fill-available';
    }
    
    initCalculator();
}

function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
    localStorage.removeItem(SAVED_PRICES_KEY);
    
    mostrarNotificacao('Sessão terminada com sucesso', 'sucesso', 3000);
    
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Função simplificada de verificação de senha
async function verificarPassword(password) {
    // Para debug: mostra a senha inserida (apenas para desenvolvimento)
    console.log('Senha inserida:', password);
    console.log('Senha esperada:', CORRECT_PASSWORD);
    
    // Comparação direta (sem hash)
    return password === CORRECT_PASSWORD;
}

function setupLoginSystem() {
    passwordInput.focus();
    
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    loginBtn.addEventListener('click', async function() {
        const password = passwordInput.value.trim();
        
        if (!password) {
            mostrarNotificacao('Por favor, insira a palavra-passe', 'erro', 3000);
            return;
        }
        
        try {
            const isValid = await verificarPassword(password);
            
            if (isValid) {
                const currentTime = new Date().getTime();
                sessionStorage.setItem(AUTH_KEY, 'true');
                sessionStorage.setItem(AUTH_TIMESTAMP_KEY, currentTime.toString());
                
                loginBtn.innerHTML = '<i class="fas fa-check"></i> Autenticado!';
                loginBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                loginBtn.disabled = true;
                
                mostrarNotificacao('Autenticação bem-sucedida!', 'sucesso', 2000);
                
                setTimeout(() => {
                    showMainContent();
                }, 1000);
            } else {
                loginError.style.display = 'flex';
                passwordInput.value = '';
                passwordInput.focus();
                
                loginBtn.innerHTML = '<i class="fas fa-times"></i> Erro!';
                loginBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                
                mostrarNotificacao('Palavra-passe incorreta', 'erro', 3000);
                
                setTimeout(() => {
                    loginError.style.display = 'none';
                    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
                    loginBtn.style.background = 'var(--gradient-primary)';
                    loginBtn.disabled = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Erro na autenticação:', error);
            mostrarNotificacao('Erro na autenticação. Tente novamente.', 'erro', 3000);
        }
    });
    
    passwordInput.addEventListener('input', function() {
        if (loginError.style.display !== 'none') {
            loginError.style.display = 'none';
        }
    });
}

function init() {
    setupLoginSystem();
    
    if (checkAuthentication()) {
        showMainContent();
    } else {
        loginScreen.style.display = 'flex';
        mainContent.style.display = 'none';
    }
}

function initCalculator() {
    configurarEventListeners();
    configurarNavegacaoTeclado();
    detectarDispositivo();
    calcularTotalInvestido();
    configurarScrollToTop();
    configurarFocusMobile();
    configurarModoEscuro();
    configurarGrafico();
    carregarPrecosSalvos();
    
    // Event listeners para botões
    toggleInvestmentBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMostrarInvestimento();
    });
    
    // Event listeners para logout
    if (logoutHeaderBtn) {
        logoutHeaderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    if (logoutFooterBtn) {
        logoutFooterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Event listener para limpar histórico
    if (limparHistoricoBtn) {
        limparHistoricoBtn.addEventListener('click', limparHistoricoCompleto);
    }
    
    // Carregar histórico ao iniciar
    setTimeout(() => {
        mostrarHistorico();
    }, 500);
    
    setTimeout(() => {
        inputsPrecos.sp.focus();
    }, 300);
}

function detectarDispositivo() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    if (isMobile) {
        document.body.classList.add('is-mobile');
        setTimeout(() => {
            showMobileKeyboardHint();
        }, 2000);
    }
}

function showMobileKeyboardHint() {
    if (isMobile && !localStorage.getItem(KEYBOARD_HINT_SHOWN)) {
        mobileKeyboardHint.classList.add('show');
        
        setTimeout(() => {
            mobileKeyboardHint.classList.remove('show');
            localStorage.setItem(KEYBOARD_HINT_SHOWN, 'true');
        }, 5000);
    }
}

// Persistência de preços
function salvarPrecos() {
    const precos = {};
    Object.keys(inputsPrecos).forEach(key => {
        if (inputsPrecos[key].value) {
            precos[key] = inputsPrecos[key].value;
        }
    });
    localStorage.setItem(SAVED_PRICES_KEY, JSON.stringify(precos));
}

function carregarPrecosSalvos() {
    try {
        const precosSalvos = JSON.parse(localStorage.getItem(SAVED_PRICES_KEY) || '{}');
        Object.keys(precosSalvos).forEach(key => {
            if (inputsPrecos[key] && precosSalvos[key]) {
                inputsPrecos[key].value = precosSalvos[key];
            }
        });
    } catch (error) {
        console.error('Erro ao carregar preços salvos:', error);
    }
}

// Validação de entrada
function validarPreco(valor, nomeCampo = '') {
    if (!valor || valor.trim() === '') {
        return { valido: false, erro: `${nomeCampo ? nomeCampo + ': ' : ''}Campo obrigatório` };
    }
    
    const num = formatarNumeroParaCalculo(valor);
    
    if (isNaN(num)) {
        return { valido: false, erro: `${nomeCampo ? nomeCampo + ': ' : ''}Valor inválido` };
    }
    
    if (num < 0) {
        return { valido: false, erro: `${nomeCampo ? nomeCampo + ': ' : ''}Valor não pode ser negativo` };
    }
    
    if (num > 1000000) {
        return { valido: false, erro: `${nomeCampo ? nomeCampo + ': ' : ''}Valor muito alto` };
    }
    
    return { valido: true, valor: num };
}

function formatarNumeroParaCalculo(valor) {
    if (!valor || valor === '') return null;
    
    let valorFormatado = valor.toString().replace(',', '.');
    valorFormatado = valorFormatado.replace(/[^\d.]/g, '');
    
    const partes = valorFormatado.split('.');
    if (partes.length > 2) {
        valorFormatado = partes[0] + '.' + partes.slice(1).join('');
    }
    
    if (valorFormatado.includes('.')) {
        const partesDecimais = valorFormatado.split('.');
        if (partesDecimais[1].length > 4) {
            valorFormatado = partesDecimais[0] + '.' + partesDecimais[1].substring(0, 4);
        }
    }
    
    return parseFloat(valorFormatado);
}

function configurarEventListeners() {
    calcularBtn.addEventListener('click', calcularPortfolio);
    calcularBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.classList.add('active');
    });
    calcularBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.classList.remove('active');
        calcularPortfolio();
    });
    
    limparBtn.addEventListener('click', limparCampos);
    limparBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.classList.add('active');
    });
    limparBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.classList.remove('active');
        limparCampos();
    });
    
    Object.values(inputsPrecos).forEach((input, index, arr) => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < arr.length - 1) {
                    arr[index + 1].focus();
                } else {
                    calcularPortfolio();
                }
            }
        });
        
        input.addEventListener('focus', () => {
            if (isMobile) {
                scrollToElement(input);
            }
        });
        
        input.addEventListener('input', (e) => {
            let value = e.target.value;
            value = value.replace(/[^\d,.]/g, '');
            
            const commaCount = (value.match(/,/g) || []).length;
            const dotCount = (value.match(/\./g) || []).length;
            
            if (commaCount + dotCount > 1) {
                const firstSeparatorIndex = Math.min(
                    value.indexOf(','), 
                    value.indexOf('.')
                );
                value = value.substring(0, firstSeparatorIndex + 1) + 
                       value.substring(firstSeparatorIndex + 1).replace(/[,.]/g, '');
            }
            
            if (value.includes(',') || value.includes('.')) {
                const separator = value.includes(',') ? ',' : '.';
                const parts = value.split(separator);
                if (parts[1] && parts[1].length > 4) {
                    value = parts[0] + separator + parts[1].substring(0, 4);
                }
            }
            
            e.target.value = value;
            
            // Salvar automaticamente
            salvarPrecos();
        });
        
        if (navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
            input.setAttribute('pattern', '[0-9]*[.,]?[0-9]*');
        }
    });
    
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            document.body.style.zoom = "100%";
        }
    }, { passive: true });
}

function configurarNavegacaoTeclado() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            calcularPortfolio();
        }
        
        if (e.key === 'Escape') {
            limparCampos();
        }
        
        if (e.key === 'i' && e.altKey) {
            e.preventDefault();
            toggleMostrarInvestimento();
        }
        
        if (e.key === 't' && e.altKey) {
            e.preventDefault();
            toggleModoEscuro();
        }
        
        if (e.key === 'l' && e.ctrlKey && e.altKey) {
            e.preventDefault();
            logout();
        }
    });
}

function configurarScrollToTop() {
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
            backToTopBtn.style.transform = 'translateY(0)';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
            backToTopBtn.style.transform = 'translateY(20px)';
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });
}

function configurarFocusMobile() {
    if (isMobile) {
        const inputs = Object.values(inputsPrecos);
        
        inputs.forEach((input, index) => {
            if (index < inputs.length - 1) {
                input.setAttribute('enterkeyhint', 'next');
            } else {
                input.setAttribute('enterkeyhint', 'go');
            }
            
            input.setAttribute('inputmode', 'decimal');
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('spellcheck', 'false');
        });
    }
}

function scrollToElement(element) {
    if (isMobile) {
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
        
        window.scrollTo({
            top: middle,
            behavior: 'smooth'
        });
    }
}

function calcularTotalInvestido() {
    const totalInvestido = acoes.reduce((total, acao) => total + acao.investido, 0);
    document.getElementById('total-investido').textContent = totalInvestido.toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
}

function toggleMostrarInvestimento() {
    mostrarInvestimento = !mostrarInvestimento;
    
    const investmentValues = document.querySelectorAll('.investment-value');
    const icon = toggleInvestmentBtn.querySelector('i');
    
    if (mostrarInvestimento) {
        investmentValues.forEach(el => el.classList.remove('hidden'));
        investmentSummary.classList.remove('hidden');
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        toggleInvestmentBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        mostrarNotificacao('Valores investidos visíveis', 'sucesso', 2000);
    } else {
        investmentValues.forEach(el => el.classList.add('hidden'));
        investmentSummary.classList.add('hidden');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        toggleInvestmentBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        mostrarNotificacao('Valores investidos ocultos', 'info', 2000);
    }
}

function atualizarIconesTema() {
    const iconHeader = themeToggleBtn.querySelector('i');
    const iconFooter = themeToggleFooterBtn.querySelector('i');
    
    if (isDarkMode) {
        iconHeader.className = 'fas fa-sun';
        iconFooter.className = 'fas fa-sun';
    } else {
        iconHeader.className = 'fas fa-moon';
        iconFooter.className = 'fas fa-moon';
    }
}

function configurarModoEscuro() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        ativarModoEscuro();
    } else {
        desativarModoEscuro();
    }
    
    themeToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleModoEscuro();
    });
    
    themeToggleFooterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleModoEscuro();
    });
}

function ativarModoEscuro() {
    document.body.classList.add('dark-mode');
    isDarkMode = true;
    atualizarIconesTema();
    localStorage.setItem(THEME_KEY, 'dark');
    
    if (chartInstance) {
        atualizarGrafico();
    }
    if (comparacaoChartInstance) {
        atualizarGraficoComparacao();
    }
    
    mostrarNotificacao('Modo escuro ativado', 'sucesso', 2000);
}

function desativarModoEscuro() {
    document.body.classList.remove('dark-mode');
    isDarkMode = false;
    atualizarIconesTema();
    localStorage.setItem(THEME_KEY, 'light');
    
    if (chartInstance) {
        atualizarGrafico();
    }
    if (comparacaoChartInstance) {
        atualizarGraficoComparacao();
    }
    
    mostrarNotificacao('Modo claro ativado', 'sucesso', 2000);
}

function toggleModoEscuro() {
    if (isDarkMode) {
        desativarModoEscuro();
    } else {
        ativarModoEscuro();
    }
}

function configurarGrafico() {
    // Inicialização vazia, os gráficos serão criados quando necessário
}

function atualizarGrafico() {
    if (!chartInstance || resultadosCalculados.length === 0) return;
    chartInstance.destroy();
    criarGrafico();
}

function atualizarGraficoComparacao() {
    if (!comparacaoChartInstance || resultadosCalculados.length === 0) return;
    comparacaoChartInstance.destroy();
    criarGraficoComparacao();
}

function criarGrafico() {
    if (resultadosCalculados.length === 0) {
        graficoSection.style.display = 'none';
        return;
    }
    
    graficoSection.style.display = 'block';
    
    const labels = resultadosCalculados.map(r => r.nomeCurto);
    const valores = resultadosCalculados.map(r => r.valorAtual);
    const total = valores.reduce((sum, val) => sum + val, 0);
    const porcentagens = valores.map(val => arredondarPercentagemGrafico(((val / total) * 100)));
    
    const colors = [
        '#2d6ae3',
        '#7e3af2',
        '#0ea5e9',
        '#10b981',
        '#f59e0b'
    ];
    
    const textColor = isDarkMode ? '#f1f5f9' : '#1f2937';
    
    const config = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: colors,
                borderColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: {
                            size: 12,
                            family: "'Poppins', sans-serif"
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].label || '';
                        },
                        label: function(context) {
                            const value = context.raw || 0;
                            const percentage = arredondarPercentagemGrafico((value / total) * 100);
                            return `${formatarMoeda(value)} (${formatarPercentagemGrafico(percentage)})`;
                        }
                    },
                    titleFont: {
                        family: "'Montserrat', sans-serif"
                    },
                    bodyFont: {
                        family: "'Poppins', sans-serif"
                    }
                }
            }
        }
    };
    
    chartInstance = new Chart(chartCanvas, config);
    atualizarLegenda(labels, valores, porcentagens, colors);
    
    if (isMobile) {
        setTimeout(() => {
            scrollToElement(graficoSection);
        }, 100);
    }
}

function atualizarLegenda(labels, valores, porcentagens, colors) {
    chartLegend.innerHTML = '';
    
    labels.forEach((label, index) => {
        const valor = valores[index];
        const porcentagem = porcentagens[index];
        const linkAcao = linksAcoes[label];
        
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        if (linkAcao) {
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <a href="${linkAcao}" target="_blank" rel="noopener noreferrer" class="legend-link">
                    <span class="legend-name">${label}</span>
                </a>
                <span class="legend-value">
                    ${formatarMoeda(valor)} (${formatarPercentagemGrafico(porcentagem)})
                </span>
            `;
        } else {
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <span class="legend-name">${label}</span>
                <span class="legend-value">
                    ${formatarMoeda(valor)} (${formatarPercentagemGrafico(porcentagem)})
                </span>
            `;
        }
        
        chartLegend.appendChild(legendItem);
    });
}

function criarGraficoComparacao() {
    if (resultadosCalculados.length === 0) {
        return;
    }
    
    const labels = resultadosCalculados.map(r => r.nomeCurto);
    const valoresInvestidos = resultadosCalculados.map(r => r.investido);
    const valoresAtuais = resultadosCalculados.map(r => r.valorAtual);
    
    const diferencas = valoresAtuais.map((valorAtual, index) => {
        return valorAtual - valoresInvestidos[index];
    });
    
    const cores = diferencas.map(diferenca => 
        diferenca >= 0 ? '#10b981' : '#ef4444'
    );
    
    const textColor = isDarkMode ? '#f1f5f9' : '#1f2937';
    const gridColor = isDarkMode ? 'rgba(241, 245, 249, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lucro/Prejuízo (€)',
                data: diferencas,
                backgroundColor: cores,
                borderColor: diferencas.map(diferenca => 
                    diferenca >= 0 ? '#059669' : '#dc2626'
                ),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 12
                        },
                        callback: function(value) {
                            const label = value >= 0 ? '+' : '';
                            return label + arredondar(value).toLocaleString('pt-PT', { minimumFractionDigits: 0 }) + '€';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: isDarkMode ? '#475569' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const diferenca = context.raw;
                            const index = context.dataIndex;
                            const investido = valoresInvestidos[index];
                            const atual = valoresAtuais[index];
                            const percentagem = arredondarPercentagem((diferenca / investido) * 100);
                            
                            const tipo = diferenca >= 0 ? 'Lucro' : 'Prejuízo';
                            
                            return [
                                `Investido: ${formatarMoeda(investido)}`,
                                `Atual: ${formatarMoeda(atual)}`,
                                `${tipo}: ${formatarMoeda(diferenca, true)} (${formatarPercentagem(percentagem, true)})`
                            ];
                        }
                    }
                }
            }
        }
    };
    
    comparacaoChartInstance = new Chart(comparacaoChartCanvas, config);
}

function calcularPortfolio() {
    resultadosCalculados = [];
    limparTabela();
    
    let totalInvestido = 0;
    let totalAtual = 0;
    let acoesValidas = 0;
    let acoesComLucro = 0;
    let erros = [];
    
    acoes.forEach(acao => {
        const input = inputsPrecos[acao.id];
        const valorInput = input.value.trim();
        
        if (valorInput !== '') {
            const validacao = validarPreco(valorInput, acao.nomeCurto);
            
            if (!validacao.valido) {
                erros.push(validacao.erro);
                input.style.borderColor = 'var(--danger)';
                return;
            }
            
            input.style.borderColor = '';
            const precoAtual = validacao.valor;
            
            const numeroAcoes = acao.investido / acao.precoCompra;
            const valorAtualBruto = numeroAcoes * precoAtual;
            const lucroBruto = valorAtualBruto - acao.investido;
            const percentagemBruto = (lucroBruto / acao.investido) * 100;
            
            const valorAtual = arredondar(valorAtualBruto);
            const lucro = arredondar(lucroBruto);
            const percentagem = arredondarPercentagem(percentagemBruto);
            
            resultadosCalculados.push({
                nome: acao.nome,
                nomeCurto: acao.nomeCurto,
                investido: acao.investido,
                precoCompra: acao.precoCompra,
                precoAtual: precoAtual,
                numeroAcoes: numeroAcoes,
                valorAtual: valorAtual,
                lucro: lucro,
                percentagem: percentagem
            });
            
            if (lucro > 0) {
                acoesComLucro++;
            }
            
            totalInvestido += acao.investido;
            totalAtual += valorAtual;
            acoesValidas++;
            
            adicionarNaTabela(acao.nomeCurto, valorAtual, lucro, percentagem, acao.icon);
        }
    });
    
    if (erros.length > 0) {
        erros.forEach(erro => {
            mostrarNotificacao(erro, 'erro', 5000);
        });
    }
    
    if (acoesValidas === 0) {
        if (erros.length === 0) {
            mostrarNotificacao("Por favor, insira pelo menos um preço atual válido", 'aviso', 4000);
        }
        resultadoSection.style.display = 'none';
        desempenhoSection.style.display = 'none';
        graficoSection.style.display = 'none';
        historicoSection.style.display = 'none'; // Esconder histórico se não há cálculo
        return;
    }
    
    const lucroTotalBruto = totalAtual - totalInvestido;
    const lucroTotal = arredondar(lucroTotalBruto);
    const percentagemTotalBruto = totalInvestido > 0 ? (lucroTotal / totalInvestido) * 100 : 0;
    const percentagemTotal = arredondarPercentagem(percentagemTotalBruto);
    
    statsAcoes.textContent = `${acoesValidas}/5 ações`;
    
    mostrarResultadoConsolidadoSimplificado(totalAtual, lucroTotal, percentagemTotal);
    
    resultadoSection.style.display = 'block';
    desempenhoSection.style.display = 'block';
    graficoSection.style.display = 'block';
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    
    if (comparacaoChartInstance) {
        comparacaoChartInstance.destroy();
        comparacaoChartInstance = null;
    }
    
    criarGrafico();
    criarGraficoComparacao();
    
    // Salvar preços após cálculo bem-sucedido
    salvarPrecos();
    
    // SALVAR NO HISTÓRICO
    const salvou = salvarHistorico(totalAtual, lucroTotal, percentagemTotal);
    if (salvou) {
        // Mostrar notificação adicional de que foi salvo
        setTimeout(() => {
            mostrarNotificacao('Dados guardados no histórico', 'sucesso', 2000);
        }, 1500);
    }
    
    // Mostrar notificação de sucesso
    const mensagem = acoesComLucro === acoesValidas ? 
        'Excelente! Todas as ações estão em lucro!' :
        acoesComLucro > 0 ? 
            `${acoesComLucro} de ${acoesValidas} ações estão em lucro` :
            'Todas as ações estão em prejuízo';
    
    mostrarNotificacao(mensagem, acoesComLucro === acoesValidas ? 'sucesso' : acoesComLucro > 0 ? 'info' : 'aviso', 4000);
    
    if (isMobile && acoesValidas > 0) {
        setTimeout(() => {
            scrollToElement(resultadoSection);
        }, 100);
    }
}

function adicionarNaTabela(nome, valorAtual, lucro, percentagem, iconClass) {
    const emptyRow = tabelaResultados.querySelector('.empty-row');
    if (emptyRow) {
        emptyRow.remove();
    }
    
    const novaLinha = tabelaResultados.insertRow();
    novaLinha.className = 'resultado-linha';
    
    const valorAtualFormatado = formatarMoeda(valorAtual);
    const lucroFormatado = formatarMoeda(lucro, true);
    const percentagemFormatada = formatarPercentagem(percentagem, true);
    
    const celulaAcao = novaLinha.insertCell(0);
    const link = document.createElement('a');
    link.href = linksAcoes[nome];
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'acao-link';
    link.innerHTML = `<i class="fas ${iconClass}"></i><span class="acao-nome">${nome}</span>`;
    celulaAcao.appendChild(link);
    celulaAcao.className = 'acao-cell';
    
    const celulaValorAtual = novaLinha.insertCell(1);
    celulaValorAtual.textContent = valorAtualFormatado;
    celulaValorAtual.className = 'valor-atual-cell';
    
    const celulaLucro = novaLinha.insertCell(2);
    celulaLucro.textContent = lucroFormatado;
    celulaLucro.className = 'lucro-cell';
    
    const celulaPercentagem = novaLinha.insertCell(3);
    celulaPercentagem.textContent = percentagemFormatada;
    celulaPercentagem.className = 'percentagem-cell';
    
    if (lucro > 0) {
        celulaLucro.classList.add('lucro-positivo');
        celulaPercentagem.classList.add('lucro-positivo');
    } else if (lucro < 0) {
        celulaLucro.classList.add('lucro-negativo');
        celulaPercentagem.classList.add('lucro-negativo');
    }
}

function mostrarResultadoConsolidadoSimplificado(totalAtual, lucroTotal, percentagemTotal) {
    let cor;
    
    if (lucroTotal > 0) {
        cor = 'resultado-positivo';
    } else if (lucroTotal < 0) {
        cor = 'resultado-negativo';
    } else {
        cor = 'resultado-estavel';
    }
    
    const totalAtualFormatado = formatarMoeda(totalAtual);
    const lucroTotalFormatado = formatarMoeda(lucroTotal, true);
    const percentagemTotalFormatada = formatarPercentagem(percentagemTotal, true);
    
    const resultadoHTML = `
        <div class="resultado-info ${cor}">
            <div class="resultado-detalhes">
                <p>
                    <i class="fas fa-wallet"></i>
                    <span>Valor Total:</span>
                    <strong>${totalAtualFormatado}</strong>
                </p>
                <p>
                    <i class="fas fa-chart-line"></i>
                    <span>Resultado:</span>
                    <strong>${lucroTotalFormatado}</strong>
                </p>
                <p>
                    <i class="fas fa-percentage"></i>
                    <span>Rentabilidade:</span>
                    <strong>${percentagemTotalFormatada}</strong>
                </p>
            </div>
        </div>
    `;
    
    resultadoConsolidado.innerHTML = resultadoHTML;
    resultadoConsolidado.classList.add('has-result');
}

function formatarMoeda(valor, comSinal = false) {
    const sinal = comSinal ? (valor > 0 ? '+' : valor < 0 ? '-' : '') : '';
    const valorArredondado = arredondar(Math.abs(valor));
    
    return sinal + valorArredondado.toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
}

function formatarPercentagem(valor, comSinal = false) {
    const sinal = comSinal ? (valor > 0 ? '+' : valor < 0 ? '-' : '') : '';
    const valorArredondado = arredondarPercentagem(Math.abs(valor));
    
    const valorFormatado = valorArredondado.toLocaleString('pt-PT', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }) + '%';
    
    return sinal + valorFormatado.replace('.', ',');
}

function formatarPercentagemGrafico(valor, comSinal = false) {
    const sinal = comSinal ? (valor > 0 ? '+' : valor < 0 ? '-' : '') : '';
    const valorArredondado = arredondarPercentagemGrafico(Math.abs(valor));
    
    const valorFormatado = valorArredondado.toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '%';
    
    return sinal + valorFormatado.replace('.', ',');
}

function limparCampos() {
    Object.values(inputsPrecos).forEach(input => {
        input.value = '';
        input.style.borderColor = '';
    });
    
    limparTabela();
    
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    
    if (comparacaoChartInstance) {
        comparacaoChartInstance.destroy();
        comparacaoChartInstance = null;
    }
    
    chartLegend.innerHTML = '';
    
    resultadoSection.style.display = 'none';
    desempenhoSection.style.display = 'none';
    graficoSection.style.display = 'none';
    
    resultadosCalculados = [];
    
    resultadoConsolidado.innerHTML = `
        <div class="estado-inicial">
            <div class="estado-icon">
                <i class="fas fa-arrow-circle-right"></i>
            </div>
            <p>Insira os preços atuais e clique em Calcular</p>
        </div>
    `;
    
    resultadoConsolidado.classList.remove('has-result');
    statsAcoes.textContent = '0/5 ações calculadas';
    
    // Limitar preços salvos
    localStorage.removeItem(SAVED_PRICES_KEY);
    
    if (mostrarInvestimento) {
        toggleMostrarInvestimento();
    }
    
    if (isMobile) {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    }
    
    inputsPrecos.sp.focus();
    mostrarNotificacao('Campos limpos', 'info', 2000);
}

function limparTabela() {
    while (tabelaResultados.rows.length > 0) {
        tabelaResultados.deleteRow(0);
    }
    
    const novaLinha = tabelaResultados.insertRow();
    novaLinha.className = 'empty-row';
    const celulaVazia = novaLinha.insertCell(0);
    celulaVazia.colSpan = 4;
    celulaVazia.innerHTML = '<i class="fas fa-info-circle"></i><span>Insira os preços e clique em Calcular</span>';
}

// Prevenir zoom em mobile
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registado com sucesso: ', registration.scope);
        }, function(err) {
            console.log('Falha no registo do ServiceWorker: ', err);
        });
    });
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', init);