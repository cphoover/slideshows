import React from 'react';
import Navigation from '../../components/navigation/navigation.jsx';
import Masthead from '../../components/masthead/masthead.jsx';
import config from '../../config.json';
import Slideshow from '../../components/slideshow/slideshow.jsx';
import Bluebird from 'Bluebird';
import mockResponse from '../../mock-response.json';
import localStorageTtl from 'localstorage-ttl';
import Highlight from 'react-highlight';
import S from 'stripmargin';

require('whatwg-fetch');

export default class Index extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			slideImages : []
		};
		this.currentPage = 2;
	}
	handleChange(event) {
		this.setState({
			message: event.target.value
		});
	}


	render() {

		const codeBlock1 = S.stripMargin(`
		|ReactDOM.render(
		|	<Slideshow transition='flip' onGetSlideImages={() => this.getSlideImages()} />,
		|	document.getElementById('target')
		|);
		|`);

		const codeBlock2 = S.stripMargin(`
		|ReactDOM.render(
		|	<Slideshow transition='fade' onGetSlideImages={() => this.getSlideImages()} />,
		|	document.getElementById('target')
		|);
		|`);

		const codeBlock3 = S.stripMargin(`
		|ReactDOM.render(
		|	<Slideshow transition='flip' onGetSlideImages={() => this.getSlideImages()} onGetNewImages={() => this.getNewSlideImages()} />,
		|	document.getElementById('target')
		|);
		|`);


		return <div id="page-home">
				<Navigation/>
				<Masthead organization="SuperHuman" title="Slideshow"/>
				<div className="main-content">
					<h2>Fullscreen support</h2>
					<p>Leverages requestFullScreen browser API.
						Need to work on this so it shows high res images... but it is a start</p>
					<h2>Keyboard Support</h2>
					<p>Try the right arrow, left arrow, space bar to navigate slides, and &quot;f&quot; to go fullscreen</p>
					<h2>Responsive (sort of)</h2>
					<p>
						css max-width: 100% for now... later support for html5 picture tag and other contents
					</p>
					<h2>Flip Transition </h2>
					<Slideshow transition='flip' onGetSlideImages={() => this.getSlideImages()} />
					<Highlight className="e4x">{codeBlock1}</Highlight>
					<h2>Fade Transition </h2>
					<Slideshow onGetSlideImages={() => this.getSlideImages()} />
					<Highlight className="e4x">{codeBlock2}</Highlight>
					<h2>Infinite Images/AJAX </h2>
					<Slideshow transition='flip' onGetSlideImages={() => this.getSlideImages()} onGetNewImages={() => this.getNewSlideImages()} />
					<Highlight className="e4x">{codeBlock3}</Highlight>
					<h2>TODO: </h2>
					<ul>
						<li>Smoother Transitions With Ajax Pull</li>
						<li>More Transitions Options</li>
						<li>Test Coverage</li>
						<li>Lint</li>
					</ul>
				</div>

		</div>;
	}


	getSlideImages() {
		this.currentPage++;
		return this.fetchImages(`${config.BASE_URL}?client_id=${config.APPLICATION_ID}&per_page=${config.PER_PAGE}`);
	}

	getNewSlideImages() {

		this.currentPage++;
		return this.fetchImages(`${config.BASE_URL}?client_id=${config.APPLICATION_ID}&per_page=${config.PER_PAGE}&page=${this.currentPage}`);
	}

	fetchImages(fetchUrl) {
		const fromCache = localStorageTtl.get(`${config.CACHE_PREFIX}${fetchUrl}`);
		return fromCache ? Bluebird.resolve(JSON.parse(fromCache)) : 
			 Bluebird.resolve(global.fetch(fetchUrl))
				.then(x => x.json()) // @todo this is just to bypass rate limiting in dev.
				.then(x => x.errors ? Bluebird.reject(x.errors) : x)
				.then(x => x.map(y => y.urls[config.IMAGE_TYPE]))
				.tap(x => localStorageTtl.set(`${config.CACHE_PREFIX}${fetchUrl}`, JSON.stringify(x), config.CACHE_TTL))
				.catch((err) => console.error('An error occurred while fetching images', err));
	}

	componentDidMount() {
		this.getSlideImages();
	}
}
