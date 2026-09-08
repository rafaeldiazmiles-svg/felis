#pragma strict

var animComp : Animation;

var pressButtonAnimation : AnimationClip;

var button : Transform;

var prosperoHead : Transform;
var prosperoRB : Rigidbody;
var prosperoClampXPosition : ClampXPosition;

var pressDistance : float;

var pressed : boolean;

var pressTime : float;

var flagTrigger : TriggerAnimation;
var flagTriggered : boolean;
var flagHoldDuration : float;


var cameraFollow : FollowCharacter;
var cameraStayInRoom : StayInRoom;
var cameraLockPositionTransform : Transform;
var cameraLockPosition : Vector3;
var lockSpeed : float;

var clampXPos : Vector2;

var zerkyRays : ZerkyRays;

var screenSpiral : ScreenSpiral;
var spiralHoldDuration : float;

var autoGetParty : boolean = true;
var catTag : String = "Cat";
var endLevelParties : CharacterParty[];

var rockets : Rocket[];

var confetti : Confetti;

var globalValues : HoldGlobalValues;
var globalValuesName : String = "Hold Global Values";
var thisLevel : int;

var afterPressEnableBackToIslandDelay : float = 2.0;
var canGoBackToIsland : boolean;
var backToIslandPressButton : ToggleBoolean;
var islandLevelName : String = "Island";
var backToIslandDelay : float = 3.5;

var pressButtonGUIAnim : ColorAnimation;
var pressButtonToContName : String = "Press Button To Continue";

var getInputFromPlayer : boolean = true;
var input : ControllerInput;

var victoryJingle : AudioSource;
var gameMusic : AudioSource;
var gameMusicTag : String = "Game Music";
var gameMusicFadeSpeed : float = 5.0;

var buttonSound : AudioSource;

var playerTag : String = "Player";

var useEndBounds : BoundsArray;
var playerOnEndBounds : boolean;

var NoNeedToPressButton : boolean;

var reset : boolean;

var debug : boolean;

function Start () {
	animComp = GetComponent.<Animation>();
	
	
	
	screenSpiral = Camera.main.transform.GetComponentInChildren.<ScreenSpiral>();
	
	var gameMusicObj : GameObject = GameObject.FindGameObjectWithTag(gameMusicTag);
	gameMusic = gameMusicObj.GetComponent.<AudioSource>();
	
	cameraFollow = Camera.main.transform.root.GetComponent.<FollowCharacter>();
	
	cameraStayInRoom = Camera.main.transform.root.GetChild(0).GetComponent.<StayInRoom>();
	
	if(autoGetParty){
		GetEndLevelParties();
	}
	
	confetti = GetComponentInChildren(Confetti);
	
	var gVals : GameObject = GameObject.Find(globalValuesName);
	if(gVals != null) globalValues = gVals .GetComponent(HoldGlobalValues);
	
	if(globalValues != null){
		thisLevel = globalValues.currentLevel;
	}

	
	var pressButtonObj : GameObject = GameObject.Find(pressButtonToContName);
	if(pressButtonObj != null){
		pressButtonGUIAnim = pressButtonObj.GetComponent(ColorAnimation);
	}

	pressButtonGUIAnim.enabled = false;
	
	if(getInputFromPlayer){
		GetPlayer();//input = GameObject.FindGameObjectWithTag(playerTag).GetComponentInChildren(ControllerInput);
	}
}

function GetEndLevelParties(){
	var allCats : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
	endLevelParties = new CharacterParty[allCats.Length];
	for(var i = 0; i < endLevelParties.Length; i++){
		endLevelParties[i] = allCats[i].GetComponentInChildren(CharacterParty);
	}	
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		input = playerObj.GetComponentInChildren.<ControllerInput>();	
		var children : Transform[] = playerObj.GetComponentsInChildren.<Transform>() as Transform[];
		for(var i = 0; i < children.Length; i++){
			if(children[i].name.ToLower().Contains("head")){
				prosperoHead = children[i];
				break;
			}
		}
		prosperoRB = playerObj.GetComponentInChildren.<Rigidbody>();
		prosperoClampXPosition = playerObj.GetComponentInChildren.<ClampXPosition>();
	}
}

function FixedUpdate(){
	if(canGoBackToIsland){
		if(input.inputButtonA.down || input.inputButtonB.down || NoNeedToPressButton){
			backToIslandPressButton.current = true;
			screenSpiral.open = false;
		}
	}
}


function Update() {
	if(input == null){
		GetPlayer();
	}
	
	if(pressed){
		gameMusic.volume = Mathf.Lerp(gameMusic.volume, 0.0, Time.deltaTime * gameMusicFadeSpeed);
	}
	
	if(!flagTriggered && pressed && Time.time > pressTime + flagHoldDuration){
		flagTriggered = true;
		if(flagTrigger != null){
			flagTrigger.play = true;
		}

		if(zerkyRays != null){
			zerkyRays.oppositeFade = true;
			
			for(var i = 0; i < zerkyRays.zerkiesInRange+1; i++){
				rockets[i].shootTriggerTime += Time.time;
				rockets[i].readyToShoot = true;
			}
		}
	}
	
	if(pressed && Time.time > pressTime + afterPressEnableBackToIslandDelay){
		canGoBackToIsland = true;
	}

	backToIslandPressButton.Update();
	if(backToIslandPressButton.current && Time.time > backToIslandPressButton.toggledTrueTime + backToIslandDelay){
		if(reset && globalValues != null){
			globalValues.currentLevel = -1;
		}
		UnityEngine.SceneManagement.SceneManager.LoadScene(islandLevelName);
	}
	
	if(pressed){
		if(cameraLockPositionTransform != null) cameraLockPosition = cameraLockPositionTransform.position;
		Camera.main.transform.position = Vector3.Lerp(Camera.main.transform.position, cameraLockPosition, Time.deltaTime * lockSpeed);
	}
	
	for(i = 0; i < endLevelParties.Length; i++){
		if(endLevelParties[i] == null){
			GetEndLevelParties();
			break;
		}

	}	

	//Press Button
	if(animComp != null && animComp[pressButtonAnimation.name].enabled == false 
	&& prosperoRB != null
	&& prosperoRB.velocity.y > 0
	&& Vector3.Distance(prosperoHead.position, button.position) < pressDistance
	|| playerOnEndBounds){
		if(!pressed){
			pressed = true;
			pressTime = Time.time;

			if(victoryJingle != null){
				victoryJingle.Play();
			}
			if(!playerOnEndBounds){
				buttonSound.Play(); 
			}
			
			cameraFollow.enabled = false;
			cameraStayInRoom.enabled = false;
			Camera.main.transform.GetComponent(DefaultTransformFixedUpdate).enabled = false;
			
			if(prosperoClampXPosition != null){
				prosperoClampXPosition.minX = transform.position.x + clampXPos.x;
				prosperoClampXPosition.maxX = transform.position.x + clampXPos.y;
			}
			
			for(i = 0; i < endLevelParties.Length; i++){
				if(endLevelParties[i] == null) continue;
				endLevelParties[i].partying.current = true;
			}

			if(confetti != null){
				confetti.emitting.current = true;
			}

			pressButtonGUIAnim.enabled = true;
			pressButtonGUIAnim.startTime = Time.time;
			
			var cats : Cats = GameObject.FindObjectOfType(Cats);
			//var savedCats : int;
			var catOneSaved : boolean;
			var catTwoSaved : boolean;
			var catThreeSaved : boolean;

			if(zerkyRays != null){
				for(var n = 0; n < zerkyRays.zerkies.Length; n++){
					if(zerkyRays.zerkies[n].inside.current){
						//savedCats++;
						if(cats != null){
							var catNumber : int = cats.GetCatNumber(zerkyRays.zerkies[n].zerky);
							if(catNumber == 1) catOneSaved = true;
							if(catNumber == 2) catTwoSaved = true;
							if(catNumber == 3) catThreeSaved = true;
						}
					}
				}
			}

			if(globalValues != null){
				globalValues.completedLevels[thisLevel] = true;
				
				if(!globalValues.catOneSaved[thisLevel]) globalValues.catOneSaved[thisLevel] = catOneSaved;
				if(!globalValues.catTwoSaved[thisLevel]) globalValues.catTwoSaved[thisLevel] = catTwoSaved;
				if(!globalValues.catThreeSaved[thisLevel]) globalValues.catThreeSaved[thisLevel] = catThreeSaved;
				
				globalValues.lastDefeatedLevel = thisLevel;

				globalValues.GetInventoryVals();
				globalValues.saveChanges = true;
			}

		}
		else{
			if(animComp != null && Time.time > pressTime + .5){
				animComp[pressButtonAnimation.name].AddMixingTransform(button.parent);
			}
		}

		if(animComp != null){
			animComp[pressButtonAnimation.name].enabled = true;
			animComp[pressButtonAnimation.name].weight = 1.0;
			animComp[pressButtonAnimation.name].time = 0.0;
		}
	}

	if(useEndBounds != null && prosperoHead != null){
		if(useEndBounds.ContainsWithCenter(prosperoHead.position, transform.position)){
			playerOnEndBounds = true;
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.yellow;
		Gizmos.DrawLine(transform.position + Vector3(clampXPos.x, -10, 0), transform.position + Vector3(clampXPos.x, 10, 0));
		Handles.Label(transform.position + Vector3(clampXPos.x,0,0), "Min");
		Gizmos.DrawLine(transform.position + Vector3(clampXPos.y, -10, 0), transform.position + Vector3(clampXPos.y, 10, 0));
		Handles.Label(transform.position + Vector3(clampXPos.y,0,0), "Max");
		Gizmos.color = Color.red;
		useEndBounds.DrawWireCubesWithCenter(transform.position);
	}
	#endif
}