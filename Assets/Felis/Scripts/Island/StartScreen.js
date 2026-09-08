 #pragma strict

var currentGame : int;

var input : ControllerInput;
var titleScript : Title;
var pressButtonToStart : GameObject;
//var prospero : GameObject;
var spiral : ScreenSpiral;

var charPos : Transform;
var charPosName : String = "Island Animation Path";

var disableControllerDurationAtStart : float = 2.5;
var disableControllerDurationOnTransition : float = 1.0;

var cameraPivot : Transform;
var cameraStartingLocalPos : Vector3;
var cameraVelocity : Vector3;
var startLevelZoomBackDistance : float = 1.0;
var cameraTime : float = 1.0;
var currentLevel : int = -1;
var previousLevel : int;

var levels : IslandLevel[];
var camTargetPos : Vector3;
var enteringLevel : boolean;
var enterLevelTriggerTime : float;
var enterLevelDelay : float = 1.0;

var changedLevel : boolean;
var comingFromLevel : int;

var disableInputAfterLVLChangeDuration : float = 1.0;

var question_DeleteGame : boolean;
var question_GoBack : boolean;
var question_EnterThisLevel : boolean;

var gameSelect : GameSelect;
var showGameSelect : boolean;
var gameSelectDelay : float = .5;
var gameSelectTime : float;

var gameAText : UVFrameText;
var gameBText : UVFrameText;
var gameCText : UVFrameText;

var gameSelectName : String = "Game Select";
var lockInputAxis : boolean;

var inputAxisDeadZone : float = .1;

var saveLoad : SaveLoad;
var saveLoadName : String = "Save Load";

var prosperoIsland : ProsperoIsland;
var prosperoIslandName : String = "Prospero (Island)";

var enterLevelAudio : AudioSource;

static var level_Prologue : int = 1;
static var level_Tower : int = 2;
static var level_DarkForest : int = 3;
static var level_LostTemple : int = 4;
static var level_CrossRoads : int = 5;
static var level_DeepLake: int = 6;
static var level_GriffinTower: int = 7;
static var level_Mushrooms: int = 8;
static var level_Mines: int = 9;
static var level_Ruins : int = 10;
static var level_TreeVillage : int = 11;
static var level_PirateShip : int = 12;
static var level_Dragon : int = 13;

var tP_EnterLevel : boolean;
var tP_SetGame : int = -1;

var moreCats : RescueMoreCats;

var invAlpha : AlphaControl;
var invFadeSpeed : float = 4.0;

var quit : boolean;

@Space(30)

var popupQuestionPrefab : GameObject;
var popupQuestion : GameObject;
var popupQuestion_InputQ : InputQuestion;

@Space(30)
var sizeShowHide_State_Load : SizeShowHide[];

function CreatePopupQuestion(){
	if(popupQuestionPrefab == null){
		popupQuestionPrefab = Resources.Load("Prefabs/GUI/Popup Question", GameObject);
	}
	popupQuestion = GameObject.Instantiate(popupQuestionPrefab);
	popupQuestion_InputQ = popupQuestion.GetComponent.<InputQuestion>();

	if(input != null){
		input.GetTouchPoints();
	}
}

function PopupQuestionToggledTrue() : boolean{
	if(popupQuestion_InputQ != null && popupQuestion_InputQ.showingSign.toggledTrue){
		return true;
	}
	else{
		return false;
	}
}

function PopupQuestionToggledFalse() : boolean{
	if(popupQuestion_InputQ != null && popupQuestion_InputQ.showingSign.toggledFalse){
		return true;
	}
	else{
		return false;
	}
}

function BringPopupQuestion(question : String){
	if(popupQuestion_InputQ == null){
		CreatePopupQuestion();
	}
	if(popupQuestion_InputQ != null){
		popupQuestion_InputQ.showingSign.current = true;
		popupQuestion_InputQ.SetTextLine(question);
	}	
}

function HidePopupQuestion(){
	if(popupQuestion_InputQ != null){
		popupQuestion_InputQ.showingSign.current = false;
	}	
}

function CleanPopupQuestion(){
	if(popupQuestion_InputQ != null){
		if(!quit && !question_DeleteGame && !question_EnterThisLevel && !question_GoBack){
			if(popupQuestion_InputQ.hidden){
				Destroy(popupQuestion);
			}
		}
	}	
}

function FindSaveLoad(){
	saveLoad = GameObject.Find(saveLoadName).GetComponent(SaveLoad);
}



class IslandLevel{
	var cameraPosition : Vector3;
	
	var completed : boolean;
	var catOneSaved : boolean;
	var catTwoSaved : boolean;
	var catThreeSaved : boolean;
	
	//var levelName : GameObject;
	
	var levelNameString : String;
}

function IsLevelAvailable(levelID : int){
	switch(levelID){
		case level_Prologue:
			//if(levels[level_Prologue].completed)
				return true;
			break;
		case level_Tower:
			if(levels[level_Prologue].completed)
				return true;
			break;
		case level_DarkForest:
			if(levels[level_Tower].completed)
				return true;
			break;
		case level_LostTemple:
			if(levels[level_DarkForest].completed)
				return true;
			break;
		case level_CrossRoads:
			if(levels[level_LostTemple].completed)
				return true;
			break;
		case level_DeepLake:
			if(levels[level_CrossRoads].completed)
				return true;
			break;
		case level_GriffinTower:
			if(levels[level_CrossRoads].completed)
				return true;
			break;
	    case level_Mushrooms:
	        if(levels[level_DeepLake].completed)
	            return true;
	        break;
	    case level_Mines:
	        if(levels[level_Mushrooms].completed)
	            return true;
	        break;
	    case level_Ruins:
	        if(levels[level_Mines].completed)
	            return true;
	        break;
	    case level_TreeVillage:
	        if(levels[level_Mushrooms].completed)
	            return true;
	        break;
	    case level_PirateShip:
	        if(levels[level_Mushrooms].completed)
	            return true;
	        break;
	    case level_Dragon:
	        if(levels[level_GriffinTower].completed)
	            return true;
	        break;
	}
	return false;
}

function Start () {
	//CreatePopupQuestion();

	invAlpha = Camera.main.transform.Find("Inventory").GetComponent.<AlphaControl>();
	invAlpha.rends = invAlpha.GetComponentsInChildren.<Renderer>();
	invAlpha.mainAlpha = 0.0;

	moreCats = GameObject.FindObjectOfType.<RescueMoreCats>();

	previousLevel = currentLevel;
	
	if(currentLevel == -1){
		Camera.main.transform.parent.GetComponent.<Animation>().Play();
		input.disableUntil = Time.time + disableControllerDurationAtStart;
	}
	
	spiral.Set(spiral.closeOffset);
	
	charPos = GameObject.Find(charPosName).transform;
	
	cameraStartingLocalPos = Camera.main.transform.localPosition;

	gameSelect = GameObject.Find(gameSelectName).GetComponent(GameSelect);

	saveLoad = GameObject.Find(saveLoadName).GetComponent(SaveLoad);
	
	var allUVFrameTexts : UVFrameText [] = GameObject.FindObjectsOfType.<UVFrameText>() as UVFrameText[];
	for(var i = 0; i < allUVFrameTexts.Length; i++){
		if(allUVFrameTexts[i].transform.parent != null){
			var name : String = allUVFrameTexts[i].transform.parent.name;
			switch(name){
				case "Game A":
					gameAText = allUVFrameTexts[i];
				break;
				case "Game B":
					gameBText = allUVFrameTexts[i];
				break;
				case "Game C":
					gameCText = allUVFrameTexts[i];
				break;
			}
		}
	}
	
	prosperoIsland = GameObject.Find(prosperoIslandName).GetComponent(ProsperoIsland);
}

function Update(){
	if(currentLevel > 0){
		invAlpha.mainAlpha = Mathf.Lerp(invAlpha.mainAlpha, 1.0, Time.deltaTime * invFadeSpeed);
	}
	else{
		invAlpha.mainAlpha = 0.0;
	}

	changedLevel = false;
	if(previousLevel != currentLevel){
		input.disableUntil = Time.time + disableInputAfterLVLChangeDuration;
		changedLevel = true;
		comingFromLevel = previousLevel;
		
		previousLevel = currentLevel;
	}

	if(lockInputAxis && Mathf.Abs(input.inputAxis.current.magnitude) < inputAxisDeadZone){
		lockInputAxis = false;
	}

}

function FixedUpdate () {
	//Quit
	if(quit){
		if(popupQuestion_InputQ != null && popupQuestion_InputQ.showingSign.current){
			if(input.inputButtonA.down|| input.startButton.down){
				HidePopupQuestion();
				Debug.Log("Quit.");		
				Application.Quit();
				return;
			}
			if(input.inputButtonB.down || input.selectButton.down){
				HidePopupQuestion();
				quit = false;
				gameSelect.show = true;
				return;
			}
					
		}
		else{
			quit = false;
			gameSelect.show = true;
		}
		return;
	}

	CleanPopupQuestion();
	

	//GAME SELECT
	if(gameSelect.show && !question_DeleteGame){
		//Quit
		if(input.selectButton.down){
			BringPopupQuestion("exit game?");
			quit = true;

			gameSelect.show = false;
			return;
		}	

		//Game select menu.
		if(gameSelect.currentRow == 0){
			if(!lockInputAxis){
				if(input.inputAxis.current.x < -inputAxisDeadZone){
					if(gameSelect.currentGame > 0) gameSelect.currentGame --;
					currentGame = gameSelect.currentGame;
					lockInputAxis = true;
				}
				if(input.inputAxis.current.x > inputAxisDeadZone){
					if(gameSelect.currentGame < 3) gameSelect.currentGame ++;
					currentGame = gameSelect.currentGame;
					lockInputAxis = true;
				}
				if(tP_SetGame != -1){
					gameSelect.currentGame = tP_SetGame;
					currentGame = gameSelect.currentGame;
					tP_SetGame = -1;
				}
			}
				
			if(input.inputButtonA.down || input.inputButtonB.down || input.startButton.down){
				gameSelect.show = false;
				saveLoad.LoadGame();
				//Load Griffin Door State
				for(var sizeSH_State : SizeShowHide in sizeShowHide_State_Load){
					sizeSH_State.loadCurrentValue = true;
				}

				if(currentLevel <= 0) currentLevel = 1;
				input.disableUntil = Time.time + disableInputAfterLVLChangeDuration;
				prosperoIsland.PathSetLevelPos(currentLevel);
				return;
			}
			if(input.inputAxis.current.y < -.5){
				gameSelect.currentRow = 1;
			}
		}
		if(gameSelect.currentRow == 1){
			if(input.inputAxis.current.y > .5){
				gameSelect.currentRow = 0;
			}
			if(input.inputButtonA.down || input.inputButtonB.down || input.startButton.down){
				question_DeleteGame = true;
				BringPopupQuestion("delete game?");
				gameSelect.show = false;
				return;
			}
		}

	}

	if(!gameSelect.IsVisible() && !gameSelect.show && gameSelect.gameObject.activeSelf){
		gameSelect.gameObject.SetActive(false);
	}

	if(gameSelect.show && !gameSelect.gameObject.activeSelf){
		gameSelect.gameObject.SetActive(true);
		input.GetTouchPoints();
	}

	//DELETE GAME QUESTION
	if(question_DeleteGame){
		if(input.inputButtonA.down|| input.startButton.down){
			HidePopupQuestion();
			question_DeleteGame = false;
			saveLoad.DeleteGame(currentGame);
			saveLoad.LoadGameScore();
			UpdateGameSelectText();
			gameSelect.show = true;		
			return;
		}
		if(input.inputButtonB.down || input.selectButton.down){
			HidePopupQuestion();
			question_DeleteGame = false;
			gameSelect.show = true;
			return;
		}
	}
	
	//GO BACK
	if(question_GoBack){
		if(input.inputButtonA.down|| input.startButton.down){
			question_GoBack = false;
			HidePopupQuestion();
			currentLevel = -1;
			gameSelect.show = true;
			Camera.main.transform.parent.GetComponent.<Animation>().Play();
			input.disableUntil = Time.time + disableControllerDurationAtStart;
				

		}
		if(input.inputButtonB.down || input.selectButton.down){
			question_GoBack = false;
			HidePopupQuestion();
		}		
	}
	else{
		if(question_EnterThisLevel && !enteringLevel){
			//ENTER THIS LEVEL
			if(input.inputButtonA.down|| input.startButton.down){
				spiral.open = false;
				enteringLevel = true;
				enterLevelTriggerTime = Time.time + enterLevelDelay;
				question_EnterThisLevel = false;
				HidePopupQuestion();
				enterLevelAudio.Play();
				input.disableUntil = Time.time + disableInputAfterLVLChangeDuration;

			}
			if(input.inputButtonB.down || input.selectButton.down){
				question_EnterThisLevel = false;
				HidePopupQuestion();
			}
		}
		else{
			if(currentLevel != -1){
				//Camera Pos.

				if(enteringLevel){
					camTargetPos = charPos.position - cameraStartingLocalPos - Camera.main.transform.forward * startLevelZoomBackDistance;
				}
				else{
					camTargetPos = levels[currentLevel].cameraPosition;
				}
				cameraPivot.position = Vector3.SmoothDamp(cameraPivot.position, camTargetPos, cameraVelocity, cameraTime);
				
				//Enter Level if button pressed.
				if(!question_GoBack){
					if(input.inputButtonA.down || input.inputButtonB.down || input.startButton.down || tP_EnterLevel){
						tP_EnterLevel = false;
						if(moreCats.catsNeeded <= 0){
							question_EnterThisLevel = true;
							BringPopupQuestion("enter level?");
					    }
					    else{
					    	moreCats.MoreCatsNeeded();
					    }
					}
				}
				
				if(!question_GoBack){
					if(input.selectButton.down){
						question_GoBack = true;
						BringPopupQuestion("go back?");
					}
				}
				
				//Destroy Press Button To Start GUI object
				if(pressButtonToStart != null){
					Destroy(pressButtonToStart);
					//DestroyPressButtonToStart();
				}
			}
			else{
				/*if(pressButtonToStart != null){
					Destroy(pressButtonToStart);
				}*/
			}
		}
	}

	
	if(enteringLevel && Time.time > enterLevelTriggerTime){
	    UnityEngine.SceneManagement.SceneManager.LoadScene(levels[currentLevel].levelNameString);
	}
	
	//TITLE SCREEN
	if(titleScript != null && titleScript.started && !titleScript.wentUp){
		//if(input.inputButtonA.down || input.inputButtonB.down || input.startButton.down){
		if(Input.touchCount > 0 || Input.anyKey || Input.GetButtonDown(input.p1_ButtonA) || Input.GetButtonDown(input.p1_ButtonB) || Input.GetButtonDown(input.p1_Start)){
			titleScript.goUp = true;
			//currentLevel = 1;
			//gameSelect.show  = true;
			gameSelect.gameObject.SetActive(true);
			input.GetTouchPoints();
			showGameSelect = true;
			gameSelectTime = Time.time + gameSelectDelay;
			DestroyPressButtonToStart();
			input.disableUntil = Time.time + disableControllerDurationOnTransition;
			saveLoad.LoadGameScore();
			
			UpdateGameSelectText();
		}
	}
	
	//SHOW GAME SELECT AFTER TITLE SCREEN
	if(showGameSelect && Time.time > gameSelectTime){
		showGameSelect = false;
		gameSelect.show  = true;
	}

	//Switch Levels
	var levelWas : int = currentLevel;
	if(!question_EnterThisLevel && !question_GoBack){
		switch(currentLevel){
			case level_Prologue:
				if(PressedRight()){
					if(IsLevelAvailable(level_Tower)){// levels[level_Prologue].completed){
						currentLevel = level_Tower;
					}
				}
				break;
			case level_Tower:
				if(PressedLeft()){
					currentLevel = level_Prologue;
				}
				if(PressedRight()){
					if(IsLevelAvailable(level_DarkForest)){// levels[level_Tower].completed){
						currentLevel = level_DarkForest;
					}
				}		
				break;
			case level_DarkForest:
				if(PressedLeft()){
					if(IsLevelAvailable(level_Tower)){
						currentLevel = level_Tower;
					}
				}
				if(PressedUp()){
					if(IsLevelAvailable(level_LostTemple)){// levels[level_DarkForest].completed){
						currentLevel = level_LostTemple;
					}
				}
				break;
			case level_LostTemple: //<<<<<<<<<<<<<<<<<<
				if(PressedDown()){
					if(IsLevelAvailable(level_DarkForest)){
						currentLevel = level_DarkForest;
					}
				}
				if(PressedLeft()){
					if(IsLevelAvailable(level_CrossRoads)){
						currentLevel = level_CrossRoads;
					}
				}
				break;
			case level_CrossRoads: //<<<<<<<<<<<<<<<<<<
				if(PressedRight()){
					if(IsLevelAvailable(level_LostTemple)){
						currentLevel = level_LostTemple;
					}
				}
				if(PressedLeft()){
					if(IsLevelAvailable(level_DeepLake)){
						currentLevel = level_DeepLake;
					}
				}
				if(PressedUp()){
					if(IsLevelAvailable(level_GriffinTower)){
						currentLevel = level_GriffinTower;
					}
				}
				break;
			case level_DeepLake: //<<<<<<<<<<<<<<<<<<
				if(PressedRight()){
					if(IsLevelAvailable(level_CrossRoads)){
						currentLevel = level_CrossRoads;
					}
				}
				if(PressedLeft()){
				    if(IsLevelAvailable(level_Mushrooms)){
				        currentLevel = level_Mushrooms;
				    }
				}

				
				break;
			case level_GriffinTower:
				if(PressedDown()){
					if(IsLevelAvailable(level_CrossRoads)){
						currentLevel = level_CrossRoads;
					}
				}
				if(PressedLeft()){
					if(IsLevelAvailable(level_Dragon)){
						currentLevel = level_Dragon;
					}
				}
				break;
		    case level_Mushrooms: //<<<<<<<<<<<<<<<<<<
		        if(PressedRight()){
		            if(IsLevelAvailable(level_DeepLake)){
		                currentLevel = level_DeepLake;
		            }
		        }
		        if(PressedUp()){
		            if(IsLevelAvailable(level_Mines)){
		                currentLevel = level_Mines;
		            }
		        }
		        if(PressedLeft()){
		        	if(IsLevelAvailable(level_PirateShip)){
		        		currentLevel = level_PirateShip;
		        	}
		        }
		        if(PressedDown()){
		        	if(IsLevelAvailable(level_TreeVillage)){
		        		currentLevel = level_TreeVillage;
		        	}
		        }
		        break;
		    case level_Mines: //<<<<<<<<<<<<<<<<<<
		        if(PressedDown()){
		            if(IsLevelAvailable(level_Mushrooms)){
		                currentLevel = level_Mushrooms;
		            }
		        }
		        if(PressedRight()){
		            if(IsLevelAvailable(level_Ruins)){
		                currentLevel = level_Ruins;
		            }
		        }
		        break;
		   case level_Ruins:
		        if(PressedLeft()){
		        	if(IsLevelAvailable(level_Mines)){
		        		currentLevel = level_Mines;
		        	}
		        }
		        break;
		   case level_TreeVillage: //<<<<<<<<<<<<<<<<<<
		        if(PressedUp()){
		        	if(IsLevelAvailable(level_Mushrooms)){
		        		currentLevel = level_Mushrooms;
		        	}
		        }
		        break;
		   case level_PirateShip: //<<<<<<<<<<<<<<<<<<
		        if(PressedRight()){
		        	if(IsLevelAvailable(level_Mushrooms)){
		        		currentLevel = level_Mushrooms;
		        	}
		        }
		        break;
		   case level_Dragon:
		        if(PressedRight()){
		        	if(IsLevelAvailable(level_GriffinTower)){
		        		currentLevel = level_GriffinTower;
		        	}
		        }
		        break;
		}
	}
	if(levelWas != currentLevel){
		input.disableUntil = Time.time + disableControllerDurationAtStart;
	}

}


function PressedLeft():boolean{
	return input.inputAxis.current.x < -.5;
}
function PressedRight():boolean{
	return input.inputAxis.current.x > .5;
}
function PressedUp():boolean{
	return input.inputAxis.current.y > .5;
}
function PressedDown():boolean{
	return input.inputAxis.current.y < -.5;
}

function UpdateGameSelectText(){
	if(saveLoad.gameAScore == 0.0) gameAText.displayText = "EMPTY";
	if(saveLoad.gameBScore == 0.0) gameBText.displayText = "EMPTY";
	if(saveLoad.gameCScore == 0.0) gameCText.displayText = "EMPTY";
	
	if(saveLoad.gameAScore == 100.0) gameAText.displayText = "COMPLETED";
	if(saveLoad.gameBScore == 100.0) gameBText.displayText = "COMPLETED";
	if(saveLoad.gameCScore == 100.0) gameCText.displayText = "COMPLETED";
	
	if(saveLoad.gameAScore > 0.0 && saveLoad.gameAScore < 100.0) gameAText.displayText = "SCORE " + saveLoad.gameAScore.ToString().Substring(0,Mathf.Floor(saveLoad.gameAScore).ToString().Length) + "%";
	if(saveLoad.gameBScore > 0.0 && saveLoad.gameBScore < 100.0) gameBText.displayText = "SCORE " + saveLoad.gameBScore.ToString().Substring(0,Mathf.Floor(saveLoad.gameBScore).ToString().Length) + "%";
	if(saveLoad.gameCScore > 0.0 && saveLoad.gameCScore < 100.0) gameCText.displayText = "SCORE " + saveLoad.gameCScore.ToString().Substring(0,Mathf.Floor(saveLoad.gameCScore).ToString().Length) + "%";
	
	gameAText.updateText = true;
	gameBText.updateText = true;
	gameCText.updateText = true;	
}

function DestroyPressButtonToStart(){
		if(pressButtonToStart != null){
			pressButtonToStart.GetComponent(ColorAnimation).enabled = false;
			var fadeAndDestroy : FadeAndDestroy = pressButtonToStart.AddComponent(FadeAndDestroy);
			fadeAndDestroy.useRenderer = pressButtonToStart.GetComponent.<Renderer>();
			fadeAndDestroy.beginDestroy = true;
			fadeAndDestroy.propertyName = "_Color";
			fadeAndDestroy.timeLeft = 1.0;
			fadeAndDestroy.totalTime = fadeAndDestroy.timeLeft;
		}	
}