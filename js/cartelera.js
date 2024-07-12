document.addEventListener('DOMContentLoaded', () => {
    function obtenerPeliculas() {
        fetch('https://cinexunidos-production.up.railway.app/theatres')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener los cines');
                }
                return response.json();
            })
            .then(theatres => {
                console.log('Cines:', theatres);

                const movies = theatres.flatMap(theatre =>
                    theatre.auditoriums.flatMap(auditorium =>
                        auditorium.showtimes.map(showtime => showtime.movie)
                    )
                );
                const uniqueMovies = [...new Map(movies.map(movie => [movie.id, movie])).values()];
                uniqueMovies.forEach(movie => {
                    const movieElement = crearCartelera(movie);
                    document.querySelector('.peliculas').appendChild(movieElement);
                });
            })
            .catch(error => {
                console.error('Error al obtener la información:', error);
            });
    }

    function crearCartelera(movie) {
        const movieContainer = document.createElement('figure');
        movieContainer.className = 'pelicula';

        const movieImage = document.createElement('img');
        movieImage.src = `https://cinexunidos-production.up.railway.app/${movie.poster}`;
        movieImage.alt = movie.name;

        const movieCaption = document.createElement('figcaption');
        movieCaption.className = 'descripcion';

        const movieTitle = document.createElement('h3');
        movieTitle.textContent = movie.name;

        movieCaption.appendChild(movieTitle);
        movieContainer.appendChild(movieImage);
        movieContainer.appendChild(movieCaption);

        movieContainer.addEventListener('click', () => {
            window.location.href = `asientos.html`;
        });

        return movieContainer;
    }

    obtenerPeliculas();
});

