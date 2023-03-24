// import preact
import { h, Component } from 'preact';

// import required Components from 'components/'
import Iphone from './iphone';
import Ipad from './ipad';

export default class App extends Component {
	constructor(props) {
	  super(props);
	  this.state = {
		isTablet: false,
		weatherData: null
	  };
	  this.handleWeatherData = this.handleWeatherData.bind(this);
	}
  
	handleWeatherData(data) {
	  this.setState({ weatherData: data });
	}
  
	render() {
	  if (this.state.isTablet) {
		return (
		  <div id="app">
			<Ipad />
		  </div>
		);
	  } else {
		return (
		  <div id="app">
			<Iphone onWeatherData={this.handleWeatherData} />
		  </div>
		);
	  }
	}
  }
