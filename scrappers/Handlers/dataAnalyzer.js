const { connectToDB } = require('../db_controller/db');
const { getDataByAttributAndDate } = require('./articleHandler');

function getDateDaysAgo(days) {
    const today = new Date();
    today.setDate(today.getDate() - days);
    return today.toISOString().split('T')[0]; 
}

async function fetchDataForRange(startDate, endDate) {
    const allData = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const data = await getDataByAttributAndDate(dateStr, "label");
        allData.push({ date: dateStr, data });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return allData;
}

async function generalNewsSentimentPerPeriod(daysCount) {
    try {
        const endDate = new Date();
        const startDate = getDateDaysAgo(daysCount);
        const allData = await fetchDataForRange(startDate, endDate);

        const mergedResult = {
            data: [],
            totalCount: 0
        };

        const dataMap = new Map();

        for (const entry of allData) {
            const { data, totalCount } = entry.data;
            
            mergedResult.totalCount += totalCount;

            for (const item of data) {
                if (dataMap.has(item.source)) {
                    dataMap.set(item.source, dataMap.get(item.source) + item.count);
                } else {
                    dataMap.set(item.source, item.count);
                }
            }
        }

        mergedResult.data = Array.from(dataMap, ([source, count]) => ({ source, count }));

        console.log(mergedResult);

    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

async function main() {
    await connectToDB();
    await generalNewsSentimentPerPeriod(100); // adjust the number of days as needed
}

main();
