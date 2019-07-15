<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');
	include('game-options.php');

	if( empty($_POST['gameid']) ) {
		$gameoptions["gridsize"];
		$userid = $_SESSION['user']['id'];
		$username = $_SESSION['user']['name'];
		$randPos = rand ( 0 , $gameoptions["gridsize"]*$gameoptions["gridsize"]-1 );

		$userInGameInfo[0]['id'] = $userid;
		$userInGameInfo[0]['username'] = $username;
		$userInGameInfo[0]['life'] = $gameoptions["life"];
		$userInGameInfo[0]['energy'] = $gameoptions["energy"];
		$userInGameInfo[0]['pos'] = $randPos;

		$userInGameInfo = json_encode($userInGameInfo);

		$game = $db_con->prepare("INSERT INTO pb_games (id, players, grid) VALUES (NULL, '$userInGameInfo', '$grid');");
		$ok = $game->execute();
		$createdGame = $db_con->lastInsertId('games');

		$_SESSION['user']['myPos'] = $randPos;
		$_SESSION['user']['gameid'] = $createdGame;
		$response['game']['id'] = $createdGame;
		$response['game']['players'] = $username;
	}else{
		$userid = $_SESSION['user']['id'];
		$username = $_SESSION['user']['name'];

		$game = $db_con->prepare("SELECT * FROM `pb_games` WHERE id=:gameid");
		$ok = $game->execute(array(":gameid"=>$_POST['gameid']));
		$data = $game->fetch(PDO::FETCH_ASSOC);

		$userInGameInfo = json_decode($data['players']);

		if( count($userInGameInfo)>=$gameoptions["maxplayer"] ){
			$response['game'] = 'full';
			echo json_encode($response);
			die;
		}

		$randPos = rand ( 0 , $gameoptions["gridsize"]*$gameoptions["gridsize"] );
		$ak = count($userInGameInfo);
		$userInGameInfo[$ak]['id'] = intval($userid);
		$userInGameInfo[$ak]['username'] = $username;
		$userInGameInfo[$ak]['life'] = $gameoptions["life"];
		$userInGameInfo[$ak]['energy'] = $gameoptions["energy"];
		$userInGameInfo[$ak]['pos'] = intval($randPos);

		$userInGameInfo = json_encode($userInGameInfo);
		
		$game = $db_con->prepare("UPDATE `pb_games` SET `players` = '$userInGameInfo' WHERE id=:gameid");
		$ok = $game->execute(array(":gameid"=>$_POST['gameid']));

		$_SESSION['user']['myPos'] = $randPos;
		$response['game']['id'] = $_SESSION['user']['gameid'] = $_POST['gameid'] ;
		$response['game']['players'] = $userInGameInfo;
	}

	echo json_encode($response);


?>
