// Dados das ações atualizados com nomes corretos
const acoes = [
    { id: 'sp', nome: 'S&P 500', investido: 7957.36, precoCompra: 57.662, icon: 'fa-chart-bar' },
    { id: 'ouro', nome: 'Ouro', investido: 7982.18, precoCompra: 234.77, icon: 'fa-gem' },
    { id: 'janus', nome: 'Janus', investido: 7999.99, precoCompra: 26.1, icon: 'fa-university' },
    { id: 'jpmorgan', nome: 'JP Morgan', investido: 8000.00, precoCompra: 482.8, icon: 'fa-landmark' },
    { id: 'imga', nome: 'IMGA', investido: 8000.00, precoCompra: 12.4971, icon: 'fa-industry' }
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
    
    // Mostrar resultado consolidado
    mostrarResultadoConsolidado(totalInvestido, totalAtual, lucroTotal, percentagemTotal, acoesValidas);
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
    celulaAcao.innerHTML = `<i class="fas ${iconClass}"></i> ${nome}`;
    
    const celulaValorAtual = novaLinha.insertCell(1);
    celulaValorAtual.textContent = valorAtualFormatado;
    
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

// Função para mostrar resultado consolidado
function mostrarResultadoConsolidado(totalInvestido, totalAtual, lucroTotal, percentagemTotal, acoesValidas) {
    // Determinar cor, emoji e situação baseado no resultado
    let cor, emoji, situacao;
    
    if (lucroTotal > 0) {
        cor = 'resultado-positivo';
        emoji = '📈';
        situacao = 'LUCRO';
    } else if (lucroTotal < 0) {
        cor = 'resultado-negativo';
        emoji = '📉';
        situacao = 'PREJUÍZO';
    } else {
        cor = 'resultado-estavel';
        emoji = '➡️';
        situacao = 'ESTÁVEL';
    }
    
    // Formatar valores monetários
    const totalAtualFormatado = formatarMoeda(totalAtual);
    const lucroTotalFormatado = formatarMoeda(lucroTotal, true);
    const percentagemTotalFormatada = percentagemTotal.toFixed(3) + '%';
    
    // Criar conteúdo HTML
    const resultadoHTML = `
        <div class="resultado-info ${cor}">
            <div class="resultado-emoji">${emoji}</div>
            <div class="resultado-titulo">${situacao} (${acoesValidas}/5 ações)</div>
            <div class="resultado-detalhes">
                <p><i class="fas fa-wallet"></i> Valor Total: <strong>${totalAtualFormatado}</strong></p>
                <p><i class="fas fa-chart-line"></i> Resultado: <strong>${lucroTotalFormatado}</strong> (${percentagemTotalFormatada})</p>
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