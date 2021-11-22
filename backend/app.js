//Importing frameworks and routes
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const userRoutes = require('./routes/users');
const sauceRoutes = require('./routes/sauce');
const path = require('path');
const app = express();

//CORS management
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT,DELETE, PATCH, OPTIONS');
    next();
});

//Connection to MongoDB
mongoose.connect('mongodb+srv://Sebastien:Ej2MoI2bjUxcjAMA@cluster0.s0wth.mongodb.net/Piiquante?retryWrites=true&w=majority',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée!')
);

// Increase security
app.use(helmet());

app.use(express.json());
//Specifies the path to signup or login
app.use('/api/auth', userRoutes);
//Specifies the path for actions on the sauces
app.use('/api/sauces', sauceRoutes);
//Get the url of the image
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;