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
    }
});
