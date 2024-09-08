document.getElementById('getWeather').addEventListener('click', function() {
    const city = document.getElementById('city').value;
    const apiKey = '32b8f612b2d87784f9a2f2a21aa0fe43'; // Substitua com sua chave de API
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const weather = `
                    <h2>${data.name}</h2>
                    <p>Temperatura: ${data.main.temp}°C</p>
                    <p>Clima: ${data.weather[0].description}</p>
                    <p>Umidade: ${data.main.humidity}%</p>
                    <p>Vento: ${data.wind.speed} m/s</p>
                `;
                document.getElementById('weatherResult').innerHTML = weather;
            } else {
                document.getElementById('weatherResult').innerHTML = `<p>Cidade não encontrada.</p>`;
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            document.getElementById('weatherResult').innerHTML = `<p>Erro ao buscar dados.</p>`;
        });
});