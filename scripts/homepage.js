$(document).ready(function() {
  var config = {
    standings: [],
    players: [],
    title: "",
    team: "",
    colours: []
  };
  //Values for d3 svg
  var margin = {top: 20, right: 20, bottom: 20, left: 45};
  var width = 700 - (margin.left - margin.right);
  var height = 555 - (margin.top - margin.bottom);

  //Must be inside the post to access the data
  $.post("/api/getTeamStanding", function(data) {
    config.standings = data;
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
  $.post("/api/getTeamColour", function(data) {
    config.colours.push(data[0].Colours[0])
    config.colours.push(data[0].Colours[1])
  });

  //Must be inside the post to access the data
  $.post("/api/getPlayers", function(data) {
    config.players = data;
    config.title = config.players[0].Team_City + " " + config.players[0].Team_Name
    config.team = config.players[0].Team_Name
    $('<h2 id="headerName">'+config.title+'</h2>').appendTo('#title');
    $('#headerName').css("color", "#"+config.colours[0], 'important');
    $('#standingsTitle').css("color", "#"+config.colours[0], 'important');
    $('#plotTitle').css("color", "#"+config.colours[0], 'important');
    $('#topPlayersTitle').css("color", "#"+config.colours[0], 'important');
    $('#goaliesTitle').css("color", "#"+config.colours[0], 'important');
    $('#homeButton').css("color", "#"+config.colours[0], 'important');
    $('#loginButton').css("color", "#"+config.colours[0], 'important');
    $('#registerButton').css("color", "#"+config.colours[0], 'important');
    $('#logoutButton').css("color", "#"+config.colours[0], 'important');
    $('#icon').prepend('<img id="theImg" src="/logos/'+config.team+'.png" />');
    //Sort players based on points to determine top players
    config.players.sort(function(a, b){
        return b.Points-a.Points
    });

    //Filter to find only goalies for goalie list
    var goalies = config.players.filter(function(f) {
      return f.Pos == "G"
    });

    for (var i = 0; i < 3; i++){
      var currPlayer = config.players[i]
      $("#playerList").append('<li class="list-group-item"><h4>'
            +currPlayer.First_Name+ " " +currPlayer.Last_Name+
            " (#" +currPlayer.Jersey_Num+")"+'</h4><p>'+
            "&nbsp&nbsp&nbsp&nbspGames Played: " +currPlayer.Games_Played
            + "&nbsp&nbsp&nbspGoals: "+currPlayer.Goals+
            "&nbsp&nbsp&nbspAssists: "+currPlayer.Assists
            +'</p></li>');
    }
    for (var i = 0; i < goalies.length; i++){
      $("#goalieList").append('<li class="list-group-item"><h4>'
            +goalies[i].First_Name+ " " +goalies[i].Last_Name+
            " (#" +goalies[i].Jersey_Num+")"+'</h4></li>');
    }

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
        .style("fill", config.colours[1])
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
