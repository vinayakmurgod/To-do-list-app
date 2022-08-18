console.log("am i working");


// //ready method for jQuery --- >
$(document).ready(function() {

  $(".quickLabals").on("click", function(){
    $(".labals").addClass("labalsCss");
    $(".labals").fadeToggle();
    });

});
