require('dotenv').config();

const runWorker = require('./intellinews-worker/worker') ;



async function main(){

await runWorker() ;

}



main() ;