<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');
	include('game-options.php');

	if( !empty($_POST['checkConnected']) ) {
		if( isset($_SESSION['user']['id']) )  { 
			$userLog = $db_con->prepare("SELECT * FROM `pb_users` WHERE id=:userid");
			$ok = $userLog->execute(array(":userid"=>$_SESSION['user']['id']));
			$data = $userLog->fetch(PDO::FETCH_ASSOC);
			$response['session'] = 1;
			$response['user']['id'] = intval($data['id']);
			$response['user']['username'] = $data['name'];
			echo json_encode($response);
			die;
		}else{
			$response['session'] = 0;
			echo json_encode($response);
			die;
		}
	} 

	$userLog = $db_con->prepare("SELECT * FROM `pb_users` WHERE name=:username");
	$ok = $userLog->execute(array(":username"=>$_POST['username']));
	$data = $userLog->fetch(PDO::FETCH_ASSOC);
	

	if( $userLog->rowCount() == 0 ){
		$user = $db_con->prepare("INSERT INTO `pb_users` (`id`, `email`, `name`, `password`) VALUES (NULL, 'email@m.com', :username, '0000');");
		$ok = $user->execute(array(":username"=>$_POST['username']));
		$userCreated = $db_con->lastInsertId('users');

		$response['user']['id'] = intval($userCreated);
		$response['user']['username'] = $_POST['username'];
		$_SESSION['user']['id'] = intval($userCreated);
		$_SESSION['user']['name'] = $_POST['username'];
	}else{
		$_SESSION['user']['id'] = intval($data['id']);
		$_SESSION['user']['name'] = $data['name'];
		$response['user']['alreadyexist'] = 1;
		$response['user']['id'] = intval($data['id']);
		$response['user']['username'] = $data['name'];
	}

	echo json_encode($response);


?>
