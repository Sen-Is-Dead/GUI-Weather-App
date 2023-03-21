import { h, Component } from 'preact';
import Iphone from './iphone';
import Ipad from './ipad';

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isTablet: false,
			latitude: null,
			longitude: null,
			error: null
		};
		this.handleWeatherData = this.handleWeatherData.bind(this);
	}

	componentDidMount() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				position => {
					this.setState({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					});
				},
				error => {
					this.setState({ error: error.message });
				}
			);
		} else {
			this.setState({ error: 'Geolocation is not supported by your browser.' });
		}
	}

	handleWeatherData(data) {
		this.setState({ weatherData: data });
	}

	render() {
		const { isTablet, latitude, longitude, error, weatherData } = this.state;

		if (error) {
			return (
				<div id="app">
					<p>{error}</p>
				</div>
			);
		}

		if (isTablet) {
			return (
				<div id="app">
					<Ipad />
				</div>
			);
		} else {
			return (
				<div id="app">
					{latitude && longitude && <Iphone onWeatherData={this.handleWeatherData} latitude={latitude} longitude={longitude} />}
					{weatherData && <p>Weather Data: {JSON.stringify(weatherData)}</p>}
				</div>
			);
		}
	}
}
