/*
 * datascope
 * https://github.com/olcayc/datascope.git
 *
 * Copyright (c) 2014 Olcay Cirit
 */


'use strict';

var kernels = {
    gaussian: function (u) {
        return 0.3989422804 * Math.exp(-0.5 * u * u);
    },

    epanechnikov: function (u) {
        return u <= 1.0 ? 0.75 * (1.0 - u * u) : 0;
    },

    uniform: function (u) {
        return u <= 1.0 ? 0.5 : 0;
    }
};

function smooth(data, xColumn, yColumn, numPoints, kernelFunction) {

    numPoints = numPoints || 100;
    kernelFunction = kernelFunction || kernels.gaussian;

    // Select desired x column and y column from data,
    // separate x values into numeric and string values
    var num = [];
    var str = [];

    var moment = require('moment');

    (function () {
        for (var row in data) {
            var xValue = data[row][xColumn];
            var yValue = data[row][yColumn];
            var point = {
                x: xValue,
                y: yValue
            };
            if (typeof xValue === 'string') {
                var asDate = moment(xValue);
                if (asDate.isValid()) {
                    point.x = asDate.unix();
                    num.push(point);
                }
                else {
                    str.push(point);
                }
            } else if (typeof xValue === 'number') {
                num.push(point);
            }
        }
    }());

    if (num.length === 0) {
        return {
            xAxis: [],
            xDensity: [],
            yMean: [],
            yFrequency: []
        };
    }
    // Sort numeric data by x value, compute minimum, maximum
    // and 1st and 99th percentiles, mean and standard deviation
    num.sort(function (a, b) {
        return a.x - b.x;
    });

    var points = num.length;
    var minimum = num[0].x;
    var maximum = num[points - 1].x;
    var percentile01 = points >= 100 ? num[Math.round(0.01 * points)].x : minimum;
    var percentile99 = points >= 100 ? num[Math.round(0.99 * points)].x : maximum;

    var mean = 0.0;
    var standardDeviation = 0.0;

    (function () {
        var n = 0.0;
        var M2 = 0.0;

        for (var row in num) {
            var delta = num[row].x - mean;
            n += 1.0;
            mean += delta / n;
            M2 += delta * (num[row].x - mean);
        }
        standardDeviation = Math.sqrt(M2 / (n - 1));
    }());

    // Calculate kernel bandwidth using Silverman's rule of thumb

    var kernelBandwidth = 1.06 * standardDeviation * Math.pow(points, -0.2);

    // xAxis: uniformly spaced x axis grid points for computing kernel estimate
    // xDensity: to contain smooth kernel density estimate of x
    // yMean: smoothed conditional means of numeric values of y
    // yFrequency: smoothed conditional means of string values of y

    var xAxis = [];
    var xDensity = fillNumericArray(numPoints, 0.0);
    var yMean = fillNumericArray(numPoints, 0.0);
    var yFrequency = {};

    (function () {
        var delta = (percentile99 - percentile01) / (numPoints - 1.0);
        for (var i = 0; i < numPoints; i++) {
            xAxis.push(percentile01 + i * delta);
        }
    }());

    // Perform convolution

    var scalingFactor = 1.0 / kernelBandwidth;

    for (var row in num) {
        var xi = num[row].x;
        var yRaw = num[row].y;
        var yi;
        var yTarget;

        // If the value to be predicted is a string,
        // make sure we have space to track it

        if (typeof yRaw === 'string') {
            if (!yFrequency.hasOwnProperty(yRaw)) {
                yFrequency[yRaw] = fillNumericArray(numPoints, 0.0);
            }
            yi = 1.0;
            yTarget = yFrequency[yRaw];
        } else {
            yi = yRaw;
            yTarget = yMean;
        }

        for (var j = 0; j < numPoints; j++) {
            var k = kernelFunction((xAxis[j] - xi) * scalingFactor);
            xDensity[j] += k;
            yTarget[j] += k * yi;
        }
    }

    // normalize and return results

    function normalize(yArray) {
        for (var i = 0; i < numPoints; i++) {
            yArray[i] = yArray[i] / xDensity[i];
        }
    }

    normalize(yMean);

    for (var key in yFrequency) {
        normalize(yFrequency[key]);
    }

    var xSum = 0.0;
    for (var xj = 0; xj < numPoints; xj++) {
        xSum += xDensity[xj];
    }
    for (var xk = 0; xk < numPoints; xk++) {
        xDensity[xk] /= xSum;
    }


    var result = {
        xAxis: xAxis,
        xDensity: xDensity,
        yMean: yMean,
        yFrequency: yFrequency
    };

    return result;
}


function generateFakeData(rows) {

    // Generates an array of objects containing fake data
    var result = [];
    for (var i = 0; i < rows; i++) {
        var row = {};
        for (var j = 1; j <= 5; j++) {
            row['x' + j] = Math.random() < 0.01 ? 'Missing' : Math.random();
        }

        row.y1 = row.x1 !== 'Missing' && row.x2 !== 'Missing' ? row.x1 * row.x1 + 0.05 * row.x2 : 'Missing';
        row.y2 = row.x3 !== 'Missing' ? Math.sin(row.x3 * Math.PI) : 'Missing';
        row.y3 = row.x4 !== 'Missing' ? Math.round(row.x4 * 10) : 'Missing';
        result.push(row);
    }
    return result;
}

function fillNumericArray(length, value) {
    return Array.apply(null, new Array(length)).map(Number.prototype.valueOf, value);
}

exports.smooth = smooth;
exports.generateFakeData = generateFakeData;
exports.kernels = kernels;