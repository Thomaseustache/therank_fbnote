<?php

	$response = [];
	session_start ();

	include('sqlconnect.php');
	include('game-options.php');

	if( !empty($_POST['skillid']) && !empty($_POST['pos']) ) {
		$skillID = $_POST['skillid'];
		$pos = $_POST['pos'];

		//RETURN GAME DATA
		$game = $db_con->prepare("SELECT * FROM `pb_games` WHERE id=:gameid");
		$ok = $game->execute(array(":gameid"=>$_SESSION['user']['gameid']));
		$data = $game->fetch(PDO::FETCH_ASSOC);

		$inGamePlayers = json_decode($data['players'], true);

		//SKILL MANAGE
		$energycost = $gameSkill[$skillID]['energy'];

		//IF NO ORE ENERGY
		if( $inGamePlayers[$data['turn']]['energy'] < $energycost){
			$response['return'] = 'noenergy';
			echo json_encode($response);
			die;
		}

		//MOVING
		if( $skillID == 1){
			$response['skill'] = 'MOVING';
			$inGamePlayers[$data['turn']]['pos'] = intval($pos);
			$response['return'] = $inGamePlayers[$data['turn']];
			$response['moveBoatTo'] = intval($pos);

			$inGamePlayers[$data['turn']]['energy'] = $inGamePlayers[$data['turn']]['energy'] - $energycost;
		}

		//VIEW
		if( $skillID == 2){
			$response['skill'] = 'VIEW';

			$inGamePlayers[$data['turn']]['energy'] = $inGamePlayers[$data['turn']]['energy'] - $energycost;

			$playersView= [];
		    foreach($inGamePlayers as $index => $player) {
		        if($player['pos'] == $pos && $_SESSION['turnIndex'] != $index){
		        	//VIEW player $index 
		        	array_push($playersView, $index);
		        }
		    }

			if ( count($playersView) ) {
				$response['view'] = 1;
				$response['return'] = 1;
				$response['view'] = [];
				$response['view']['playersid'] = $playersView;
				$response['view']['pos'] = intval($pos);
			}else{
				$response['return'] = 0;
			}
		}
		//SHOT
		if( $skillID == 3){

			$response['skill'] = 'SHOT';

			$inGamePlayers[$data['turn']]['energy'] = $inGamePlayers[$data['turn']]['energy'] - $energycost;

			$playersHit= [];
		    foreach($inGamePlayers as $index => $player) {
		        if($player['pos'] == $pos && $_SESSION['turnIndex'] != $index){
		        	//hit player $index 
		        	array_push($playersHit, $index);
		        	$inGamePlayers[$index]['life']--;
		        }
		    }

			if ( count($playersHit) ) {
				$response['hit'] = 1;
				$response['return'] = 1;
				$response['hit'] = [];
				$response['hit']['playersid'] = $playersHit;
				$response['hit']['pos'] = intval($pos);
			}else{
				$response['return'] = 0;
			}
		}


		$playersObj = json_encode($inGamePlayers);

		$startgame = $db_con->prepare("UPDATE pb_games SET players = '$playersObj'  WHERE games.id = :gameid;");
		$ok = $startgame->execute(array(":gameid"=>$_SESSION['user']['gameid']));

		echo json_encode($response);
	}

?>