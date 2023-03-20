import { h, render, Component } from 'preact';
import style from './style';
import $ from 'jquery';
import Button from '../button';
import clear from '../../assets/backgrounds/clear-iphone.jpg'
import clouds from '../../assets/backgrounds/clouds-iphone.jpg'
import rain from '../../assets/backgrounds/rain-iphone.jpg'
import snow from '../../assets/backgrounds/snow-iphone.jpg'
import thunderstorm from '../../assets/backgrounds/thunderstorm-iphone.jpg'
import mist from '../../assets/backgrounds/mist-iphone.jpg'


export default class WeatherApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: '',
      display: true,
      weather: null,
      airQuality: null,
      pollen: null,
      forecast: null
    };
  }

  handleLocationChange = (event) => {
    this.setState({ location: event.target.value });
  };

  fetchWeatherData = () => {
    const { location } = this.state;

    const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&APPID=f790ee04115c5a19a219111693630060`;
    $.ajax({
      url: weatherUrl,
      dataType: 'jsonp',
      success: (response) => {
        this.setState({ weather: response });
        this.fetchAirQualityAndPollenData(response.coord.lat, response.coord.lon);
      },
      error: (req, err) => {
        console.log(`Weather API call failed: ${err}`);
      }
    });
    this.fetchWeatherForecastData();
    this.setState({ display: false });
  };

  fetchWeatherForecastData = () => {
    const { location } = this.state;

    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast/daily?q=${location}&cnt=1&units=metric&appid=f790ee04115c5a19a219111693630060`;
    $.ajax({
      url: forecastUrl,
      dataType: 'jsonp',
      success: (response) => {
        this.setState({ forecast: response.list[0] });
      },
      error: (req, err) => {
        console.log(`Forecast API call failed: ${err}`);
      }
    });
  };

  fetchAirQualityAndPollenData = (lat, lon) => {
    const ambeeApiUrl = `https://api.ambeedata.com/latest/by-lat-lng?lat=${lat}&lng=${lon}`;
    const pollenApiUrl = `https://api.ambeedata.com/latest/pollen/by-lat-lng?lat=${lat}&lng=${lon}`;
    const ambeeApiKey = 'e398f233ae0f3fffbe9b518286c45bcf3969cdb89ad04abeb92c44290b11a976';

    $.ajax({
      url: ambeeApiUrl,
      headers: { 'x-api-key': ambeeApiKey },
      success: (response) => {
        this.setState({ airQuality: response });
      },
      error: (req, err) => {
        console.log(`Air quality API call failed: ${err}`);
      }
    });

    $.ajax({
      url: pollenApiUrl,
      headers: { 'x-api-key': ambeeApiKey },
      success: (response) => {
        this.setState({ pollen: response });
      },
      error: (req, err) => {
        console.log(`Pollen API call failed: ${err}`);
      }
    });
  };

  getBackgroundImage = (weather) => {
    if (!weather) {
      return clouds; // Default background image
    }
  
    const condition = weather.weather[0].main.toLowerCase();
    let backgroundImage;
  
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

  render() {
    const { display, weather, airQuality, pollen, forecast } = this.state;

    return (
      <div class={style.container} style={{ backgroundImage: `url(${this.getBackgroundImage(weather)})` }}>
        {display && (
          <div>
            <input
              class={style.locationInput}
              type="text"
              placeholder="Enter location"
              value={this.state.location}
              onChange={this.handleLocationChange}
            />
            <Button class={style.submitButton} clickFunction={this.fetchWeatherData} />
          </div>
        )}
        {weather && (
      <div class={style.weatherInfo}>
        <div class={style.city}>{weather.name}</div>
        <div class={style.temperature}>{weather.main.temp}°C</div>
        {forecast && (
          <div class={style.highLow}>
            High: {forecast.temp.max.toFixed(1)} Low: {forecast.temp.min.toFixed(1)}
          </div>
        )}
        <div class={style.conditions}>{weather.weather[0].description}</div>
      </div>
    )}
        {airQuality && (
          <div class={style.airQualityInfo}>
            <div class={style.infoTitle}>Air Quality Data:</div>
            <div class={style.infoSubtitle}>Category: {airQuality.stations[0].aqiInfo.category}</div>
            <div class={style.infoSubtitle}>AQI: {airQuality.stations[0].aqiInfo.concentration.toFixed(1)}</div>
          </div>
        )}
        {pollen && (
          <div class={style.pollenInfo}>
            <div class={style.infoTitle}>Pollen Count Data:</div>
            <div class={style.infoSubtitle}>Tree Risk Level: {pollen.data[0].Risk.tree_pollen}</div>
            <div class={style.infoSubtitle}>Grass Risk Level: {pollen.data[0].Risk.grass_pollen}</div>
            <div class={style.infoSubtitle}>Weed Risk Level: {pollen.data[0].Risk.weed_pollen}</div>
          </div>
        )}
      </div>
    );
  }
}
