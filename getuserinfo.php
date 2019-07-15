<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');

	if( !(empty($_POST['id']) )  ) {

		$stmt = $db_con->prepare("SELECT * FROM `users` WHERE `id` = :id");

		$ok = $stmt->execute( array(":id"=>$_POST['id'] ) );

		$response['user'] = $stmt->fetch(PDO::FETCH_ASSOC);

		echo json_encode($response);

	}

	if( !(empty($_POST['friendid']) )  ) {

		$stmt = $db_con->prepare("SELECT * FROM `users` WHERE `fbid` = :id");

		$ok = $stmt->execute( array(":id"=>$_POST['friendid'] ) );

		$response['friendinfo'] = $stmt->fetch(PDO::FETCH_ASSOC);

		echo json_encode($response);

	}

?>

