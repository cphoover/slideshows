import assert from 'assert';
import {add, subtract} from './math';

describe('math helper', function () {
	it('add will add two numbers', function test() {
		assert(add(5, 3) === 8);
	});

	it('add will add two numbers', function test() {
		assert(subtract(19, 8) === 11);
	});

});
