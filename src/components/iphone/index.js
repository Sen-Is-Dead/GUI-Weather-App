import { h, render, Component } from 'preact';
import style from './style';
import style_iphone from '../button/style_iphone';
import $ from 'jquery';
import Button from '../button';

class Iphone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locate: '',
      temp: '',
      cond: '',
      display: true,
      airQuality: null,
      error: null
    };
  }

  fetchWeatherData = () => {
    const weatherApiUrl = 'http://api.openweathermap.org/data/2.5/weather?q=London&units=metric&APPID=f790ee04115c5a19a219111693630060';
    $.ajax({
      url: weatherApiUrl,
      dataType: 'jsonp',
      success: this.parseWeatherResponse,
      error: (req, err) => console.log('Weather API call failed: ' + err)
    });
  }

  fetchAirQualityData = () => {
    const ambeeApiUrl = 'https://api.ambeedata.com/latest/by-lat-lng?lat=51&lng=0';
    const pollenApiUrl = 'https://api.ambeedata.com/latest/pollen/by-lat-lng?lat=51&lng=0';
    const ambeeApiKey = 'e398f233ae0f3fffbe9b518286c45bcf3969cdb89ad04abeb92c44290b11a976';
    
    console.log('Fetching air quality data...');
    fetch(ambeeApiUrl, {
      headers: {
        'x-api-key': ambeeApiKey
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Air quality data fetched successfully:', data);
        this.setState({ airQuality: data });
        return fetch(pollenApiUrl, {
          headers: {
            'x-api-key': ambeeApiKey
          }
        });
      })
      .then(response => response.json())
      .then(data => {
        console.log('Pollen count data fetched successfully:', data);
        this.setState({ pollenCount: data });
      })
      .catch(error => {
        console.log('Error fetching air quality and pollen count data:', error);
        this.setState({ error });
      });
  }

  componentDidMount() {
    console.log('Component mounted, fetching air quality data...');
    this.fetchAirQualityData();
  }

render() {
  const tempStyles = this.state.temp ? `${style.temperature} ${style.filled}` : style.temperature;

  return (
    <div class={style.container}>
      <div class={style.header}>
        <div class={style.city}>{this.state.locate}</div>
        <div class={style.conditions}>{this.state.cond}</div>
        <span class={tempStyles}>{this.state.temp}</span>
      </div>
      <div class={style.details}>
        {this.state.displayAirQualityData && this.renderAirQualityData()}
      </div>
      <div class={style_iphone.container}>
        {this.state.display ? <Button class={style_iphone.button} clickFunction={this.fetchWeatherData} /> : null}
        {!this.state.display && !this.state.displayAirQualityData && (
          <Button class={style_iphone.button} clickFunction={this.showAirQualityData} label="Show Air Quality Data" />
        )}
      </div>
    </div>
  );
}

showAirQualityData = () => {
  this.setState({ displayAirQualityData: true });
}

renderAirQualityData = () => {
  let airQualityData;
  if (this.state.error) {
    airQualityData = <div>Error: {this.state.error.message}</div>;
  } else if (!this.state.airQuality || !this.state.pollenCount) {
    airQualityData = <div>Loading...</div>;
  } else {
    const aqiCategory = this.state.airQuality.stations[0].aqiInfo.category;
    const aqiValue = this.state.airQuality.stations[0].aqiInfo.concentration;
    const grassPollenRisk = this.state.pollenCount.data[0].Risk.grass_pollen;
    const treePollenRisk = this.state.pollenCount.data[0].Risk.tree_pollen;
    const weedPollenRisk = this.state.pollenCount.data[0].Risk.weed_pollen;
    airQualityData = (
      <div>
        <h2>Air Quality Data:</h2>
        <p>Category: {aqiCategory}</p>
        <p>AQI: {aqiValue}</p>
        <h2>Pollen Count Data:</h2>
        <p>Grass Pollen Risk: {grassPollenRisk}</p>
        <p>Tree Pollen Risk: {treePollenRisk}</p>
        <p>Weed Pollen Risk: {weedPollenRisk}</p>
      </div>
    );
  }
  return (
    <div>
      <Button class={style_iphone.button} clickFunction={this.hideAirQualityData} label="Hide Air Quality Data" />
      {airQualityData}
    </div>
  );
}

hideAirQualityData = () => {
  this.setState({ displayAirQualityData: false });
}
  


  parseWeatherResponse = (parsed_json) => {
    const location = parsed_json.name;
    const temp_c = parsed_json.main.temp;
    const conditions = parsed_json.weather[0].description;

    this.setState({
      locate: location,
      temp: temp_c,
      cond: conditions,
      display: false
    });
  }
}

export default Iphone;