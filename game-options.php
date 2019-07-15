<?php
	
	//OPTIONS
	$gameoptions=[
		"gridsize" => 10,
		"maxplayer" => 4,
		"timeRound" => 20,
		"energy" => 3,
		"life" => 1
	];

	//GENERATE GRID

	$i = 0;
	$grid = "";
	while ($i <= $gameoptions["gridsize"]) {
	    $grid .= $i.': 0 ;';
	    $i++;
	}

	//SKILLS
	$gameSkill=[
		1 => [
			"energy" => 1
		],
		2 => [
			"energy" => 2
		],
		3 => [
			"energy" => 3
		]	

	];
	

?>