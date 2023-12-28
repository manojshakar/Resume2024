
const session_live_time = 2*7*24*60*60*1000 //2 weeks

function isLoggedIn(){
    if (localStorage.getItem("expiry_time") == null)
        return false;

    current_time = Date.now()
    expiry_time = localStorage.getItem("expiry_time")

    return current_time < expiry_time
}

function bodyLoad(){
    console.log("Body Load 2")

    // to put these in cache
	$.ajax({
		url: "./header.html"
	});
	$.ajax({
		url: "./footer.html"
	});

    if(isLoggedIn()){
        formValidate();
        return;
    }

    $('.passcode').keypress(function(e) {
        if (e.which == '13') {
            e.preventDefault();
            formValidate()
            }
        });
        
    $(".loading_holder").hide()
    $(".body").show()
}

function formFocus(){
	$(".passcode").removeClass("invalid")
	$(".password-form input").addClass("focus")
	$(".password-form button").addClass("focus")
	$(".error_msg").css("display","none")
}

function formValidate(){
	$(".password-form input").removeClass("focus")
	$(".password-form button").removeClass("focus")
	$(".password-form input").attr("disabled", true)
	$(".password-form button").attr("disabled", true)
	var passcode = $(".passcode").val()
    if(passcode == null || passcode==="") passcode = localStorage.getItem("passcode", passcode)
	var htmlfile = location.href.split("/").slice(-1)[0]

	if(htmlfile == "") htmlfile="index.html"

	$.ajax({
		url: "https://resumedataprotect-60022959849.catalystserverless.in/server/PasswordProtect/?passcode="+passcode+"&filename="+htmlfile, // Replace with the URL of the API you want to access
		type: "POST",
		crossDomain: true,
		xhrFields: {
		  withCredentials: true,
		},

		success: function (data) {

			if(typeof(data) != 'string'){
				$(".passcode").addClass("invalid")
				$(".password-form input").attr("disabled", false)
				$(".password-form button").attr("disabled", false)
				var message = "The provided password is incorrect"
				if (data.reason.startsWith("Expired")){
					message = "The provided password is expired"
				}
				$(".error_msg").html(message)
				$(".error_msg").css("display","block")
			}else{

				$(".password-holder").css("display", "none")
				$("body").empty();
				//$("html").append(data)
				$("body").append(data)
				$(".header").addClass("header_shadow");
				$(".footer").load("./footer.html", function(){
					$(".footer").css("display", "block")
				});
				
				bodyLoad();

				$(".password-holder").css("display", "none")

				if(!isLoggedIn()){
					localStorage.setItem("logged_in", true)
					localStorage.setItem("passcode", passcode)
					localStorage.setItem("expiry_time", Date.now()+session_live_time)
				}
			}
		},
		error: function (xhr, textStatus, error) {
		  $(".passcode").addClass("invalid")
		  $(".password-form input").attr("disabled", false)
		  $(".password-form button").attr("disabled", false)
		  $(".error_msg").html("Unexpected Error Occurred in the valition server")
		  $(".error_msg").css("display","block")
		},
	  });
	
}
