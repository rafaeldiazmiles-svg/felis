#pragma strict

var startScreen : StartScreen;
var startScreenName : String = "Start Screen";

var saveNow : boolean;

var loadNow : boolean;

var loadGameScore : boolean;
var gameAScore : float;
var gameBScore : float;
var gameCScore : float;

var gameACatsSaved : int;
var gameBCatsSaved : int;
var gameCCatsSaved : int;

var saveDiskGUI : BlinkMaterial;
var showSaveDisk : boolean;
var saveDiskDelay : float = .3;
var saveDiskTime : float;
var saveDiskDuration : float = .6;
var saveDiskUntil : float;

var globalValues : HoldGlobalValues;
var globalValuesName : String = "Hold Global Values";

var delete_Reset_SizeShowHide: SizeShowHide[];


function Start () {
	var startScreenObject : GameObject = GameObject.Find(startScreenName);
	if(startScreenObject != null){
		startScreen = startScreenObject.GetComponent(StartScreen);
	}
	saveDiskGUI.gameObject.GetComponent.<Renderer>().enabled = false;

	var gVals : GameObject = GameObject.Find(globalValuesName);
	if(gVals != null){
		globalValues = gVals .GetComponent(HoldGlobalValues);
	}
}

function Update () {
	if(saveNow){
		SaveGame();
		saveNow = false;
	}
	
	if(loadNow){
		LoadGame();
		loadNow = false;
	}

	if(loadGameScore){
		LoadGameScore();
		loadGameScore = false;
	}
	
	if(Time.time < saveDiskUntil){
		saveDiskGUI.show.current = true;
	}
	else{
		saveDiskGUI.show.current = false;
	}
	
	if(showSaveDisk && Time.time > saveDiskTime){
		showSaveDisk = false;
		saveDiskUntil = Time.time + saveDiskDuration;
	}
	
	if(Time.time < saveDiskUntil){
		saveDiskGUI.show.current = true;
	}
	else{
		saveDiskGUI.show.current = false;
	}
}

function GetCatsSaved() : int{
	LoadGameScore();
	switch(startScreen.currentGame){
		case 0:
			return gameACatsSaved;
		break;
		case 1:
			return gameBCatsSaved;
		break;
		case 2:
			return gameCCatsSaved;
		break;
	}
	return 0;
}


function SaveGame(){
	PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Current Level", startScreen.currentLevel);

	/*gameACatsSaved = 0;
	gameBCatsSaved = 0;
	gameCCatsSaved = 0;*/

	for(var i = 0; i < startScreen.levels.Length; i++){
		var levelCompleted : int = 0;
		if(startScreen.levels[i].completed){
			levelCompleted = 1;
		}
		PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Level " + i.ToString() + " - Completed", levelCompleted);
		
		var catOneSaved : int = 0;
		if(startScreen.levels[i].catOneSaved){
			catOneSaved = 1;
			//gameACatsSaved ++;
		}

		var catTwoSaved : int = 0;
		if(startScreen.levels[i].catTwoSaved){
			catTwoSaved = 1;
			//gameBCatsSaved ++;
		}

		var catThreeSaved : int = 0;
		if(startScreen.levels[i].catThreeSaved){
			catThreeSaved = 1;
			//gameCCatsSaved ++;
		}

		PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Level " + i.ToString() + " - Cat One Saved", catOneSaved);
		PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Level " + i.ToString() + " - Cat Two Saved", catTwoSaved);
		PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Level " + i.ToString() + " - Cat Three Saved", catThreeSaved);
	}

	PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Fireball", globalValues.hasFireball);
	PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Wings", globalValues.hasWings);

	//Inventory
	if(globalValues.invSlots != null && globalValues.invSlots.Length == 3){
		PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Inv Slot 1", parseInt(globalValues.invSlots[0]));
		PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Inv Slot 2", parseInt(globalValues.invSlots[1]));
		PlayerPrefs.SetInt("Game " + startScreen.currentGame.ToString() + " - Inv Slot 3", parseInt(globalValues.invSlots[2]));
	}

	PlayerPrefs.Save();
	
	//saveDiskUntil = Time.time + saveDiskDuration;
	saveDiskTime = Time.time + saveDiskDelay;
	showSaveDisk = true;


	LoadGameScore();
}

function LoadGame(){
	startScreen.currentLevel = PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Current Level");
	
	for(var i = 0; i < startScreen.levels.Length; i++){
		var levelCompleted : int =
		PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Level " + i.ToString() + " - Completed");
		
		if(levelCompleted == 1) startScreen.levels[i].completed = true;
		else startScreen.levels[i].completed = false;

		var catOneSaved : int =
		PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Level " + i.ToString() + " - Cat One Saved");
		var catTwoSaved : int =
		PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Level " + i.ToString() + " - Cat Two Saved");
		var catThreeSaved : int =
		PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Level " + i.ToString() + " - Cat Three Saved");
		
		if(catOneSaved == 1) startScreen.levels[i].catOneSaved = true;
		else startScreen.levels[i].catOneSaved = false;
		
		if(catTwoSaved == 1) startScreen.levels[i].catTwoSaved = true;
		else startScreen.levels[i].catTwoSaved = false;
		
		if(catThreeSaved == 1) startScreen.levels[i].catThreeSaved = true;
		else startScreen.levels[i].catThreeSaved = false;
	}

	globalValues.invSlots = new Inv_ItemType[3];
	globalValues.invSlots[0] = PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Inv Slot 1");
	globalValues.invSlots[1] = PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Inv Slot 2");
	globalValues.invSlots[2] = PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Inv Slot 3");


	globalValues.hasFireball = PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Fireball");
	globalValues.hasWings = PlayerPrefs.GetInt("Game " + startScreen.currentGame.ToString() + " - Wings");
	globalValues.SetPowerUps();

	globalValues.setInvItems = true;
}

function LoadGameScore(){
	gameAScore = 0.0;
	gameBScore = 0.0;
	gameCScore = 0.0;

	gameACatsSaved = 0;
	gameBCatsSaved = 0;
	gameCCatsSaved = 0;

	for(var i = 0; i < startScreen.levels.Length; i++){
		var completedOnGameA : int = PlayerPrefs.GetInt("Game 0" + " - Level " + i.ToString() + " - Completed");
		var completedOnGameB : int = PlayerPrefs.GetInt("Game 1" + " - Level " + i.ToString() + " - Completed");
		var completedOnGameC : int = PlayerPrefs.GetInt("Game 2" + " - Level " + i.ToString() + " - Completed");
		
		var catOneSavedOnGameA : int = PlayerPrefs.GetInt("Game 0" + " - Level " + i.ToString() + " - Cat One Saved");
		var catOneSavedOnGameB : int = PlayerPrefs.GetInt("Game 1" + " - Level " + i.ToString() + " - Cat One Saved");
		var catOneSavedOnGameC : int = PlayerPrefs.GetInt("Game 2" + " - Level " + i.ToString() + " - Cat One Saved");
		
		var catTwoSavedOnGameA : int = PlayerPrefs.GetInt("Game 0" + " - Level " + i.ToString() + " - Cat Two Saved");
		var catTwoSavedOnGameB : int = PlayerPrefs.GetInt("Game 1" + " - Level " + i.ToString() + " - Cat Two Saved");
		var catTwoSavedOnGameC : int = PlayerPrefs.GetInt("Game 2" + " - Level " + i.ToString() + " - Cat Two Saved");
		
		var catThreeSavedOnGameA : int = PlayerPrefs.GetInt("Game 0" + " - Level " + i.ToString() + " - Cat Three Saved");
		var catThreeSavedOnGameB : int = PlayerPrefs.GetInt("Game 1" + " - Level " + i.ToString() + " - Cat Three Saved");
		var catThreeSavedOnGameC : int = PlayerPrefs.GetInt("Game 2" + " - Level " + i.ToString() + " - Cat Three Saved");
		
		gameAScore += completedOnGameA;
		gameBScore += completedOnGameB;
		gameCScore += completedOnGameC;
		
		gameAScore += catOneSavedOnGameA;
		gameBScore += catOneSavedOnGameB;
		gameCScore += catOneSavedOnGameC;
		
		gameAScore += catTwoSavedOnGameA;
		gameBScore += catTwoSavedOnGameB;
		gameCScore += catTwoSavedOnGameC;
		
		gameAScore += catThreeSavedOnGameA;
		gameBScore += catThreeSavedOnGameB;
		gameCScore += catThreeSavedOnGameC;

		gameACatsSaved += catOneSavedOnGameA;
		gameBCatsSaved += catOneSavedOnGameB;
		gameCCatsSaved += catOneSavedOnGameC;

		gameACatsSaved += catTwoSavedOnGameA;
		gameBCatsSaved += catTwoSavedOnGameB;
		gameCCatsSaved += catTwoSavedOnGameC;

		gameACatsSaved += catThreeSavedOnGameA;
		gameBCatsSaved += catThreeSavedOnGameB;
		gameCCatsSaved += catThreeSavedOnGameC;
	}

	var maxScore = (startScreen.levels.Length - 1) * 4;

	maxScore -= 6; //Griffin Tower and Dragon has no cats to rescue;

	gameAScore /= maxScore;
	gameBScore /= maxScore;
	gameCScore /= maxScore;
	
	gameAScore *= 100.0;
	gameBScore *= 100.0;
	gameCScore *= 100.0;
}

function DeleteGame(game : int){
	for(var i = 0; i < startScreen.levels.Length; i++){
		PlayerPrefs.DeleteKey("Game " + game.ToString() + " - Current Level");
		PlayerPrefs.DeleteKey("Game " + game.ToString() + " - Level " + i.ToString() + " - Completed");
		PlayerPrefs.DeleteKey("Game " + game.ToString() + " - Level " + i.ToString() + " - Cat One Saved");
		PlayerPrefs.DeleteKey("Game " + game.ToString() + " - Level " + i.ToString() + " - Cat Two Saved");
		PlayerPrefs.DeleteKey("Game " + game.ToString() + " - Level " + i.ToString() + " - Cat Three Saved");
	}

	PlayerPrefs.DeleteKey("Game " + startScreen.currentGame.ToString() + " - Inv Slot 1");
	PlayerPrefs.DeleteKey("Game " + startScreen.currentGame.ToString() + " - Inv Slot 2");
	PlayerPrefs.DeleteKey("Game " + startScreen.currentGame.ToString() + " - Inv Slot 3");

	PlayerPrefs.DeleteKey("Game " + startScreen.currentGame.ToString() + " - Fireball");
	PlayerPrefs.DeleteKey("Game " + startScreen.currentGame.ToString() + " - Wings");

	for(i = 0; i < delete_Reset_SizeShowHide.Length; i++){
		delete_Reset_SizeShowHide[i].resetValue = true;
	}
}