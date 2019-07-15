var user, turnUserID, clock, actualisation, gameloaded = 0, music;

$(function(){

  console.log('------ G  A  M  E.js');

  loadGame()
  
});

function loadGame(){
	console.log('. . . LOADING . . .');
	gameloaded = 1;
	if(gameloaded){
		$('.loading').hide();
		sound('menu');
		binders();	
		isUserConnected();	
	}
}
function isUserConnected(){
	$.post( "login.php", {'checkConnected':1}, function( data ) {
		data = JSON.parse(data);
	    console.log("isUserConnected : ", data.session);
	    if(data.session){
	    	user = data.user;
	    	appendUserInfoHUD();
	    	popMenu('menu-game');
	    }else{
	    	popMenu('menu-login');
	    }
	});
}

function appendUserInfoHUD(){
	$('.hud-profile b').text(user.username);
}

function popMenu(menuName){
	$('.menu-box').hide();
	$('.'+menuName).show();
}

function connectUser(e, callback){
	username = $('.username').val();
	console.log('LOG : ', username);

	//JOIN
	$.post( "login.php", {'username':username}, function( data ) {
		data = JSON.parse(data);
	    console.log("login : ", data);
	    user = data.user;
	    appendUserInfoHUD();
	    if(callback){
	    	callback();
	    }
	});
}

function binders(){

	//LOGIN
	$('.login').submit(function(e){
		e.preventDefault();
		connectUser(event,function(){
			console.log("loged CB ");
			popMenu('menu-game');
		});
		return false;
	});

	//LOGOUT
	$('.logout').click(function(){
		$.post( "logout.php", function( data ) {
			console.log('LOGOUT /////////');
			window.location.reload();
		});
		return false;
	});

	//CREATE & JOIN GAME
	createJoin();
}


function createJoin(){
	$('.join').submit(function(e){
		e.preventDefault();
		//JOIN
		gameid = $('.gameid').val();
		$.post( "create-game.php", {'gameid': gameid}, function( data ) {
		    data = JSON.parse(data);
		    console.log(data);
		    if(data.game!='full'){
		    	enterLobby(data);	
		    }
		});
		return false;
	});

	$('.createGame').click(function(e){
		e.preventDefault();
		//CREATE
		$.post( "create-game.php", function( data ) {
		    data = JSON.parse(data);
		    console.log(data);
		    if(data.game!='full'){
		    	enterLobby(data);	
		    }
		});
		return false;
	});
}

function enterLobby(data){
	$('.menu').hide();
	gameUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?game="+data.game.id ;
	history.pushState({}, null, gameUrl);
	getGameInfo(data.game);
	actualisation = window.setInterval(function(){
		console.log('INTERVAL');
		getGameInfo(data.game);
	},1000);
	$('.game-lobby').show();


	//START GAME in lobby (from SESSION GAME ID stocked)
	$('.startGame').click(function(){
		startGame();
	})
}

function getLobbyInfo(data){
	$('.game-lobby .players').empty();
	if( Array.isArray(data.game.players) ) {
		$.each( data.game.players , function( key, player ) {
			$('.game-lobby .players').append('<li>'+player.username+'</li>')
		});
	}else{
		$('.game-lobby .players').append('<li>'+data.game.players.username+'</li>')
	}
}
function getGameInfo(game){
	// console.log("getGameInfo :: " , game);

	$.post( "game.php", {'gameid': game.id}, function( data ) {
	    data = JSON.parse(data);
	    console.log("getGameInfo :: ", data);
	    if(data.game.lobby == 1){
	    	getLobbyInfo(data);
	    }else{
			startGame();
	    }
	});
}

function startGame(){
	console.log('--------- START GAME -------');
	window.clearInterval(actualisation);
	sound('stop');
	sound('battle');
	$.post( "game.php", {'start': 1}, function( data ) {
	    data = JSON.parse(data);
	    console.log('startGame', data);
	    gridBuilder(data.game.gridNb);
		spawnPlayer(data.game.myPos);
		initGameUI(data.game);
		navigateMap();
		// initCommand();

		actualisation = window.setInterval(function(){
			getInGameData(data.game);
		},1000);

		$('.game-lobby').hide();
		$('.game-ui').show();
		$('.game').show();
	});
}

function getInGameData(game){
	
	$.post( "game.php", {'gameid': game.id}, function( data ) {
	    data = JSON.parse(data);
	    console.log("getInGameData :: ", data);

	    console.log("TURN  : --- : ", user.id , data.game.turn, user.id == data.game.turn );

	    updateGameUI(data);
	    if(data.game.end){
	    	messageGame('C FINI !');
	    	window.clearInterval(clock);
	    	window.clearInterval(actualisation);
			$('.game-ui').hide();
			$('.game').hide();
			$('.menu').show();
			sound('stop');
			sound('menu');
			popMenu('menu-game');
	    	return false;
	    }
	    
	    switch ( getTurn(data) ) {
		    case 1:
		        console.log('MY TURN BEGIN ***** '); 

		        //MESSAGE 
		        messageGame('It s your turn !');

		        //dev
	        	// window.clearInterval(actualisation);

	    		//init COMMAND GRID
	    		gridClick(1);

	    		//Set Timer
	    		console.log('RESET TIMER --------- <<<<<<<<<<<<<<<<');
	    		$('.game-ui .timer').attr('time', data.game.timer).text(data.game.timer);
	    		clock = window.setInterval(function(){
					time = $('.game-ui .timer').attr('time');
					time = time - 1;
					$('.game-ui .timer').attr('time', time).text(time);
				},1000);

				turnUserID = data.game.turn;

		        break;
		    case 2:
		        console.log('MY TURN CONTINUE +++');
		        break;
		    case 3:
		        console.log('MY TURN ENDED BY CLOCK /// ');


		        finishTurn();
		        window.clearInterval(clock);
		    	turnUserID = "";
		        break;
		    case 4:
		        console.log('MY TURN ENDED /// ');

		        finishTurn();
		        window.clearInterval(clock);
		    	turnUserID = data.game.turn;

		        break;
		    case 5:
		        console.log('NOT MY TURN ');
		        break;
		    case 6:
		        console.log('NOT MY TURN BEGIN');
		        messageGame($('.game-ui .players li#'+data.game.turn).text() +' to play !');
	    		turnUserID = data.game.turn;
		}

	  
	});
}

function finishTurn(){
	gridClick(0);
	$.post( "game.php", {'finishturn': 1}, function( data ) {
		data = JSON.parse(data);
		console.log('NEXT PLAY', data);
	});
}

function getTurn(data){

	// console.log('MY TURN BEGIN ***** ');  ==> 1
	// console.log('MY TURN CONTINUE +++');  ==> 2
	// console.log('MY TURN ENDED BY CLOCK /// ');  ==> 3
	// console.log('MY TURN ENDED /// ');  ==> 4
	// console.log('NOT MY TURN ');  ==> 5
	// console.log('NOT MY TURN BEGIN');  ==> 6

	if( user.id == data.game.turn ){
    	// console.log('MY TURN - -');
    	if( turnUserID != data.game.turn ){
    		// MY TURN BEGIN
    		// console.log('MY TURN BEGIN ***** ');
    		return 1;

    	}else{
    		time = $('.game-ui .timer').attr('time');
    		if( time == 0){
		    	// console.log('MY TURN ENDED BY CLOCK /// ');
		    	return 3;
    		}else{
    			// MY TURN CONTINUE
    			// console.log('MY TURN CONTINUE +++');
    			return 2;
    		}
    	}
    }else{
    	if( (turnUserID != data.game.turn) && (user.id == turnUserID) ){
	    	// console.log('MY TURN ENDED /// ');
	    	return 4;
    	}else{
    		if( turnUserID != data.game.turn ){
    			// console.log('NOT MY TURN BEGIN');
    			return 6;
    		}else{
    			// console.log('NOT MY TURN ');
    			return 5;
    		}
    	}
    	
    }
}
function initGameUI(game){
	players = game.players;
	$('.game-ui .players').empty();
	$.each( players , function( key, player ) {
		$('.game-ui .players').append('<li id="'+player.id+'"><b>'+player.username+'</b><span class="life"></span></li>');
		for (i = 0; i < player.life; i++) { 
			$('.game-ui .players li').last().find('.life').append('<i></i>')
		}
	});

	//INIT TIMER
	$('.game-ui .timer').attr('time', game.timer).text(game.timer);

	initSkills();
	

}

function updateGameUI(data){
	players = data.game.players;
	myEnergy = data.game.players[data.game.myIndex].energy;
	$('.game-ui .energy').text(myEnergy).attr('energy', myEnergy);
	$('.game-ui .players').empty();
	$.each( players , function( key, player ) {
		$('.game-ui .players').append('<li id="'+player.id+'"><b>'+player.username+'</b><span class="life"></span></li>');
		for (i = 0; i < player.life; i++) { 
			$('.game-ui .players li').last().find('.life').append('<i></i>')
		}
	});
}

function spawnPlayer(pos){
	$('.grid ul li').eq(pos).append('<div class="myBoat"><div class="waves"></div><div class="inside"><div class="inside-wrap"><div class="boat-img"></div></div></div></div>');
}

function initSkills(){

	$('.skills li').removeClass('active');

	$('.skills li').click(function(){

		skillID = $(this).attr('id');
		$('.skills li').removeClass('active');
		$(this).addClass('active');

		$('.grid').attr('cursor','');

		if($(this).attr('id')==3){
			$('.grid').attr('cursor','target');
		}

		if($(this).attr('id')==1){
			highlightPos();
		}else{
			highlightPos(true);
		}



	});
}

function gridClick(on){


	if(!on){
		$('.grid ul li').off().click(function(){
			$('.grid ul li').removeClass('active');
			$(this).addClass('active');
			$('.grid').attr('cursor','');
		});
		return false;
	}
	$('.grid ul li').off().click(function(){
		// window.clearInterval(actualisation);
		$('.grid').attr('cursor','');

		skillID = $('.skills li.active').attr('id');
		skillPos = $(this).index() + ($(this).closest('ul').index()*10);
		console.log( skillID, skillPos );

		if( !skillID ){
			return false;
		}

		if( skillID==1 && !$(this).hasClass('highlight') ){
			return false;
		}
		$.post( "skill-launch.php", {'skillid': skillID, 'pos': skillPos }, function( data ) {
		    data = JSON.parse(data);
		    console.log(data);

		    //RESET SKILL and HL
		    highlightPos(true);
			$('.skills li').removeClass('active');

		    if(data.moveBoatTo){
		    	moveBoat(data.moveBoatTo);
		    }
		    if(data.view){
		    	// viewBoat(data.moveBoatTo);
		    	messageGame('vu !');
		    }
		    if(data.hit){
		    	hitBoat(data);
		    	messageGame('tuchey !');
		    }
		    if(data.return=="noenergy"){
	 			messageGame('Pas assez d energie !');
		    }
		});
	});

	
}

function hitBoat(data){
	console.log('HIT');
}

function messageGame(text){

	timerIn = $('.game-message').length * 2000;
	
	setTimeout(function(){
		$('.game-container').append('<div class="game-message"><h2>'+text+'</h2></div>');
		setTimeout(function(){
			$('.game-message').first().remove();
		},2000);
	},timerIn);
	
}

function highlightPos(off){
	$('.grid ul li').removeClass('highlight');

	if(off){
		return false;
	}

	myEnergy = $('.game-ui .energy').attr('energy');

	currentLi = $('.myBoat').closest('li');
	currentUl = currentLi.closest('ul');

	currentLi.nextAll(':lt('+myEnergy+')').addClass('highlight');
	currentLi.prevAll(':lt('+myEnergy+')').addClass('highlight');

	for (i = 1; i <= myEnergy; i++) { 
		index01 = currentUl.index()-i;
		index02 = currentUl.index()+i;
		if( index01 < 0 ){
			index01 = 0;
		}
		if( index02>$('.grid ul').length ){
			index02 = $('.grid ul').length;
		}
		$('.grid ul').eq(index01).find('li').eq(currentLi.index()).addClass('highlight');
		$('.grid ul').eq(index02).find('li').eq(currentLi.index()).addClass('highlight');   
	}	

}

function moveBoat(pos){
	var boatPosition;
	
		currentLi = $('.myBoat').closest('li');
		moveToLi = $('.grid ul li').eq(pos);
		if(moveToLi.find('.myBoat').length){
			return false;
		}

		// $('.grid ul li').removeClass('MoveFrom').removeClass('MoveTo');

		// currentLi.addClass('MoveFrom');
		// moveToLi.addClass('MoveTo');

		boatPosition = {x: currentLi.index(), y: currentLi.closest('ul').index()};
		moveTo = {x: moveToLi.index(), y:moveToLi.closest('ul').index() };

		// console.log( boatPosition, '=>', moveTo , 'BOAT POS : ', boatPosition, 'MOVE BOAT TO :  ', moveTo );
		moveLeft = ( moveTo.x - boatPosition.x) * 100;
		moveTop = ( moveTo.y - boatPosition.y) * 100;

		boatDirection= {};
		if(moveLeft<0){
			console.log('LEFT');
			boatDirection.x = "left";
		}else if(moveLeft==0){
			console.log('NONE');
		}else{
			console.log('RIGHT');
			boatDirection.x = "right";
		}
		if(moveTop<0){
			console.log('TOP');
			boatDirection.y = "top";
		}else if(moveTop==0){
			console.log('NONE');
			boatDirection.y = boatDirection.x;
		}else{
			console.log('BOTTOM');
			boatDirection.y = "bottom";
		}
		$('.myBoat .boat-img').removeClass('top right bottom left').addClass(boatDirection.x);
		$('.myBoat').stop().animate({ left:moveLeft+'%'}, Math.abs(moveLeft)*2, function(){
			$('.myBoat .boat-img').removeClass('top right bottom left').addClass(boatDirection.y);
			$('.myBoat').animate({ top:moveTop+'%'}, Math.abs(moveTop)*2, function(){
				moveToLi.append( $('.myBoat').clone() );
				currentLi.find('.myBoat').remove();
				moveToLi.find('.myBoat').css({left:0, top:0});
				// highlightPos();
			});
		});

}


function gridBuilder(size){
	$('.grid').empty();
	caseSize = 100; //en px
	insideWidth = Math.hypot(caseSize, caseSize);
	colNb = size;

	for (var i = 0; i < colNb; i++) {

	    $('.grid').append('<ul></ul>');
	    
	    for (var a = 0; a < colNb; a++) {
	    	$('.grid ul').eq(i).append('<li></li>');
		}
	}
	
	$('.grid').width(colNb*caseSize+'px');
	$('.grid-floor').width(colNb*caseSize+'px').height(colNb*caseSize+'px');

	$('.grid ul li').click(function(){
		$('.grid ul li').removeClass('active');
		$(this).addClass('active');
	});
	
}


function navigateMap(){

	var isDragging = false, fromPoint = {x:0,y:0}, move= {left:0,top:0}, map={ current:{x:0,y:0}, zoom:1};
	$(".game").mousedown(function(event) {
	    isDragging = true;

    	fromPoint.y = event.clientY;
	    fromPoint.x = event.clientX;

	    if( event.which == 2 ) {
	      event.preventDefault();
	      map={ current:{x:0,y:0}, zoom:1};
	      $('.map').css({transform: 'translate('+map.current.x+'px, '+map.current.y+'px) scale('+map.zoom+')'});
	   	}	

	})
	.mousemove(function(event) {
	    if(isDragging){
	    	move.left = map.current.x + (event.clientX - fromPoint.x);
		    move.top = map.current.y + ( event.clientY - fromPoint.y);
	    	// console.log("mousemove *", move.left, move.top);
		    $('.map').css({transform: 'translate('+move.left+'px, '+move.top+'px) scale('+map.zoom+')'});

		}
	 })
	.mouseup(function(event) {
	    var wasDragging = isDragging;

	    map.current.x = move.left;
	    map.current.y = move.top;

	    isDragging = false;
	});

	 $('.game').bind('mousewheel', function(e){
        if(e.originalEvent.wheelDelta /120 > 0) {
        	map.zoom = map.zoom+0.1;
        	if(map.zoom >= 2){
        		map.zoom = 2;
        	}
            $('.map').css({transform: 'translate('+move.left+'px, '+move.top+'px) scale('+map.zoom+')'});
        }
        else{
        	map.zoom = map.zoom-0.1;
        	if(map.zoom <= 0.7){
        		map.zoom = 0.7;
        	}
            $('.map').css({transform: 'translate('+move.left+'px, '+move.top+'px) scale('+map.zoom+')'});
        }
    });

}


function sound(fx){

	// return false; //DEV no music

	if(fx == "stop"){
		music.pause();
		music.currentTime = 0;
	}
	if(fx == 'menu'){
		music = new Audio('sounds/menu.mp3');
		music.id = "sound-menu";
		music.loop = true;
		music.volume = 0.3;
		music.play();
	}
	if(fx == 'battle'){
		music = new Audio('sounds/battle.mp3');
		music.id = "sound-game";
		music.loop = true;
		music.volume = 0.4;
		music.play();
	}
	

}
