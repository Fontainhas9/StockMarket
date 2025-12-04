// Dados das ações atualizados com os nomes completos
const acoes = [
    { 
        id: 'sp', 
        nome: 'BCP S&P 500', 
        investido: 7957.36, 
        precoCompra: 57.662, 
        icon: 'fa-chart-bar',
        nomeCurto: 'SP500'
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
        nomeCurto: 'JPMorgan'
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

// Links para os sites das ações
const linksAcoes = {
    'IMGA': 'https://ind.millenniumbcp.pt/pt/Particulares/Investimentos/Pages/FundsDetail.aspx?Isi=PTYAGALM0005',
    'Janus': 'https://markets.ft.com/data/funds/tearsheet/summary?s=IE0002167009:EUR',
    'JPMorgan': 'https://pt.investing.com/funds/lu0218171717',
    'Ouro': 'https://live.euronext.com/en/product/structured-products/PTBCPAYM0053-XMLI',
    'SP500': 'https://live.euronext.com/en/product/structured-products/PTBITHYM0080-XMLI'
};

// Referências aos elementos DOM
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
const graficoSection = document.getElementById('grafico-section');
const chartCanvas = document.getElementById('portfolio-chart');
const chartLegend = document.getElementById('chart-legend');
const desempenhoSection = document.getElementById('desempenho-section');
const resultadoSection = document.getElementById('resultado-section');

// NOVAS REFERÊNCIAS PARA A SEÇÃO DE COMPARAÇÃO
const comparacaoSection = document.getElementById('comparacao-section');
const comparacaoChartCanvas = document.getElementById('comparacao-chart');
const comparacaoLegend = document.getElementById('comparacao-legend');
const diferencaTotalSpan = document.getElementById('diferenca-total');

// Estado da aplicação
let mostrarInvestimento = false;
let resultadosCalculados = [];
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let lastScrollTop = 0;
let chartInstance = null;
let comparacaoChartInstance = null; // NOVA INSTÂNCIA DO GRÁFICO DE COMPARAÇÃO
let isDarkMode = false;

// Configuração da palavra-passe
const CORRECT_PASSWORD = "Fontainhas#9"; 
const AUTH_KEY = 'portfolio_calculator_auth';
const AUTH_TIMESTAMP_KEY = 'portfolio_calculator_auth_timestamp';
const THEME_KEY = 'portfolio_calculator_theme';

// Função para arredondar para 2 casas decimais para cima
function arredondarParaCima(valor) {
    return Math.ceil(valor * 100) / 100;
}

// Função para arredondar percentagem para 2 casas decimais para cima
function arredondarPercentagemParaCima(valor) {
    return Math.ceil(valor * 100) / 100;
}

// Verificar se o usuário já está autenticado
function checkAuthentication() {
    try {
        const authData = sessionStorage.getItem(AUTH_KEY);
        const authTimestamp = sessionStorage.getItem(AUTH_TIMESTAMP_KEY);
        
        if (authData && authTimestamp) {
            return true;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
    return false;
}

// Mostrar conteúdo principal
function showMainContent() {
    loginScreen.style.display = 'none';
    mainContent.style.display = 'block';
    document.body.style.background = 'linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%)';
    
    // Ajustar altura em dispositivos móveis
    if (isMobile) {
        document.body.style.minHeight = '100vh';
        document.body.style.minHeight = '-webkit-fill-available';
    }
    
    // Inicializar a calculadora
    initCalculator();
}

// Fazer logout
function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
    location.reload();
}

// Configurar sistema de login
function setupLoginSystem() {
    // Focar no campo de senha
    passwordInput.focus();
    
    // Mostrar/ocultar senha
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Login com Enter
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Botão de login
    loginBtn.addEventListener('click', function() {
        const password = passwordInput.value.trim();
        
        if (password === CORRECT_PASSWORD) {
            // Autenticação bem-sucedida
            const currentTime = new Date().getTime();
            sessionStorage.setItem(AUTH_KEY, 'true');
            sessionStorage.setItem(AUTH_TIMESTAMP_KEY, currentTime.toString());
            
            // Animação de sucesso
            loginBtn.innerHTML = '<i class="fas fa-check"></i> Autenticado!';
            loginBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                showMainContent();
            }, 800);
        } else {
            // Senha incorreta
            loginError.style.display = 'flex';
            passwordInput.value = '';
            passwordInput.focus();
            
            // Animar o botão de erro
            loginBtn.innerHTML = '<i class="fas fa-times"></i> Erro!';
            loginBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            
            setTimeout(() => {
                loginError.style.display = 'none';
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
                loginBtn.style.background = 'var(--gradient-primary)';
            }, 2000);
        }
    });
    
    // Limpar erro ao digitar
    passwordInput.addEventListener('input', function() {
        if (loginError.style.display !== 'none') {
            loginError.style.display = 'none';
        }
    });
}

// Inicializar a aplicação
function init() {
    setupLoginSystem();
    
    loginScreen.style.display = 'flex';
    mainContent.style.display = 'none';
    
    // Limpar qualquer sessão anterior (para garantir)
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_TIMESTAMP_KEY);
}

// Inicializar a calculadora (após login)
function initCalculator() {
    configurarEventListeners();
    configurarNavegacaoTeclado();
    detectarDispositivo();
    calcularTotalInvestido();
    configurarScrollToTop();
    configurarFocusMobile();
    configurarModoEscuro();
    configurarGrafico();
    
    // Configurar o botão de mostrar investimentos (agora no footer)
    toggleInvestmentBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMostrarInvestimento();
    });
    
    // Configurar o botão de sair no header
    const logoutHeaderBtn = document.getElementById('logout-header-btn');
    if (logoutHeaderBtn) {
        logoutHeaderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Focar no primeiro campo
    setTimeout(() => {
        inputsPrecos.sp.focus();
    }, 300);
}

// Detectar dispositivo e ajustar comportamento
function detectarDispositivo() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Verificar se é mobile
    isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    // Adicionar classe CSS para mobile
    if (isMobile) {
        document.body.classList.add('is-mobile');
        
        // Mostrar dica de teclado móvel
        setTimeout(() => {
            showMobileKeyboardHint();
        }, 2000);
    }
}

// Mostrar dica de teclado móvel
function showMobileKeyboardHint() {
    if (isMobile && !sessionStorage.getItem('keyboardHintShown')) {
        mobileKeyboardHint.classList.add('show');
        
        setTimeout(() => {
            mobileKeyboardHint.classList.remove('show');
            sessionStorage.setItem('keyboardHintShown', 'true');
        }, 5000);
    }
}

// Função para formatar números com vírgula para ponto
function formatarNumeroParaCalculo(valor) {
    if (!valor || valor === '') return null;
    
    // Substituir vírgula por ponto
    let valorFormatado = valor.toString().replace(',', '.');
    
    // Remover caracteres não numéricos exceto ponto e números
    valorFormatado = valorFormatado.replace(/[^\d.]/g, '');
    
    // Remover múltiplos pontos (manter apenas o primeiro)
    const partes = valorFormatado.split('.');
    if (partes.length > 2) {
        valorFormatado = partes[0] + '.' + partes.slice(1).join('');
    }
    
    // Limitar a 4 casas decimais para os valores inseridos
    if (valorFormatado.includes('.')) {
        const partesDecimais = valorFormatado.split('.');
        if (partesDecimais[1].length > 4) {
            valorFormatado = partesDecimais[0] + '.' + partesDecimais[1].substring(0, 4);
        }
    }
    
    return parseFloat(valorFormatado);
}

// Configurar event listeners
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
    
    // Eventos para inputs - melhorar experiência mobile e decimal
    Object.values(inputsPrecos).forEach((input, index, arr) => {
        // Para desktop: navegação com Enter
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
        
        // Para mobile: mostrar botão de ação quando focado
        input.addEventListener('focus', () => {
            if (isMobile) {
                scrollToElement(input);
            }
        });
        
        // Validação em tempo real para números decimais
        input.addEventListener('input', (e) => {
            let value = e.target.value;
            
            // Permitir apenas números, ponto e vírgula
            value = value.replace(/[^\d,.]/g, '');
            
            // Garantir que só haja um separador decimal
            const commaCount = (value.match(/,/g) || []).length;
            const dotCount = (value.match(/\./g) || []).length;
            
            if (commaCount + dotCount > 1) {
                // Se houver múltiplos separadores, manter apenas o primeiro
                const firstSeparatorIndex = Math.min(
                    value.indexOf(','), 
                    value.indexOf('.')
                );
                value = value.substring(0, firstSeparatorIndex + 1) + 
                       value.substring(firstSeparatorIndex + 1).replace(/[,.]/g, '');
            }
            
            // Limitar a 4 casas decimais para os valores inseridos
            if (value.includes(',') || value.includes('.')) {
                const separator = value.includes(',') ? ',' : '.';
                const parts = value.split(separator);
                if (parts[1] && parts[1].length > 4) {
                    value = parts[0] + separator + parts[1].substring(0, 4);
                }
            }
            
            e.target.value = value;
        });
        
        // Para iOS: garantir que o teclado numérico com decimal apareça
        if (navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
            input.setAttribute('pattern', '[0-9]*[.,]?[0-9]*');
        }
    });
    
    // Prevenir zoom em inputs em iOS
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            document.body.style.zoom = "100%";
        }
    }, { passive: true });
}

// Configurar navegação por teclado - MELHORIA PARA MOBILE
function configurarNavegacaoTeclado() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter ou Cmd+Enter para calcular
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            calcularPortfolio();
        }
        
        // Escape para limpar
        if (e.key === 'Escape') {
            limparCampos();
        }
        
        // Alt+I para mostrar/ocultar investimento
        if (e.key === 'i' && e.altKey) {
            e.preventDefault();
            toggleMostrarInvestimento();
        }
        
        // Alt+T para alternar tema
        if (e.key === 't' && e.altKey) {
            e.preventDefault();
            toggleModoEscuro();
        }
        
        // Ctrl+Alt+L para logout (atalho secreto)
        if (e.key === 'l' && e.ctrlKey && e.altKey) {
            e.preventDefault();
            logout();
        }
    });
}

// Configurar scroll para o topo
function configurarScrollToTop() {
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Mostrar/ocultar botão baseado no scroll
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

// Configurar foco em mobile - MELHORIA PARA TECLADO
function configurarFocusMobile() {
    if (isMobile) {
        // Adicionar botões de navegação virtual para mobile
        const inputs = Object.values(inputsPrecos);
        
        inputs.forEach((input, index) => {
            // Configurar enterkeyhint para melhor navegação no teclado móvel
            if (index < inputs.length - 1) {
                // Para todos exceto o último: "next" (ou "próximo")
                input.setAttribute('enterkeyhint', 'next');
            } else {
                // Para o último: "go" (ou "concluir") para calcular
                input.setAttribute('enterkeyhint', 'go');
            }
            
            // Garantir que o teclado numérico com decimal apareça
            input.setAttribute('inputmode', 'decimal');
            
            // Melhorar a experiência do teclado
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('spellcheck', 'false');
        });
    }
}

// Scroll para elemento em mobile
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

// Calcular e mostrar total investido
function calcularTotalInvestido() {
    const totalInvestido = acoes.reduce((total, acao) => total + acao.investido, 0);
    document.getElementById('total-investido').textContent = totalInvestido.toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
}

// Alternar mostrar/ocultar valores investidos (agora no footer)
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
    } else {
        investmentValues.forEach(el => el.classList.add('hidden'));
        investmentSummary.classList.add('hidden');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        toggleInvestmentBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    }
}

// Configurar Modo Escuro
function configurarModoEscuro() {
    // Verificar preferência salva
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        ativarModoEscuro();
    } else {
        desativarModoEscuro();
    }
    
    // Configurar botão de toggle
    themeToggleBtn.addEventListener('click', toggleModoEscuro);
}

// Ativar Modo Escuro
function ativarModoEscuro() {
    document.body.classList.add('dark-mode');
    isDarkMode = true;
    
    // Atualizar ícone do botão
    const icon = themeToggleBtn.querySelector('i');
    icon.className = 'fas fa-sun';
    
    // Salvar preferência
    localStorage.setItem(THEME_KEY, 'dark');
    
    // Atualizar gráficos se existirem
    if (chartInstance) {
        atualizarGrafico();
    }
    if (comparacaoChartInstance) {
        atualizarGraficoComparacao();
    }
}

// Desativar Modo Escuro
function desativarModoEscuro() {
    document.body.classList.remove('dark-mode');
    isDarkMode = false;
    
    // Atualizar ícone do botão
    const icon = themeToggleBtn.querySelector('i');
    icon.className = 'fas fa-moon';
    
    // Salvar preferência
    localStorage.setItem(THEME_KEY, 'light');
    
    // Atualizar gráficos se existirem
    if (chartInstance) {
        atualizarGrafico();
    }
    if (comparacaoChartInstance) {
        atualizarGraficoComparacao();
    }
}

// Alternar Modo Escuro
function toggleModoEscuro() {
    if (isDarkMode) {
        desativarModoEscuro();
    } else {
        ativarModoEscuro();
    }
}

// Configurar Gráfico (SIMPLIFICADA - botão removido)
function configurarGrafico() {
    // Botão de mostrar percentagens REMOVIDO
    // Apenas manter a configuração básica do gráfico
}

// Atualizar Gráfico
function atualizarGrafico() {
    if (!chartInstance || resultadosCalculados.length === 0) return;
    
    // Destruir gráfico anterior
    chartInstance.destroy();
    
    // Criar novo gráfico com os dados atualizados
    criarGrafico();
}

// NOVA FUNÇÃO: Atualizar Gráfico de Comparação
function atualizarGraficoComparacao() {
    if (!comparacaoChartInstance || resultadosCalculados.length === 0) return;
    
    // Destruir gráfico anterior
    comparacaoChartInstance.destroy();
    
    // Criar novo gráfico com os dados atualizados
    criarGraficoComparacao();
}

// Criar Gráfico (SIMPLIFICADA)
function criarGrafico() {
    if (resultadosCalculados.length === 0) {
        graficoSection.style.display = 'none';
        return;
    }
    
    // Mostrar seção do gráfico
    graficoSection.style.display = 'block';
    
    // Preparar dados para o gráfico
    const labels = resultadosCalculados.map(r => r.nomeCurto);
    const valores = resultadosCalculados.map(r => r.valorAtual);
    const total = valores.reduce((sum, val) => sum + val, 0);
    // ALTERADO: Agora sempre mostra valores (€) e as percentagens são calculadas apenas para a legenda
    const porcentagens = valores.map(val => arredondarPercentagemParaCima(((val / total) * 100)));
    
    // Cores para o gráfico
    const colors = [
        '#2d6ae3', // Azul
        '#7e3af2', // Roxo
        '#0ea5e9', // Azul claro
        '#10b981', // Verde
        '#f59e0b'  // Laranja
    ];
    
    // Configuração do gráfico baseada no modo escuro
    const textColor = isDarkMode ? '#f1f5f9' : '#1f2937';
    
    // Configurações do gráfico de pizza - SEMPRE MOSTRA VALORES (€)
    const config = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores, // SEMPRE mostra valores em €
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
                        // MELHORIA: Remover duplicação do nome no tooltip
                        title: function(context) {
                            return context[0].label || '';
                        },
                        label: function(context) {
                            const value = context.raw || 0;
                            const percentage = arredondarPercentagemParaCima((value / total) * 100);
                            return `${formatarMoeda(value)} (${percentage.toFixed(2)}%)`;
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
    
    // Criar gráfico
    chartInstance = new Chart(chartCanvas, config);
    
    // Atualizar legenda - SEMPRE mostra valores e percentagens COM LINKS
    atualizarLegenda(labels, valores, porcentagens, colors);
    
    // Scroll para gráfico em mobile
    if (isMobile) {
        setTimeout(() => {
            scrollToElement(graficoSection);
        }, 100);
    }
}

// Atualizar Legenda (SIMPLIFICADA - sempre mostra valores e percentagens com LINKS)
function atualizarLegenda(labels, valores, porcentagens, colors) {
    chartLegend.innerHTML = '';
    
    labels.forEach((label, index) => {
        const valor = valores[index];
        const porcentagem = porcentagens[index];
        
        // Obter o link para esta ação
        const linkAcao = linksAcoes[label];
        
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        // SEMPRE mostra o valor e a percentagem na legenda COM LINK
        if (linkAcao) {
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <a href="${linkAcao}" target="_blank" rel="noopener noreferrer" class="legend-link">
                    <span class="legend-name">${label}</span>
                </a>
                <span class="legend-value">
                    ${formatarMoeda(valor)} (${porcentagem.toFixed(2)}%)
                </span>
            `;
        } else {
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${colors[index]}"></div>
                <span class="legend-name">${label}</span>
                <span class="legend-value">
                    ${formatarMoeda(valor)} (${porcentagem.toFixed(2)}%)
                </span>
            `;
        }
        
        chartLegend.appendChild(legendItem);
    });
}

// NOVA FUNÇÃO: Criar Gráfico de Comparação (Diferença vs Investido)
function criarGraficoComparacao() {
    if (resultadosCalculados.length === 0) {
        comparacaoSection.style.display = 'none';
        return;
    }
    
    // Mostrar seção do gráfico
    comparacaoSection.style.display = 'block';
    
    // Preparar dados para o gráfico
    const labels = resultadosCalculados.map(r => r.nomeCurto);
    const valoresInvestidos = resultadosCalculados.map(r => r.investido);
    const valoresAtuais = resultadosCalculados.map(r => r.valorAtual);
    
    // Calcular a diferença (excedente) para cada ação
    const diferencas = valoresAtuais.map((valorAtual, index) => {
        return valorAtual - valoresInvestidos[index];
    });
    
    // Calcular a diferença total
    const totalInvestido = valoresInvestidos.reduce((a, b) => a + b, 0);
    const totalAtual = valoresAtuais.reduce((a, b) => a + b, 0);
    const diferencaTotal = totalAtual - totalInvestido;
    
    // Atualizar estatísticas
    diferencaTotalSpan.textContent = formatarMoeda(diferencaTotal, true);
    
    // Configurar cores baseadas na diferença
    const cores = diferencas.map(diferenca => 
        diferenca >= 0 ? '#10b981' : '#ef4444' // Verde para positivo, vermelho para negativo
    );
    
    // Configuração do gráfico baseada no modo escuro
    const textColor = isDarkMode ? '#f1f5f9' : '#1f2937';
    const gridColor = isDarkMode ? 'rgba(241, 245, 249, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Configurações do gráfico de barras - MOSTRA APENAS A DIFERENÇA
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Excedente (€)',
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
                            return (value >= 0 ? '+' : '') + arredondarParaCima(value).toLocaleString('pt-PT', { minimumFractionDigits: 0 }) + '€';
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
                            const percentagem = arredondarPercentagemParaCima((diferenca / investido) * 100);
                            
                            return [
                                `Investido: ${formatarMoeda(investido)}`,
                                `Atual: ${formatarMoeda(atual)}`,
                                `Excedente: ${diferenca >= 0 ? '+' : ''}${formatarMoeda(Math.abs(diferenca))} (${diferenca >= 0 ? '+' : ''}${percentagem.toFixed(2)}%)`
                            ];
                        }
                    }
                }
            }
        }
    };
    
    // Criar gráfico
    comparacaoChartInstance = new Chart(comparacaoChartCanvas, config);
    
    // Atualizar legenda do gráfico de comparação
    atualizarLegendaComparacao(labels, diferencas);
    
    // Scroll para gráfico de comparação em mobile
    if (isMobile) {
        setTimeout(() => {
            scrollToElement(comparacaoSection);
        }, 100);
    }
}

// Função para atualizar a legenda do gráfico de comparação
function atualizarLegendaComparacao(labels, diferencas) {
    if (!comparacaoLegend) return;
    
    comparacaoLegend.innerHTML = '';
    
    labels.forEach((label, index) => {
        const diferenca = diferencas[index];
        const linkAcao = linksAcoes[label];
        
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        if (linkAcao) {
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${diferenca >= 0 ? '#10b981' : '#ef4444'}"></div>
                <a href="${linkAcao}" target="_blank" rel="noopener noreferrer" class="legend-link">
                    <span class="legend-name">${label}</span>
                </a>
                <span class="legend-value">
                    ${diferenca >= 0 ? '+' : ''}${formatarMoeda(Math.abs(diferenca))}
                </span>
            `;
        } else {
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${diferenca >= 0 ? '#10b981' : '#ef4444'}"></div>
                <span class="legend-name">${label}</span>
                <span class="legend-value">
                    ${diferenca >= 0 ? '+' : ''}${formatarMoeda(Math.abs(diferenca))}
                </span>
            `;
        }
        
        comparacaoLegend.appendChild(legendItem);
    });
}

// Função para calcular o portfólio
function calcularPortfolio() {
    // Limpar resultados anteriores
    resultadosCalculados = [];
    limparTabela();
    
    let totalInvestido = 0;
    let totalAtual = 0;
    let acoesValidas = 0;
    let acoesComLucro = 0;
    
    // Calcular cada ação
    acoes.forEach(acao => {
        const input = inputsPrecos[acao.id];
        const valorInput = input.value.trim();
        
        // Converter o valor para número (suporta vírgula e ponto) - mantém até 4 casas decimais
        const precoAtual = formatarNumeroParaCalculo(valorInput);
        
        if (valorInput !== '' && !isNaN(precoAtual) && precoAtual >= 0) {
            // Calcular resultados com alta precisão inicial
            const numeroAcoes = acao.investido / acao.precoCompra;
            const valorAtualBruto = numeroAcoes * precoAtual;
            const lucroBruto = valorAtualBruto - acao.investido;
            const percentagemBruto = (lucroBruto / acao.investido) * 100;
            
            // Arredondar resultados para 2 casas decimais para cima
            const valorAtual = arredondarParaCima(valorAtualBruto);
            const lucro = arredondarParaCima(lucroBruto);
            const percentagem = arredondarPercentagemParaCima(percentagemBruto);
            
            // Armazenar resultados
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
            
            // Contar ações com lucro
            if (lucro > 0) {
                acoesComLucro++;
            }
            
            // Atualizar totais
            totalInvestido += acao.investido;
            totalAtual += valorAtual;
            acoesValidas++;
            
            // Adicionar à tabela (MELHORIA: nome com link)
            adicionarNaTabela(acao.nomeCurto, valorAtual, lucro, percentagem, acao.icon);
        }
    });
    
    if (acoesValidas === 0) {
        mostrarErro("Por favor, insira pelo menos um preço atual válido");
        // OCULTAR TODAS AS SEÇÕES (na ordem correta)
        desempenhoSection.style.display = 'none';
        resultadoSection.style.display = 'none';
        graficoSection.style.display = 'none';
        comparacaoSection.style.display = 'none'; // NOVA SEÇÃO
        return;
    }
    
    // Calcular totais consolidados com arredondamento para cima
    const lucroTotalBruto = totalAtual - totalInvestido;
    const lucroTotal = arredondarParaCima(lucroTotalBruto);
    const percentagemTotalBruto = totalInvestido > 0 ? (lucroTotal / totalInvestido) * 100 : 0;
    const percentagemTotal = arredondarPercentagemParaCima(percentagemTotalBruto);
    
    // Atualizar estatísticas
    statsAcoes.textContent = `${acoesValidas}/5 ações calculadas`;
    
    // Mostrar resultado consolidado SIMPLIFICADO
    mostrarResultadoConsolidadoSimplificado(totalAtual, lucroTotal, percentagemTotal);
    
    // MOSTRAR SEÇÕES NA NOVA ORDEM após cálculo:
    // 1. Desempenho por Ação (tabela)
    desempenhoSection.style.display = 'block';
    // 2. Resumo do Portefólio (resultado consolidado)
    resultadoSection.style.display = 'block';
    // 3. Distribuição do Portefólio (gráfico)
    // 4. Comparação: Investido vs Atual (gráfico de barras)
    
    // CORREÇÃO: Destruir os gráficos anteriores antes de criar novos
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    
    if (comparacaoChartInstance) {
        comparacaoChartInstance.destroy();
        comparacaoChartInstance = null;
    }
    
    // Criar ou atualizar gráficos
    criarGrafico();
    criarGraficoComparacao(); // NOVO GRÁFICO
    
    // Scroll para a PRIMEIRA seção de resultados (Desempenho por Ação) em mobile
    if (isMobile && acoesValidas > 0) {
        setTimeout(() => {
            scrollToElement(desempenhoSection);
        }, 100);
    }
}

// Função para adicionar linha na tabela (MELHORIA: nome com link)
function adicionarNaTabela(nome, valorAtual, lucro, percentagem, iconClass) {
    // Remover linha vazia se existir
    const emptyRow = tabelaResultados.querySelector('.empty-row');
    if (emptyRow) {
        emptyRow.remove();
    }
    
    // Criar nova linha
    const novaLinha = tabelaResultados.insertRow();
    novaLinha.className = 'resultado-linha';
    
    // Formatar valores
    const valorAtualFormatado = formatarMoeda(valorAtual);
    const lucroFormatado = formatarMoeda(lucro, true);
    const percentagemFormatada = percentagem.toFixed(2) + '%';
    
    // Adicionar células (MELHORIA: nome com link)
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
    
    // Aplicar estilos baseados no resultado
    if (lucro > 0) {
        celulaLucro.classList.add('lucro-positivo');
        celulaPercentagem.classList.add('lucro-positivo');
    } else if (lucro < 0) {
        celulaLucro.classList.add('lucro-negativo');
        celulaPercentagem.classList.add('lucro-negativo');
    }
}

// Função para mostrar resultado consolidado SIMPLIFICADO
function mostrarResultadoConsolidadoSimplificado(totalAtual, lucroTotal, percentagemTotal) {
    // Determinar cor baseado no resultado
    let cor;
    
    if (lucroTotal > 0) {
        cor = 'resultado-positivo';
    } else if (lucroTotal < 0) {
        cor = 'resultado-negativo';
    } else {
        cor = 'resultado-estavel';
    }
    
    // Formatar valores monetários
    const totalAtualFormatado = formatarMoeda(totalAtual);
    const lucroTotalFormatado = formatarMoeda(lucroTotal, true);
    const percentagemTotalFormatada = percentagemTotal.toFixed(3) + '%';
    
    // Criar conteúdo HTML SIMPLIFICADO
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
                    <strong>${lucroTotalFormatado} (${percentagemTotalFormatada})</strong>
                </p>
            </div>
        </div>
    `;
    
    resultadoConsolidado.innerHTML = resultadoHTML;
    resultadoConsolidado.classList.add('has-result');
}

// Função para mostrar erro
function mostrarErro(mensagem) {
    resultadoConsolidado.innerHTML = `
        <div class="resultado-info resultado-negativo">
            <div class="resultado-titulo">${mensagem}</div>
        </div>
    `;
    resultadoConsolidado.classList.add('has-result');
    statsAcoes.textContent = '0/5 ações calculadas';
}

// Função para formatar valores monetários (ALTERADA: símbolo € no final)
function formatarMoeda(valor, comSinal = false) {
    const sinal = comSinal ? (valor > 0 ? '+' : '') : '';
    const valorArredondado = arredondarParaCima(Math.abs(valor));
    
    // Formatar com separador de milhares e 2 casas decimais, símbolo € no final
    return sinal + valorArredondado.toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
}

// Função para limpar campos
function limparCampos() {
    // Limpar campos de entrada
    Object.values(inputsPrecos).forEach(input => {
        input.value = '';
    });
    
    // Limpar tabela
    limparTabela();
    
    // Limpar gráficos - CORREÇÃO: destruir completamente os gráficos anteriores
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    
    if (comparacaoChartInstance) {
        comparacaoChartInstance.destroy();
        comparacaoChartInstance = null;
    }
    
    // Limpar legendas dos gráficos
    chartLegend.innerHTML = '';
    if (comparacaoLegend) {
        comparacaoLegend.innerHTML = '';
    }
    
    // OCULTAR SEÇÕES na ordem correta
    desempenhoSection.style.display = 'none';
    resultadoSection.style.display = 'none';
    graficoSection.style.display = 'none';
    comparacaoSection.style.display = 'none'; // NOVA SEÇÃO
    
    // Limpar resultados
    resultadosCalculados = [];
    
    // Restaurar estado inicial do resultado consolidado
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
    
    // Esconder valores investidos se estiverem visíveis
    if (mostrarInvestimento) {
        toggleMostrarInvestimento();
    }
    
    // Scroll para topo em mobile
    if (isMobile) {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    }
    
    // Focar no primeiro campo
    inputsPrecos.sp.focus();
}

// Função para limpar tabela
function limparTabela() {
    // Remover todas as linhas exceto a linha vazia
    while (tabelaResultados.rows.length > 0) {
        tabelaResultados.deleteRow(0);
    }
    
    // Adicionar linha vazia novamente
    const novaLinha = tabelaResultados.insertRow();
    novaLinha.className = 'empty-row';
    const celulaVazia = novaLinha.insertCell(0);
    celulaVazia.colSpan = 4;
    celulaVazia.innerHTML = '<i class="fas fa-info-circle"></i><span>Insira os preços e clique em Calcular</span>';
}

// Prevenir comportamento padrão de toque longo
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

// Suporte para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registado com sucesso: ', registration.scope);
        }, function(err) {
            console.log('Falha no registo do ServiceWorker: ', err);
        });
    });
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);

// Adicionar botão de logout no footer (após o botão de mostrar investimentos)
window.addEventListener('load', function() {
    // Esperar o footer ser carregado
    setTimeout(() => {
        const footerLinks = document.querySelector('.footer-links');
        if (footerLinks && !document.getElementById('logout-footer-btn')) {
            // Criar botão de logout para o footer
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'logout-footer-btn';
            logoutBtn.className = 'footer-link';
            logoutBtn.href = '#';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span class="footer-link-text">Sair</span>';
            logoutBtn.title = 'Sair (Ctrl+Alt+L)';
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
            
            // Adicionar após o botão de mostrar investimentos
            footerLinks.appendChild(logoutBtn);
        }
    }, 500);
});