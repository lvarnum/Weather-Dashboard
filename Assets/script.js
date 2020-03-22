var button = $("#search");
var date = moment().format('MMMM D, YYYY');
var key = "1ae5de67f02a53b9683d18d17bf86b63";

if (localStorage.getItem("lastSearched") === null) {
    var lastSearched = {
        cities: [],
        lastCity: ""
    };
    localStorage.setItem("lastSearched", JSON.stringify(lastSearched));
}

var searched = JSON.parse(localStorage.getItem("lastSearched"));

for (var i = 0; i < searched.cities.length; i++) {
    createButtons(searched.cities[i]);
}

if (searched.lastCity !== "") {
    var name = searched.lastCity;
    $("#cityName").text(name + " (" + date + ")");
    displayInfo(name);
    displayFiveDay(name);
}

button.on("click", function (event) {
    event.preventDefault();
    $("#fiveDays").empty();
    var name = $("#name").val();
    var city = name.trim();
    $("#cityName").text(city + " (" + date + ")");
    $("#name").val('');
    createButtons(city);
    searched.cities.push(city);
    displayInfo(city);
    displayFiveDay(city);
    searched.lastCity = city;
    localStorage.setItem("lastSearched", JSON.stringify(searched));
});

$("#clear").on("click", function() {
    $(".list-group").empty();
    $(".info").empty();
    var lastSearched = {
        cities: [],
        lastCity: ""
    };
    localStorage.setItem("lastSearched", JSON.stringify(lastSearched));
    searched = JSON.parse(localStorage.getItem("lastSearched"));
    localStorage.clear();
});

function createButtons(city) {
    var newItem = $("<li>");
    newItem.addClass("list-group-item");
    newItem.attr("data-name", city);
    newItem.text(city);
    $(".list-group").append(newItem);
    newItem.on("click", function() {
        $("#fiveDays").empty();
        var name = newItem.attr("data-name");
        $("#cityName").text(city + " (" + date + ")");
        displayInfo(city);
        displayFiveDay(city);
    });
}

function displayInfo(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + key;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        $("#five").text("5 Day Forecast:");
        var icon = $("<img>");
        icon.attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
        $("#cityName").append(icon);
        var temp = $("#temp");
        var tempF = (response.main.temp - 273.15) * 1.8 + 32;
        temp.text("Temperature: " + tempF.toFixed(1) +  " F");
        var humidity = $("#humid");
        humidity.text("Humidity: " + response.main.humidity + "%");
        var wind = $("#wind");
        wind.text("Wind Speed: " + (response.wind.speed * 2.237).toFixed(0) + " MPH");
        displayIndex(response.coord.lat, response.coord.lon);
    });
}

function displayIndex(lat, lon) {
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + key + "&lat=" + lat + "&lon=" + lon;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var uv = $("#uv");
        var uvItem = $("<div>").text(response.value);
        uv.text("UV Index:");
        uv.append(uvItem);
        uvItem.addClass("uvItem");
        if (response.value < 3) {
            uvItem.css("background-color", "green");
        }
        else if (response.value < 6) {
            uvItem.css("background-color", "orange");
        }
        else if (response.value >= 6) {
            uvItem.css("background-color", "red");
            uvItem.css("color", "white");
        }
    });
}

function displayFiveDay(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + key;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var val = 5;
        for (var i = 0; i < 5; i++) {
            var div = $("<div>");
            div.addClass("col forecast");
            var date = $("<div>").text(moment().add(i + 1, 'days').format("MMMM D, YYYY"));
            var icon = $("<img>");
            icon.attr("src", "https://openweathermap.org/img/w/" + response.list[val].weather[0].icon + ".png");
            var tempF = (response.list[val].main.temp - 273.15) * 1.8 + 32;
            var temp = $("<div>").text("Temperature: " + tempF.toFixed(1) + " F");
            var humidity = $("<div>").text("Humidity: " + response.list[val].main.humidity + "%");
            var wind = $("<div>").text("Wind Speed: " + (response.list[val].wind.speed * 2.237).toFixed(0) +  " MPH");
            div.append(date, icon, temp, humidity, wind);
            $("#fiveDays").append(div);
            val += 8;
        }
    });
}
