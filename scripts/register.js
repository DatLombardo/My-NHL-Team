$.post("/api/getTeams", function(data) {
  $.each(data, function(i, obj) {
    $('#team').append($('<option>', {
          value: obj.Name,
          text : obj.City + " " + obj.Name
    }));
  });
});
