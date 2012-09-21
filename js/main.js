/**
 * A class to Draw custom social chart using hemispheres and edges.
 * @author Mohamed Samir <mohamedsamir216@gmail.com>
 * @Date Started June 24 2012 
 * @license Client Free to use it and distribute it for commercial purposes
 */
$(document).ready(function(){
	//JSON validation before form submit
	$('#drawChart').click(function(){
		try {
			var jsonIn =$('#JSONBox').val();
			if(jsonIn == ""){
				$('#errorMsgs').show();
			}
		  	else {
		  		var c = $.parseJSON(jsonIn);
			  	
			  	 $('#dataIn').hide();
			  	 init($('#holder').attr('width'),10);

			  }
		}
		catch (err) {
			//Show the JSON error below the error message
		  	$('#errorMsgs').html($('#errorMsgs').html() +"<br/> Details:["+err+"]");
		  	$('#errorMsgs').show();
		}
	});
});