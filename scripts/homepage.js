$.post("/api/getTeamStanding", function(data) {
  console.log(data);
  // parse data and display using d3 here
});

$.post("/api/getPlayers", function(data) {
  console.log(data);
  // parse data and display using d3 here
});
team = d3.select("#teamHeader");
team.attr("height", 400);
console.log(team);
