var DATA = {};

var sampleDataFiles = [
    {
        title: " Wine Quality ",
        desc: "A collection of measurements made on thousands of Portuguese wines, " +
              "along with a subjective quality assessment made by a panel of tasters. " +
              "You can see interesting patterns such as higher alcohol content " +
              "leading to higher perception of quality and lower residual sugars.",
        orig: "http://archive.ics.uci.edu/ml/datasets/Wine+Quality",
        link: "data/wine-quality-dataset.csv"
    },
    {
        title: " Car MPG ",
        desc: "A comparison of car performance from the 90s. It shows " +
              "that increased weight, displacement, cylinders, and cycles all lead to fewer miles per " +
            "gallon",
        orig: "http://archive.ics.uci.edu/ml/datasets/Auto+MPG",
        link: "data/auto-mpg-dataset.csv"
    },
    {
        title: " CPU Performance ",
        desc: "A comparison of computer performance. Not surprisingly, performance goes up "+
              "with increased main memory and cache size. ",
        orig: "http://archive.ics.uci.edu/ml/datasets/Computer+Hardware",
        link: "data/cpu-perf-dataset.csv"
    },
    {
        title: " Median Home Price ",
        desc: " Concerns housing prices in suburbs of Boston ",
        orig: "http://archive.ics.uci.edu/ml/datasets/Housing",
        link: "data/home-price-dataset.csv"
    },
    {
        title: " Parkinsons Severity ",
        desc:  "A comparison of features in a patient's voice that may be correlated with Parkinsons Severity (total_UPDRS). " +
        "Shimmer is a class of features capturing fluctuations in the volume of speech, while jitter captures changes in frequency. ",
        orig: "http://archive.ics.uci.edu/ml/datasets/Parkinsons+Telemonitoring",
        link: "data/parkinsons-dataset.csv"
    },
    {
        title: " Forest Fire Area ",
        desc: "A dataset of variables that may be correlated with the observed area of forest fires in a " +
            "national park. Not surprisingly, the presence of rain correlated negatively with the area of " +
            "any fire",
        orig: "http://archive.ics.uci.edu/ml/datasets/Forest+Fires",
        link: "data/forest-fire-dataset.csv"
    },
    {
        title:" Bike Share Usage ",
        desc: " Daily records of participation and membership in a community bike sharing program. " +
        "Notably, usage goes up on warmer days but down on windy and very humid days. ",
        orig: "http://archive.ics.uci.edu/ml/datasets/Bike+Sharing+Dataset",
        link: "data/bike-sharing-dataset.csv"
    },
    {
        title:" Banknote Forgery ",
        desc: " This dataset looks at various statistics of scanned images of banknotes to detect forgeries. ",
        orig: "http://archive.ics.uci.edu/ml/datasets/banknote+authentication",
        link: "data/banknote-authentication-dataset.csv"
    },
    {
        title: " Breast Cancer ",
        desc: " This dataset attempts to distinguish between benign and malignant mammography masses.",
        orig: "http://archive.ics.uci.edu/ml/datasets/Mammographic+Mass",
        link: "data/breast-cancer-dataset.csv"
    },
    {
        title: " Diabetes Risk Factors ",
        desc: " This dataset was collected from a sample of Pima indians, an ethnic group at high risk for diabetes. ",
        orig: "http://archive.ics.uci.edu/ml/datasets/Pima+Indians+Diabetes ",
        link: "data/diabetes-dataset.csv"
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
                    $('#description-text').empty();
                    $('#description-link').empty();
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
                    $('#description-text').text(sampleDataFiles[index].desc);
                    $('#description-link')
                        .text('(source)')
                        .attr('href',(sampleDataFiles[index].orig));
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