$.post("/api/getTeams", function(data) {
  //Draw the drop menu for registration
  $.each(data, function(i, obj) {
    $('#team').append($('<option>', {
          value: obj.Name,
          text : obj.City + " " + obj.Name
    }));
  });
});
