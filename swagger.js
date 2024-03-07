//Start swagger with autogen
const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info : {
        titel: 'Mon API',
        description : 'Mon API',
        },
    host : 'localhost:3000',
    basePath : '/',
    schemes : ['http']
}

//Path to generate swagger definitions
const outputFile = "./swagger_outuput.json";
//Path to scan and search for the routes
const endPointFile = ['./app.js'];

swaggerAutogen(outputFile, endPointFile, doc);