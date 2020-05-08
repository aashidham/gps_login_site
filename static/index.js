$(function(){

    var gps_loc;

    function submit_login() {
        var username = $("#login-username").val();
        var pw = $("#login-pw").val();
        $.post("/login",{username: username, pw:pw, loc:gps_loc}, function(data){
            if(data.err){$("#login-msg").text(data.msg);}
            if(data.redirect){window.location.replace(data.redirect);}
        })
    }

    //use HTML5 Geolocation API to determine GPS location
    function get_gps_location()
    {
        navigator.permissions.query({name:'geolocation'}).then(function(result) {
            console.log("geolocation navigator permissions are",result)
                //if (result.state !== 'denied') {
                const geolocation_success = function (pos) {
                    var curr_obj = pos.coords
                    console.log("Your current position is", curr_obj);
                    gps_loc = pos.coords;
                }
                const geolocation_err = function(err) { 
                    console.log("Geolocation err",err);
                }
                const options = { enableHighAccuracy: true, timeout: 60 * 1000, maximumAge: 0 };
                navigator.geolocation.getCurrentPosition(geolocation_success, geolocation_err,options); 
        });
     
    }


    get_gps_location()

    // send login when 'Enter' key is pressed
    $("input.login").keypress(function(e){
        if(e.which === 13) submit_login()
    });

    //send login when button is pressed
    $("#login-submit").click(function(){submit_login();});


});


