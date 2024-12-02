const Article = require("../../models/Article");


const getDataByAttributAndDate  = async (date,attribut) => {
    try {
        console.time('Execution Time');
        const queryDate = new Date(date);
        if (isNaN(queryDate)) {
            throw new Error('Invalid date');
            return;
        }

        const dbData = await Article.aggregate([
            { $match: { date: queryDate } },
            {
                $group: {
                    _id: `$${attribut}`,
                    count: { $sum: 1 },

                }
            }
        ]);

        const sentimentCountsArray = dbData.map(item => ({
            source: item._id,
            count: item.count,

         }));

        const totalCount = dbData.reduce((acc, item) => acc + item.count, 0);

        console.timeEnd('Execution Time');
        return { data: sentimentCountsArray, totalCount };
    } catch (err) {
        console.error(err);
        throw err;
    }
};
const getArticlesByDate = async (date) => {
    try {
        const queryDate = new Date(date);
        if (isNaN(queryDate)) {
            throw new Error('Invalid date');
            return;
        }

        const articles = await Article.find({ date: queryDate });
        if (!articles || articles.length === 0) {
            return "No Articles Found";
        }
        return articles;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
const getKeywordsPerDate = async (date) => {
    try {
        console.time('Execution Time');
        const queryDate = new Date(date);
        if (isNaN(queryDate)) {
            throw new Error('Invalid date');
        }

        const keywordsData = await Article.aggregate([
            { $match: { date: queryDate } },
            { $unwind: "$keywords" },  
            {
                $group: {
                    _id: null,  
                    keywords: { $addToSet: "$keywords" }  
                }
            },
            {
                $project: {
                    _id: 0,  
                    keywords: 1  
                }
            }
        ]);

        console.timeEnd('Execution Time');
        return keywordsData.length > 0 ? keywordsData[0].keywords : []; 
    } catch (err) {
        console.error(err);
        throw err;
    }
}



module.exports = {getDataByAttributAndDate,getKeywordsPerDate,getArticlesByDate} ;