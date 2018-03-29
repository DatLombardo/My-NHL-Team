$.post("/api/getTeams", function(data) {
  $.each(data, function(i, obj) {
    $('#team').append($('<option>', {
          value: obj.Name,
          text : obj.City + " " + obj.Name
    }));
  });
  // parse data and display using d3 here
});
