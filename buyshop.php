<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');

	if( !(empty($_POST['userid']) )  ) {

		$credit = $db_con->prepare("SELECT * FROM users WHERE `id` = :id");
		$ok = $credit->execute( array(":id"=>$_POST['userid'] ) );
		$userInfo = $credit->fetch(PDO::FETCH_ASSOC);
		$response['credit'] = $userInfo['credit'];

		$emots_bag = $userInfo['emots_bag'];
		// $emots_bag = str_replace(['[', ']'], '', $emots_bag);
		// $emots_bag = explode(",", $emots_bag);

		$price = $db_con->prepare("SELECT price FROM emoticons WHERE `id` = :id");
		$ok = $price->execute( array(":id"=>$_POST['itemid'] ) );
		$response['price'] = $price->fetch(PDO::FETCH_ASSOC)['price'];
		$priceVal = $response['price'];

		if($response['credit'] >= $response['price']){
			// $emots_bag .= ', '+$_POST['itemid'];
			// $emots_bag = explode(",", $emots_bag);
			// $emots_bag = json_encode($emots_bag);
			$emots_bag = json_decode($emots_bag);
			array_push($emots_bag, intval($_POST['itemid']));
			$emots_bag = json_encode($emots_bag);

			$buy = $db_con->prepare("UPDATE users SET credit = credit-$priceVal , emots_bag = '$emots_bag' WHERE id = :id");
			$ok = $buy->execute( array(":id"=>$_POST['userid'] ) );
			$response['buy'] = json_decode($emots_bag);
			$response['price'] = $priceVal;
		}else{
			$response['buy'] = 0;
		}

		echo json_encode($response);
	}

?>
