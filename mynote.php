<?php
	session_start ();

	$minVote = 5;

	$response = [];


	$user = json_decode($_SESSION['user']);


	include('sqlconnect.php');

	$mynote = $db_con->prepare("SELECT * FROM notes WHERE `userid`= :id ORDER BY notes.date DESC");
	$noteData = $mynote->execute( array(":id"=> $user->id) );

	$count = $db_con->prepare("SELECT * FROM notes WHERE `voterid`= :id");
	$countData = $count->execute( array(":id"=> $user->id) );

	$query = $db_con->prepare("SELECT AVG( note ) AS rank FROM notes WHERE `userid`= :id");
	$queryData = $query->execute( array(":id"=> $user->id) );

	$result = $query -> fetchAll(PDO::FETCH_ASSOC);

	if( $count->rowCount() >= $minVote){
		$response = $result[0];
		$response['notes'] = $mynote->fetchAll(PDO::FETCH_ASSOC);
		$response['reviewnb'] = $count->rowCount();
	}else{
		$response['blocked'] = 1;
		$response['reviewnb'] = $count->rowCount();
	}

    echo json_encode($response);
	
?>