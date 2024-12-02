const sourcesData = require('./sourcesData.json');



function biasAnalyzer(source) {
    const sourceObject = sourcesData.find(item => item[source]);
    
    if (sourceObject) {
        const { bias } = sourceObject[source];
        return bias;
    } else {
        return 'Source not found';
    }
}

module.exports = biasAnalyzer ;
