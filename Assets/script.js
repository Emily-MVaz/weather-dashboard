// Global variables
var apiKey = "1f424de6f8c55f73372510aac5d23b26"
var currentCity = "";
var lastCity ="";



// Get current weather conditions
var currentConditions = (event) => {

    // grab city name form search box
    let city = $("#city-search").val();
    currentCity = $("#city-search").val();

    // Set up API for specific city 
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid" + apiKey;

    // Grab city weather from API
    fetch(queryURL)
    .then((response) => {
        return response.json();
    })

    // Save city info to local storage
    .then((response) => {
        saveCity(city);
        
        let weatherIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

        var currentCityDate = data.current.dt;
        currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");
        var currentDateEl = $("<span>");
        // currentDateEl.text(` (${currentCityDate}) `);
        // cityNameEl.append(currentDateEl);

    
        // show list of cities searched
        cityList();
        // get 5 day forecast for city
        getForecast(event);

        // Display city weather info
        let currentWeatherCard = `<h3>${response.name} ${currentCityDate}<img src="${weatherIcon}"></h3>
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
        let uvQuery = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon" + longitude + "&appid=" + apiKey;

        fetch(uvQuery)
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


//local storage function
var saveCity = (newCity)



// event listeners

//search button 
$("#search-button").on("click", (event) => {
    event.preventDefault();
    currentCity = $("#city-search").val();
    currentConditions(event);
});


// search history
$("#search-history").on("click", (event) => {
    event.preventDefault();
    $("#city-search").val(event.target.textContent);
    currentCity = $("#city-search").val();
    currentConditions(event);
});


// call functions

currentConditions();