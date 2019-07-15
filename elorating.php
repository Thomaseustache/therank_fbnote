<?php
    $response = [];
    session_start ();

    include('sqlconnect.php');

    if( !(empty($_POST['userID']) )  ) {

        $stmt = $db_con->prepare("SELECT * FROM users WHERE `public` = 1 AND name != 'ghost' ORDER BY elo DESC, note DESC LIMIT 20");
        $ok = $stmt->execute();

        $response['toptable'] = $stmt->fetchALL(PDO::FETCH_ASSOC);

        echo json_encode($response);
    }


?>

