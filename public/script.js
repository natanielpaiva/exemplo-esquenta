const socket = io();

document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('login', { username });
        document.getElementById('login').style.display = 'none';
        document.getElementById('status').textContent = 'Aguardando oponente...';
    }
});

socket.on('waiting', (data) => {
    document.getElementById('status').textContent = data.message;
});

socket.on('startGame', (data) => {
    document.getElementById('status').textContent = '';
    document.getElementById('game').style.display = 'block';
    document.getElementById('opponent').textContent = `Oponente: ${data.opponent}`;
    document.getElementById('playAgain').style.display = 'none'; // Esconde o botão de jogar novamente
});

document.querySelectorAll('.choice').forEach(button => {
    button.addEventListener('click', () => {
        const choice = button.getAttribute('data-choice');
        socket.emit('playerChoice', { choice });
    });
});

socket.on('result', (message) => {
    document.getElementById('result').textContent = message;
    document.getElementById('playAgain').style.display = 'block'; // Mostra o botão de jogar novamente
});

socket.on('restartGame', () => {
    document.getElementById('result').textContent = '';
    document.getElementById('playAgain').style.display = 'none';
});

document.getElementById('playAgain').addEventListener('click', () => {
    socket.emit('playAgain');
    document.getElementById('status').textContent = 'Aguardando novo oponente...'; // Atualiza o status
});

socket.on('opponentDisconnected', (data) => {
    document.getElementById('result').textContent = data.message;
    document.getElementById('game').style.display = 'none';
    document.getElementById('status').textContent = 'Aguardando novo oponente...';
});

// Atualiza o placar
socket.on('updateScoreboard', (scoreboard) => {
    const scoreboardBody = document.getElementById('scoreboardBody');
    scoreboardBody.innerHTML = ''; // Limpa o placar
    scoreboard.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${player.username}</td><td>${player.score}</td>`;
        scoreboardBody.appendChild(row);
    });
    document.getElementById('scoreboard').style.display = 'block';
});