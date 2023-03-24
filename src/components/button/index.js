// import preact
import { h, render, Component } from 'preact';

// Button component	
export default class Button extends Component {

// rendering a function when the button is clicked
	render() {

// Get the clickFunction prop and check if it's a valid function
		let cFunction = this.props.clickFunction;
		if(typeof cFunction !== 'function'){

// If it's not a function, log an error message and set a default function
			cFunction = () => {
				console.log("passed something as 'clickFunction' that wasn't a function !");
			}
		}

// Return the button element with an onClick event that calls the clickFunction
		return (
			<div>
				<button onClick={cFunction}>
					Display Weather
				</button>
			</div>
		);
	}
}

