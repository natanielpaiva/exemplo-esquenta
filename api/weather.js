// api/weather.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { city } = req.query;
    const apiKey = process.env.API_KEY; // Variável de ambiente segura
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== 200) {
            res.status(data.cod).json({ error: data.message });
        } else {
            res.status(200).json(data);
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados da previsão do tempo' });
    }
};