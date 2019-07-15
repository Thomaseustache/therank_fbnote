<?php
	session_start ();
	$response = [];

	include('sqlconnect.php');

	if( !( empty($_POST['notifid']) ) ){
		$getnotif = $db_con->prepare("SELECT * FROM history WHERE `id`= :id");
		$noteData = $getnotif->execute( array(":id"=> $_POST['notifid']) );
		$notifs = $getnotif -> fetchAll(PDO::FETCH_ASSOC);

		$credwin = $response['creditwin'] = $notifs[0]['credit'];

		$win = $db_con->prepare("UPDATE users SET credit = credit+$credwin WHERE id = :id");
		$ok = $win->execute( array(":id"=>$_POST['id'] ) );

		$getnotif = $db_con->prepare("UPDATE history SET view = 1 WHERE id = :id");
		$noteData = $getnotif->execute( array(":id"=> $_POST['notifid']) );

		$response['notifdeleted'] = 1;
	    echo json_encode($response);
	}else{
		$getnotif = $db_con->prepare("SELECT * FROM history WHERE `userid`= :id AND view = 0 ORDER BY date");
		$noteData = $getnotif->execute( array(":id"=> $_POST['id']) );
		$notifs = $getnotif -> fetchAll(PDO::FETCH_ASSOC);

		$response['notifs'] = $notifs;
	    echo json_encode($response);
		
	}

	
?>