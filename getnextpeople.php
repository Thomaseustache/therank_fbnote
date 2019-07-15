<?php
	session_start ();
	$peopleID = $_SESSION['people']['id'];

	if( !empty($_POST['id']) ) {

		include('sqlconnect.php');

		if( !empty($_POST['friendID']) ){

			$query = $db_con->prepare("SELECT * FROM users  WHERE id=:friendID");
			$exist = $query->execute( array(":friendID"=>$_POST['friendID']) );
			$people = $query->fetch(PDO::FETCH_ASSOC);

			//WAITING FB VALIDATION
			echo json_encode($people);
			die;


			//AFTER :

			$item = NULL;
			$val = $people['fbid'];
			foreach($_POST['friends'] as $obj) {
			    if ($val == $obj['id']) {
			        $item = $obj;
			        break;
			    }
			}
			 
			if(!is_null($item)){
				$_SESSION['people'] = $people;

				if( $query->rowCount() ){
					echo json_encode($people);
				}else{
					echo $query->rowCount();
				}
			}else{
				echo json_encode("nofriend");
			}
		}
		else{

			// $query = $db_con->prepare("SELECT DISTINCT(users.id), users.picture, notes.voterid FROM users LEFT JOIN notes ON notes.userid = users.id WHERE (notes.voterid IS NULL OR notes.voterid != :id) AND users.id != :id AND users.public = 1 ORDER BY RAND()");

			$query = $db_con->prepare("SELECT users.id, users.picture, notes.voterid FROM users LEFT JOIN notes ON notes.userid = users.id WHERE users.id NOT IN ( SELECT users.id FROM users LEFT JOIN notes ON notes.userid = users.id WHERE notes.voterid = :id ) AND users.id != :id AND users.public = 1 ORDER BY RAND()");
			$exist = $query->execute( array(":id"=>$_POST['id']) );
			$people = $query->fetch(PDO::FETCH_ASSOC);


			if( $query->rowCount() ){
				$_SESSION['people'] = $people;
				echo json_encode($people);
			}else{
				echo json_encode("nomorepeople");
			}

		}

		
	}

?>