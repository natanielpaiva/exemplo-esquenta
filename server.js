// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servindo arquivos estáticos da pasta 'public'
app.use(express.static('public'));

let waitingPlayer = null;
let games = {};
let players = {};
let rematchQueue = []; // Fila de jogadores para rematch

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Jogador faz login com nome
    socket.on('login', (data) => {
        socket.username = data.username;
        players[socket.id] = { username: data.username, score: 0 };

        pairPlayers(socket); // Tenta emparelhar o jogador ao entrar

        // Atualiza todos os jogadores com o placar
        io.emit('updateScoreboard', getScoreboard());
    });

    // Recebe a escolha do jogador
    socket.on('playerChoice', (data) => {
        const game = Object.values(games).find(game => game.players.includes(socket));
        if (!game) return;

        game.choices[socket.id] = data.choice;

        // Verifica se ambos os jogadores escolheram
        if (Object.keys(game.choices).length === 2) {
            checkWinner(game);
        }
    });

    // Jogar novamente
    socket.on('playAgain', () => {
        rematchQueue.push(socket); // Adiciona o jogador à fila de rematch
        pairRandomPlayers(); // Tenta emparelhar jogadores aleatoriamente da fila
    });

    // Desconectar
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }

        // Remove o jogador da fila de rematch se estiver nela
        rematchQueue = rematchQueue.filter(player => player !== socket);

        const game = Object.values(games).find(game => game.players.includes(socket));
        if (game) {
            game.players.forEach(player => {
                if (player !== socket) {
                    player.emit('opponentDisconnected', { message: 'O oponente desconectou.' });
                }
            });
            delete games[Object.keys(games).find(key => games[key] === game)];
        }

        // Remove o jogador da lista de jogadores
        delete players[socket.id];

        // Atualiza o placar para todos os jogadores restantes
        io.emit('updateScoreboard', getScoreboard());
    });
});

function pairPlayers(socket) {
    if (waitingPlayer) {
        // Cria um jogo com dois jogadores
        const gameId = `${waitingPlayer.id}-${socket.id}`;
        games[gameId] = {
            players: [waitingPlayer, socket],
            choices: {}
        };

        waitingPlayer.emit('startGame', { opponent: socket.username });
        socket.emit('startGame', { opponent: waitingPlayer.username });

        waitingPlayer = null; // Reseta jogador em espera
    } else {
        waitingPlayer = socket;
        socket.emit('waiting', { message: 'Aguardando oponente...' });
    }
}

function pairRandomPlayers() {
    // Verifica se há pelo menos dois jogadores na fila de rematch
    while (rematchQueue.length >= 2) {
        const randomIndex1 = Math.floor(Math.random() * rematchQueue.length);
        const player1 = rematchQueue.splice(randomIndex1, 1)[0]; // Remove o jogador da fila

        const randomIndex2 = Math.floor(Math.random() * rematchQueue.length);
        const player2 = rematchQueue.splice(randomIndex2, 1)[0]; // Remove o jogador da fila

        // Cria um novo jogo com os dois jogadores
        const gameId = `${player1.id}-${player2.id}`;
        games[gameId] = {
            players: [player1, player2],
            choices: {}
        };

        player1.emit('startGame', { opponent: player2.username });
        player2.emit('startGame', { opponent: player1.username });
    }
}

function checkWinner(game) {
    const [player1, player2] = game.players;
    const choice1 = game.choices[player1.id];
    const choice2 = game.choices[player2.id];

    let result = '';

    if (choice1 === choice2) {
        result = 'Empate!';
    } else if (
        (choice1 === 'pedra' && choice2 === 'tesoura') ||
        (choice1 === 'tesoura' && choice2 === 'papel') ||
        (choice1 === 'papel' && choice2 === 'pedra')
    ) {
        result = `${player1.username} (${choice1}) venceu contra ${player2.username} (${choice2})!`;
        players[player1.id].score += 1; // Incrementa pontuação do jogador 1
    } else {
        result = `${player2.username} (${choice2}) venceu contra ${player1.username} (${choice1})!`;
        players[player2.id].score += 1; // Incrementa pontuação do jogador 2
    }

    // Envia resultado para ambos os jogadores
    game.players.forEach(player => player.emit('result', result));

    // Atualiza o placar para todos os jogadores
    io.emit('updateScoreboard', getScoreboard());
}

function getScoreboard() {
    // Retorna a lista de jogadores e suas pontuações
    return Object.values(players).map(player => ({
        username: player.username,
        score: player.score
    }));
}

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});