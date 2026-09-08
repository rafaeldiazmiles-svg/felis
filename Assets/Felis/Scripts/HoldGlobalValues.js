#pragma strict

var currentGame : int;

@Space(30)
var recentlyCreated : boolean = true;

@Space(30)
var currentLevel : int;
var completedLevels : boolean[];
var catOneSaved : boolean[];
var catTwoSaved : boolean[];
var catThreeSaved : boolean[];

@Space(30)
var lastDefeatedLevel : int;

@Space(30)
var autoFindComponents : boolean = true;
var startScreen : StartScreen;
var startScreenName : String = "Start Screen";

@Space(30)
var saveChanges : boolean;
var setPlayerIslandPos: boolean;

@Space(30)
var hasFireball : int;
var hasWings : int;

@Space(30)
var inv : Inventory;
var invSlots : Inv_ItemType[];
var setInvItems : boolean;

@Space(30)
var quitKey : KeyCode;

@Space(30)
var cursorPrefab : GameObject;
var cursorObj : GameObject;

@Space(30)
var pause : Pause;

@Space(30)
var popupQuestionPrefab : GameObject;
var popupQuestion : GameObject;
var popupQuestion_InputQ : InputQuestion;
@Space(12)
var input : ControllerInput;
var player : GameObject;
var playerTag : String = "Player";

var quit : boolean;
var selectingGame : boolean;
var inventory : boolean;

var createCursor = true;

@Space(30)
var platform : Platform;
var cursorPlatforms : PlatformType[];

function CreatePopupQuestion(){
	if(popupQuestionPrefab == null){
		popupQuestionPrefab = Resources.Load("Prefabs/GUI/Popup Question", GameObject);
	}
	popupQuestion = GameObject.Instantiate(popupQuestionPrefab);
	popupQuestion_InputQ = popupQuestion.GetComponent.<InputQuestion>();

	if(input == null){
		GetInput();
	}

	if(input != null){
		input.GetTouchPoints();
	}
}

function CreateCursor(){
	if(platform == null){
		platform = GameObject.FindObjectOfType.<Platform>();
	}
	var platformUsesCursor : boolean;
	if(platform != null){
		for(var i = 0; i < cursorPlatforms.Length; i++){
			if(platform.platform == cursorPlatforms[i]){
				platformUsesCursor = true;
				break;
			}
		}
	}

	if(platformUsesCursor){

		if(!createCursor){
			return;
		}

		if(cursorPrefab == null){
			cursorPrefab = Resources.Load("Prefabs/GUI/Cursor", GameObject);
		}
		if(cursorObj != null){
			Destroy(cursorObj);
		}
		cursorObj = GameObject.Instantiate(cursorPrefab);
		if(pause == null){
			pause = GameObject.FindObjectOfType.<Pause>();
		}
		if( pause != null){
			pause.cursorComponents = cursorObj.GetComponentsInChildren.<MonoBehaviour>();
		}
	}
	else{
		if(cursorObj != null){
			Destroy(cursorObj);
			if(pause == null){
				pause = GameObject.FindObjectOfType.<Pause>();
			}
			if( pause != null){
				pause.cursorComponents = new MonoBehaviour[0];
			}
		}
	}
}

function GetInput(){
	if(startScreen != null){
		
		input = startScreen.input;
	}
	else{
		player = GameObject.FindWithTag(playerTag);
		if(player != null){
			input = player.GetComponentInChildren.<ControllerInput>();
		}
	}

	if(input == null){
		var inputObj : GameObject = GameObject.Find("/Input");
		if(inputObj != null){
			input = inputObj.GetComponentInChildren.<ControllerInput>();
		}		
	}
}

function Start () {
	 pause = GameObject.FindObjectOfType.<Pause>();

	GameObject.DontDestroyOnLoad(gameObject);
	
	if(startScreen == null){
		startScreen = GameObject.FindObjectOfType(StartScreen);
	}

	GetInput();
	
	completedLevels = new boolean[startScreen.levels.Length];
	catOneSaved = new boolean[startScreen.levels.Length];
	catTwoSaved = new boolean[startScreen.levels.Length];
	catThreeSaved = new boolean[startScreen.levels.Length];
	if(!recentlyCreated){
		SetLevels();
	}

	SetInventoryVals();

	SetPowerUps();

	 CreateCursor();
	 //CreatePopupQuestion();

}

function LateUpdate () {
	if(quit){
		if(popupQuestion_InputQ != null && popupQuestion_InputQ.showingSign.current){
			if(input == null){
				GetInput();
			}

			if(input.inputButtonA.down|| input.startButton.down){
				popupQuestion_InputQ.showingSign.current = false;
				Debug.Log("Quit.");	

				input.inputButtonA.down = false;
				input.startButton.down = false;

				if(startScreen == null){
					//Game
					if(!pause.pause.current && !pause.inventory.show.current){
						pause.UnStopGame();
					}
						
					if(pause.pause.current){
						pause.enabled = true;
						pause.pauseText.enabled = true;
					}

					if(inventory){
						pause.inventory.gameObject.SetActive(true);
					}
				}

				Application.Quit();
				return;
			}
			if(input.inputButtonB.down || input.selectButton.down){
				popupQuestion_InputQ.showingSign.current = false;
				quit = false;

				input.inputButtonB.down = false;
				input.selectButton.down = false;

				if(startScreen != null){
					//Island
					if(selectingGame ){
						startScreen.gameSelect.show = true;
					}
					startScreen.enabled = true;
				}
				else{
					//Game
					if(!pause.pause.current && !pause.inventory.show.current){
						pause.UnStopGame();
					}

					if(pause.pause.current){
						pause.enabled = true;
						pause.pauseText.enabled = true;
					}

					if(inventory){
						pause.inventory.gameObject.SetActive(true);
					}
				}

				return;
			}
					
		}
		else{
			quit = false;

		}
		return;
	}

	if(!quit){
		if(popupQuestion_InputQ != null && popupQuestion_InputQ.hidden){
			Destroy(popupQuestion);
		}
	}

	if(setInvItems){
		setInvItems = false;
		SetInventoryVals();
		inv.SetGPItemInstance();
		inv.transform.parent.GetComponent.<AlphaControl>().rends = inv.transform.parent.GetComponentsInChildren.<Renderer>();
	}

	if(Input.GetKeyDown(quitKey)){
		if(!(startScreen != null && startScreen.quit)){
			if(startScreen != null){
				//Island
				selectingGame = startScreen.gameSelect.show || startScreen.question_DeleteGame;
				
				//startScreen.enterThisLevel.showingSign.current = false;
				startScreen.question_DeleteGame = false;
				startScreen.question_EnterThisLevel = false;
				startScreen.question_GoBack = false;
				startScreen.gameSelect.show = false;
				startScreen.HidePopupQuestion();
				startScreen.enabled = false;
			}
			else{
				//Game
				if(!pause.pause.current && !pause.inventory.show.current){
					pause.StopGame();
				}

				if(pause.pause.current){
					pause.popup_GoBack = false;
					if(pause.popupQuestion_InputQ != null){
						pause.popupQuestion_InputQ.showingSign.current= false;
					}

					pause.enabled = false;
					pause.pauseText.enabled = false;
				}

				if(pause.inventory.show.current){
					inventory = true;
					pause.inventory.gameObject.SetActive(false);
				}
				else{
					inventory = false;
				}
			}

			if(popupQuestion_InputQ == null){
				CreatePopupQuestion();
			}
			popupQuestion_InputQ.showingSign.current = true;
			popupQuestion_InputQ.SetTextLine("exit game?");
			quit = true;
		}
	}

	recentlyCreated = false;
	if(startScreen != null){
		currentLevel = startScreen.currentLevel;
		GetLevels();
	 }
	 
	 if(startScreen != null){
		if(saveChanges || setPlayerIslandPos){
			startScreen.prosperoIsland.PathSetLevelPos(currentLevel);
			setPlayerIslandPos = false;
		}	 
	 	if(saveChanges){
	 		saveChanges = false;
			startScreen.saveLoad.SaveGame();
		}

		//Debug.Log("Game Saved");
	 }
}

function OnLevelWasLoaded(){
	if(!recentlyCreated){
		var name : String = gameObject.name;
		gameObject.name = "Temp name";
		var newCopy : GameObject = GameObject.Find(name);
		if(newCopy != null){
			Destroy(newCopy);
		}
		gameObject.name = name;
	
	
		GetInput();

		if(startScreen == null){
			startScreen = GameObject.FindObjectOfType(StartScreen);
		}

		if(startScreen != null){
			input = startScreen.input;
			startScreen.currentLevel = currentLevel;
		}
		SetLevels();

		SetPowerUps();
		SetInventoryVals();

		pause = GameObject.FindObjectOfType.<Pause>();

		 CreateCursor();
		 //CreatePopupQuestion();
	}
}

function SetPowerUps(){
	var pIsland : ProsperoIsland = GameObject.FindObjectOfType.<ProsperoIsland>();
	if(pIsland != null){
		if(hasFireball){
			pIsland.addFireBall = true;
		}
		if(hasWings){
			pIsland.addWings = true;
		}
	}	
}

function SetLevels(){
	if(startScreen != null){
		startScreen.currentGame = currentGame;
		for(var i = 0; i <completedLevels.Length; i++){
			startScreen.levels[i].completed = completedLevels[i];
			startScreen.levels[i].catOneSaved = catOneSaved[i];
			startScreen.levels[i].catTwoSaved = catTwoSaved[i];
			startScreen.levels[i].catThreeSaved = catThreeSaved[i];
			//startScreen.saveLoad.SaveGame();
		}
	}
}

function GetLevels(){
	if(startScreen != null){
		currentGame = startScreen.currentGame;
		for(var i = 0; i <completedLevels.Length; i++){
			completedLevels[i] = startScreen.levels[i].completed;
			catOneSaved[i] = startScreen.levels[i].catOneSaved;
			catTwoSaved[i] = startScreen.levels[i].catTwoSaved;
			catThreeSaved[i] = startScreen.levels[i].catThreeSaved;
		}
	}
}

function GetInventoryVals(){
	inv = GameObject.FindObjectOfType.<Inventory>();
	if(inv != null){
		invSlots = inv.slotItem;
	}
}

function SetInventoryVals(){
	inv = GameObject.FindObjectOfType.<Inventory>();
	if(inv != null){
		if(invSlots != null && invSlots.Length == inv.slotItem.Length){
			inv.slotItem = invSlots;
		}

		inv.SetGPItemInstance();
	}
}