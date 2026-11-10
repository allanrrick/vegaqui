const API_BASE_URL = 'https://vegaqui.onrender.com';
const map = L.map('map').setView([-14.235, -51.925], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

let userMarker = null;
let restaurantMarkers = []
let userLatitude = null;
let userLongitude = null;
let selectingLocation = false;
let selectedLatitude = null;
let selectedLongitude = null;
let temporaryMarker = null;
let locationCursorMarker = null;
let allRestaurants = [];
let editingRestaurantId = null;
let currentSearchLatitude = null;
let currentSearchLongitude = null;

function getUserLocation() {

    if (!navigator.geolocation) {
        console.error('Geolocation is not supported.');
        return;
    }

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            userLatitude = latitude;
            userLongitude = longitude;
            currentSearchLatitude = latitude;
            currentSearchLongitude = longitude;

            map.flyTo([latitude, longitude], 15);
            loadRestaurants(latitude, longitude);

            // if (userMarker) {
            //     map.removeLayer(userMarker);
            // }

            // userMarker = L.marker([latitude, longitude])
            //     .addTo(map)

        },

        (error) => {

            console.error('Geolocation error:', error.code, error.message);

            switch (error.code) {
                case 1:
                    console.error('Permission denied.');
                    break;
                case 2:
                    console.error('Position unavailable.');
                    break;
                case 3:
                    console.error('Request timed out.');
                    break;
            }

        },

        {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000
        }
    );
}

getUserLocation();

function displayRestaurants(restaurants) {
    restaurantMarkers.forEach(marker => map.removeLayer(marker));
    restaurantMarkers = [];

    restaurants.forEach(restaurant => {
        const marker = L.marker([
            restaurant.latitude,
            restaurant.longitude
        ]).addTo(map);

        const categoryText = restaurant.type === 'vegan'
            ? 'Serve opções veganas'
            : restaurant.type === 'vegetarian'
                ? 'Serve opções vegetarianas'
                : 'Categoria não informada';

        marker.bindPopup(`
            <div>
                <strong>${restaurant.name}</strong>

                <p>${restaurant.description || 'Sem descrição cadastrada.'}</p>

                <p>${restaurant.address}</p>

                <p>${categoryText}</p>

                <div class="popup-actions">
                    <button
                        onclick="editRestaurant(${restaurant.id})"
                        class="edit-button">
                        Editar
                    </button>

                    <button
                        onclick="deleteRestaurant(${restaurant.id})"
                        class="delete-button">
                        Excluir
                    </button>
                </div>
            </div>
        `);

        restaurantMarkers.push(marker);
    });
}

async function loadRestaurants(latitude, longitude, distanceKm = 5) {
    try {
        const distance = distanceKm * 1000;

        const response = await fetch(
            `${API_BASE_URL}/restaurants/nearby?latitude=${latitude}&longitude=${longitude}&distance=${distance}`
        );

        if (!response.ok) {
            throw new Error(`error: ${response.status}`);
        }

        const restaurants = await response.json();
        console.log(restaurants);
        console.log(restaurants[0]);
        allRestaurants = restaurants;

        displayRestaurants(allRestaurants);

    } catch (error) {
        console.error('Error:', error);
    }
}

const distanceInput = document.getElementById('distanceInput');

distanceInput.addEventListener('change', () => {
    let distanceKm = Number(distanceInput.value);

    if (!Number.isFinite(distanceKm) || distanceKm < 1) {
        distanceKm = 1;
        distanceInput.value = 1;
    }

    loadRestaurants(
        currentSearchLatitude,
        currentSearchLongitude,
        distanceKm
    );
});

const addRestaurantButton = document.getElementById('addRestaurantButton');
const restaurantModal = document.getElementById('restaurantModal');
const closeModalButton = document.getElementById('closeModalButton');

addRestaurantButton.addEventListener('click', () => {
    selectingLocation = true;

    const mapElement = document.getElementById('map');

    mapElement.classList.add('selecting-location');

    if (!locationCursorMarker) {
        locationCursorMarker = L.marker(map.getCenter(), {
            icon: createLocationIcon(),
            interactive: false
        }).addTo(map);
    }

    locationCursorMarker.setLatLng(map.getCenter());
});

closeModalButton.addEventListener('click', () => {
    closeRestaurantModal();
});

restaurantModal.addEventListener('click', (event) => {
    if (event.target === restaurantModal) {
        closeRestaurantModal();
    }
});

map.on('click', (event) => {

    if (!selectingLocation) {
        return;
    }

    selectedLatitude = event.latlng.lat;
    selectedLongitude = event.latlng.lng;

    selectingLocation = false;

    document.getElementById('map')
        .classList.remove('selecting-location');

    if (locationCursorMarker) {
        map.removeLayer(locationCursorMarker);
        locationCursorMarker = null;
    }

    temporaryMarker = L.marker([
        selectedLatitude,
        selectedLongitude
    ], {
        icon: createLocationIcon()
    }).addTo(map);

    restaurantModal.style.display = 'flex';

    console.log('Latitude:', selectedLatitude);
    console.log('Longitude:', selectedLongitude);
});

function createLocationIcon() {
    return L.divIcon({
        className: 'location-cursor',
        html: `
            <svg viewBox="0 0 24 24" fill="#619b3d"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 22s8-7.5 8-13A8 8 0 0 0 4 9c0 5.5 8 13 8 13Z"
                    stroke="white"
                    stroke-width="1.5"
                />
                <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });
}

map.on('mousemove', (event) => {
    if (!selectingLocation) {
        return;
    }

    locationCursorMarker.setLatLng(event.latlng);
});

const restaurantForm = document.getElementById('restaurantForm');

restaurantForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('restaurantName').value.trim();
    const type = document.getElementById('restaurantType').value;
    const address = document.getElementById('restaurantAddress').value.trim();
    const description = document.getElementById('restaurantDescription').value.trim();

    if (!type) {
        alert('Selecione o tipo do restaurante.');
        return;
    }

    if (address.length < 5) {
        alert('Informe um endereço válido.');
        return;
    }

    const restaurant = {
        name,
        type,
        address,
        description,
        latitude: selectedLatitude,
        longitude: selectedLongitude
    };

    const isEditing = editingRestaurantId !== null;

    const url = isEditing
        ? `${API_BASE_URL}/restaurants/${editingRestaurantId}`
        : `${API_BASE_URL}/restaurants`;

    try {
        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(restaurant)
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar restaurante.');
        }

        const savedRestaurant = await response.json();

        console.log(savedRestaurant);

        editingRestaurantId = null;

        closeRestaurantModal();

        await loadRestaurants(
            userLatitude,
            userLongitude,
            Number(distanceInput.value) || 5
        );

        alert(
            isEditing
                ? 'Restaurante atualizado com sucesso!'
                : 'Restaurante cadastrado com sucesso!'
        );

    } catch (error) {
        console.error(error);
        alert('Não foi possível salvar o restaurante.');
    }
});

function closeRestaurantModal() {
    restaurantModal.style.display = 'none';

    restaurantForm.reset();

    selectedLatitude = null;
    selectedLongitude = null;

    if (temporaryMarker) {
        map.removeLayer(temporaryMarker);
        temporaryMarker = null;
    }

    if (locationCursorMarker) {
        map.removeLayer(locationCursorMarker);
        locationCursorMarker = null;
    }

    selectingLocation = false;

    document.getElementById('map')
        .classList.remove('selecting-location');
}

const searchInput = document.getElementById('searchInput');
let currentSearchIndex = -1;

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const filteredRestaurants = allRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm)
    );

    currentSearchIndex = -1;

    displayRestaurants(filteredRestaurants);
});

searchInput.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) return;

    const filteredRestaurants = allRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm)
    );

    if (filteredRestaurants.length > 0) {

        currentSearchIndex++;

        if (currentSearchIndex >= filteredRestaurants.length) {
            currentSearchIndex = 0;
        }

        const restaurant = filteredRestaurants[currentSearchIndex];

        map.flyTo([
            restaurant.latitude,
            restaurant.longitude
        ], 17);

        const marker = restaurantMarkers.find(marker => {
            const position = marker.getLatLng();

            return (
                position.lat === Number(restaurant.latitude) &&
                position.lng === Number(restaurant.longitude)
            );
        });

        if (marker) marker.openPopup();

        return;
    }

    currentSearchIndex = -1;

    await searchLocation(searchTerm);
});

function editRestaurant(id) {

    const restaurant = allRestaurants.find(
        restaurant => Number(restaurant.id) === Number(id)
    );

    if (!restaurant) {
        alert('Restaurante não encontrado.');
        return;
    }

    editingRestaurantId = restaurant.id;

    document.getElementById('restaurantName').value = restaurant.name;
    document.getElementById('restaurantType').value = restaurant.type;
    document.getElementById('restaurantAddress').value = restaurant.address;
    document.getElementById('restaurantDescription').value =
        restaurant.description || '';

    selectedLatitude = Number(restaurant.latitude);
    selectedLongitude = Number(restaurant.longitude);

    restaurantModal.style.display = 'flex';
}

async function deleteRestaurant(id) {
    const confirmation = confirm(
        'Confirmar exclusão'
    );

    if (!confirmation) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/restaurants/${id}`,
            {
                method: 'DELETE'
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.erro || 'Erro ao excluir restaurante.');
        }

        alert('Restaurante excluído com sucesso!');

        await loadRestaurants(
            currentSearchLatitude,
            currentSearchLongitude,
            Number(distanceInput.value) || 5
        );

    } catch (error) {
        console.error(error);
        alert('Não foi possível excluir o restaurante.');
    }
}

async function searchLocation(searchTerm) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=${encodeURIComponent(searchTerm)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erro ao pesquisar localização.');
        }

        const results = await response.json();

        if (results.length === 0) {
            showToast('Localização não encontrada.', 'error');
            return;
        }

        const latitude = Number(results[0].lat);
        const longitude = Number(results[0].lon);

        currentSearchLatitude = latitude;
        currentSearchLongitude = longitude;

        currentSearchIndex = -1;

        map.flyTo([latitude, longitude], 14);

        await loadRestaurants(
            latitude,
            longitude,
            Number(distanceInput.value) || 5
        );

        showToast('Localização encontrada!');

    } catch (error) {
        console.error('Erro na busca:', error);
        showToast('Não foi possível pesquisar essa localização.', 'error');
    }
}

async function loadRestaurantsOnMap() {
    try {
        const bounds = map.getBounds();

        const north = bounds.getNorth();
        const south = bounds.getSouth();
        const east = bounds.getEast();
        const west = bounds.getWest();

        const response = await fetch(
            `${API_BASE_URL}/restaurants/map?north=${north}&south=${south}&east=${east}&west=${west}`
        );

        if (!response.ok) {
            throw new Error('Erro ao carregar restaurantes do mapa.');
        }

        const restaurants = await response.json();

        const normalizedRestaurants = restaurants.map(restaurant => ({
            ...restaurant,
            latitude: Number(restaurant.latitude ?? restaurant.lat),
            longitude: Number(restaurant.longitude ?? restaurant.lng)
        }));

        allRestaurants = normalizedRestaurants;

        displayRestaurants(allRestaurants);

        console.log('restaurantes area visivel:', allRestaurants);

    } catch (error) {
        console.error('Erro ao buscar restaurantes no mapa:', error);
    }
}

map.on('moveend', () => {
    loadRestaurantsOnMap();
});