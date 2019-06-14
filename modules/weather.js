function getForecasts(latitude, longitude, client, superagent) {

    const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`
    
    return superagent
        .get(URL)
        .then(response => response.body.daily.data)
        .then(days => days.map(day => new Weather(day)))
}

function Weather(dayData) {
    this.forecast = dayData.summary;
    this.time = new Date(dayData.time * 1000).toString().slice(0, 15);
}

module.exports = getForecasts;