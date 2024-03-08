const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const uniqid = require('uniqid')

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

//JSON cors
app.use(express.json());
app.use(cors());

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

app.post('/movie/create', async (req, res) => {
    
    /* 
            #swagger.description = 'Create un film avec ID' 
    */

   let movie = new Movie();
   movie.id = Math.round(Math.random()*10000)
   movie.title = req.body.title
   movie.year = req.body.year
   movie.synopsis = req.body.synopsis
   movie.duration = req.body.duration
   await movie.save();
   res.json('OK');
    
})
            


app.post('/movie/edit/:id?', async (req, response) => {
    
    /* 
            #swagger.description = 'Update/create un film avec ID' 
    */
   /*
            const movie = new Movie();
            if (req.params.id) {
                movie.id = Math.random()
            } else {
                const idRequest = parseInt(req.params.id);
                movie = await Movie.findOne({ id : idRequest});
            }
            */
            const idRequest = parseInt(req.params.id);
            movie = await Movie.findOne({ id : idRequest});
            movie.title = req.body.title;
            movie.year = req.body.year;
            movie.synopsis = req.body.synopsis;
            movie.duration = req.body.duration; 
            await movie.save();
            response.json('OK');                  
})

app.delete('/movie/delete/:id', async (req,res) => { 
 
    /* 
            #swagger.description = 'Delete un film avec ID' 
    */
    await Movie.findOneAndDelete({id: req.params.id});
    res.json("OK");
    }); 
    

//Start the server
app.listen(3000, () => {
    console.log("Server launched");}
    );