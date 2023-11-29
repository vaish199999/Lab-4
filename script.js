async function getCoordinates(location) {
    const geocodeUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(location)}`;

    try {
        let response = await fetch(geocodeUrl);
        let data = await response.json();

        // Check if data is undefined, empty, or if the location is not found
        if (!data || data.length === 0 || data[0].error) {
            throw new Error('Invalid location. Please provide a valid location.');
        }

        let c = data[0];
        return { lat: c['lat'], lng: c['lon'] };
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        throw new Error('Error fetching coordinates. Please try again with a different location.');
    }
}



async function fetchCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            const { latitude, longitude } = position.coords;
            const sunriseSunsetCurrent = await getSunriseSunset(latitude, longitude, 'today');
            const sunriseSunsetTomorrow = await getSunriseSunset(latitude, longitude, 'tomorrow');
            displaySunriseSunsetToday('Current Location', sunriseSunsetCurrent);
            displaySunriseSunsetTomorrow('Current Location', sunriseSunsetTomorrow);
        }, function(error) {
            console.error('Error fetching current location:', error);
            displayError('Error fetching current location. Please try again.');
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
        displayError('Geolocation is not supported by this browser.');
    }
}

async function getSunriseSunset(lat, lng, date) {
    const sunriseSunsetUrl = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${date}`;

    try {
        const response = await fetch(sunriseSunsetUrl);
        const data = await response.json();

        const { sunrise, sunset, dawn, dusk, day_length, solar_noon, timezone } = data.results;
        return { sunrise, sunset, dawn, dusk, day_length, solar_noon, timezone };
    } catch (error) {
        console.error('Error fetching sunrise/sunset:', error);
        return null;
    }
}

async function fetchSunriseSunsetInfo() {
    const userLocationInput = document.getElementById('searchInput');
    const userLocation = userLocationInput.value.trim();

    // Check if the userLocation is empty or contains invalid characters
    if (!userLocation || /[^a-zA-Z\s,]/.test(userLocation)) {
        displayError('Invalid location. Please provide a valid location.');
        userLocationInput.value = ''; // Clear the input field
        return;
    }

    try {
        const coordinates = await getCoordinates(userLocation);

        const { lat, lng } = coordinates;
        const sunriseSunsetToday = await getSunriseSunset(lat, lng, 'today');
        const sunriseSunsetTomorrow = await getSunriseSunset(lat, lng, 'tomorrow');

        if (sunriseSunsetToday) {
            displaySunriseSunsetToday(userLocation, sunriseSunsetToday);
            displaySunriseSunsetTomorrow(userLocation, sunriseSunsetTomorrow);
        } else {
            displayError('Error fetching sunrise/sunset details.');
        }
    } catch (error) {
        displayError(error.message);
        userLocationInput.value = ''; // Clear the input field
    }
}


function displaySunriseSunsetToday(location, sunriseSunset) {
    document.getElementById('locationNameToday').textContent = location;
    document.getElementById('sunriseTimeToday').textContent = sunriseSunset.sunrise;
    document.getElementById('sunsetTimeToday').textContent = sunriseSunset.sunset;
    document.getElementById('dawnTimeToday').textContent = sunriseSunset.dawn;
    document.getElementById('duskTimeToday').textContent = sunriseSunset.dusk;
    document.getElementById('dayLengthToday').textContent = sunriseSunset.day_length;
    document.getElementById('solarNoonTimeToday').textContent = sunriseSunset.solar_noon;
    document.getElementById('timezoneToday').textContent = sunriseSunset.timezone;
}

function displaySunriseSunsetTomorrow(location, sunriseSunset) {
    document.getElementById('locationNameTomorrow').textContent = location;
    document.getElementById('sunriseTimeTomorrow').textContent = sunriseSunset.sunrise;
    document.getElementById('sunsetTimeTomorrow').textContent = sunriseSunset.sunset;
    document.getElementById('dawnTimeTomorrow').textContent = sunriseSunset.dawn;
    document.getElementById('duskTimeTomorrow').textContent = sunriseSunset.dusk;
    document.getElementById('dayLengthTomorrow').textContent = sunriseSunset.day_length;
    document.getElementById('solarNoonTimeTomorrow').textContent = sunriseSunset.solar_noon;
    document.getElementById('timezoneTomorrow').textContent = sunriseSunset.timezone;
}

function displayError(message) {
    console.error('Error:', message);
    alert(message); // Display an alert message
}