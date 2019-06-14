function getForecasts(query, client, superagent) {
    // gets the results of the weather from our DB
    console.log("the forecast query object ", query);
    return checkStoredWeather(query, client).then(weathers => {
      console.log(" the results from the query ", weathers);
      //if weathers is found, return the weathers
      if (weathers.length > 0) {
        return weathers;
      }
      //if weathers is not found, get Location from API
      else {
        return getWeatherFromAPI(query, client, superagent);
      }
    });
  
  }
  
  function checkStoredWeather(query, client) {
  // let keepAlive = query.keep_alive_seconds * 1000;
  // let created = rows.create_at;
  // let now = new Date();
  // if data exists and is not stale return the data
  // if data is invalid or if there is no data go to the API
  // remove from data base and return null


    let id = query.id ? parseInt(query.id) : 0;
    const SQL = `SELECT * FROM weathers WHERE location_id=${id}`;
    return client.query(SQL).then(results => {
        if(results.rows.length > 0){
            let now = new Date().valueOf();
            // let created_at = results.rows[0].created_at;
            let created_at = now - 604800001;
            let keepAlive = 604800000;

            // if( abs(createdAt - now) > keepAlive){
            //     return [];
            // }
            // return results.rows;
            return abs(createdAt - now) < keepAlive ? results.rows : [];            
        }
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
    // console.log("caching weather data ", weather, locationId);
    let createdAt = new Date().valueOf();
    //TODO: generate a time stamp, insert that into the table
    const SQL = `INSERT INTO weathers (forecast, time, created_at, location_id) VALUES ('${
      weather.forecast
    }', '${weather.time}', ${createdAt}, ${locationId});`;
    return client.query(SQL).then(results => weather);
  }
  
  function Weather(dayData) {
    this.forecast = dayData.summary;
    this.time = new Date(dayData.time * 1000).toString().slice(0, 15);
  }
  
  module.exports = getForecasts;
  