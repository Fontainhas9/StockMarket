// Dados das ações atualizados com os nomes completos
const acoes = [
    { 
        id: 'sp', 
        nome: 'BCP S&P 500', 
        investido: 7957.36, 
        precoCompra: 57.662, 
        icon: 'fa-chart-bar',
        nomeCurto: 'BCP S&P 500'
    },
    { 
        id: 'ouro', 
        nome: 'BCP Ouro', 
        investido: 7982.18, 
        precoCompra: 234.77, 
        icon: 'fa-gem',
        nomeCurto: 'BCP Ouro'
    },
    { 
        id: 'janus', 
        nome: 'Janus Henderson Capital Funds plc - Global Technology and Innovation Fund A2 HEUR', 
        investido: 7999.99, 
        precoCompra: 26.1, 
        icon: 'fa-university',
        nomeCurto: 'Janus Henderson Global Tech'
    },
    { 
        id: 'jpmorgan', 
        nome: 'JPMorgan Investment Funds - US Select Equity Fund A (acc) - EUR', 
        investido: 8000.00, 
        precoCompra: 482.8, 
        icon: 'fa-landmark',
        nomeCurto: 'JP Morgan US Select Equity'
    },
    { 
        id: 'imga', 
        nome: 'IMGA Ações América A – Fundo de Investimento Aberto de Acções', 
        investido: 8000.00, 
        precoCompra: 12.4971, 
        icon: 'fa-industry',
        nomeCurto: 'IMGA Ações América A'
    }
];

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

// Estado da aplicação
let mostrarInvestimento = false;
let resultadosCalculados = [];
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let lastScrollTop = 0;

// Configuração da palavra-passe
const CORRECT_PASSWORD = "Fontainhas#9"; 
const AUTH_KEY = 'portfolio_calculator_auth';
const AUTH_TIMESTAMP_KEY = 'portfolio_calculator_auth_timestamp';
const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 horas em milissegundos

// Verificar se o usuário já está autenticado
function checkAuthentication() {
    try {
        const authData = localStorage.getItem(AUTH_KEY);
        const authTimestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);
        
        if (authData && authTimestamp) {
            const currentTime = new Date().getTime();
            const loginTime = parseInt(authTimestamp);
            
            // Verificar se a sessão expirou (12 horas)
            if (currentTime - loginTime < SESSION_TIMEOUT) {
                showMainContent();
                return true;
            } else {
                // Sessão expirada - limpar dados de login
                logout();
            }
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
    
    // Inicializar a calculadora
    initCalculator();
}

// Fazer logout
function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
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
            localStorage.setItem(AUTH_KEY, 'true');
            localStorage.setItem(AUTH_TIMESTAMP_KEY, currentTime.toString());
            
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
    
    // Verificar autenticação
    if (!checkAuthentication()) {
        // Mostrar tela de login
        loginScreen.style.display = 'flex';
        mainContent.style.display = 'none';
    }
}

// Inicializar a calculadora (após login)
function initCalculator() {
    configurarEventListeners();
    configurarNavegacaoTeclado();
    detectarDispositivo();
    calcularTotalInvestido();
    configurarScrollToTop();
    configurarFocusMobile();
    
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
    if (isMobile && !localStorage.getItem('keyboardHintShown')) {
        mobileKeyboardHint.classList.add('show');
        
        setTimeout(() => {
            mobileKeyboardHint.classList.remove('show');
            localStorage.setItem('keyboardHintShown', 'true');
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
    
    // Limitar a 4 casas decimais
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
    
    toggleInvestmentBtn.addEventListener('click', toggleMostrarInvestimento);
    
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
            
            // Limitar a 4 casas decimais
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

// Configurar navegação por teclado
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

// Configurar foco em mobile
function configurarFocusMobile() {
    if (isMobile) {
        // Adicionar botões de navegação virtual para mobile
        const inputs = Object.values(inputsPrecos);
        
        inputs.forEach((input, index) => {
            // Adicionar botões de navegação no teclado virtual
            input.setAttribute('enterkeyhint', index < inputs.length - 1 ? 'next' : 'go');
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
    document.getElementById('total-investido').textContent = formatarMoeda(totalInvestido);
}

// Alternar mostrar/ocultar valores investidos
function toggleMostrarInvestimento() {
    mostrarInvestimento = !mostrarInvestimento;
    
    const investmentValues = document.querySelectorAll('.investment-value');
    const icon = toggleInvestmentBtn.querySelector('i');
    const text = toggleInvestmentBtn.querySelector('span');
    
    if (mostrarInvestimento) {
        investmentValues.forEach(el => el.classList.remove('hidden'));
        investmentSummary.classList.remove('hidden');
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        text.textContent = 'Ocultar Valores Investidos';
        toggleInvestmentBtn.style.background = 'linear-gradient(135deg, #1e56c7 0%, #6b3af2 100%)';
    } else {
        investmentValues.forEach(el => el.classList.add('hidden'));
        investmentSummary.classList.add('hidden');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        text.textContent = 'Mostrar Valores Investidos';
        toggleInvestmentBtn.style.background = 'var(--gradient-primary)';
    }
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
        
        // Converter o valor para número (suporta vírgula e ponto)
        const precoAtual = formatarNumeroParaCalculo(valorInput);
        
        if (valorInput !== '' && !isNaN(precoAtual) && precoAtual >= 0) {
            // Calcular resultados com até 6 casas decimais de precisão
            const numeroAcoes = acao.investido / acao.precoCompra;
            const valorAtual = parseFloat((numeroAcoes * precoAtual).toFixed(6));
            const lucro = parseFloat((valorAtual - acao.investido).toFixed(6));
            const percentagem = parseFloat(((lucro / acao.investido) * 100).toFixed(6));
            
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
            
            // Adicionar à tabela
            adicionarNaTabela(acao.nomeCurto, valorAtual, lucro, percentagem, acao.icon);
        }
    });
    
    if (acoesValidas === 0) {
        mostrarErro("Por favor, insira pelo menos um preço atual válido");
        return;
    }
    
    // Calcular totais consolidados com alta precisão
    const lucroTotal = parseFloat((totalAtual - totalInvestido).toFixed(6));
    const percentagemTotal = totalInvestido > 0 ? parseFloat(((lucroTotal / totalInvestido) * 100).toFixed(6)) : 0;
    
    // Atualizar estatísticas
    statsAcoes.textContent = `${acoesValidas}/5 ações calculadas`;
    
    // Mostrar resultado consolidado SIMPLIFICADO
    mostrarResultadoConsolidadoSimplificado(totalAtual, lucroTotal, percentagemTotal, acoesComLucro, acoesValidas);
    
    // Scroll para resultados em mobile
    if (isMobile && acoesValidas > 0) {
        setTimeout(() => {
            const resultadosSection = document.querySelector('.desempenho-card');
            scrollToElement(resultadosSection);
        }, 100);
    }
}

// Função para adicionar linha na tabela
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
    const percentagemFormatada = parseFloat(percentagem).toFixed(2) + '%';
    
    // Adicionar células
    const celulaAcao = novaLinha.insertCell(0);
    celulaAcao.innerHTML = `<i class="fas ${iconClass}"></i> <span class="acao-nome">${nome}</span>`;
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

// Função para mostrar resultado consolidado SIMPLIFICADO - REMOVIDO O EMOJI
function mostrarResultadoConsolidadoSimplificado(totalAtual, lucroTotal, percentagemTotal, acoesComLucro, acoesValidas) {
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
    const percentagemTotalFormatada = parseFloat(percentagemTotal).toFixed(3) + '%';
    
    // Criar conteúdo HTML SIMPLIFICADO SEM EMOJI
    const resultadoHTML = `
        <div class="resultado-info ${cor}">
            <div class="resultado-detalhes">
                <p>
                    <i class="fas fa-chart-pie"></i>
                    <span>Ações com Lucro:</span>
                    <strong>${acoesComLucro}/${acoesValidas}</strong>
                </p>
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

// Função para limpar campos
function limparCampos() {
    // Limpar campos de entrada
    Object.values(inputsPrecos).forEach(input => {
        input.value = '';
    });
    
    // Limpar tabela
    limparTabela();
    
    // Restaurar estado inicial
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
    celulaVazia.innerHTML = '<i class="fas fa-info-circle"></i><span>Nenhum cálculo realizado ainda</span>';
}

// Função para formatar valores monetários
function formatarMoeda(valor, comSinal = false) {
    const sinal = comSinal ? (valor > 0 ? '+' : '') : '';
    const valorAbsoluto = Math.abs(valor);
    
    // Formatar com separador de milhares e 2 casas decimais
    return sinal + '€ ' + valorAbsoluto.toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
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

// Adicionar botão de logout no footer
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
            
            // Adicionar ao lado do botão "Voltar ao Topo"
            footerLinks.appendChild(logoutBtn);
        }
    }, 500);
});