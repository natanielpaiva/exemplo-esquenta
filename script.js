document.getElementById('getWeather').addEventListener('click', function() {
    const city = document.getElementById('city').value;
    const apiUrl = `/api/weather?city=${city}`; // Chama o backend na Vercel

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('weatherResult').innerHTML = `<p>${data.error}</p>`;
            } else {
                const weather = `
                    <h2>${data.name}</h2>
                    <p>Temperatura: ${data.main.temp}°C</p>
                    <p>Clima: ${data.weather[0].description}</p>
                    <p>Umidade: ${data.main.humidity}%</p>
                    <p>Vento: ${data.wind.speed} m/s</p>
                `;
                document.getElementById('weatherResult').innerHTML = weather;
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            document.getElementById('weatherResult').innerHTML = `<p>Erro ao buscar dados.</p>`;
        });
});