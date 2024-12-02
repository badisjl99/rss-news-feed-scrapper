const sourcesData = require('./sourcesData.json');



function relatedCountryAnalyzer(source) {
    const sourceObject = sourcesData.find(item => item[source]);
    
    if (sourceObject) {
        const { country } = sourceObject[source];
        return country;
    } else {
        return 'Source not found';
    }
}

module.exports = relatedCountryAnalyzer ;
