
<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');

	if( !(empty($_POST['noteid']) ) ){
		$response['noteid'] = $_POST['noteid'];
	}

	if( !(empty($_POST['userid']) )  ) {

		$stmt = $db_con->prepare("SELECT emots_bag FROM `users` WHERE `id` = :id");

		$ok = $stmt->execute( array(":id"=>$_POST['userid'] ) );

		$response['useremots'] = $stmt->fetch(PDO::FETCH_ASSOC);

	}
	else{

		if( !(empty($_POST['emotsid']) )  ) {

			$stmt = $db_con->prepare("SELECT * FROM emoticons WHERE `id` = :emotsid");

			$ok = $stmt->execute( array(":emotsid"=>$_POST['emotsid'] ) );

			$response['emots'] = $stmt->fetch(PDO::FETCH_ASSOC);
	

		}else{

			$stmt = $db_con->prepare("SELECT * FROM emoticons");

			$ok = $stmt->execute();

			$response['emots'] = $stmt->fetchAll(PDO::FETCH_ASSOC);


		}
		
	}

	echo json_encode($response);
?>
