<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');

	if( !(empty($_POST['emotID']) )  ) {

		$stmt = $db_con->prepare("SELECT * FROM emoticons WHERE `id` = :id ");

		$ok = $stmt->execute( array(":id"=>$_POST['emotID'] ) );

		$response['emotInfo'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

		echo json_encode($response);
	}

?>
