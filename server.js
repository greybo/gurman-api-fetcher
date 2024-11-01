const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to fetch data from the API
async function fetchDataFromAPI() {
    try {
        const response = await axios.get('https://vngurmann.salesdrive.me/api/order/list/?filter[statusId]=__NOTDELETED__', {
            headers: {
                'Form-Api-Key': process.env.ORDER_FETCH_LIST_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        return null;
    }
}

// Variable to store the last fetched data
let lastFetchedData = null;

// Scheduling a task for every minute
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

// Function to convert the data
function convertData(apiData) {
    // console.log(`convertData ${apiData.data}`);
    return `success ${apiData.data[0].id}`;
}

// Route to get the latest data
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