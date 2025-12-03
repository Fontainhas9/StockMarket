// Dados das ações atualizados com os nomes completos
const acoes = [
    { 
        id: 'sp', 
        nome: 'BCP S&P 500', 
        investido: 7957.36, 
        precoCompra: 57.662, 
        icon: 'fa-chart-bar' 
    },
    { 
        id: 'ouro', 
        nome: 'BCP Ouro', 
        investido: 7982.18, 
        precoCompra: 234.77, 
        icon: 'fa-gem' 
    },
    { 
        id: 'janus', 
        nome: 'Janus Henderson Capital Funds plc - Global Technology and Innovation Fund A2 HEUR', 
        investido: 7999.99, 
        precoCompra: 26.1, 
        icon: 'fa-university' 
    },
    { 
        id: 'jpmorgan', 
        nome: 'JPMorgan Investment Funds - US Select Equity Fund A (acc) - EUR', 
        investido: 8000.00, 
        precoCompra: 482.8, 
        icon: 'fa-landmark' 
    },
    { 
        id: 'imga', 
        nome: 'IMGA Ações América A – Fundo de Investimento Aberto de Acções', 
        investido: 8000.00, 
        precoCompra: 12.4971, 
        icon: 'fa-industry' 
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

// Estado da aplicação
let mostrarInvestimento = false;
let resultadosCalculados = [];

// Inicializar a aplicação
function init() {
    configurarEventListeners();
    configurarNavegacaoTeclado();
    inputsPrecos.sp.focus();
    
    // Calcular e mostrar total investido
    const totalInvestido = acoes.reduce((total, acao) => total + acao.investido, 0);
    document.getElementById('total-investido').textContent = formatarMoeda(totalInvestido);
    
    // Configurar botão de voltar ao topo
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Mostrar/ocultar botão de voltar ao topo baseado no scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
            backToTopBtn.style.transform = 'translateY(0)';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
            backToTopBtn.style.transform = 'translateY(20px)';
        }
    });
}

// Configurar event listeners
function configurarEventListeners() {
    calcularBtn.addEventListener('click', calcularPortfolio);
    limparBtn.addEventListener('click', limparCampos);
    toggleInvestmentBtn.addEventListener('click', toggleMostrarInvestimento);
    
    // Adicionar evento para Enter em cada input
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
    });
}

// Configurar navegação por teclado
function configurarNavegacaoTeclado() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter para calcular
        if (e.key === 'Enter' && e.ctrlKey) {
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
        const precoAtual = parseFloat(input.value);
        
        if (input.value.trim() !== '' && !isNaN(precoAtual) && precoAtual >= 0) {
            // Calcular resultados
            const numeroAcoes = acao.investido / acao.precoCompra;
            const valorAtual = numeroAcoes * precoAtual;
            const lucro = valorAtual - acao.investido;
            const percentagem = (lucro / acao.investido) * 100;
            
            // Armazenar resultados
            resultadosCalculados.push({
                nome: acao.nome,
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
            adicionarNaTabela(acao.nome, valorAtual, lucro, percentagem, acao.icon);
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
    
    // Nome abreviado para a tabela
    let nomeAbreviado = nome;
    if (nome.length > 40) {
        // Abreviar nomes muito longos
        if (nome.includes('Janus Henderson')) {
            nomeAbreviado = 'Janus Henderson Global Tech';
        } else if (nome.includes('JPMorgan Investment Funds')) {
            nomeAbreviado = 'JP Morgan US Select Equity';
        } else if (nome.includes('IMGA Ações América')) {
            nomeAbreviado = 'IMGA Ações América A';
        }
    }
    
    // Adicionar células
    const celulaAcao = novaLinha.insertCell(0);
    celulaAcao.innerHTML = `<i class="fas ${iconClass}"></i> <span class="acao-nome">${nomeAbreviado}</span>`;
    
    const celulaValorAtual = novaLinha.insertCell(1);
    celulaValorAtual.textContent = valorAtualFormatado;
    celulaValorAtual.className = 'valor-atual';
    
    const celulaLucro = novaLinha.insertCell(2);
    celulaLucro.textContent = lucroFormatado;
    
    const celulaPercentagem = novaLinha.insertCell(3);
    celulaPercentagem.textContent = percentagemFormatada;
    
    // Aplicar estilos baseados no resultado
    if (lucro > 0) {
        celulaLucro.className = 'lucro-positivo';
        celulaPercentagem.className = 'lucro-positivo';
    } else if (lucro < 0) {
        celulaLucro.className = 'lucro-negativo';
        celulaPercentagem.className = 'lucro-negativo';
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
                    Ações com Lucro: 
                    <strong>${acoesComLucro}/${acoesValidas}</strong>
                </p>
                <p>
                    <i class="fas fa-wallet"></i>
                    Valor Total: 
                    <strong>${totalAtualFormatado}</strong>
                </p>
                <p>
                    <i class="fas fa-chart-line"></i>
                    Resultado: 
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
    celulaVazia.innerHTML = '<i class="fas fa-info-circle"></i> Nenhum cálculo realizado ainda';
}

// Função para formatar valores monetários
function formatarMoeda(valor, comSinal = false) {
    const sinal = comSinal ? (valor > 0 ? '+' : '') : '';
    const valorAbsoluto = Math.abs(valor);
    return sinal + '€ ' + valorAbsoluto.toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);