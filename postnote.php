<?php
	session_start ();

	$response = [];

	if (isset($_SESSION['people']) ) {

		if( !( empty($_POST['id']) OR empty($_POST['note']) OR empty($_POST['voterid']) ) AND $_POST['note']>=0 AND $_POST['note']<21 ) {
			
			include('sqlconnect.php');

			$count = $db_con->prepare("SELECT * FROM notes WHERE `voterid`= :voterid AND userid=:id");
			$countData = $count->execute( array(":voterid"=> $_POST['voterid'], ":id"=> $_POST['id']) );
			
			$response['alreadyvoted'] = $count->rowCount();

			//ELO RANK CALCULATE >>
			$getuserA = $db_con->prepare("SELECT * FROM users WHERE `id`= :voterid");
			$countData = $getuserA->execute( array(":voterid"=> $_POST['voterid']) );

			$getuserB = $db_con->prepare("SELECT * FROM users WHERE `id`= :id");
			$countData = $getuserB->execute( array(":id"=> $_POST['id']) );

			$countnbVote = $db_con->prepare("SELECT * FROM notes WHERE userid=:voterid");
			$countData = $countnbVote->execute( array(":voterid"=> $_POST['voterid']) );
			
			$response['nbvote_userA'] = $countnbVote->rowCount();

			$countUsers = $db_con->prepare("SELECT * FROM users");
			$countData = $countUsers->execute();
			
			$response['nbUsers'] = $countUsers->rowCount();

			$userA = $getuserA->fetchAll(PDO::FETCH_ASSOC)[0];
			$userB = $getuserB->fetchAll(PDO::FETCH_ASSOC)[0];

			// ELO A(noteur)
	        // ELO B(noté)
	        $a_elo = $userA['elo'];
	        $b_elo = $userB['elo'];


	        $response['eloA'] = $a_elo;
	        $response['eloB'] = $b_elo;

	        $NOTEA = $userA['note'];
	        $NOTEB = $userB['note'];

	        $NBVOTE = $response['nbvote_userA'];
	        $NBUSERS = $response['nbUsers'];

	        $b_win_prob = 1/(1+pow(10,($a_elo - $b_elo)/400));

	        $P1 = $NBVOTE / $NBUSERS;
	        $P2 = $NOTEA / 20;
	        $M = ($P1 + ($P2*3)) / 4; // P2 est ici 3 fois plus important que P1

	        if($a_elo > $b_elo){
	            $b_k = 40;  
	        }elseif($a_elo == $b_elo){
	            $b_k = 35;
	        }else{
	            $b_k = 20; 
	        }
	        $b_k = $b_k  * $M; // Monter vite

	        //if( $a_note > $b_note){
	        if( $_POST['note'] > $NOTEB){
	            $b_elo_new = $b_elo + $b_k*(2*$b_win_prob);
	        }else{
	            $b_elo_new = $b_elo - $b_k*(2*$b_win_prob);
	        }


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

				$majNoteUser = $db_con->prepare("UPDATE users SET note = $newNote, elo = $b_elo_new, nb_notes = nb_notes+1 WHERE id = :id");
				$upCred = $majNoteUser->execute( array(":id"=>$_POST['id']) );

				$cred = $db_con->prepare("UPDATE users SET credit = credit+1 WHERE id = :id");
				$upCred = $cred->execute( array(":id"=>$_POST['voterid']) );
				$response['voted'] = $_POST['note'];

				// SUCESS : NOTE = 20 /
				if( $_POST['note'] == 20 ){
					$typeObj = [];
					$typeObj = ['rate'=> $_POST['note'], 'emots_id'=> $_POST['emots'] ];
					$typeObj = json_encode($typeObj);

					$notif = $db_con->prepare("INSERT INTO `history` (`id`, `userid`, `type`, `credit`, `text`, `date`, `view`) VALUES (NULL, :id, '$typeObj' , '10', 'WOW! You have been rated 20!', CURRENT_TIMESTAMP, '0')");
					$ok = $notif->execute( array(":id"=>$_POST['id']) );
				}else{
					// SUCESS : NOTE /

					$typeObj = [];
					$typeObj = ['rate'=> $_POST['note'], 'emots_id'=> $_POST['emots'] ];
					$typeObj = json_encode($typeObj);

					$notif = $db_con->prepare("INSERT INTO `history` (`id`, `userid`, `type`, `credit`, `text`, `date`, `view`) VALUES (NULL, :id, '$typeObj' , '2', 'You have been rated', CURRENT_TIMESTAMP, '0')");
					$ok = $notif->execute( array(":id"=>$_POST['id']) );

					// !SUCESS : NOTE /
				}


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



