$(document).ready(function() {

    $('#wait-page').fadeOut("slow", function() {
        $('#wrapper').fadeIn("slow");
    });

    $('#submit').on('click', function () {
        $(this).button('loading')
    });

    $('select').selectToAutocomplete();

    $('[data-toggle="popover"]').mouseover(function() {
        $(this).popover('show');
    });

    $('[data-toggle="popover"]').mouseout(function() {
        $(this).popover('hide');
    });

});
