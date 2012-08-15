$(function(){
    "use strict";
	function newRow(){
        var row = "<li class='item'><input type='text' /><input type='text' class='cabelPrice' /><input type='text' class='metalContent' /><select name='metalType'><option value='Cu'>Cu</option><option value='Al'>Al</option></select><input type='text' class='cutPrice' /><input type='checkbox' class='midship' name='midship'><span class='articlePrice priceArticle'></span><span class='articlePrice pricePlate'></span></li>";
        return row;    
	}

    var dotToComma = function ( withComa ) {
		return withComa.replace(/,/, '.'); 
	};
		
    function Total(){
        var totalCost = 0;
        this.addTotal = function(total){
            totalCost += parseFloat(total);
        };
        this.getTotal = function(){
            return totalCost.toFixed(2);
        };
    }
	
	function Item(price, content, type, length, check){
        var cabelPrice = price,
			metalContent = content,
			metalType = type,
			cutLength = length,
			isChecked = check,
			usrCfg = {
				surchargeCopper : parseFloat( dotToComma($('input#surchargeCopper').val())),
				surchargeAluminium : parseFloat( dotToComma($('input#surchargeAluminium').val())),
				euroRate : parseFloat( dotToComma($('input#euroRate').val())),
				shipping : parseFloat( dotToComma($('input#shipping').val())) || 0 ,
				cutPrice : parseFloat( dotToComma($('input#cutPrice').val())) || 0
			};
			
			for( var property in usrCfg){
				var selector = "";
				if( isNaN(usrCfg[property]) ){
					selector = "#"+property;
					$(selector).addClass("input-error");
				}else{
					selector = "#"+property;
					$(selector).removeClass("input-error");
				}
			}
		
		this.getPrice = function(){
            var basePrice = 0;
            if(metalType === "Cu"){
                basePrice = (((metalContent * usrCfg.surchargeCopper) + cabelPrice) / 1000) * usrCfg.euroRate;
                return parseFloat(basePrice.toFixed(2));
            }else{
                basePrice = (((metalContent * usrCfg.surchargeAluminium) + cabelPrice) / 1000) * usrCfg.euroRate;
                return parseFloat(basePrice.toFixed(2));
            }
        };
		
        this.getPriceWithShipping = function(price){
            return parseFloat((price * ((usrCfg.shipping / 100) + 1)).toFixed(2));
        };
		
        this.setCuttingLength = function(){
            if (isChecked === true){
                return 25;
            }else{
                return 100;
            }
        };
		
        this.getPriceWithCut = function(){
            var cutFee = 0,
                priceWithCut = 0;
            if(cutLength > 0 && cutLength < this.setCuttingLength()){
                cutFee = ((usrCfg.cutPrice * usrCfg.euroRate) / cutLength);
                priceWithCut = (this.getPrice() + cutFee).toFixed(2);
                return priceWithCut;
            }else{
                priceWithCut = (this.getPrice()).toFixed(2);
                return priceWithCut;
            }
        };
    } // end Item

	//////////////////////////////////
    $('.articleList').append(newRow());
	
    $('#buttonNextRow').on("click", function(){
        $('.item:last').after(newRow);
            $('.item:last').hide().fadeIn(300);
    });
	
	$('#buttonDelRow').on("click", function(){
        var ulLength = $('li.item').length;
		console.log(ulLength);
		if( ulLength > 1){
			$('.item:last').fadeOut(300, function(){
				$(this).remove();
			});
		}
    });
	
	$('#buttonGetPrice').on("click", function(){
		var totalCost = new Total();
			
		$('li.item').each(function(){ 
			var cabelPrice = parseFloat (dotToComma ( $('input.cabelPrice', this).val())),
				metalContent =  parseFloat (dotToComma ( $('input.metalContent', this).val())),
				metalType = dotToComma ( $(':selected', this).val()),
				cutLength =  parseFloat ( dotToComma ( $('input.cutPrice', this).val())),
				isChecked = $('input.midship', this).is(':checked');
	
				if( isNaN(cabelPrice) && isNaN(metalContent) ){
					$('input.cabelPrice', this).addClass("input-error");
					$('input.metalContent', this).addClass("input-error");
				}else if( isNaN(cabelPrice)){
					$('input.metalContent', this).removeClass("input-error");
					$('input.cabelPrice', this).addClass("input-error");
				}else if ( isNaN(metalContent) ){	
					$('input.cabelPrice', this).removeClass("input-error");
					$('input.metalContent', this).addClass("input-error");
				}else{
					var item = new Item(cabelPrice, metalContent, metalType, cutLength, isChecked);
					$('input.cabelPrice', this).removeClass("input-error");
					$('input.metalContent', this).removeClass("input-error");	
					
					var pricePerM = item.getPriceWithShipping(item.getPriceWithCut());
						$('span.pricePlate', this).html(pricePerM+' Kč/m');
						
						var price = (pricePerM * cutLength).toFixed(2);
							if (isNaN(price)){
								$('span.priceArticle', this).html("Zadej délku");
							}else{
								$('span.priceArticle', this).html(price+' Kč');
								totalCost.addTotal(price);
							}
				}
		});

		$('span.priceTotal').html(totalCost.getTotal()+' Kč'); 
		
    });
	
	$('#help-mark').on("click", function(){
		var display = $('#help').css('display');
		if (display === "none"){
			$('#help').fadeIn(500);
		}else{
			$('#help').fadeOut(500);
		}
	});
	$('#help').on("click", function(){
		$('#help').fadeOut(500);
	});
});
