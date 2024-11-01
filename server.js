const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Функція для виконання запиту до API
async function fetchDataFromAPI() {
    try {
        const response = await axios.get('https://vngurmann.salesdrive.me/api/order/list/?filter[statusId]=__NOTDELETED__', {
            headers: {
                'Form-Api-Key': 'fZBk3CpDdYDE_gfYNNHnR0t85mxymdcR1MslYx6Dmdv4ipDLLfDYpbC5ys_By4nZi5UNSqqTJ4Z5NXAwDgNjNvChnvd_EZZ7yDht'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        return null;
    }
}

// Змінна для зберігання останніх отриманих даних
let lastFetchedData = null;

// Планування завдання на кожну хвилину
cron.schedule('* * * * *', async () => {
    console.log('Fetching data from API...');
    const apiData = await fetchDataFromAPI();
    console.log('fetchDataFromAPI() successfully.');
    if (apiData) {
        console.log(`apiData =${apiData.data[0].id}`);
        lastFetchedData = convertData(apiData);
        console.log('Data fetched and converted successfully.');
    }
});

// Функція для конвертації даних в потрібний формат
function convertData(apiData) {
    // console.log(`convertData ${apiData.data}`);
    return `success ${apiData.data[0].id}`;
}

// Маршрут для отримання останніх даних
app.get('/api/data', (req, res) => {
    if (lastFetchedData) {
        res.json(lastFetchedData);
    } else {
        res.status(404).json({ message: 'No data available yet' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});