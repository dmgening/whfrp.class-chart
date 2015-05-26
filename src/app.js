var d3 = require('d3');

var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120;

//var svg = d3.select('#classwheel')[0]
//    .append('g')
//    .attr('transform', 'translate(' + radius + ',' + radius ');')

//var bundle = d3.layout.bundle(),
//    link = svg.append('g').selectAll('.link'),
//    node = svg.append('g').selectAll('.node');

var cluster = d3.layout.cluster()
    .size(360, innerRadius)
    .sort(null)
    .value(function(d){ return d; });

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var active_class = undefined;

d3.json("data/careers.json", function(error, classes) {
  console.log(classes)
})





