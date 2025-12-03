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

// Inicializar a aplicação
function init() {
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
    
    // Eventos para inputs - melhorar experiência mobile
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
        
        // Melhorar entrada numérica em mobile
        input.addEventListener('input', (e) => {
            if (isMobile) {
                // Garantir formato correto para números decimais
                let value = e.target.value;
                value = value.replace(/[^\d.,-]/g, '');
                
                // Substituir vírgula por ponto para cálculo
                if (value.includes(',')) {
                    value = value.replace(',', '.');
                }
                
                // Garantir apenas um ponto decimal
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                }
                
                e.target.value = value;
            }
        });
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
            
            // Para iOS: garantir que o teclado numérico apareça
            if (navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) {
                input.setAttribute('pattern', '[0-9]*');
            }
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
        text.textContent = 'Ocultar Investidos';
        toggleInvestmentBtn.style.background = 'rgba(255, 255, 255, 0.25)';
    } else {
        investmentValues.forEach(el => el.classList.add('hidden'));
        investmentSummary.classList.add('hidden');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        text.textContent = 'Mostrar Investidos';
        toggleInvestmentBtn.style.background = 'rgba(255, 255, 255, 0.15)';
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
        let valorInput = input.value.trim();
        
        // Substituir vírgula por ponto para compatibilidade
        valorInput = valorInput.replace(',', '.');
        
        const precoAtual = parseFloat(valorInput);
        
        if (valorInput !== '' && !isNaN(precoAtual) && precoAtual >= 0) {
            // Calcular resultados
            const numeroAcoes = acao.investido / acao.precoCompra;
            const valorAtual = numeroAcoes * precoAtual;
            const lucro = valorAtual - acao.investido;
            const percentagem = (lucro / acao.investido) * 100;
            
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
    
    // Calcular totais consolidados
    const lucroTotal = totalAtual - totalInvestido;
    const percentagemTotal = totalInvestido > 0 ? (lucroTotal / totalInvestido) * 100 : 0;
    
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
    const percentagemFormatada = percentagem.toFixed(2) + '%';
    
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

// Função para mostrar resultado consolidado SIMPLIFICADO
function mostrarResultadoConsolidadoSimplificado(totalAtual, lucroTotal, percentagemTotal, acoesComLucro, acoesValidas) {
    // Determinar cor e emoji baseado no resultado
    let cor, emoji;
    
    if (lucroTotal > 0) {
        cor = 'resultado-positivo';
        emoji = '📈';
    } else if (lucroTotal < 0) {
        cor = 'resultado-negativo';
        emoji = '📉';
    } else {
        cor = 'resultado-estavel';
        emoji = '➡️';
    }
    
    // Formatar valores monetários
    const totalAtualFormatado = formatarMoeda(totalAtual);
    const lucroTotalFormatado = formatarMoeda(lucroTotal, true);
    const percentagemTotalFormatada = percentagemTotal.toFixed(3) + '%';
    
    // Criar conteúdo HTML SIMPLIFICADO
    const resultadoHTML = `
        <div class="resultado-info ${cor}">
            <div class="resultado-emoji">${emoji}</div>
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
            <div class="resultado-emoji">❌</div>
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

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);

// Suporte para PWA (se aplicável)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registado com sucesso: ', registration.scope);
        }, function(err) {
            console.log('Falha no registo do ServiceWorker: ', err);
        });
    });
}