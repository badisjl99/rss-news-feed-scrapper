const mongoose = require('mongoose') ;

const Article = require('../models/Article');
const Topic = require('../models/Topic');
const TwitterTrends = require('../models/TwitterTrends');
const Podcast = require('../models/Podcast');
const Bias = require('../models/Bias');


const getTopics = require('./scrap-components/getTrendingTopics') ;
const getRTNews = require('./scrap-components/getRussiaTodayNews');
const getTwitterTrends = require('./scrap-components/getTwitterTrendingTopics');
const getYahooNews = require('./scrap-components/getYahooNews');
const getRSSAudio = require('./scrap-components/getAudioNews') ;
const getWashingtonPostNews = require('./scrap-components/getWashingtonPostNews') ;
const getFrance24News = require('./scrap-components/getFrance24News');
const getMosaiqueNews = require('./scrap-components/getMosaiqueNews');
const getMediaBiasDistribution = require('./scrap-components/getMediaBiasDistribution' );
const getPalestineChronicleNews= require('./scrap-components/getPalestineChronicleNews');
const getSCMPNews = require('./scrap-components/getSCMPNews') ;
const getChinaDailyNews = require('./scrap-components/getChinaDailyNews');

const {insertData,connectToDB,cleanDuplicates} = require('./db_controller/db');


async function runWorker() {
    try {

        

        await connectToDB();
        console.log('Connecting to DB...');

        console.log('Inserting News Articles ...');
        console.time('insertNews'); 

        await insertData(getSCMPNews(), Article);
        await insertData(getRTNews(), Article);
        await insertData(getYahooNews(), Article);
        await insertData(getWashingtonPostNews(), Article);
        await insertData(getSCMPNews(), Article);
        await insertData(getFrance24News(), Article);
        await insertData(getMosaiqueNews(), Article);
        await insertData(getPalestineChronicleNews(), Article);
        await insertData(getChinaDailyNews(), Article);

        console.timeEnd('insertNews'); 
        console.log('News Articles inserted successfully.');
        

        await insertData(getRSSAudio(), Podcast);
        await insertData(getMediaBiasDistribution(), Bias);
        await insertData(getTwitterTrends(), TwitterTrends);
        await insertData(getTopics(), Topic);
  

       
        console.log('Cleaning Database From Duplicates...');
        await cleanDuplicates("articles") ;
        await cleanDuplicates("podcasts") ; 
        console.log('Database Cleaned successfully.');

       
        console.log('All tasks completed.');
        process.exit(); 

    } catch (err) {
        console.error('Error during execution:', err);
    }
}





module.exports = runWorker ;