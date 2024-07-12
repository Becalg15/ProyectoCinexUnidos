const API_BASE_URL = 'https://cinexunidos-production.up.railway.app';
let selectedSeats = [];

document.getElementById('reserve-seats').addEventListener('click', function () {
    reservarAsientos();
});

document.getElementById('cancel-reservation').addEventListener('click', function () {
    cancelarReservacion();
});

document.addEventListener('DOMContentLoaded', () => {
    obtenerCines();
});

document.getElementById('theatres').addEventListener('change', function () {
    const theatreId = this.value;
    if (theatreId) {
        currentTheatreId = theatreId;
        obtenerSalas(theatreId);
    }
});

document.getElementById('auditoriums').addEventListener('change', function () {
    const auditoriumId = this.value;
    if (auditoriumId) {
        currentAuditoriumId = auditoriumId;
        const theatreId = document.getElementById('theatres').value;
        obtenerFunciones(theatreId, auditoriumId);
    }
});

document.getElementById('showtimes').addEventListener('change', function () {
    const showtimeId = this.value;
    if (showtimeId) {
        currentShowtimeId = showtimeId;
        const theatreId = document.getElementById('theatres').value;
        const auditoriumId = document.getElementById('auditoriums').value;
        obtenerDetallesFuncion(theatreId, auditoriumId, showtimeId);
        document.getElementById('reserve-seats').disabled = false;
        document.getElementById('cancel-reservation').disabled = false;
    }
});


function obtenerCines() {
    fetch(`${API_BASE_URL}/theatres`)
        .then(response => response.json())
        .then(data => {
            console.log('Cines obtenidos:', data);
            const theatresSelect = document.getElementById('theatres');
            data.forEach(theatre => {
                const option = document.createElement('option');
                option.value = theatre.id;
                option.textContent = theatre.name;
                theatresSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener cines:', error);
        });
}

function obtenerSalas(theatreId) {
    fetch(`${API_BASE_URL}/theatres/${theatreId}/auditoriums`)
        .then(response => response.json())
        .then(data => {
            console.log('Salas obtenidas:', data);
            const auditoriumsSelect = document.getElementById('auditoriums');
            auditoriumsSelect.innerHTML = '<option value="">Seleccione una sala</option>';
            data.forEach(auditorium => {
                const option = document.createElement('option');
                option.value = auditorium.id;
                option.textContent = auditorium.name;
                auditoriumsSelect.appendChild(option);
            });
            auditoriumsSelect.disabled = false;
        })
        .catch(error => {
            console.error('Error al obtener salas:', error);
        });
}

function obtenerFunciones(theatreId, auditoriumId) {
    fetch(`${API_BASE_URL}/theatres/${theatreId}/auditoriums/${auditoriumId}/showtimes`)
        .then(response => response.json())
        .then(data => {
            console.log('Funciones obtenidas:', data);
            if (!Array.isArray(data)) {
                console.error('Datos de funciones no son un array:', data);
                alert('Hubo un error al obtener las funciones. Por favor, intente de nuevo.');
                return;
            }
            const showtimesSelect = document.getElementById('showtimes');
            showtimesSelect.innerHTML = '<option value="">Seleccione una función</option>';
            if (data.length === 0) {
                showtimesSelect.innerHTML = '<option value="">No hay funciones disponibles</option>';
            } else {
                data.forEach(showtime => {
                    const option = document.createElement('option');
                    option.value = showtime.id;
                    option.textContent = `${showtime.movie.name} - ${showtime.startTime}`;
                    showtimesSelect.appendChild(option);
                });
            }
            showtimesSelect.disabled = false;
        })
        .catch(error => {
            console.error('Error al obtener funciones:', error);
            alert('Hubo un error al obtener las funciones. Por favor, intente de nuevo.');
        });
}
function obtenerDetallesFuncion(theatreId, auditoriumId, showtimeId) {
    fetch(`${API_BASE_URL}/theatres/${theatreId}/auditoriums/${auditoriumId}/showtimes/${showtimeId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Detalles de la función:', data);
            if (typeof data !== 'object' || data === null) {
                console.error('Datos de detalles de la función no son válidos:', data);
                alert('Hubo un error al obtener los detalles de la función. Por favor, intente de nuevo.');
                return;
            }
            const functionDetails = document.getElementById('function-detalles');
            functionDetails.innerHTML = `
                <h3>Detalles de la Función</h3>
                <div class="info-pelicula">
                    <div class="poster">
                        <img id="poster" src="https://cinexunidos-production.up.railway.app/${data.movie.poster}">
                    </div>
                    <div id="detalles">
                        <p><strong>Película:</strong> ${data.movie.name}</p>
                        <p><strong>Hora:</strong> ${data.startTime}</p>
                        <p><strong>Duración:</strong> ${data.movie.runningTime}</p>
                        <p><strong>Clasificación:</strong> ${data.movie.rating}</p>
                    </div>
                </div>
            `;
            if (data.seats) {
                armarSalas(data.seats);
            }
            document.getElementById('reserve-seats').disabled = false;
            document.getElementById('cancel-reservation').disabled = false;
            recibirActualizacionesDeReservacion(theatreId, auditoriumId, showtimeId);
        })
        .catch(error => {
            console.error('Error al obtener detalles de la función:', error);
            alert('Hubo un error al obtener los detalles de la función. Por favor, intente de nuevo.');
        });
}


function armarSalas(seats) {
    const seatRowsContainer = document.getElementById('seat-rows');
    seatRowsContainer.innerHTML = '';

    Object.keys(seats).forEach(rowKey => {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'seat-row';

        const rowLabel = document.createElement('span');
        rowLabel.className = 'seat-label';
        rowLabel.textContent = rowKey;
        rowContainer.appendChild(rowLabel);

        seats[rowKey].forEach((seatType, index) => {
            const seatElement = document.createElement('div');
            const seatId = `${rowKey}${index}`;

            switch (seatType) {
                case -1:
                    seatElement.className = 'seat espacio-vacio';
                    break;
                case 0:
                    seatElement.className = 'seat seat-libre';
                    seatElement.addEventListener('click', () => {
                        seleccionarAsientos(seatElement, seatId);
                    });
                    break;
                case 1:
                    seatElement.className = 'seat seat-ocupado';
                    break;
                case 2:
                    seatElement.className = 'seat seat-reservado';
                    break;
                default:
                    seatElement.className = 'seat';
                    break;
            }

            rowContainer.appendChild(seatElement);
        });

        seatRowsContainer.appendChild(rowContainer);
    });
}

function seleccionarAsientos(seatElement, seatId) {
    if (seatElement.classList.contains('seat-seleccionado')) {
        seatElement.classList.remove('seat-seleccionado');
        const index = selectedSeats.indexOf(seatId);
        if (index !== -1) {
            selectedSeats.splice(index, 1);
        }
    } else {
        seatElement.classList.add('seat-seleccionado');
        selectedSeats.push(seatId);
    }
}
function reservarAsientos() {
    const theatreId = document.getElementById('theatres').value;
    const auditoriumId = document.getElementById('auditoriums').value;
    const showtimeId = document.getElementById('showtimes').value;

    if (selectedSeats.length === 0) {
        alert('No hay asientos seleccionados para reservar.');
        return;
    }
    const requests = [];

    for (const seat of selectedSeats) {
        const requestData = { seat: seat };
        const jsonString = JSON.stringify(requestData);

        console.log(`Enviando solicitud para reservar el asiento: ${seat}`);
        console.log(`Datos de la solicitud: ${jsonString}`);

        const requestPromise = fetch(`${API_BASE_URL}/theatres/${theatreId}/auditoriums/${auditoriumId}/showtimes/${showtimeId}/reserve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: jsonString
        })
            .then(response => {
                console.log(`Respuesta del servidor para el asiento ${seat}:`, response);

                if (!response.ok) {
                    return response.json().then(errorData => {
                        console.error(`Error en la reservación de asientos: ${errorData.message}`);
                        alert(`Error en la reservación de asientos: ${errorData.message}`);
                        throw new Error(`Error en la reservación de asientos: ${errorData.message}`);
                    });
                }

                return response.json();
            })
            .then(data => {
                console.log(`Asiento reservado con éxito: ${seat}`, data);
            })
            .catch(error => {
                console.error(`Error al reservar el asiento ${seat}:`, error);
                alert(`Hubo un error al reservar el asiento ${seat}: ${error.message}`);
                throw error;
            });

        requests.push(requestPromise);
    }
    Promise.all(requests)
        .then(() => {
            alert('Asientos reservados con éxito.');
            obtenerDetallesFuncion(theatreId, auditoriumId, showtimeId);
        })
        .catch(error => {
            console.error('Error al completar las reservas:', error);
            alert('Hubo un error al completar las reservas.');
        });
}

function cancelarReservacion() {
    const theatreId = document.getElementById('theatres').value;
    const auditoriumId = document.getElementById('auditoriums').value;
    const showtimeId = document.getElementById('showtimes').value;

    if (selectedSeats.length === 0) {
        alert('No hay asientos seleccionados para cancelar la reservación.');
        return;
    }

    const requests = selectedSeats.map(seat => {
        console.log(`Enviando solicitud para cancelar la reservación del asiento: ${seat}`);

        const requestData = { seat: seat };
        const jsonString = JSON.stringify(requestData);

        return fetch(`${API_BASE_URL}/theatres/${theatreId}/auditoriums/${auditoriumId}/showtimes/${showtimeId}/reserve`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: jsonString
        }).then(response => {
            console.log(`Respuesta del servidor para la cancelación del asiento ${seat}:`, response);

            if (!response.ok) {
                return response.json().then(errorData => {
                    console.error(`Error al cancelar la reservación del asiento ${seat}: ${errorData.message}`);
                    throw new Error(`Error al cancelar la reservación del asiento ${seat}: ${errorData.message}`);
                });
            }

            console.log(`Reservación del asiento ${seat} cancelada con éxito.`);
        }).catch(error => {
            console.error(`Error al cancelar la reservación del asiento ${seat}:`, error);
            throw error;
        });
    });

    Promise.all(requests)
        .then(() => {
            alert('Reservación de asientos cancelada con éxito.');
            obtenerDetallesFuncion(theatreId, auditoriumId, showtimeId);
        })
        .catch(error => {
            console.error('Error al completar las cancelaciones:', error);
            alert('Hubo un error al completar las cancelaciones.');
        });
}


function recibirActualizacionesDeReservacion(theatreId, auditoriumId, showtimeId) {
    const eventSource = new EventSource(`${API_BASE_URL}/theatres/${theatreId}/auditoriums/${auditoriumId}/showtimes/${showtimeId}/reservation-updates`);
    eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        console.log('Actualización de reservación recibida:', data);
        armarSalas(data.seats);
    };
    eventSource.onerror = function (error) {
        console.error('Error en las actualizaciones de reservación:', error);
        eventSource.close();
    };
}
