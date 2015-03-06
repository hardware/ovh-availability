var domains = [
'gmail.com','hotmail.fr','aliceadsl.fr','free.fr','hotmail.com','sfr.fr','wanadoo.fr','yahoo.com','laposte.net',
'voila.fr','orange.fr','ovh.net','outlook.com','live.fr','yahoo.fr','ymail.com','gmx.fr','gmx.com','gmx.net',
'msn.com','online.fr','hushmail.com','openmailbox.org','opmbx.org'
];

var secondLevelDomains = [
'gmail','hotmail','aliceadsl','free','hotmail','sfr','wanadoo','yahoo','laposte',
'voila','orange','ovh','outlook','live','yahoo','ymail','gmx','gmx','msn','online',
'hushmail','openmailbox','opmbx'
];

var topLevelDomains = ['com','fr','com','net','org'];
var mailInput = $('input[name="mail"]');

mailInput.on('blur', function() {

  $( this ).mailcheck({

    domains:domains,
    secondLevelDomains:secondLevelDomains,
    topLevelDomains:topLevelDomains,

    suggested: function( element, suggestion ) {
      mailInput.after('<span class="help-block">Vous voulez dire <a id="suggestion" href="javascript:{}">' + suggestion.full + '</a> ?</span>');
    },

    empty: function( element ) {
      mailInput.next().remove();
    }

  });

});

$( document ).on( 'click', '#suggestion', function() {

    mailInput.val( $('a#suggestion').text() );
    mailInput.next().remove();

});
