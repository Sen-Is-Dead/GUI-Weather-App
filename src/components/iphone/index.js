import { h, render, Component } from 'preact';
import style from './style';
import style_iphone from '../button/style_iphone';
import $ from 'jquery';
import Button from '../button';

export default class WeatherApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: '',
      display: true,
      weather: null,
      airQuality: null,
      pollen: null
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

    this.setState({ display: false });
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

  render() {
    const { display, weather, airQuality, pollen } = this.state;

    return (
      <div class={style.container}>
        {display && (
          <div class={style.inputContainer}>
            <input
              class={style.locationInput}
              type="text"
              placeholder="Enter location"
              value={this.state.location}
              onChange={this.handleLocationChange}
            />
            <Button class={style.submitButton} style={style_iphone} clickFunction={this.fetchWeatherData} />
          </div>
        )}
        {weather && (
          <div class={style.weatherInfo}>
            <div class={style.city}>{weather.name}</div>
            <div class={style.temperature}>{weather.main.temp}°C</div>
            <div class={style.conditions}>{weather.weather[0].description}</div>
          </div>
        )}
        {airQuality && (
          <div class={style.airQualityInfo}>
            <div class={style.infoTitle}>Air Quality Data:</div>
            <div class={style.infoSubtitle}>Category: {airQuality.stations[0].aqiInfo.category}</div>
            <div>AQI: {airQuality.stations[0].aqiInfo.concentration}</div>
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
