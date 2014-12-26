$(document).ready(function() {

  $('#wait-page').fadeOut("slow", function() {
    $('#wrapper').fadeIn("slow");
  });

  $('#submit').on('click', function () {
    $(this).button('loading')
  });

});
