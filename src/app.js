var d3 = require('d3');

var diameter = 1000,
    radius = diameter / 2,
    innerRadius = radius - 180;

var svg = d3.select('#classwheel').append('g')
    .attr("transform", "translate(" + radius + "," + radius + ")");

var bundle = d3.layout.bundle(),
    link = svg.append('g').selectAll('.link'),
    node = svg.append('g').selectAll('.node');

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
//    .value(function(d){ return d.id.length; });

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.15)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var active_career = undefined;
var careers = {}

function IDOrName(id){
  if(careers[id]){
    return careers[id].name;
  }
  return id;
}

function setActive(career_name){
  if(careers[career_name]){
    d3.select('#list_'+active_career).classed('active', false)
    d3.select('#wheel_'+active_career).classed('active', false)
    active_career = career_name;
    showTooltip(career_name);
    d3.select('#list_'+active_career).classed('active', true)
    d3.select('#wheel_'+active_career).classed('active', true)
  } else {
    console.log('Sorry! No record in db for ' + career_name);
  }
}

function mouseOver(d){
  showTooltip(d.id);  
} 

function mouseOut(d){
  showTooltip(active_career);
}

function showTooltip(career_name){
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
    .append('li').append('a').on('click', setActive).text(IDOrName);
  d3.select('#exits').selectAll('li').remove();
  d3.select('#exits').selectAll('li').data(career.exits).enter()
    .append('li').append('a').on('click', setActive).text(IDOrName);
}

// List functions
var career_list = d3.select('#classlist ul').selectAll('li')
function filterList(text){
}


d3.json("data/careers.json", function(error, data) {
  data.forEach(function(d){ careers[d.id] = d; });

  career_list = career_list.data(Object.keys(careers))
  list = career_list.enter().append('li').attr('id', function(d){ return 'list_' + d; });
  list.append('a').text(function(d){ return careers[d].name }).on('click', setActive);
  list.append('span').attr('class', function(d){
    return 'pull-right label label-' + careers[d].type.toLowerCase();
  }).text(function(d){ return careers[d].type[0]; });
  
  // Search form
  d3.select('#searchform input').on('input', function(d){
    var text = this.value
    if(text){
      career_list.classed('hidden', false).classed('hidden', function(d){ return careers[d].name.indexOf(text) < 0; });
    } else {
      career_list.classed('hidden', false)
    }
  });

  var nodes = cluster.nodes(function(){
    var map = {"": {id: "", children: []}};
    data.forEach(function(d){
      map[""].children.push({id: d.id, children:[]}) 
    })
    return map[""];
  }());
  var links = function(){
    var map = {}, links = [];
    nodes.forEach(function(d){ map[d.id] = d; });
    nodes.forEach(function(d){
      function appendImports(i){
        if(map[i]){
          links.push({source: map[d.id], target: map[i]});
        }
      }
      c = d.id && careers[d.id]
      if(c.entries && c.exits){
        c.entries.forEach(appendImports);
        c.exits.forEach(appendImports);
      }
    });
    return links;
  }();
  link = link
    .data(bundle(links))
    .enter().append("path")
    .each(function(d) {
      d.source = d[0], d.target = d[d.length - 1]; 
    })
    .attr("class", "link")
    .attr("d", line);
  node = node.data(nodes.filter(function(n) { return !n.children; }))
    .enter().append("text")
    .attr("class", "node")
    .attr("dy", ".31em")
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
    .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .attr('id', function(d){ return 'wheel_' + d.id; })
    .text(function(d) { return careers[d.id].name; })
    .on('click', function(d){ setActive(d.id) })
    .on('mouseover', mouseOver)
    .on('mouseout', mouseOut)
  
  
});
