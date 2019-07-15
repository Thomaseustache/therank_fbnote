<?php
	session_start ();

	$response = [];

	if (isset($_SESSION['people']) ) {

		if( !( empty($_POST['id']) OR empty($_POST['note']) OR empty($_POST['voterid']) ) AND $_POST['note']>0 AND $_POST['note']<21 ) {
			
			include('sqlconnect.php');

			$count = $db_con->prepare("SELECT * FROM notes WHERE `voterid`= :voterid AND userid=:id");
			$countData = $count->execute( array(":voterid"=> $_POST['voterid'], ":id"=> $_POST['id']) );
			
			$response['alreadyvoted'] = $count->rowCount();

			if( $response['alreadyvoted'] == 1 ){
				$stmt = $db_con->prepare("UPDATE `notes` SET note = :note , emots_id = :emots WHERE (notes.voterid = :voterid AND notes.userid = :id)");
				$ok = $stmt->execute( array(":id"=>$_POST['id'], ":voterid"=>$_POST['voterid'], ":emots"=>$_POST['emots'], ":note"=>$_POST['note']) );

				$getOldNote = $db_con->prepare("SELECT AVG( note ) AS rank FROM notes WHERE `userid`= :id");
				$countData = $getOldNote->execute( array(":id"=> $_POST['id']) );
				$oldNote = $getOldNote->fetchAll(PDO::FETCH_ASSOC);
				$newNote = $oldNote[0]["rank"];

				$majNoteUser = $db_con->prepare("UPDATE users SET note = $newNote WHERE id = :id");
				$upCred = $majNoteUser->execute( array(":id"=>$_POST['id']) );

				$response['voted'] = $_POST['note'];
				echo json_encode($response);
			}
			else{
				$stmt = $db_con->prepare("INSERT INTO `notes` (`userid`, `note`, `voterid`, emots_id) VALUES (:id, :note, :voterid, :emots)");
				$ok = $stmt->execute( array(":id"=>$_POST['id'], ":voterid"=>$_POST['voterid'], ":note"=>$_POST['note'], ":emots"=>$_POST['emots']) );

				$getOldNote = $db_con->prepare("SELECT AVG( note ) AS rank FROM notes WHERE `userid`= :id");
				$countData = $getOldNote->execute( array(":id"=> $_POST['id']) );
				$oldNote = $getOldNote->fetchAll(PDO::FETCH_ASSOC);
				$newNote = $oldNote[0]["rank"];

				$majNoteUser = $db_con->prepare("UPDATE users SET note = $newNote, nb_notes = nb_notes+1 WHERE id = :id");
				$upCred = $majNoteUser->execute( array(":id"=>$_POST['id']) );

				$cred = $db_con->prepare("UPDATE users SET credit = credit+1 WHERE id = :id");
				$upCred = $cred->execute( array(":id"=>$_POST['voterid']) );
				$response['voted'] = $_POST['note'];

				echo json_encode($response);
			}

			

		}
		else{
			echo "NO ISSET POST";
		}

	}
	else{
		echo "No PEOPLE SESSION";
	}
	die;
?>



