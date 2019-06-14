// function getForecasts(latitude, longitude, client, superagent) {

//     const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`

//     return superagent
//         .get(URL)
//         .then(response => response.body.daily.data)
//         .then(days => days.map(day => new Weather(day)))
// }

function getForecasts(query, client, superagent) {
  // gets the results of the weather from our DB
  console.log("the forecast query object ", query);
  return checkStoredWeather(query, client).then(weathers => {
    console.log(" the results from the query ", weathers);
    //if weathers is found, return the weathers
    if (weathers.length > 0) {
        console.log('from cache ', weathers)
      return weathers;
    }
    //if weathers is not found, get Location from API
    else {
      return getWeatherFromAPI(query, client, superagent);
    }
  });

  // this will get moved into it's own function
  const URL = `https://api.darksky.net/forecast/${
    process.env.WEATHER_API_KEY
  }/${latitude},${longitude}`;
  return superagent
    .get(URL)
    .then(response => response.body.daily.data)
    .then(days => days.map(day => new Weather(day)));
}

function checkStoredWeather(query, client) {
  let id = query.id ? parseInt(query.id) : 0;
  //   if (query.id) {
  //     let id = parseInt(query.id);
  //   } else {
  //     let id = 0;
  //   }

  const SQL = `SELECT * FROM weathers WHERE location_id=${id}`;
  return client.query(SQL).then(results => {
    return results.rows;
  });

}

function getWeatherFromAPI(query, client, superagent) {
  console.log("query from weather api function ", query);
  const URL = `https://api.darksky.net/forecast/${
    process.env.WEATHER_API_KEY
  }/${query.latitude},${query.longitude}`;
  return superagent
    .get(URL)
    .then(response => response.body.daily.data)
    .then(days => {
      return days.map(day => {
        // http://localhost:3000/weather?data%5Bsearch_query%5D=paris&data%5Bformatted_query%5D=Paris%2C%20France&data%5Blatitude%5D=48.856614&data%5Blongitude%5D=2.3522219
        // hit this url directly and pass additional query value like life_span to show time to keep alive
        // console.log("went back the the API");
        let weather = new Weather(day);
        cacheWeather(weather, client, query.id);
        return weather;
      });
    });
}

// once we do the cache invalidation, we need to drop the table to add the column
// mimic the error
// how would we even check that this is going to the API if we invalidate the code
function cacheWeather(weather, client, locationId) {
  console.log("caching weather data ", weather, locationId);
  //TODO: generate a time stamp, insert that into the table
  const SQL = `INSERT INTO weathers (forecast, time, location_id) VALUES ('${
    weather.forecast
  }', '${weather.time}', ${locationId});`;
  return client.query(SQL).then(results => weather);
}

function Weather(dayData) {
  this.forecast = dayData.summary;
  this.time = new Date(dayData.time * 1000).toString().slice(0, 15);
}

module.exports = getForecasts;
