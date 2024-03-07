const express = require('express')
const mongoose = require('mongoose')

//Creating a model with .model(the name of the model, the class, the name of the collection (table))
const Movie = mongoose.model('Movie',
                                        {
                                        id: Number,
                                        title: String, 
                                        synopsis: String, 
                                        duration: Number,
                                        year: Number
                                        }, "movies");

//Url mongo + name of db
const urlMongo = "mongodb://127.0.0.1:27017/movie_app"

//Connection to the db
mongoose.connect(urlMongo);
mongoose.connection.once('open', () => {
    console.log("Success");
})

mongoose.connection.on('error', () => {
    console.log("Error DB connexion");
})

// ================================================== APPLICATION ============================================================ //
//Start the application
const app = express();

//Swagger middleware
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger_outuput.json');

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));


//Routing
app.get('/movies', async (request, response) => {

    /* 
            #swagger.description = 'Récupérer les films'
    */

    const movies = await Movie.find();
    //Response = json of persons
    response.json(movies);

})

app.get('/movie/:id', async (request, response) => {

    /* 
            #swagger.description = 'Récupérer un film avec ID'
    */

    const idRequest = parseInt(request.params.id);
    const movie = await Movie.findOne({ id : idRequest});
    //Response = json of persons
    response.json(movie);

})

//Start the server
app.listen(3000, () => {
    console.log("Server launched");}
    );