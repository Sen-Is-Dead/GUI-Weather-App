// Import necessary modules and assets
import { h, render, Component } from 'preact';
import style from './style';
import $ from 'jquery';

// Import background images for different weather conditions
import clear from '../../assets/backgrounds/clear-iphone.jpg'
import clouds from '../../assets/backgrounds/clouds-iphone.jpg'
import rain from '../../assets/backgrounds/rain-iphone.jpg'
import snow from '../../assets/backgrounds/snow-iphone.jpg'
import thunderstorm from '../../assets/backgrounds/thunderstorm-iphone.jpg'
import mist from '../../assets/backgrounds/mist-iphone.jpg'
import low from '../../assets/icons/LowLevel.png' 
import high from '../../assets/icons/HighLevel.png'

// Create a WeatherApp component that extends Preact's Component
export default class WeatherApp extends Component {
  constructor(props) {
    super(props);
// Initialize state with default values
    this.state = {
      location: '', // Location input value
      display: true, // Controls the display of the search bar
      weather: null, // Weather data fetched from API
      airQuality: null, // Air quality data fetched from API
      pollen: null, // Pollen data fetched from API
      hourlyForecast: null, // Hourly forecast data fetched from API
      searched: false, // Indicates if a search has been performed
    };
  }

    // Handle location input change and trigger weather data fetch when the Enter key is pressed
  handleLocationChange = (event) => {
    if (event.key === 'Enter') {
      this.setState({ location: event.target.value });

   // Fetch weather data based on the location entered
      this.fetchWeatherData(event.target.value)
        .then((response) => {
          if (response) {
            const { lat, lon } = response.coord;

		    // Fetch air quality and pollen data based on the coordinates received
            this.fetchAirQualityAndPollenData(lat, lon);
          }
        });

	// Reset location input and set searched state to true
      this.setState({ location: '', searched: true });
      event.target.blur();
    }
  };

   // Fetch weather data from OpenWeatherMap API using location (city name)
  fetchWeatherData = (location) => {

  // Use jQuery's ajax method to fetch data from both APIs
   return new Promise((resolve, reject) => {

  // Construct URLs for current weather and hourly forecast APIs
      const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&APPID=f790ee04115c5a19a219111693630060`;
      const hourlyForecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&APPID=f790ee04115c5a19a219111693630060`;

      $.ajax({
        url: weatherUrl,
        dataType: 'jsonp',
        success: (response) => {

 // Update the weather state with the fetched data
          this.setState({ weather: response });
          resolve(response);
        },
        error: (req, err) => {
          console.log(`Weather API call failed: ${err}`);
          reject(err);
        }
      });

      $.ajax({
        url: hourlyForecastUrl,
        dataType: 'jsonp',
        success: (response) => {

 // Update the hourlyForecast state with the fetched data
          this.setState({ hourlyForecast: response });
        },
        error: (req, err) => {
          console.log(`Hourly forecast API call failed: ${err}`);
        }
      });
    });
  };

// Fetch air quality and pollen data based on latitude and longitude
  fetchAirQualityAndPollenData = (lat, lon) => {

// Construct URLs for air quality and pollen APIs
    const ambeeApiUrl = `https://api.ambeedata.com/latest/by-lat-lng?lat=${lat}&lng=${lon}`;
    const pollenApiUrl = `https://api.ambeedata.com/latest/pollen/by-lat-lng?lat=${lat}&lng=${lon}`;
    const ambeeApiKey = 'e398f233ae0f3fffbe9b518286c45bcf3969cdb89ad04abeb92c44290b11a976';


// Use jQuery's ajax method to fetch data from both APIs
    $.ajax({
      url: ambeeApiUrl,
      headers: { 'x-api-key': ambeeApiKey },
      success: (response) => {

 // Update the airQuality state with the fetched data
        this.setState({ airQuality: response });
      },
      error: (req, err) => {
        console.log(`Air quality API call failed: ${err}`);
        this.setState({ airQuality: false });
      }
    });

    $.ajax({
      url: pollenApiUrl,
      headers: { 'x-api-key': ambeeApiKey },
      success: (response) => {
 // Update the pollen state with the fetched data
        this.setState({ pollen: response });
      },
      error: (req, err) => {
        console.log(`Pollen API call failed: ${err}`);
        this.setState({ pollen: false });
      }
    });
  };


// Function to get the appropriate background image for the given weather condition
  getBackgroundImage = (weather) => {
    if (!weather) {
      return clouds;
    }

    const condition = weather.weather[0].main.toLowerCase();
    let backgroundImage;

// Switch statement to select the right background image for the condition
    switch (condition) {
      case 'clear':
        backgroundImage = clear;
        break;
      case 'clouds':
        backgroundImage = clouds;
        break;
      case 'rain':
      case 'drizzle':
        backgroundImage = rain;
        break;
      case 'snow':
        backgroundImage = snow;
        break;
      case 'thunderstorm':
        backgroundImage = thunderstorm;
        break;
      case 'mist':
      case 'haze':
      case 'smoke':
      case 'fog':
      case 'dust':
        backgroundImage = mist;
        break;
      default:
        backgroundImage = clouds;
    }
    return backgroundImage;
  };

// Function to get the appropriate pollen risk image for the given pollen risk level
  getPollenRiskImage = (PollenRiskLevel) => {
    return PollenRiskLevel === "High" ? high : low;
  };

// Function to get the current location using the Geolocation API
  getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          this.fetchWeatherDataByCoords(lat, lon)
            .then((response) => {
              if (response) {
                this.fetchAirQualityAndPollenData(lat, lon);
              }
            });
        },
        (error) => {
          console.log(`Geolocation error: ${error.message}`);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  };


// Function to fetch weather and hourly forecast data by coordinates
  fetchWeatherDataByCoords = (lat, lon) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&APPID=f790ee04115c5a19a219111693630060`;
    const hourlyForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&APPID=f790ee04115c5a19a219111693630060`;

// AJAX call to fetch weather data
	$.ajax({
      url: weatherUrl,
      dataType: 'jsonp',
      success: (response) => {
        this.setState({ weather: response, searched: true });
      },
      error: (req, err) => {
        console.log(`Weather API call failed: ${err}`);
      }
    });

// AJAX call to fetch hourly forecast data  
    $.ajax({
      url: hourlyForecastUrl,
      dataType: 'jsonp',
      success: (response) => {
        this.setState({ hourlyForecast: response });
      },
      error: (req, err) => {
        console.log(`Hourly forecast API call failed: ${err}`);
      }
    });

// Fetch air quality and pollen data  
    this.fetchAirQualityAndPollenData(lat, lon);
  };

// Function called when the component is mounted
  compDidMount() {
    this.getLocation();
  }

// Function to find the minimum and maximum temperature from the hourly forecast
  findMinMaxTemp = () => {
    const { hourlyForecast } = this.state;

// If hourlyForecast is not available, return null values for minTemp and maxTemp
    if (!hourlyForecast) {
      return { minTemp: null, maxTemp: null };
    }

    let minTemp = Infinity;
    let maxTemp = -Infinity;

// Loop through the hourly forecast list to find the minimum and maximum temperature
    hourlyForecast.list.forEach((item) => {
      if (item.main.temp_min < minTemp) {
        minTemp = item.main.temp_min;
      }
      if (item.main.temp_max > maxTemp) {
        maxTemp = item.main.temp_max;
      }
    });

// Return an object containing the minimum and maximum temperature
    return { minTemp, maxTemp };
  };

// Render function to display the app components and data
  render() {
    const { display, weather, airQuality, pollen, hourlyForecast } = this.state;
    const { minTemp, maxTemp } = this.findMinMaxTemp();

    return (
      <div class={style.container} style={{ backgroundImage: `url(${this.getBackgroundImage(weather)})` }}>
        {display && (

// Render the search box and location button
          <div class={style.topWrapper}>
            <label for="search-box"><img src="../../assets/icons/search.png" class={style.searchIcon} /></label>
            <input
              id="search-box"
              class={style.search}
              type="text"
              placeholder="Enter location"
              value={this.state.location}
              onChange={this.handleLocationChange}
              onKeyPress={this.handleLocationChange}
            />
            <button id="location-box" class={style.locationButton} onClick={this.getLocation}/>
            <label for="location-box"><img src="../../assets/icons/location.png" class={style.locationIcon}/></label>
          </div>
        )}
        {weather && (

// Render the weather information for the current location
          <div class={style.weatherInfo}>
            <div class={style.city}>{`${weather.name}, ${weather.sys.country}`}</div>
            <div class={style.temperature}>{Math.round(weather.main.temp)}°C</div>
            <div class={style.minMaxTemps}>
              <div>H: {maxTemp !== null ? `${maxTemp.toFixed(0)}°C` : 'N/A'} L: {minTemp !== null ? `${minTemp.toFixed(0)}°C` : 'N/A'}</div>
            </div>
            <div class={style.conditions}>{weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}</div>
          </div>
        )}
        {this.state.searched && weather &&(

// Render the air quality information for the current location
          <div class={style.airQualityInfo}>
            <div class={style.infoTitle}>Air Quality Data:</div>
            <div class={style.infoSubtitle}>Category: {airQuality !== null ? (airQuality.stations && airQuality.stations[0] ? airQuality.stations[0].aqiInfo.category : 'N/A') : 'N/A'}</div>
            <div class={style.infoSubtitle}>AQI: {airQuality !== null ? (airQuality.stations && airQuality.stations[0] ? airQuality.stations[0].aqiInfo.concentration.toFixed(1) : 'N/A') : 'N/A'}</div>
          </div>
        )}
        {this.state.searched && weather &&(

// Render the pollen count information for the current location
          <div class={style.pollenInfo}>
            <div class={style.infoTitle}>Pollen Count Data:</div>
              <div class={style.infoSubtitle}>Tree Risk Level: {pollen !== null ? (pollen && pollen.data && pollen.data[0] ? <img class={style.pollenRiskImg} src={this.getPollenRiskImage(pollen.data[0].Risk.tree_pollen)} alt={pollen.data[0].Risk.tree_pollen} /> : 'N/A') : 'N/A'}</div>
              <div class={style.infoSubtitle}>Grass Risk Level: {pollen !== null ? (pollen && pollen.data && pollen.data[0] ? <img class={style.pollenRiskImg} src={this.getPollenRiskImage(pollen.data[0].Risk.grass_pollen)} alt={pollen.data[0].Risk.grass_pollen} /> : 'N/A') : 'N/A'}</div>
              <div class={style.infoSubtitle}>Weed Risk Level: {pollen !== null ? (pollen && pollen.data && pollen.data[0] ? <img class={style.pollenRiskImg} src={this.getPollenRiskImage(pollen.data[0].Risk.weed_pollen)} alt={pollen.data[0].Risk.weed_pollen} /> : 'N/A') : 'N/A'}</div>
          </div>
        )}
        {hourlyForecast && (

// Render the hourly forecast information for the current location
          <div class={style.hourlyForecastOverlay}>
            <div class={style.hourlyForecast}>
              <div class={style.forecastItems}>
                {
                  hourlyForecast.list.slice(0,12).map((item, index) => (
                    <div class={style.forecastItem} key={index}>
                      <div>
                        {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', hour12: false })}
                      </div>
                      <img src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`} />
                      <div>{Math.round(item.main.temp)}°C</div>
                    </div>
                  ))
                }
              </div>
            </div>
            </div>
          )}
      </div>
    );
  }
}
