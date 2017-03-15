import React from 'react';

export default class Navigation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}
	handleChange(event) {
		this.setState({
			message: event.target.value
		});
	}
	render() {
		return <div className="component-navigation">
			<a href="/about">About</a>
			<a href="//github.com/cphoover">Fork this project!</a>
		</div>;
	}
}
