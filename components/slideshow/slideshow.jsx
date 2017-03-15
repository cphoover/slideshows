import React from 'react';
import Form from 'react-jsonschema-form';
import Bluebird from 'bluebird';

function preloadImage(url) { // from http://stackoverflow.com/questions/3646036/javascript-preloading-images
    const img=new Image();
    img.src=url;
}

class SlideshowContents extends React.Component {

	renderPlayPauseToggle() {
		return this.props.playing ?
			<span className='icon pause' onClick={(ev) => this.props.onStop(ev)}>pause</span> :
			<span className='icon play' onClick={(ev) => this.props.onPlay(ev)}>play</span>;
	}

	render () {

		function genActiveClassName(activeSlide, imageObj) {
			return imageObj.index === activeSlide ? 'active' : '';
		}

		return <div className='contents'>
			{ this.props.supportsFullscreen ? <div className='ctrl hidden-fullscreen'>
				<span className='icon fullscreen' onClick={(ev) => this.props.onFullscreen(ev)}>fullscreen</span>
			</div> : '' }
			<div className='arrows'>
				<span className='icon prev' onClick={(ev) => this.props.onPrevClick(ev)}>previous</span>
				{this.renderPlayPauseToggle()}
				<span className='icon next' onClick={(ev) => this.props.onNextClick(ev)}>next</span>
			</div>
			<div className='slides'>
				{
					this.props.slides.length  ?
					this.props.slides.map(imageObj => {
						return <div className={ `slide ${this.props.transition} ${genActiveClassName(this.props.activeSlide, imageObj)}`} key={imageObj.index}><img src={imageObj.value} /></div>
					}) : ''
				}
			</div>
		</div>
	}

}


export default class Slideshow extends React.Component {

	static get defaultProps() {
	  return {
		startingSlide : 0,
		autoPlay : true,
		transition: 'fade',
		intervalDuration : 5000
	  }
	}

	constructor(props) {
		super(props);
		this.setStateAsync = Bluebird.promisify(this.setState);
		this.before = [];
		this.interval = false;

		this.state = {
			activeSlide : this.props.startingSlide,
			playing : this.props.autoPlay,
			slides : [],
			appLoading : false

		};
	}

	next() {
		const nextSlide = ++this.state.activeSlide;


		if (nextSlide < this.state.slides.length) {
			return this.go(nextSlide)
		}

		if (this.props.onGetNewImages) {
			return this.loadImages(() => this.props.onGetNewImages())
				.tap(x => console.log('teh new images', x))
				.then(() => this.go(nextSlide));
		}

		return this.go(0);

	}

	prev() {
		const nextSlide = --this.state.activeSlide;
		return this.go(nextSlide > 0 ? nextSlide : this.state.slides.length - 1);
	}

	play() {
		this.interval = setInterval(() => this.next(), this.props.intervalDuration);
		const nextState = {playing: true};
		return this.setStateAsync(Object.assign({}, this.state, nextState));
	}

	stop() {
		global.clearInterval(this.interval)
		const nextState = {playing: false};
		return this.setStateAsync(Object.assign({}, this.state, nextState));
	}

	go(page) {
		const nextState = { activeSlide: page};
		return this.setStateAsync(Object.assign({}, this.state, nextState));
	}

	fullscreen() {
		this.fullscreenFn.call(this.innerWrapper);
	}

	componentDidMount() {
		// make configurable
		// I'm sure I'm doing this wrong... oh well
		const fullscreenFns = [
			'requestFullScreen',
			'requestFullscreen',
			'msRequestFullScreen',
			'msRequestFullscreen',
			'mozRequestFullScreen',
			'mozRequestFullscreen',
			'webkitRequestFullScreen',
			'webkitRequestFullscreen'
		];


		// set the fullscreen method if it exists
		this.fullscreenFn = fullscreenFns.reduce((result, fn) => {
			if (result) {
				return result;
			}
			return global.document.body[fn] || false;
		}, false);

		return this.loadImages(() => this.props.onGetSlideImages())
			.then(() => this.props.autoPlay ? this.play() : null); // avoid multiple setState here with componentShouldUpdate??

	}

	formatImages(imgs) {
		return imgs.map((value, index)=>({value, index : index + this.state.slides.length})); //hacky mutating
	}

	loadImages(fn, render = true) {

		const nextState = { appLoading : true }; // first enable loading bar

		return this.setStateAsync(Object.assign({}, this.state, nextState))
			.then(() =>	fn())
			.then((imgs) => this.formatImages(imgs))
			.then(slides => {
				const nextState = { slides : this.state.slides.concat(slides)};
				return this.setStateAsync(Object.assign({}, this.state, nextState))

			})
			.then(() => {
				this.state.slides.forEach(x => preloadImage(x.value));
			})
			.delay(1000)
			.then(() => {
				const nextState = {appLoading: false};
				return this.setStateAsync(Object.assign({}, this.state, nextState));
			})
	}

	handleKeyPress(event) {
		event.preventDefault();
		if (event.key == 'ArrowRight') {
			this.next();
		} else if (event.key === 'ArrowLeft') {
			this.prev();
		} else if (event.key === ' ') { // space bar
			this[this.state.playing ? 'stop' : 'play']();
		} else if (event.key === 'f' || event.key === 'F') {
			this.fullscreen();
		}

	}

	render() {

		return <div className='component-slideshow' tabIndex="0" onKeyDown={(ev) => this.handleKeyPress(ev)}>
			{this.state.appLoading}
			<div className={`inner ${this.state.appLoading ? 'app-loading' : ''}`} ref={(ref) => this.innerWrapper = ref}>
				<SlideshowContents
					slides={this.state.slides}
					supportsFullscreen={this.fullscreenFn}
					onFullscreen={() => this.fullscreen()}
					onPrevClick={() => {
						// if it's playing stop it we are now taking manual control
						return this.state.playing ? this.stop()
						.then(() =>this.prev()) : this.prev()
					}}
					onNextClick={() => {
						return this.state.playing ? this.stop()
						.then(() =>this.next()) : this.next()
					}}
					onPlay={() => this.play()}
					onStop={() => this.stop()}
					transition={this.props.transition}
					activeSlide={this.state.activeSlide}
					playing={this.state.playing}
				/>
				<div className='loading-bar'></div>
			</div>
		</div>;
	}

}
