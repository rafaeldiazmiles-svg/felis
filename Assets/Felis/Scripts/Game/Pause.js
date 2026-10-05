#pragma strict

var pauseSound : AudioSource;
var overlay : Renderer;
var controller : ControllerInput;
var spiral : ScreenSpiral; 
var globalValues : HoldGlobalValues;
var inventory : Inventory;
var inventoryChildren : Transform[];
@Space(10)
var pauseText : Renderer;
var infoText : Renderer;
var info_GoBackButtons : Renderer[]; //Several for several platforms

@Space(50)
var overlayName : String = "Overlay";
var pauseTextName : String = "Paused";
var info_GoBackButtonsParentName : String = "Go Back - Pause";
var info_GoBackButtons_BaseName : String = "Go Back Button";
var spiralName : String = "Screen Spiral";
var globalValuesName : String = "Hold Global Values";
var islandLevelName : String = "Island";
var playerTag : String = "Player";
var _propName : String = "_LerpVal";
var darkenAmount : float = .5;

@Space(50)
var pause : ToggleBoolean;
var stop : boolean;
var overlayLerp : FloatLerp;
var alreadyDisabled : Array;
var alreadyDisabledAnim : Array;
var alreadyDisabledKinematicRB : Array;
var exitingLevel : boolean;
var userPaused : boolean;
var unStoppedThisFrame : boolean;
var allScripts : MonoBehaviour[];
var allRbs : Rigidbody[];
var allAnims : Animation[];
@Space(30)
var cursorComponents : MonoBehaviour[];
@Space(30)
var noPauseNames : String[];
@Space(30)
var popupQuestionPrefab : GameObject;
var popupQuestion : GameObject;
var popupQuestion_InputQ : InputQuestion;
@Space(30)
var popup_GoBack : boolean;
@Space(30)
var allSounds : AudioSource[];

function CreatePopupQuestion(){
	if(popupQuestionPrefab == null){
		popupQuestionPrefab = Resources.Load("Prefabs/GUI/Popup Question", GameObject);
	}
	popupQuestion = GameObject.Instantiate(popupQuestionPrefab);
	popupQuestion_InputQ = popupQuestion.GetComponent.<InputQuestion>();

	if(controller == null){
		GetController();
	}

	if(controller != null){
		controller.GetTouchPoints();
	}
}

function IsCursorScript(script : MonoBehaviour) : boolean{
	if(cursorComponents != null){
		for(var i = 0; i < cursorComponents.Length; i++){
			if(script == cursorComponents[i]){
				return true;
			}
		}
	}

	return false;
}

function Start () {
	pauseSound = GetComponent.<AudioSource>();
	info_GoBackButtons = new Renderer[0];
	inventoryChildren = new Transform[0];

	if(Camera.main != null){
		var overlayTr : Transform = Camera.main.transform.Find(overlayName);
		if(overlayTr != null) overlay = overlayTr.GetComponent.<Renderer>();

		var pauseTextTr : Transform = Camera.main.transform.Find(pauseTextName);
		if(pauseTextTr != null) pauseText = pauseTextTr.GetComponent.<Renderer>();

		var info_GoBackButtons_Obj : Transform = Camera.main.transform.Find(info_GoBackButtonsParentName);
		if(info_GoBackButtons_Obj != null){
			var goBackButtonArray : Array = new Array();
			for(var i = 0; i < info_GoBackButtons_Obj.childCount ; i++){
				if(info_GoBackButtons_Obj.GetChild(i).name.Contains(info_GoBackButtons_BaseName)){
					goBackButtonArray.Add(info_GoBackButtons_Obj.GetChild(i).GetComponent.<Renderer>());
				}
			}
			info_GoBackButtons = goBackButtonArray.ToBuiltin(Renderer);
		}
	}

	spiral = GameObject.FindObjectOfType.<ScreenSpiral>();
	if(pauseText != null){
		pauseText.enabled = false;
	}

	for(var info_GoBackButton : Renderer in info_GoBackButtons){
		if(info_GoBackButton != null) info_GoBackButton.enabled = false;
	}

	inventory = GameObject.FindObjectOfType.<Inventory>();
	if(inventory != null){
		inventoryChildren = inventory.GetComponentsInChildren.<Transform>();
	}

	var gVals : GameObject = GameObject.Find(globalValuesName);
	if(gVals != null) globalValues = gVals .GetComponent(HoldGlobalValues);	
	
	if(overlayLerp.speed == 0.0){
		overlayLerp.speed = 15.0;
	}
	
	alreadyDisabledKinematicRB = new Array();
	alreadyDisabled = new Array();
	alreadyDisabledAnim = new Array();
}

function FixedUpdate () {
	if(!popup_GoBack && popupQuestion_InputQ != null && popupQuestion_InputQ.hidden){
		Destroy(popupQuestion);
	}

	pause.Update();
	overlayLerp.Lerp();
	
	if(controller == null){
		GetController();
	}
	else{
		if(exitingLevel){
			if(spiral.offsetMaterial.offset.x < 0.001){
			    UnityEngine.SceneManagement.SceneManager.LoadScene(islandLevelName);
			    if(globalValues != null){
					globalValues.setPlayerIslandPos = true;
				}
			}
		}
		else{
			if(pause.current && popup_GoBack){
				if(controller.inputButtonA.down){
					spiral.enabled = true;
					spiral.offsetMaterial.enabled = true;
					spiral.open = false;
					exitingLevel = true;
					if(popupQuestion_InputQ != null){
						popupQuestion_InputQ.showingSign.current= false;
					}
				}
				if(controller.inputButtonB.down || controller.selectButton.down){
					if(popupQuestion_InputQ != null){
						popupQuestion_InputQ.showingSign.current = false;
					}
					popup_GoBack = false;
				}

			}
			else{
				if(controller.startButton.down){
					if(inventory == null || !inventory.show.current){
						pause.current = !pause.current;
					}
				}
			}

			if(pause.current){
				if(controller.inputButtonA.down){
					if(popupQuestion_InputQ == null){
						CreatePopupQuestion();
					}
					popupQuestion_InputQ.showingSign.current = true;
					popupQuestion_InputQ.SetTextLine("go back?");
					popup_GoBack = true;
				}

				if(controller.selectButton.down){
					pause.current = false;
				}

				if(pauseText != null) pauseText.enabled = !popup_GoBack;
			}
		}
	}
	
	if(pause.toggledTrue){
		pauseSound.Play();
		Darken();

		
			if(!popup_GoBack){
			if(pauseText != null) pauseText.enabled = true;
			for(var info_GoBackButton : Renderer in info_GoBackButtons){
				if(info_GoBackButton != null) info_GoBackButton.enabled = true;
			}

			if(infoText != null){
				infoText.enabled = true;
			}
		}

		StopGame();

		//Stop sounds
		StopAudio();
		
	}

	unStoppedThisFrame = false;

	if(pause.toggledFalse){
		UnDarken();
		if(pauseText != null) pauseText.enabled = false;
		for(var info_GoBackButton : Renderer in info_GoBackButtons){
			if(info_GoBackButton != null) info_GoBackButton.enabled = false;
		}
		if(infoText != null){
			infoText.enabled = false;
		}
		if(popupQuestion_InputQ != null){
			popupQuestion_InputQ.showingSign.current = false;
		}
		popup_GoBack = false;


		UnStopGame();

		//Sounds.
		 UnstopAudio();
	}

	if(overlay != null){
		overlay.material.SetFloat(_propName, overlayLerp.current);
	}
}

function Darken(){
	overlayLerp.target = darkenAmount;
}

function UnDarken(){
	overlayLerp.target = 0.0;
}

function StopAudio(){
	allSounds = GameObject.FindObjectsOfType.<AudioSource>();
	for(var w = 0; w < allSounds.Length; w++){
		if(allSounds[w] == pauseSound){
			continue;
		}

		allSounds[w].Pause();
	}
}

function UnstopAudio(){
	//allSounds = GameObject.FindObjectsOfType.<AudioSource>();
	for(var w = 0; w < allSounds.Length; w++){
		if(allSounds[w] == pauseSound){
			continue;
		}

		if(allSounds[w] == null){
			continue;
		}

		allSounds[w].UnPause();
	}	
}

function UnStopGame(){
	stop = false;

	//Scripts
	for(var i = 0; i < allScripts.Length; i++){
		if(allScripts[i] == null){
			continue;
		}
		var cont : boolean = false;
		for(var ii = 0; ii < alreadyDisabled.length; ii ++){
			if(alreadyDisabled[ii] == i){
				cont = true;
				break;
			}
		}

		if(cont){
			continue;
		}

		allScripts[i].enabled = true;
	}
	
	//RB
	for(var n = 0; n < allRbs.Length; n++){
		cont = false;
		for(var nn = 0; nn < alreadyDisabledKinematicRB.length; nn++){
			if(alreadyDisabledKinematicRB[nn] == n){
				cont = true;
				break;
			}
		}
		if(cont){
			continue;
		}

		allRbs[n].isKinematic = false;
	}
	//Anims
	for(var m = 0; m < allAnims.Length; m++){
		cont = false;
		for(var mm = 0; mm < alreadyDisabledAnim.length; mm++){
			if(alreadyDisabledAnim[mm] == m){
				cont = true;
				break;
			}
		}
		if(cont){
			continue;
		}

		if(allAnims[m] == null){
			continue;
		}

		allAnims[m].enabled = true;
	}

	unStoppedThisFrame = true;
}

function StopGame(){
	stop = true;

	///Stop scrips
	alreadyDisabled.Clear();

	var cont : boolean;

	allScripts = GameObject.FindObjectsOfType.<MonoBehaviour>();
	for(var i = 0; i < allScripts.Length; i++){
		if(allScripts[i] == this
		|| allScripts[i] == controller
		|| allScripts[i] == globalValues
		|| allScripts[i] instanceof PreserveAfterSceneChange
		|| allScripts[i] instanceof Parent
		|| allScripts[i] instanceof SpriteSheetLoop
		|| allScripts[i] instanceof SpriteSheetUV
		|| allScripts[i] instanceof OffsetFramesAnim
		|| allScripts[i] instanceof OffsetFrames
		|| allScripts[i] instanceof TouchPoint
		|| allScripts[i] instanceof ControllerInput
		|| allScripts[i] instanceof TouchPointDialog
		|| allScripts[i] instanceof FaceCameraFix
		|| allScripts[i] instanceof DefaultTransformUpdate
		|| allScripts[i] instanceof DefaultTransformLateUpdate
		|| allScripts[i] instanceof DefaultTransformFixedUpdate
		|| allScripts[i] instanceof Inventory
		|| allScripts[i] instanceof TriggerAnimation
		|| allScripts[i] instanceof AlphaControl
		|| allScripts[i] instanceof ScreenPosition
		|| allScripts[i] instanceof OffsetFrames
		|| allScripts[i] instanceof OffsetFramesAnim
		|| allScripts[i] instanceof ButtonPressAnimation
		|| allScripts[i] instanceof DPadAnimation
		|| allScripts[i] instanceof ListAnimWeights
		|| allScripts[i] instanceof ScreenSpiral
		|| allScripts[i] instanceof OffsetMaterial
		|| allScripts[i] instanceof GroundAngle
		|| allScripts[i] instanceof InputQuestion
		|| allScripts[i] instanceof FontMeshArrange
		|| allScripts[i] instanceof Death
		|| allScripts[i] instanceof Animation
		|| allScripts[i] instanceof LoadingText
		|| allScripts[i] instanceof StartScreen
		|| allScripts[i] instanceof MenuSound
		|| allScripts[i] instanceof SaveLoad
		|| allScripts[i] instanceof INTRO_Control
		|| allScripts[i] instanceof TutorialControl_LVL1
		|| allScripts[i] instanceof Platform
		|| IsCursorScript(allScripts[i]))
		{
			continue;
		}

		if(IsInventoryComp(allScripts[i])) {
			continue;
		}

		cont = false;
		for(var w = 0; w < noPauseNames.Length; w++){
			if(allScripts[i].gameObject.name == noPauseNames[w]){
				cont = true;
				break;
			}
		}
		if(cont){
			continue;
		}

		if(allScripts[i].enabled == false){
			alreadyDisabled.Push(i);
		}
		else{
			allScripts[i].enabled = false;
		}
	}
	
	///Stop RB
	alreadyDisabledKinematicRB.Clear();
		
	allRbs = GameObject.FindObjectsOfType.<Rigidbody>();
	for(var n = 0; n < allRbs.Length; n++){
		if(allRbs[n].isKinematic == true){
			alreadyDisabledKinematicRB.Push(n);
		}
		else{
			allRbs[n].isKinematic = true;
		}
	}
	
	///Stop ANIMATION
	alreadyDisabledAnim.Clear();
	
	allAnims = GameObject.FindObjectsOfType.<Animation>();
	for(var m = 0; m < allAnims.Length; m++){
		if(allAnims[m].gameObject.GetComponent.<Inventory>() != null){
			continue;
		}

		cont = false;
		for(w = 0; w < noPauseNames.Length; w++){
			if(allAnims[m].gameObject.name == noPauseNames[w]){
				cont = true;
				break;
			}
		}
		if(cont){
			continue;
		}

		if(allAnims[m].enabled == false){
			alreadyDisabledAnim.Push(m);
		}
		else{
			allAnims[m].enabled = false;
		}
		
	}	
}

function GetController(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		controller = playerObj.GetComponentInChildren.<ControllerInput>();
	}
}

function IsInventoryComp(comp : MonoBehaviour){
	if(inventoryChildren == null) return false;
	for(var i = 0; i < inventoryChildren.Length; i++){
		if(comp.transform == inventoryChildren[i]){
			return true;
		}
	}

	return false;
}

function GetInfoTextRend(setRend : Renderer){
	infoText = setRend;
}
