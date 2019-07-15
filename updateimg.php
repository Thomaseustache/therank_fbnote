<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');

	$query = $db_con->prepare("UPDATE users SET picture = :imgsrc WHERE users.id = :userid");
	$sqlpublic = $query->execute( array(":imgsrc"=>$_POST['imgsrc'] , ':userid'=>$_POST['userid']) );
	$response['Profile image'] = $_POST['userid'];
	echo json_encode($response);

?>