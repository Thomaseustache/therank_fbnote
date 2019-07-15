<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');

	if( !(empty($_POST['id']) )  ) {

		$count = $db_con->prepare("SELECT * FROM notes WHERE `voterid`= :voterid AND userid=:id");
		$countData = $count->execute( array(":voterid"=> $_POST['voterid'], ":id"=> $_POST['id']) );

		$response['noteinfo'] = $count->fetch(PDO::FETCH_ASSOC);

		echo json_encode($response);

	}

?>

