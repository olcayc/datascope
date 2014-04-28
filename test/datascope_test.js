'use strict';

var datascope = require('../src/datascope.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['generateFakeData'] = {
    setUp: function(done) {
        // setup here
        done();
    },
    'generate 1000 random datapoints': function(test) {
        test.expect(2);
        // tests here
        var data = datascope.generateFakeData(1000);

        test.equal(data.length, 1000, 'generateFakeData should have generated 1000 records.');
        test.equal(Object.keys(data[0]).length, 8, 'generateFakeData should return 8 columns');
        test.done();
    },
};
exports['smooth'] = {
    'smooth 1000 datapoints': function(test) {
        test.expect(2);
        var data = datascope.generateFakeData(1000);

        var result = datascope.smooth(data, 'x1', 'y1', 100);
        console.log(result);
        test.equal(result.xAxis.length, 100, 'smooth should return xAxis of length 100.');
        test.equal(Object.keys(result.yFrequency).length, 1, 'smooth should return string results as well as numeric results');
        test.done();
    },
};