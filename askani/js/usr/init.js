$(document).ready(function () {
    var gacode;
    if (window.location.hostname !== 'askani.net') {
        // Share
        $('#shareaskani').remove();

        // Analytics
        $.get("js/usr/gacode.js", function(data) {
            gacode = data;
            if (gacode) {
                $.gaTrack(gacode);
            }
        });
    } else {
        stLight.options({
            publisher:'6cbefb55-0497-4fec-b520-0d552fb726d6',
            st_title: 'Askani - Django models generator',
            st_url: 'http://askani.net/',
            onhover: false
        });
    }
});
