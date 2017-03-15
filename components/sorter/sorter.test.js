import jsdomGlobal from 'jsdom-global';
import jsdom from 'jsdom';
import React from 'react'; // eslint-disable-line
import assert from 'assert';
import sinon from 'sinon';
import {mount} from 'enzyme';
import Sorter from './sorter.jsx';

jsdomGlobal();
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>'); // @todo use a real browser...

describe('A suite', function () {
	before(function () {
		this.sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		this.sandbox.restore();
	});


	it('contains spec with an expectation', function () {
		const onSelectChange = this.sandbox.spy();
		const wrapper = mount(<Sorter onChange={onSelectChange} />);
		wrapper.find('select').simulate('change', {target : {value : 'most-run'}});
		assert(onSelectChange.callCount === 1);
	});
});
