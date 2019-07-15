<?php
	$response = [];
	session_start ();

	include('sqlconnect.php');

	if( !empty($_POST['goPublic']) ){
			if($_POST['goPublic'] == "true"){
				$userpublic = 1;
			}else{
				$userpublic = 0;
			}
			
			$query = $db_con->prepare("UPDATE users SET public = :userpublic WHERE users.id = :userid");
			$sqlpublic = $query->execute( array(":userid"=>$_POST['userid'] , ':userpublic'=>$userpublic) );
			$response['public'] = $_POST['goPublic'];
			echo json_encode($response);
			
	}
	elseif(!empty($_POST['goNotify'])){
		if($_POST['goNotify'] == "true"){
			$usernotify = 1;
		}else{
			$usernotify = 0;
		}
		$query = $db_con->prepare("UPDATE users SET notify = :usernotify WHERE users.id = :userid");
		$sqlpublic = $query->execute( array(":userid"=>$_POST['userid'] , ':usernotify'=>$usernotify) );
		$response['notify'] = $_POST['goNotify'];
		echo json_encode($response);
	}else{

		if( !(empty($_POST['fbid']) OR empty($_POST['email']) OR empty($_POST['imgsrc']) )  ) {

			$query = $db_con->prepare("SELECT * FROM users WHERE fbid=:fbid");
			$exist = $query->execute( array(":fbid"=>$_POST['fbid']) );
			// $count = $query->fetch()[0];

			if( $query->rowCount() == 0) {
				/* SQL query to get results from database */
				$stmt = $db_con->prepare("INSERT INTO `users` (`fbid`, `name`, `picture`, `public`, `notify`, `email`, `credit`) VALUES (:fbid, :name, :picture, 0, 1, :email, 0)");
				$ok = $stmt->execute( array(":fbid"=>$_POST['fbid'], ":name"=>$_POST['name'], ":email"=>$_POST['email'], ":picture"=>$_POST['imgsrc']) );

				// $response['insert'] = $stmt->lastInsertId();

				$stmt2 = $db_con->prepare("SELECT * FROM `users` WHERE `fbid` = :id");
				$ok2 = $stmt2->execute( array(":id"=>$_POST['fbid'] ) );

				$response['exist'] = 0;
				$response['userInfo'] = $stmt2->fetch(PDO::FETCH_ASSOC);
				$_SESSION['user'] = json_encode($response['userInfo']);
			}
			else{
				$stmt = $db_con->prepare("SELECT * FROM `users` WHERE `fbid` = :fbid");
				$ok = $stmt->execute( array(":fbid"=>$_POST['fbid'] ) );
				$response['userInfo'] = $stmt->fetch(PDO::FETCH_ASSOC);
				$userid = $response['userInfo']['id'];


				// SUCESS : DAILYCO /
				$typeObj = [];
				$typeObj = ['type'=> 'dailyco'];
				$typeObj = json_encode($typeObj);

				$log = $db_con->prepare("SELECT * FROM `history` WHERE DATE(date)=CURDATE() AND userid = :id");
				$ok = $log->execute( array(":id"=>$userid ) );
				$logtoday = $log->rowCount();

				if($logtoday == 0) {
				    //it's today, let's make ginger snaps
				    $gaincred = $db_con->prepare("INSERT INTO `history` (`id`, `userid`, `type`, `credit`, `text`, `date`, `view`) VALUES (NULL, $userid, '$typeObj' , '1', 'Daily connection', CURRENT_TIMESTAMP, '0')");
					$ok = $gaincred->execute();
				}
				// !SUCESS : DAILYCO /

				

				$response['exist'] = 1;
				$_SESSION['user'] = json_encode($response['userInfo']);
			}

			echo json_encode($response);
		}

		
		

	}

?>

