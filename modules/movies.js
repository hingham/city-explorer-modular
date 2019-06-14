module.exports = function getMovies(search_query, location_id, client, superagent) {
    
    const url = `https://api.themoviedb.org/3/search/movie/?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&query=${search_query}`;


    return superagent.get(url)
        .then(response => {
            const movieSummaries = response.body.results.map(movie => {
                const details = new Movie(movie);
                // details.save(request.query.data.id);
                return details;
            });
            return movieSummaries;
        });



}
function Movie(movie) {
    this.title = movie.title;
    this.overview = movie.overview;
    this.average_votes = movie.vote_average;
    this.total_votes = movie.vote_count;
    this.image_url = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
    this.popularity = movie.popularity;
    this.released_on = movie.release_date;
    this.created_at = Date.now();
}

Movie.prototype = function save(location_id) {
    const SQL = `INSERT INTO ${this.tableName} (title, overview, average_votes, total_votes, image_url, popularity, released_on, created_at, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
    const values = [this.title, this.overview, this.average_votes, this.total_votes, this.image_url, this.popularity, this.released_on, this.created_at, location_id];

    client.query(SQL, values);
}
