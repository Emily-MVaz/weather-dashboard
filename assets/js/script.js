// Global variables
var apiKey = "1f424de6f8c55f73372510aac5d23b26";
var today = moment().format('L');
var searchHistoryList = [];

// var currentCity = "";
// var lastCity ="";


// Get current weather conditions
function currentConditions(city) {

    // grab city name from search box
    // let city = $("#city-search").val();
    // currentCity = $("#city-search").val();

    //API setup 
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    // fetch(queryURL)
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(cityResponse) {
    //   console.log(cityResponse);
        

        $("#weather-info").css("display", "block");
        $("#current-weather").empty();

        var iconCode = cityResponse.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

        // console.log(cityResponse.weather[0]);


        // Display city weather info
        var currentCity = $(`
            <h2 id="currentCity">
                ${cityResponse.name} ${today} <img src="${iconURL}" alt=${cityResponse.weather[0].description}" />
            </h2>
            <p>Temperature: ${cityResponse.main.temp}&#8457</p>
            <p>Humidity: ${cityResponse.main.humidity}\%</p>
            <p>Wind Speed: ${cityResponse.wind.speed}mph</p>
        `);

        $("#current-weather").append(currentCity);

        //UV index info
        var lat = cityResponse.coord.lat;
        var lon = cityResponse.coord.lon;
        var uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        // fetch(uvQueryURL)
        $.ajax({
            url: uvQueryURL,
            method: "GET"
        })
        .then(function(uvResponse) {
            // console.log(uvResponse);

            var uvIndex = uvResponse.value;
            var uvIndexP = $(`
                <p> UV Index:
                    <span id="uvIndexColor" class="p-2 rounded">${uvIndex}</span>
                </p>
            `);

            $("#current-weather").append(uvIndexP);

            // UV Index color changes
            futureConditions(lat, lon);


            /* Color Key:
            favorable: UV is 0-2 green #52a72d
            moderate: UV is 3-7 orange #ff9c2c
            severe: UV is 8+ redish violet #b0124e
            */
            if (uvIndex >= 0 && uvIndex <= 2) {
                $("#uvIndexColor").css("background-color", "#52a72d").css("color","white");
            } else if (uvIndex >= 3 && uvIndex <=7) {
                $("#uvIndexColor").css("background-color", "#ff9c2c").css("color","white");
            } else {
                $("#uvIndexColor").css("background-color", "#b0124e").css("color","white");
            };
        });
    });
}

// 5 day forecast function
function futureConditions(lat, lon) {

    // 5 day forecast
    var fiveDayURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    // fetch(fiveDayURL)

    $.ajax({
        url: fiveDayURL,
        method: "GET"
    })
    .then(function(forecastResponse) {
        // console.log(forecastResponse);
        $("#five-days").empty();

        for (let i = 1; i < 6; i ++) {
            var cityInfo = {
                date: forecastResponse.daily[i].dt,
                icon: forecastResponse.daily[i].weather[0].icon,
                temp: forecastResponse.daily[i].temp.day,
                humidity: forecastResponse.daily[i].humidity
            };

            var currentDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${forecastResponse.daily[i].weather[0].main}" />`;

            // Displays all weather forecast info
            var forecastCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width:12rem;>
                        <div class="card-body">
                            <h5>${currentDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temperature: ${cityInfo.temp}&#8457</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                </div>
            `);
            
            $("#five-days").append(forecastCard);
        }
    });
}

// Event listeners
$("#search-button").on("click", function(event) {
    event.preventDefault();

    var city = $("#city-search").val().trim();
    currentConditions(city);
    if (!searchHistoryList.includes(city)) {
        searchHistoryList.push(city);
        var searchedCity = $(`
        <li class="list-group-item">${city}</li>
        `);
        $("#search-history").append(searchedCity);
    };

    localStorage.setItem("city", JSON.stringify(searchHistoryList));
    // console.log(searchHistoryList);
});

// Clickable history
$(document).on("click", ".list-group-item", function() {
    var listCity = $(this).text();
    currentConditions(listCity);
});

// Last searched city info shown
$(document).ready(function() {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        currentConditions(lastSearchedCity);
        // console.log(`Last serched city: ${lastSearchedCity}`);
    }

});
