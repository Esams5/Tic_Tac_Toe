const EMPTY = '';
const PLAYER_X = 'X';
const PLAYER_O = 'O';

let board = Array(9).fill(EMPTY);
let currentPlayer = PLAYER_X;

function createNode(board, depth) {
    return {
        board,
        depth,
        children: [],
        move: null,
        value: evaluateBoard(board)  // Avalia a pontuação do tabuleiro no momento da criação do nó
    };
}

function getEmptyCells(board) {
    return board.map((cell, index) => cell === EMPTY ? index : -1).filter(index => index !== -1);
}

function makeMove(board, index, player) {
    const newBoard = [...board];
    newBoard[index] = player;
    return newBoard;
}

function isWinning(board, player) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]  // Diagonal
    ];
    return wins.some(pattern => pattern.every(index => board[index] === player));
}

function isFull(board) {
    return board.every(cell => cell !== EMPTY);
}

function evaluateBoard(board) {
    if (isWinning(board, PLAYER_X)) return 9;  // Valor para posição vencedora
    if (isWinning(board, PLAYER_O)) return -9; // Valor para posição perdedora
    return 0; // Valor neutro para posições que não são ganhadoras ou perdedoras
}

function expand(node) {
    if (isWinning(node.board, PLAYER_X) || isWinning(node.board, PLAYER_O) || isFull(node.board)) return;

    const emptyCells = getEmptyCells(node.board);
    const nextPlayer = (node.depth % 2 === 0) ? PLAYER_X : PLAYER_O;  // Alterna entre jogadores

    for (const cell of emptyCells) {
        const newBoard = makeMove(node.board, cell, nextPlayer);
        const childNode = createNode(newBoard, node.depth + 1);
        childNode.move = cell;
        node.children.push(childNode);
        expand(childNode);
    }
}

function buildTree(rootNode, maxDepth) {
    if (rootNode.depth >= maxDepth) return;
    expand(rootNode);
}

function printTree(rootNode) {
    const levels = [];
    const queue = [rootNode];

    while (queue.length > 0) {
        const levelSize = queue.length;
        const levelNodes = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            levelNodes.push(node);
            queue.push(...node.children);
        }
        
        levels.push(levelNodes);
    }
    
    const treeElement = document.createElement('div');
    treeElement.className = 'tree';
    
    levels.forEach((levelNodes, levelIndex) => {
        const levelElement = document.createElement('div');
        levelElement.className = 'level';
        
        levelNodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'node';
            
            const boardElement = document.createElement('div');
            boardElement.className = 'board';
            
            node.board.forEach((cell, index) => {
                const cellElement = document.createElement('div');
                cellElement.className = 'cell';
                cellElement.textContent = cell === EMPTY ? '' : cell;
                boardElement.appendChild(cellElement);
            });

            const turnMarker = document.createElement('span');
            turnMarker.className = 'turn-marker';
            turnMarker.textContent = (node.depth % 2 === 0) ? '+' : '-';  // Marca o turno
            
            const scoreElement = document.createElement('span');
            scoreElement.className = 'score';
            scoreElement.textContent = node.value;  // Exibe a pontuação
            
            nodeElement.appendChild(boardElement);
            nodeElement.appendChild(turnMarker);
            nodeElement.appendChild(scoreElement);
            levelElement.appendChild(nodeElement);
        });
        
        treeElement.appendChild(levelElement);
    });
    
    return treeElement;
}

function renderTree(rootNode, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.appendChild(printTree(rootNode));
}

function bestBranch(node) {
    if (node.children.length === 0) return node;

    let bestMove = null;
    let bestValue = -Infinity;

    for (const child of node.children) {
        const value = minimax(child, false);
        if (value > bestValue) {
            bestValue = value;
            bestMove = child;
        }
    }

    return bestMove;
}

function minimax(node, isMaximizing) {
    const score = evaluateBoard(node.board);
    if (score === 9) return score;  // Vencedor
    if (score === -9) return score; // Perdedor
    if (isFull(node.board)) return 0; // Empate

    if (isMaximizing) {
        let best = -Infinity;
        for (const child of node.children) {
            best = Math.max(best, minimax(child, !isMaximizing));
        }
        return best;
    } else {
        let best = Infinity;
        for (const child of node.children) {
            best = Math.min(best, minimax(child, !isMaximizing));
        }
        return best;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const boardDiv = document.getElementById('board');
    
    function resetBoard() {
        board = Array(9).fill(EMPTY);
        currentPlayer = PLAYER_X;
        Array.from(boardDiv.children).forEach(cell => cell.textContent = '');
        document.getElementById('tree-container').innerHTML = ''; // Limpa a árvore
    }
    
    for (let i = 0; i < 9; i++) {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.dataset.index = i;
        cellDiv.addEventListener('click', () => {
            if (board[i] === EMPTY) {
                board[i] = currentPlayer;
                cellDiv.textContent = currentPlayer;
                currentPlayer = (currentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
            }
        });
        boardDiv.appendChild(cellDiv);
    }

    document.getElementById('generate-tree').addEventListener('click', () => {
        const root = createNode(board, 0);
        buildTree(root, 2); // Controla a profundidade da árvore
        renderTree(root, 'tree-container');

        const bestMove = bestBranch(root);
        if (bestMove) {
            console.log('Melhor movimento:', bestMove.board);
        }
    });

    document.getElementById('reset-game').addEventListener('click', resetBoard);
});


