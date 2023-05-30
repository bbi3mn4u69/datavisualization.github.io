var diagramWidth = 1000;
var diagramHeight = 600;

// Draw a SVG
var svgDiagram = d3
  .select("#sankey")
  .append("svg")
  .attr("width", diagramWidth)
  .attr("height", diagramHeight)
  .append("g")
// Sankey color
var colorPalette = d3.scaleOrdinal(d3.schemeCategory10);

// Set the sankey diagram properties
var sankeyDiagram = d3
  .sankey()
  .nodeWidth(50)
  .nodePadding(10)
  .size([diagramWidth, diagramHeight]);

// Data from a json file
d3.json("sankey.json", function (graphData) {
  sankeyDiagram //Create a sankey
    .nodes(graphData.nodes)
    .links(graphData.links)
    .layout(1);

  // Add the links
  var diagramLink = svgDiagram
    .append("g")
    .selectAll(".link")
    .data(graphData.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankeyDiagram.link())
    .style("stroke-width", function (d) { return d.dy; })
    .sort(function (a, b) { return b.dy - a.dy; })
    .on("mouseover", function (d) {
      // Show tooltip on mouseover
      d3.select("#tooltip")
        .style("opacity", 1)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px")
        .html(
          "<div style='background-color: white; padding: 10px; border: 1px solid gray;'>Origin Country: " +
          d.source.name +
          "<br/>" +
          "Destination Region: " +
          d.target.name +
          "<br/>" +
          "Number of refugees: " +
          d.value +
          "</div>"
        );
    })
    .on("mouseout", function () {
      // Hide tooltip on mouseout
      d3.select("#tooltip").style("opacity", 0);
    });

  // Add the nodes
  var diagramNode = svgDiagram
    .append("g")
    .selectAll(".node")
    .data(graphData.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.drag().subject(function (d) { return d; })
      .on("start", function () { this.parentNode.appendChild(this); })
      .on("drag", Drag));

  // Rect of the node
  diagramNode
    .append("rect")
    // .attr("x", function(d) {return d.x0;})
    // .attr("y", function(d) {return d.y0;})
    .attr("height", function (d) { return d.dy; })
    .attr("width", sankeyDiagram.nodeWidth())
    .style("fill", function (d) { return (d.color = colorPalette(d.name.replace(/ .*/, ""))); })
    .style("stroke", "black")
    .append("title")
    .text(function (d) { return d.name + ": " + d.value + " refugees"; });

  // Title of the node
  diagramNode
    .append("text")
    .attr("y", function (d) { return d.dy / 2; })
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .text(function (d) { return d.name; })
    .filter(function (d) { return d.x < diagramWidth / 2; })
    .attr("x", sankeyDiagram.nodeWidth() + 10)
    .attr("text-anchor", "start");

  // Drag the node
  function Drag(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(diagramHeight - d.dy, d3.event.y))) + ")");
    sankeyDiagram.relayout();
    diagramLink.attr("d", sankeyDiagram.link());
  }
});
