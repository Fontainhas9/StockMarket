// Dados das ações (investimento inicial e preço de compra)
const acoes = [
    { id: 'sp', nome: 'S&P', investido: 7957.36, precoCompra: 57.662 },
    { id: 'ouro', nome: 'Ouro', investido: 7982.18, precoCompra: 234.77 },
    { id: 'janus', nome: 'Janus', investido: 7999.99, precoCompra: 26.1 },
    { id: 'jpmorgan', nome: 'JPMorgan', investido: 8000.00, precoCompra: 482.8 },
    { id: 'imga', nome: 'IMGA', investido: 8000.00, precoCompra: 12.4971 }
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
const tabelaResultados = document.getElementById('tabela-resultados').getElementsByTagName('tbody')[0];
const resultadoConsolidado = document.getElementById('resultado-consolidado');

// Configurar navegação por teclado
Object.values(inputsPrecos).forEach((input, index, arr) => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index < arr.length - 1) {
                arr[index + 1].focus();
            } else {
                calcularBtn.focus();
                calcularPortfolio();
            }
        }
        
        if (e.key === 'Escape') {
            limparCampos();
        }
    });
});

// Adicionar eventos aos botões
calcularBtn.addEventListener('click', calcularPortfolio);
limparBtn.addEventListener('click', limparCampos);

// Adicionar evento de teclado global
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        calcularPortfolio();
    }
    
    if (e.key === 'Escape') {
        limparCampos();
    }
});

// Focar no primeiro campo ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    inputsPrecos.sp.focus();
});

// Função para calcular o portfólio
function calcularPortfolio() {
    // Limpar resultados anteriores
    limparTabela();
    
    let resultados = [];
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
            resultados.push({
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
            adicionarNaTabela(acao.nome, valorAtual, lucro, percentagem);
        }
    });
    
    if (acoesValidas === 0) {
        mostrarErro("Nenhum preço atual inserido");
        return;
    }
    
    // Calcular totais consolidados
    const lucroTotal = totalAtual - totalInvestido;
    const percentagemTotal = totalInvestido > 0 ? (lucroTotal / totalInvestido) * 100 : 0;
    
    // Mostrar resultado consolidado
    mostrarResultadoConsolidado(totalInvestido, totalAtual, lucroTotal, percentagemTotal, acoesValidas);
}

// Função para adicionar linha na tabela
function adicionarNaTabela(nome, valorAtual, lucro, percentagem) {
    // Remover linha vazia se existir
    const emptyRow = tabelaResultados.querySelector('.empty-row');
    if (emptyRow) {
        emptyRow.remove();
    }
    
    // Criar nova linha
    const novaLinha = tabelaResultados.insertRow();
    
    // Formatar valores
    const valorAtualFormatado = formatarMoeda(valorAtual);
    const lucroFormatado = formatarMoeda(lucro, true);
    const percentagemFormatada = percentagem.toFixed(2) + '%';
    
    // Adicionar células
    const celulaAcao = novaLinha.insertCell(0);
    celulaAcao.textContent = nome;
    
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
                <p>Valor Total: ${totalAtualFormatado}</p>
                <p>Resultado: ${lucroTotalFormatado} (${percentagemTotalFormatada})</p>
            </div>
        </div>
    `;
    
    resultadoConsolidado.innerHTML = resultadoHTML;
}

// Função para mostrar erro
function mostrarErro(mensagem) {
    resultadoConsolidado.innerHTML = `
        <div class="resultado-info resultado-negativo">
            <div class="resultado-emoji">❌</div>
            <div class="resultado-titulo">${mensagem}</div>
            <div class="resultado-detalhes">
                <p>Por favor, insira pelo menos um preço atual válido.</p>
            </div>
        </div>
    `;
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
            <i class="fas fa-arrow-circle-right"></i>
            <p>Insira os preços atuais e clique em Calcular</p>
        </div>
    `;
    
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
    celulaVazia.textContent = 'Nenhum cálculo realizado ainda';
}

// Função para formatar valores monetários
function formatarMoeda(valor, comSinal = false) {
    const sinal = comSinal && valor > 0 ? '+' : '';
    return sinal + '€ ' + valor.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}