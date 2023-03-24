// import preact
import { h, Component } from 'preact';

// import required Components from 'components/'
import Iphone from './iphone';
import Ipad from './ipad';

// Main App component
export default class App extends Component {

// Initialize state and bind methods
	constructor(props) {
	  super(props);
	  this.state = {
		weatherData: null
	  };
	  this.handleWeatherData = this.handleWeatherData.bind(this);
	}

// Method to handle weather data received from child components
	handleWeatherData(data) {
	  this.setState({ weatherData: data });
	}

// Render method for the component
	render() {
		return (
		  <div id="app">
			<Iphone onWeatherData={this.handleWeatherData} />
		  </div>
		);
	  }
}

