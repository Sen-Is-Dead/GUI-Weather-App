import { h, render, Component } from 'preact';
import style from './style';
import $ from 'jquery';
import clear from '../../assets/backgrounds/clear-iphone.jpg'
import clouds from '../../assets/backgrounds/clouds-iphone.jpg'
import rain from '../../assets/backgrounds/rain-iphone.jpg'
import snow from '../../assets/backgrounds/snow-iphone.jpg'
import thunderstorm from '../../assets/backgrounds/thunderstorm-iphone.jpg'
import mist from '../../assets/backgrounds/mist-iphone.jpg'
import low from '../../assets/icons/LowLevel.png' 
import high from '../../assets/icons/HighLevel.png'


export default class WeatherApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: '',
      display: true,
      weather: null,
      airQuality: null,
      pollen: null,
      hourlyForecast: null,
      searched: false,
    };
  }
  handleLocationChange = (event) => {
    if (event.key === 'Enter') {
      this.setState({ location: event.target.value });
      this.fetchWeatherData(event.target.value)
        .then((response) => {
          if (response) {
            const { lat, lon } = response.coord;
            this.fetchAirQualityAndPollenData(lat, lon);
          }
        });
      this.setState({ location: '', searched: true });
    }
  };

  fetchWeatherData = (location) => {
    return new Promise((resolve, reject) => {
      const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&APPID=f790ee04115c5a19a219111693630060`;
      const hourlyForecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&APPID=f790ee04115c5a19a219111693630060`;

      $.ajax({
        url: weatherUrl,
        dataType: 'jsonp',
        success: (response) => {
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
          this.setState({ hourlyForecast: response });
        },
        error: (req, err) => {
          console.log(`Hourly forecast API call failed: ${err}`);
        }
      });
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
        this.setState({ airQuality: false });
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
        this.setState({ pollen: false });
      }
    });
  };

  getBackgroundImage = (weather) => {
    if (!weather) {
      return clouds;
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

  getPollenRiskImage = (PollenRiskLevel) => {
    return PollenRiskLevel === "High" ? high : low;
  };

  //beginning of geolocation ZS
  getLocation = () => {
    if ('geolocation' in nav) {
      nav.geolocation.getCurrentLocation(
        (location) => {
          const { lat, lon } = location.coords;
          this.fetchWeatherDataByCoords(lat, lon);
        },
        (error) => {
          console.log(`Geolocation error: ${error.message}`);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  };

  fetchWeatherDataByCoords = (lat, lon) => {
    const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&APPID=f790ee04115c5a19a219111693630060`;
    const hourlyForecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&APPID=f790ee04115c5a19a219111693630060`;

	      $.ajax({
        url: weatherUrl,
        dataType: 'jsonp',
        success: (response) => {
          this.setState({ weather: response});
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
          this.setState({ hourlyForecast: response });
        },
        error: (req, err) => {
          console.log(`Hourly forecast API call failed: ${err}`);
        }
      });

	      this.fetchAirQualityAndPollenData(lat, lon);
      };

  compDidMount() {
    this.getLocation();
  }
  //end of geo location ZS

  findMinMaxTemp = () => {
    const { hourlyForecast } = this.state;

    if (!hourlyForecast) {
      return { minTemp: null, maxTemp: null };
    }

    let minTemp = Infinity;
    let maxTemp = -Infinity;

    hourlyForecast.list.slice(0, 7).forEach((item) => {
      if (item.main.temp_min < minTemp) {
        minTemp = item.main.temp_min;
      }
      if (item.main.temp_max > maxTemp) {
        maxTemp = item.main.temp_max;
      }
    });

    return { minTemp, maxTemp };
  };

  render() {
    const { display, weather, airQuality, pollen, hourlyForecast } = this.state;
    const { minTemp, maxTemp } = this.findMinMaxTemp();

    return (
      <div class={style.container} style={{ backgroundImage: `url(${this.getBackgroundImage(weather)})` }}>
        {display && (
          <div class={style.searchWrapper}>
            <input
              id="search-box"
              class={style.search}
              type="text"
              placeholder="Enter location"
              value={this.state.location}
              onChange={this.handleLocationChange}
              onKeyPress={this.handleLocationChange}
            />
            <label for="search-box"><img src="../../assets/icons/search.png" class={style.searchIcon} /></label>
          </div>
        )}
        {weather && (
          <div class={style.weatherInfo}>
            <div class={style.city}>{`${weather.name}, ${weather.sys.country}`}</div>
            <div class={style.temperature}>{weather.main.temp}°C</div>
            <div class={style.minMaxTemps}>
              <div>H: {maxTemp !== null ? `${maxTemp.toFixed(0)}°C` : 'N/A'} L: {minTemp !== null ? `${minTemp.toFixed(0)}°C` : 'N/A'}</div>
            </div>
            <div class={style.conditions}>{weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}</div>
          </div>
        )}
        {this.state.searched && weather &&(
          <div class={style.airQualityInfo}>
            <div class={style.infoTitle}>Air Quality Data:</div>
            <div class={style.infoSubtitle}>Category: {airQuality !== null ? (airQuality.stations && airQuality.stations[0] ? airQuality.stations[0].aqiInfo.category : 'N/A') : 'N/A'}</div>
            <div class={style.infoSubtitle}>AQI: {airQuality !== null ? (airQuality.stations && airQuality.stations[0] ? airQuality.stations[0].aqiInfo.concentration.toFixed(1) : 'N/A') : 'N/A'}</div>
          </div>
        )}
        {this.state.searched && weather &&(
          <div class={style.pollenInfo}>
            <div class={style.infoTitle}>Pollen Count Data:</div>
              <div class={style.infoSubtitle}>Tree Risk Level: {pollen !== null ? (pollen && pollen.data && pollen.data[0] ? <img class={style.pollenRiskImg} src={this.getPollenRiskImage(pollen.data[0].Risk.tree_pollen)} alt={pollen.data[0].Risk.tree_pollen} /> : 'N/A') : 'N/A'}</div>
              <div class={style.infoSubtitle}>Grass Risk Level: {pollen !== null ? (pollen && pollen.data && pollen.data[0] ? <img class={style.pollenRiskImg} src={this.getPollenRiskImage(pollen.data[0].Risk.grass_pollen)} alt={pollen.data[0].Risk.grass_pollen} /> : 'N/A') : 'N/A'}</div>
              <div class={style.infoSubtitle}>Weed Risk Level: {pollen !== null ? (pollen && pollen.data && pollen.data[0] ? <img class={style.pollenRiskImg} src={this.getPollenRiskImage(pollen.data[0].Risk.weed_pollen)} alt={pollen.data[0].Risk.weed_pollen} /> : 'N/A') : 'N/A'}</div>
          </div>
        )}
        {hourlyForecast && (
          <div class={style.hourlyForecastOverlay}>
            <div class={style.hourlyForecast}>
              <div class={style.forecastItems}>
                {
                  hourlyForecast.list.slice(12).map((item, index) => (
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
