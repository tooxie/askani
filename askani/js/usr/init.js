/*jslint
         bitwise: true,
         eqeqeq: true,
         immed: true,
         indent: 4,
         newcap: true,
         nomen: false,
         onevar: true,
         plusplus: true,
         regexp: false,
         undef: true,
         white: true
*/
/*global $,
         document,
         stLight,
         window
*/
$(document).ready(function () {
    var gacode,
        host = window.location.hostname;
    if (host === 'askani.net' || host === 'www.askani.net') {
        // Analytics
        $.get("js/usr/gacode.js", function (data) {
            gacode = data;
            if (gacode) {
                $.gaTrack(gacode);
            }
        });
        stLight.options({
            publisher: '6cbefb55-0497-4fec-b520-0d552fb726d6',
            st_title: 'Askani - Django models generator',
            st_url: 'http://askani.net/',
            onhover: false
        });
    } else {
        // Share
        $('#shareaskani').remove();
    }
    $('a[href^="http"]').live('click', function () {
        window.open(this.href);
        return false;
    });
});
