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
                'Form-Api-Key': 'some_key'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        return null;
    }
}

// Функція для конвертації даних в потрібний формат
function convertData(apiData) {
    const convertedData = {
        data: apiData.data.map(item => ({
            id: item.id,
            statusId: item.status_id,
            fName: item.f_name,
            lName: item.l_name,
            comment: item.comment,
            shippingMethod: item.shipping_method,
            trackingNumber: item.tracking_number,
            boxData: item.box_data,
            products: item.products.map(product => ({
                productId: product.product_id,
                amount: product.amount,
                text: product.text,
                barcode: product.barcode,
                restCount: product.rest_count,
                sku: product.sku,
                added: product.added
            })),
            shippingData: item.shipping_data.map(shipping => ({
                text: shipping.text,
                value: shipping.value
            }))
        })),
        meta: {
            fieldsMeta: {
                shippingMethod: apiData.meta.fields_meta.shipping_method,
                products: {
                    options: apiData.meta.fields_meta.products.options.map(option => ({
                        parameter: option.parameter,
                        restCount: option.rest_count,
                        barcode: option.barcode,
                        sku: option.sku,
                        text: option.text,
                        value: option.value,
                        options: option.options.map(subOption => ({
                            barcode: subOption.barcode,
                            text: subOption.text,
                            parameter: subOption.parameter,
                            restCount: subOption.rest_count,
                            sku: subOption.sku,
                            value: subOption.value
                        })),
                        complect: option.complect.map(complectItem => ({
                            complectId: complectItem.complect_id,
                            count: complectItem.count,
                            formId: complectItem.form_id,
                            id: complectItem.id,
                            productId: complectItem.product_id
                        }))
                    }))
                },
                statusDatum: apiData.meta.fields_meta.status_datum,
                userResponsible: apiData.meta.fields_meta.user_responsible
            }
        }
    };
    return convertedData;
}

// Змінна для зберігання останніх отриманих даних
let lastFetchedData = null;

// Планування завдання на кожну хвилину
cron.schedule('* * * * *', async () => {
    console.log('Fetching data from API...');
    const apiData = await fetchDataFromAPI();
    if (apiData) {
        lastFetchedData = convertData(apiData);
        console.log('Data fetched and converted successfully.');
    }
});

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