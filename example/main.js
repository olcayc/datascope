var DATA = {};

var sampleDataFiles = [
    {
        title: " Wine Quality ",
        link: "data/wine-quality-dataset.csv"
    },
    {
        title: " Car MPG ",
        link: "data/auto-mpg-dataset.csv"
    },
    {
        title: " CPU Performance ",
        link: "data/cpu-perf-dataset.csv"
    },
    {
        title: " Median Home Price ",
        link: "data/home-price-dataset.csv"
    },
    {
        title: " Parkinsons Severity ",
        link: "data/parkinsons-dataset.csv"
    },
    {
        title: " Forest Fire Area ",
        link: "data/forest-fire-dataset.csv"
    },
    {
        title: " Bike Share Usage ",
        link: "data/bike-sharing-dataset.csv"
    }
];

var csvParseConfig = {
    delimiter: "",
    header: true,
    dynamicTyping: true
};

$(function () {
    $('input[type=file]').bootstrapFileInput();

    loadSampleFiles();

    $('#file').change(function () {
        if (this.files.length > 0) {

            $('#file').parse({
                before: function (file, inputElem) {
                    $('#example-btn-text').text(' Examples ');
                    pauseUI(true);
                },
                error: function (err, file, elem) {
                    console.log("Error loading " + (file ? file.name : "files") + ": " + err.name);
                },
                complete: function (data, file, inputElem, event) {
                    newData(data);
                },
                config: csvParseConfig
            });
        }
    });

});

function pauseUI(trueIfPaused) {
    $('#file').prop('disabled', trueIfPaused);
    if (trueIfPaused) {

    }
    else {

    }
}

function loadSampleFiles () {
    function populateCallback(index) {
        return function (data) {
            $('<li/>')
                .text(sampleDataFiles[index].title)
                .click(function() {
                    $('span.file-input-name').empty();
                    $('#example-btn-text').text('Example: ' + this.innerText);
                    newData($.parse(data,csvParseConfig));
                })
                .appendTo($('ul#examples'))
        };
    }
    $.each(sampleDataFiles, function(i) {
        $.get(sampleDataFiles[i].link,'',populateCallback(i));
    });
}

function newData(data) {
    // Build target selection nav based on field names in csv
    // header. Assume last field is the prediction target

    DATA = data;
    var fieldList = data.results.fields;
    var lastField = fieldList.length - 1;

    var targetList = $('ul.targets');
    targetList.empty();

    $.each(fieldList, function (i) {
        var li = $('<li/>');
        li.click(selectTarget);
        if (i === lastField)
            li.addClass('active');
        li.appendTo(targetList);

        var aaa = $('<a/>')
            .text(fieldList[i])
            .appendTo(li);
    });

    update(fieldList[lastField]);
    pauseUI(false);
}


function selectTarget(event) {
    var targets = $('ul.targets li');
    var clicked = this;
    targets.each(function (index, li) {
        li.removeAttribute('class');
        if (li === clicked) li.classList.add('active');
    });

    var selected = clicked.innerText.trim();
    update(selected);
}

function detectSelected() {
    var cList = $('ul.targets li');

    var selected = "";
    cList.each(function (index, li) {
        if (li.className === 'active') {
            selected = li.innerText.trim();
        }

    });
    return selected;
}

function update(target) {

    var data = DATA;
    var yColumn = target || detectSelected();

    var datascope = require('datascope');
    var results = {};

    var fieldList = data.results.fields;

    $('svg.sparkline').empty();
    $('span.label').empty();

    var fieldsCompleted = 0;
    for (var xIndex in fieldList) {
        var xColumn = fieldList[xIndex];
        if (xColumn !== yColumn) {
            fieldsCompleted++;

            results = datascope.smooth(data.results.rows, xColumn, yColumn, 100);

            var chartData = [];
            for (var i = 0; i < results.xAxis.length; i++) {
                var point = {x: results.xAxis[i],
                    y: results.yMean[i]
                };
                chartData.push(point);
            }
            $('#field' + fieldsCompleted).text(xColumn);
            bindSparkline('#chart'+fieldsCompleted,chartData);
        }
    }
}


function bindSparkline(containerId, data) {
    nv.addGraph(function() {

        var chart = nv.models.sparklinePlus()

        chart
            .margin({left:70})
            .x(function(d,i) { return i });

        d3.select(containerId)
            .datum(data)
            .transition().duration(250)
            .call(chart);

        return chart;
    });
}