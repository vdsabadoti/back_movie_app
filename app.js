const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const uniqid = require('uniqid')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const helper = require('./helper')

const secretJwtKey = "key"
//Creating a model with .model(the name of the model, the class, the name of the collection (table))
const Movie = mongoose.model('Movie',
                                        {
                                        id: Number,
                                        title: String, 
                                        synopsis: String, 
                                        duration: Number,
                                        year: Number
                                        }, "movies");

const Person = mongoose.model('Person',
                                        {
                                        mail : String, 
                                        password : String,
                                        nickname : String,
                                        city : String,
                                        postalCode : String,
                                        phoneNumber : String 
                                        }, "persons");

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

//JSON cors
app.use(express.json());
app.use(cors());

//Swagger middleware
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger_outuput.json');

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//-------- FUNCTIONS ------//
async function hashPassword(plaintextPassword) {
    return await bcrypt.hash(plaintextPassword, 10);
}
 
async function comparePassword(plaintextPassword, hash) {
    console.log(plaintextPassword);
    console.log(hash);
    let result = await bcrypt.compare(plaintextPassword, hash);
    console.log(result);
    return result;
}
//------------------------------------------//

//Routing
app.get('/movies', async (request, response) => {

    /* 
            #swagger.description = 'Récupérer les films'
    */

    const movies = await Movie.find();
    //Response = json of persons
    //response.json(movies);
    response.json({code: "200", message: "Success", data: movies});

})

//Create a tokenVerification
function tokenVerification(request) {
    
    const token = request.headers['authorization'];
    console.log(token);
    var valid = false;

    //Pb n° 1 : no token
    if (!token){
        console.log("No token");
        valid = false;
    }

    //Pb n° 2 : invalid token
    jwt.verify(token, secretJwtKey, (err, decoded) => {
        if (err) {
            console.log("Token invalid");
            valid = false;
        }
        //FYI => decoded is the object, so we can add the user (mail) at the request
        //request.user = decoded;
        console.log("Token is valid");
        valid = true;
    })

    return valid;
}

//Create a middleware to verify token, reuse token verification, and reuse everywhere we need verification
function tokenVerificationMidleware(request, response, next){
    if (tokenVerification(request) == true) {
        next();
    } else {
        return response.status(401).json("Not authorized")
    }
}

//Token is needed and we verify it with a middleware
app.get('/v2/movies', tokenVerificationMidleware, async (request, response) => {

    /* 
            #swagger.description = 'Récupérer les films avec un token'
    */

    const movies = await Movie.find();
    //Response = json of persons
    //response.json(movies);
    response.json({code: "200", message: "Success", data: movies});

})

app.get('/v2/movie/:id', tokenVerificationMidleware, async (request, response) => {

    /* 
            #swagger.description = 'Récupérer un film avec ID'
    */

    const idRequest = parseInt(request.params.id);
    const movie = await Movie.findOne({ id : idRequest});
    //Response = json of persons
    //response.json(movie);
    response.json({code: "200", message: "Success", data: movie});

})

app.post('/v2/movie/create', tokenVerificationMidleware, async (req, response) => {
    
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
   response.json({code: "200", message: "Success", data: movie});
    
})
            


app.post('/v2/movie/edit/:id?', tokenVerificationMidleware, async (req, response) => {
    
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
            return response.json({code: "200", message: "Movie updated", data: movie});                
})

app.delete('/v2/movie/delete/:id', tokenVerificationMidleware, async (req,response) => { 
 
    /* 
            #swagger.description = 'Delete un film avec ID' 
    */
    await Movie.findOneAndDelete({id: req.params.id});
    return response.json({code: "200", message: "Movie deleted"});
    }); 

app.post('/login', async (req, response) =>{

    let user = await  Person.findOne({ mail : req.body.mail });
    
    if (user) {
        if (await comparePassword(req.body.password, user.password) == true) {
            const token = jwt.sign({mail : user.mail}, secretJwtKey, { expiresIn : '1h'}) 
            console.log('login is OK');
            return helper.buildResponse(response, "200", "Login success", token);
        } 
        return helper.buildResponse(response, "402", "Wrong credentials", {mail : req.body.mail});     
    }
    return helper.buildResponse(response, "401", "Wrong credentials", {mail : req.body.mail}); 
}
)

app.post('/signup', async (req, response) =>{

    let userDB = await Person.findOne({ mail : req.body.mail });
    if (!userDB){
        const user = new Person();
        user.mail = req.body.mail;
        user.password = await hashPassword(req.body.password);

        //verifier unicité du username avant de créer l'user
        await user.save();
        console.log("user is ok");
        return response.json({code: "200", message: "User created with success", data: user});
    }
    return response.json({code: "407", message: "This mail already exists", data: { mail : req.body.mail }});
}
)

app.get('/verify-token', async (request, response) => {

    if (tokenVerification(request) == true){
        console.log("token verification is TRUE");
        return helper.buildResponse(response, "200", "Connected", true)
    } else {
        return helper.buildResponse(response, "740", "Not connected", false)
    }
})
    

//Start the server
app.listen(3000, () => {
    console.log("Server launched");}
    );

