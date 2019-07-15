<?php 

	$host         = "";
	$username     = "";
	$password     = "";
	$dbname       = "";

	try{
	    $db_con = new PDO("mysql:host={$host};dbname={$dbname}",$username,$password);
	    $db_con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}catch(PDOException $e){
	    echo $e->getMessage();
	}

?>