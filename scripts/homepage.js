$(document).ready(function() {
  var config = {
    standings: [],
    players: [],
    title: "",
    team: ""
  };
  //Values for d3 svg
  var margin = {top: 20, right: 20, bottom: 20, left: 45};
  var width = 700 - (margin.left - margin.right);
  var height = 555 - (margin.top - margin.bottom);

  //Must be inside the post to access the data
  $.post("/api/getTeamStanding", function(data) {
    config.standings = data;
    console.log(config.standings);
    config.standings.sort(function(a, b){
      return a.Rank-b.Rank
    })
    //Write conference standings table
    $.each(config.standings, function (index, val) {
        var newRow = $("<tr><td>"+val.Rank+"</td><td>"+val.Team_City+ " " +val.Team_Name+
                        "</td><td>"+val.Wins+"</td><td>"+val.Losses+
                        "</td><td>"+val.Points+"</td></tr>");
        $("#standingsTable").append(newRow);
    });
  });

  //Must be inside the post to access the data
  $.post("/api/getPlayers", function(data) {
    config.players = data;
    config.title = config.players[0].Team_City + " " + config.players[0].Team_Name
    config.team = config.players[0].Team_Name
    $('<div id="title"></div>').appendTo('#teamHeader');
    $('<h2>'+config.title+'</h2>').appendTo('#title');
    console.log(config.players);

    //Write Team Performance Overview

    //Axis and Scale Definition
    var xScale = d3.scaleLinear()
        .domain(d3.extent(config.players, function(d) {
          return d.Goals;
        }))
        .range([0, width]);
    var xAxis = d3.axisBottom(xScale);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(config.players, function(d) {
          return d.Assists;
        }))
        .range([height, 0]);
    var yAxis = d3.axisLeft(yScale);

    //Add visualization svg element to plot div
    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 20)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Add axis's to svg
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left )
      .attr("x",0 - (height / 2))
      .attr("dy", "20px")
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .text("Assists");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .text("Goals");

    //Draw scatter plot nodes
    svg.selectAll(".dot")
        .data(config.players)
      .enter().append("circle")
        .attr("class", "player")
        .attr("r", 5)
        .attr("cx", function(d) {
          return xScale(d.Goals);
        })
        .attr("cy", function(d) {
          return yScale(d.Assists);
        })
        .style("fill", "red")
        //Apply tooltip on hover of dot elements
        .append("svg:title")
            .text(function(d,i){
              var tooltip = d.First_Name + " " +d.Last_Name+ " (" +d.Jersey_Num+ ")\n"
                            + "Goals: " +d.Goals+ "\t" + "Assists: " +d.Assists+ "\n"
                            + "Position: " + d.Pos
              return tooltip;
            });
  });



});
