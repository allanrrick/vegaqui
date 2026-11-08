const map = L.map('map').setView([-14.235, -51.925], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

let userMarker = null;
let accuracyCircle = null;

function getUserLocation() {

    if (!navigator.geolocation) {
        console.error('Geolocation is not supported.');
        return;
    }

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            map.flyTo([latitude, longitude], 15);

            if (userMarker) {
                map.removeLayer(userMarker);
            }

            if (accuracyCircle) {
                map.removeLayer(accuracyCircle);
            }

            userMarker = L.marker([latitude, longitude])
                .addTo(map)

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
