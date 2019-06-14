'use strict';

// enviroment variables
require('dotenv').config();

// Application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// database set up
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application set up
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// routes
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/events', handleEvents);
// app.get('/movies', handleMovies);

// internal modules
const getLocation = require('./modules/location-cache.js');
const getForecasts = require('./modules/weathers-cache.js');
const getEvents = require('./modules/events');
// const getMovies = require('./modules/movies');


// route handlers
function handleLocation(req, res) {

    getLocation(req.query.data, client, superagent)
        .then(location => res.send(location))
        .catch(error => handleError(error, res));
}

function handleWeather(req, res) {

    getForecasts(req.query.data, client, superagent)
        .then(forecasts => res.send(forecasts))
        .catch(error => handleError(error, res));
}

function handleEvents(req, res) {

    getEvents(req.query.data.formatted_query, client, superagent)
        .then(events => res.send(events))
        .catch(error => handleError(error, res));
}

function handleMovies(req, res) {

    getMovies(req.query.data.search_query, req.query.data.id, client, superagent)
        .then(movies => res.send(movies))
        .catch(error => handleError(error, res));
}

function handleError(error, response) {
    console.error(error);
    response.status(500).send('ERROR');
}

app.listen(PORT, () => console.log(`App is listening on ${PORT}`));