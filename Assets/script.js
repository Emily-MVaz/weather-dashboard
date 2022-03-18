// Global variables
var APIKey = "1f424de6f8c55f73372510aac5d23b26";
// TODO API key not working 400 error not sure why maybe add lon adn lat to link??
var currentCity = "";
var lastCity ="";



// Get current weather conditions
var currentConditions = (event) => {

    // grab city name form search box
    let city = $("#city-search").val();
    currentCity = $("#city-search").val();

    // Set up API for specific city 
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;

    // Grab city weather from API
    fetch(queryURL)
    .then((response) => {
        return response.json();
    })

    // Save city info to local storage
    .then((response) => {
        saveCity(city);
        
        let weatherIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

        


        // Offset UTC timezone - using moment.js
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);



        // Time information
        // TODO: fix time info maybe different structure needed 
        // var currentCityDate = data.current.dt;
        // currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");
        // var currentDateEl = $("<span>");
        // currentDateEl.text(` (${currentCityDate}) `);
        // cityNameEl.append(currentDateEl);



        // show list of cities searched
        cityList();
        // get 5 day forecast for city
        getForecast(event);

        // Display city weather info
        let currentWeatherCard = `<h3>${response.name} ${currentMoment.format("MM/DD/YYYY")}<img src="${weatherIcon}"></h3>
        <ul class="list-unstyled">
            <li>Temperature: ${response.main.temp}&#8457;</li> 
            <li>Humidity: ${response.main.humidity}%;</li> 
            <li>Wind Speed: ${response.wind.speed}; mph</li> 
            <li id="uvIndex">UV Index:</li>
        </ul>`;
        
        $("#current-weather").html(currentWeatherCard);

        // UV Index lon and lat
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + APIKey;

        // queryURL = "https://cors-anywhere.herokuapp.com/" + queryURL;


        fetch(queryURL)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            let uvIndex = response.value;
            $("#uvIndex").html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
            
        });

    })
}

//5 day forecast function
var getForecast = (event) => {
    let city = $("#city-search").val();

    // Set up URL for API search using forecast search
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + APIKey;

    // Grab info from API
    fetch(queryURL)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        // HTML template
        let fiveDayForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        // Loop over the 5 day forecast and build the template HTML using UTC offset and Open Weather Map icon
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            // Only displaying mid-day forecasts
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        // Build the HTML template
        fiveDayForecastHTML += `</div>`;
        // Append the five-day forecast to the DOM
        $('#five-days').html(fiveDayForecastHTML);
    })
}










//local storage function
var saveCity = (newCity) => {

    let cityExists = false;
    // if City exists in local storage
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    // Save to localStorage if city is new
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

var cityList = () => {
    $("#search-history").empty();

    // if local storage is empty
    if (localStorage.length === 0) {
        if (lastCity){
            $("#city-search").attr("value",lastCity);
        } else {
            $("#city-search").attr("value","");
        }
    }  else {
        let lastCityKey = "cities" + (localStorage.length-1);
        lastCity = localStorage.getItem(lastCityKey);

        // set search input to last city
        $("#city-search").attr("value",lastCity);

        for (let i=0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;

            if (currentCity === "") {
                currentCity = lastCity
            }

            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            }

            $("#search-history").prepend(cityEl);
        }

        // if there is a list add a clear button
        if (localStorage.length > 0) {
            $("#clear-history").html($("<a id='clear-history' href='#'>clear</a>"));
        } else {
            $("#clear-history").html("");
        }
    }
}

// event listeners

//search button 
$("#search-button").on("click", (event) => {
    event.preventDefault();
    currentCity = $("#city-search").val();
    currentConditions(event);
});


// search history
// ? Is this right????
$("#search-history").on("click", (event) => {
    event.preventDefault();
    $("#city-search").val(event.target.textContent);
    currentCity = $("#city-search").val();
    currentConditions(event);
});

$("#clear-history").on("click", (event) => {
    localStorage.clear();
    cityList();
})




// call functions

cityList();

currentConditions();