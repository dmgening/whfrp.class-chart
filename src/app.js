var d3 = require('d3');

var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 120;

var svg = d3.select('#classwheel').append('g')
    .attr("transform", "translate(" + radius + "," + radius + ")");

var bundle = d3.layout.bundle(),
    link = svg.append('g').selectAll('.link'),
    node = svg.append('g').selectAll('.node');

var cluster = d3.layout.cluster()
    .size(360, innerRadius)
    .sort(null)
    .value(function(d){ return d; });

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var active_career = undefined;
var careers = undefined

function IDOrName(id){
  if(careers[id]){
    return careers[id].name;
  }
  return id;
}

function updateActive(career_name){
  if(careers[career_name]){
    active_career = career_name;
    updateTooltip(career_name);
  } else {
    console.log('Sorry! No record in db for ' + career_name);
  }
}

function updateTooltip(career_name){
  career = careers[career_name];
  d3.select('#classname').text(career.name);
  d3.select('#quote').text(career.quote);
  d3.select('#skills').text(career.skills);
  d3.select('#talents').text(career.talents);
  d3.select('#trappings').text(career.trappings);
  d3.select('#description').text(career.description);

  d3.select('#main-profile').selectAll('td')
    .data(career.mainprofile).text(function(d){ return d; });
  d3.select('#secondary-profile').selectAll('td')
    .data(career.secondaryprofile).text(function(d){ return d; });

  d3.select('#entries').selectAll('li').remove();
  d3.select('#entries').selectAll('li').data(career.entries).enter()
    .append('li').append('a').on('click', updateActive).text(IDOrName);
  d3.select('#exits').selectAll('li').remove();
  d3.select('#exits').selectAll('li').data(career.exits).enter()
    .append('li').append('a').on('click', updateActive).text(IDOrName);
}


d3.json("data/careers.json", function(error, classes) {
  function packageHierarchy(careers){
    return careers;
  }

  function packageImports(careers){
    return careers;
  }

  careers = classes;
  var nodes = cluster.nodes(packageHierarchy(careers)),
      links = packageImports(nodes);

  lis = d3.select('#classlist ul').selectAll('li').data(Object.keys(classes))
        .enter().append('li');
  lis.append('a').attr('id', function(d){ return '' }).text(function(d){ return classes[d].name }).on('click', updateActive)
  lis.append('span').attr('class', function(d){
    return 'pull-right label label-' + classes[d].type.toLowerCase();
  }).text(function(d){ return classes[d].type[0]; });


})
