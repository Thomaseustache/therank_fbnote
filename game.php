<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');
	include('game-options.php');

	


	//RETURN GAME DATA
	$game = $db_con->prepare("SELECT * FROM `pb_games` WHERE id=:gameid");
	$ok = $game->execute(array(":gameid"=>$_SESSION['user']['gameid']));
	$data = $game->fetch(PDO::FETCH_ASSOC);

	$inGamePlayers = json_decode($data['players'], true);

	$response['game'] = $data;
	$response['game']['id'] = $_SESSION['user']['gameid'];

	$response['game']['turnIndex'] = intval($data['turn']);
	$response['game']['turn'] = intval( $inGamePlayers[intval($data['turn'])]['id'] );

	$response['game']['gridNb'] = $gameoptions["gridsize"];
	$response['game']['myPos'] = $_SESSION['user']['myPos'];

	//RETURN INDEX OF PLAYER
	foreach($inGamePlayers as $index => $player) {
        if($player['id'] == $_SESSION['user']['id']){
        	$response['game']['myIndex'] = $index;
        }
    }

	//START FROM LOBBY AND SET TURN
	if( !empty($_POST['start']) && $data['lobby'] == 1 ){

		// $randKEY = rand( 0, count($inGamePlayers)-1 );
		// $randomPlayer = $inGamePlayers[$randKEY]['id'];

		$playersTurn = $inGamePlayers;
		shuffle( $playersTurn );

		$_SESSION['game']['players'] = $playersTurn;
		$inGamePlayers = $playersTurn;

		

		$playersObj= json_encode($playersTurn);

		$startgame = $db_con->prepare("UPDATE pb_games SET lobby = '0', turn = '0', players = '$playersObj'  WHERE games.id = :gameid;");
		$ok = $startgame->execute(array(":gameid"=>$_SESSION['user']['gameid']));

		$response['game']['started'] = 'YES';
		$response['game']['turnIndex'] = 0;
		$response['game']['turn'] = intval($inGamePlayers[0]['id']);
	}

	//GLOBAL RESPONSE FOR ALL PLAYERS EVERY 1S
	$response['game']['timer'] = $gameoptions["timeRound"];
	$response['game']['players'] = $inGamePlayers;

	$_SESSION['game']['players'] = $inGamePlayers;
	$_SESSION['turnIndex'] = $response['game']['turnIndex'];

	
	$response['game']['playersNB'] = count($inGamePlayers);


	//IF LAST MAN ALIVE
	$deadboat = 0;
	for( $i = 0; $i<$response['game']['playersNB']; $i++ ) {
		if($inGamePlayers[$i]['life']==0){
			$deadboat++;
		}else{
			$winnerPlayer = $inGamePlayers[$i];
		}
	}
	$response['game']['deadboat'] = $deadboat;

	$deadPlayertoWin = $response['game']['playersNB']-1;
	if( $deadboat == $deadPlayertoWin){
		$response['game']['end'] = 1;
		$response['game']['winner'] = $winnerPlayer;
		echo json_encode($response);
		die;
	}
	




	//ENVOIE A LA FIN DU TOUR
	if( !empty($_POST['finishturn']) ){

		//RESET ENERGY
		$inGamePlayers[$data['turn']]['energy'] = $gameoptions['energy'];
		$playersObj= json_encode($inGamePlayers);


		$i = $data['turn']+1;
		if ( $i > $response['game']['playersNB']-1 ){
			$i = 0;
		}

		//VERIF IF DEAD 
		$dead = 1;
		do {
			if($inGamePlayers[$i]['life']==0){
				$dead = 1;
				$i++;
				if ( $i > $response['game']['playersNB']-1 ){
					$i = 0;
				}
			}else{
				$dead = 0;
				$response['game']['turnIndex'] = $i;
				$nextPlayer = intval($inGamePlayers[$i]['id']);
				$response['game']['turn'] = $nextPlayer;
			}

		} while ($dead == 1);



		

		$startgame = $db_con->prepare("UPDATE pb_games SET lobby = '0', turn = '$i', players = '$playersObj' WHERE games.id = :gameid;");
		$ok = $startgame->execute(array(":gameid"=>$_SESSION['user']['gameid']));
	}



	echo json_encode($response);


?>
