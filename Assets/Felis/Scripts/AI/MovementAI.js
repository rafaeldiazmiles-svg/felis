#pragma strict

var character : Transform;
var controller : ControllerInput;
var sideMovement : SideMovement;
var sideDetection : SideDetection;
var isGrounded : IsGrounded;
var underWater : UnderWater;
var pickedRB : PickableRigidbody;
@Space(20)
var horizontalInput : float;
var moveVector : float;
var hDistance : float;
@Space(20)
var enableMovement : boolean;
@Space(20)
var onTarget : ToggleBoolean;
var target : Transform;
var targetPosition : Vector3;
var nextTargetUpdateTime : float;
var targetUpdateEvery : Vector2 = Vector2(.1,.3);
@Space(20)
var preciseUntil : float;
var preciseDist : float = .2;
@Space(20)
var moveTowardsTargetDistance : float = 1.5;
var useMoveTowardsTargetDist : float;
@Space(20)
var stopMovingDistance : float = .5;
var useStopMovingDist : float;
@Space(20)
var blockDistanceCheck : float = 1.1;

var offset : float;
var runAwayMode : boolean; //
@Space(20)
var disableUntil : float;
var disableJumpUntil : float;
var disable : boolean;
@Space(40)
var targetInStairCollider : boolean;
var allStairs : StairCollider[];
var nearStairDistance : float = 6.0;
var stairCloseby : StairCollider;
var previousStairCloseBy : StairCollider;
var stairCharacter : StairCharacter;
//var stairTurnAroundDistance : float = .3; //Reach first half of the stairs at this distance;
var stairTurnAroundUntil : float; //After reaching the first half, go the other way until this time.
var stairTurnAruondDuration : float = 3.0;
var getTimer : Timer;
@Space(20)
var debug : boolean;
@Space(20)
var needToSwimUpHeight : float = 1.0;
var buttonTimer : Timer;
@Space(20)
var forceTargetPos : boolean;
var forceTargetPosVal : Vector3;
var faceTgtOnTgt : boolean = true; //Face target even when on target.current = true;
@Space(20)
var keepEnemyDist : boolean;
var keepDist : EnemyKeepDistance[];
var getKeepDist : ToggleBoolean;
var keepingDist : boolean;
@Space(20)
var useDisableAnim : boolean;
var disabledMovement_LoopAnim : PlayLoopAnimation;
@Space(20)
var baloonThoughtPrefab : GameObject;
var baloonThought : GameObject;
var baloonThought_AlphaControl : AlphaControl;
var baloonThought_AlphaLerpSpeed : float = 10.0;
var baloonThought_Show : ToggleBoolean;
var baloonThought_HideDelay : float = 1.0;
var baloonThought_IconRend : Renderer;
var baloonThought_SandWatchTexture : Texture;
var baloonThought_LightbulbTexture : Texture;

@Space(20)
var forceMovementAI_CurrentPriority : int;

function ResetForceMovementAIPriority(){
	yield WaitForEndOfFrame();
	forceMovementAI_CurrentPriority = 0;
}

function LoadBaloonThoughtTextures(){
	if(baloonThought_SandWatchTexture == null){
		baloonThought_SandWatchTexture = Resources.Load("Textures/GUI/Baloons/Baloon Sand Watch", Texture);
	}
	if(baloonThought_LightbulbTexture == null){
		baloonThought_LightbulbTexture = Resources.Load("Textures/GUI/Baloons/Baloon Lightbulb", Texture);
	}
}

function CharacterDestroy(){
	if(baloonThought != null){
		Destroy(baloonThought);
	}
}

function LoadBaloonThought(){
	if(baloonThoughtPrefab != null){
		baloonThought = GameObject.Instantiate(baloonThoughtPrefab);
		baloonThought.transform.position = transform.position;
		var mainParent : Transform = baloonThought.transform.Find("Small 1");
		var mainParentPA : PropAttach = mainParent.GetComponent.<PropAttach>();
		mainParentPA.FindBoneForChar(transform.parent);
		baloonThought_AlphaControl = baloonThought.GetComponent.<AlphaControl>();

		var iconObj : Transform = baloonThought.transform.Find("Main/Icon");
		baloonThought_IconRend = iconObj.GetComponent.<Renderer>();
	}
}

function ShowThoughtBaloon(){
	if(baloonThought == null){
		LoadBaloonThought();
	}

	if(baloonThought != null){
		if(!baloonThought.activeSelf){
			baloonThought.SetActive(true);
			baloonThought.transform.position = transform.position;
		}

		baloonThought_AlphaControl.mainAlpha = Mathf.Lerp(baloonThought_AlphaControl.mainAlpha, 1.0, baloonThought_AlphaLerpSpeed * Time.deltaTime);
	}

	baloonThought_Show.current = true;
}


function HideThoughtBaloon(){
	if(baloonThought != null){
		baloonThought_Show.Update();

		if(!baloonThought_Show.current && Time.time > baloonThought_Show.toggledFalseTime + baloonThought_HideDelay){
			baloonThought_AlphaControl.mainAlpha = Mathf.Lerp(baloonThought_AlphaControl.mainAlpha, 0.0, baloonThought_AlphaLerpSpeed * Time.deltaTime);
			if(baloonThought_AlphaControl.mainAlpha < .05){
				baloonThought.SetActive(false);
			}
		}

		baloonThought_Show.current = false;
	}
}


function DisableAnim(){
	if(disabledMovement_LoopAnim != null){
		if(useDisableAnim && !enableMovement && (pickedRB == null || !pickedRB.beingPicked.current)){
			disabledMovement_LoopAnim.animationPlay.current = true;
			ShowThoughtBaloon();
		}
		else{
			disabledMovement_LoopAnim.animationPlay.current = false;;
		}
	}

	if(baloonThought_IconRend != null && disabledMovement_LoopAnim.animationPlay.toggledTrue){
		baloonThought_IconRend.material.mainTexture = baloonThought_SandWatchTexture;
	}
}




function ForceTargetPos(pos : float){
	enableMovement = true;
	forceTargetPos = true;
	forceTargetPosVal = Vector3(pos,0,0);
}

function DisableMovement(){
	enableMovement = false;
}

function Setup(setCharacter : Transform){
	character = setCharacter;
	if(controller == null) controller = character.GetComponentInChildren(ControllerInput);
	if(sideMovement == null) sideMovement = character.GetComponentInChildren(SideMovement);
	if(sideDetection == null) sideDetection = character.GetComponentInChildren(SideDetection);
	if(isGrounded == null) isGrounded = character.GetComponentInChildren(IsGrounded);
	if(underWater == null) underWater = character.GetComponentInChildren(UnderWater);
	if(pickedRB == null) pickedRB = character.GetComponentInChildren.<PickableRigidbody>();
}

function Start () {
	LoadBaloonThoughtTextures();

	if(baloonThoughtPrefab == null){
		baloonThoughtPrefab = Resources.Load("Prefabs/GUI/Baloons/For Cat/Baloon Thought_Cat", GameObject);
	}

	if(character == null){
		if(transform.parent != null){
			Setup(transform.parent);
		}
		else{
			Setup(transform);
		}
	}

	GetStairs();
	
	if(getTimer.every == 0.0){
		getTimer.every = 6.0;
	}
	
	GetKeepDist();

	buttonTimer.every = .1;
	buttonTimer.randomize = .03;
}

function GetStairs(){
	allStairs = GameObject.FindObjectsOfType.<StairCollider>();
}

function GetKeepDist(){
	yield WaitForEndOfFrame();
	var keepDistArray : Array = new Array();
	var allKeepDist : EnemyKeepDistance[] = GameObject.FindObjectsOfType.<EnemyKeepDistance>();
	for(var i = 0; i < allKeepDist.Length; i++){
		var movAI : MovementAI = allKeepDist[i].GetComponentInChildren.<MovementAI>();
		if(movAI == null || movAI != this){
			keepDistArray.Add(allKeepDist[i]);
		}
	}
	keepDist = keepDistArray.ToBuiltin(EnemyKeepDistance);

	getKeepDist.current = false;
}


function Update () {
	ResetForceMovementAIPriority();

	HideThoughtBaloon();

	getKeepDist.Update();
	if(getKeepDist.toggledTrue){
		GetKeepDist();
	}

	if(Time.time > preciseUntil){
		useStopMovingDist = stopMovingDistance;
		useMoveTowardsTargetDist = moveTowardsTargetDistance;
	}
	else{
		useStopMovingDist = preciseDist;
		useMoveTowardsTargetDist = preciseDist;
	}

	buttonTimer.Update();

	if(disable){
		return;
	}

	//Update target position.
	if(target !=  null && Time.time > nextTargetUpdateTime){
		nextTargetUpdateTime = Time.time + Random.Range(targetUpdateEvery.x, targetUpdateEvery.y);
		targetPosition = target.position + Vector3(offset, 0 ,0);
	}

	keepingDist = false;
	if(keepEnemyDist){
		if(keepDist != null){
			for(var	i = 0; i < keepDist.Length; i++){
				if(keepDist[i] == null){
					getKeepDist.current = true;
					continue;
				}
				var dist : float = Vector3.Distance(transform.position, keepDist[i].transform.position);
				if(dist < keepDist[i].distance && !keepDist[i].disable){
					targetPosition = (transform.position - keepDist[i].transform.position).normalized * keepDist[i].distance;
					keepingDist = true;
					break;
				}
			}
		}
	}

	if(forceTargetPos){
		targetPosition = forceTargetPosVal;
	}
	
	moveVector = character.position.x - targetPosition.x;
	hDistance = Mathf.Abs(moveVector);
	
	//Vertical


	//Stairs spiral.
	stairCloseby = null;
	for(i = 0; i < allStairs.Length; i++){
		if(allStairs[i] == null) continue;
		if(Vector3.Distance(transform.position, allStairs[i].transform.position) < nearStairDistance){
			stairCloseby = 	allStairs[i];
		}
	}
	if(previousStairCloseBy != stairCloseby){
		previousStairCloseBy = stairCloseby;
		
		if(stairCloseby != null){
			for(var charID : int = 0; charID < stairCloseby.stairCharacters.Length; charID++) {
				if(stairCloseby.stairCharacters[charID].character == character){
					stairCharacter = stairCloseby.stairCharacters[charID];
				}
			}
		}
	}
	
	targetInStairCollider = false;
	if(stairCloseby != null){
		if(stairCloseby.bounds.Contains(targetPosition)){
			targetInStairCollider = true;
		}
	}

	DisableAnim();

	if(enableMovement && Time.time > disableUntil){
		if(targetInStairCollider){
			//Climb Spiral Stairs
			//targetPosition = transform.position;
			horizontalInput = 0;
			
			
			var targetUpStairs : boolean;
			var charUpstairs : boolean;
			
			if(targetPosition.y > stairCloseby.bounds.center.y){
				targetUpStairs = true;
			}
			else{
				targetUpStairs = false;
			}
			
			if(transform.position.y > stairCloseby.bounds.center.y){
				charUpstairs = true;
			}
			else{
				charUpstairs = false;
			}
			
			if(targetUpStairs == charUpstairs){
				FollowInput();
			}
			else{
				if(stairCloseby.invert){
					horizontalInput = 1;
				}
				else{
					horizontalInput = -1;
				}
				
				if(stairCharacter.relativePos.x > stairCharacter.switchAt){
					stairTurnAroundUntil = Time.time + stairTurnAruondDuration;
				}
				
				if(Time.time < 	stairTurnAroundUntil){
					horizontalInput =  -horizontalInput;
				}
			}
			
			
			if(debug){
				Debug.DrawLine(character.position, targetPosition, Color.cyan);
			}
		}
		else{
			//Follow
			FollowInput();

			//Run away instead of follow.
			if(runAwayMode) horizontalInput = -moveVector;
			
			//Look at target.
			if(!runAwayMode){
				if(faceTgtOnTgt || !faceTgtOnTgt && !onTarget.current){
					sideMovement.currentSide = Mathf.Sign(moveVector);
				}
			}

			//Jump over obstacle.
			if(!onTarget.current){
				if(hDistance > useMoveTowardsTargetDist){
					if(moveVector > 0){
						if(sideDetection.rightDistance < blockDistanceCheck){
							PressB();
							//DebugUtility.DrawArrow(transform.position, Vector3.up, Color.white, .1);
						}
					}
					if(moveVector < 0){
						if(sideDetection.leftDistance < blockDistanceCheck){
							PressB();
							//DebugUtility.DrawArrow(transform.position, Vector3.up, Color.white, .1);
						}
					}
					//Jump over hole.
					if(moveVector > 0){
						if(sideDetection.HasRightDrop()){
							PressB();
							//DebugUtility.DrawArrow(transform.position, Vector3.up, Color.red, .1);
						}
					}
					if(moveVector < 0){
						if(sideDetection.HasLeftDrop()){
							PressB();
							//DebugUtility.DrawArrow(transform.position, Vector3.up, Color.red, .1);
						}
					}
				}
			}
			
			//Swim up if it's below target.
			if(underWater.isUnderwater.current){
				var deltaHeight : float = targetPosition.y - character.position.y;
				if(deltaHeight > needToSwimUpHeight){
					PressB();
				}
			}
		}
	}
	else{
		horizontalInput = 0;
	}
	
	//Have the character reached it's target.
	if(Mathf.Abs(moveVector) > useMoveTowardsTargetDist){
		onTarget.current = false;
	}
	if(Mathf.Abs(moveVector) < useStopMovingDist){
		onTarget.current = true;
	}

	onTarget.Update();
	
	if(horizontalInput != 0){
		DebugUtility.DrawArrow(transform.position, Vector3.left * horizontalInput);
	}
	
	///// KEEP THIS AT THE BOTTOM.

	if(!onTarget.current){
		controller.inputAxis.target.x = Mathf.Clamp(horizontalInput, -1.0, 1.0);
	}
	else{
		controller.inputAxis.target.x = 0.0;
	}

	if(debug){
		DebugUtility.DrawPoint(targetPosition, 1.5, Color.cyan);
	}

	if(controller.inputButtonA.pressed && Time.time > controller.inputButtonA.lastDownTime + .05){
		controller.inputButtonA.pressed = false;
	}

	if(controller.inputButtonB.pressed && Time.time > controller.inputButtonB.lastDownTime + .05){
		controller.inputButtonB.pressed = false;
	}
}

function PressA(){
	if(Time.time < disableJumpUntil){
		return;
	}

	if(buttonTimer.current){
		controller.inputButtonA.pressed = true;
		controller.inputButtonA.down = true;
		controller.inputButtonA.lastDownTime = Time.time;
	}
}

function PressB(){
	if(Time.time < disableJumpUntil){
		return;
	}

	if(buttonTimer.current){
		controller.inputButtonB.pressed = true;
		controller.inputButtonB.down = true;
		controller.inputButtonB.lastDownTime = Time.time;
	}

}

function StopFollowing(){
	enableMovement = false;
	target = null;
	horizontalInput = 0;
}

function FollowInput(){
	//Follow
	if(hDistance > useMoveTowardsTargetDist){
		if(moveVector < 0){
			horizontalInput = -1;
		}
		if(moveVector > 0){
			horizontalInput = 1;
		}
	}

	if(hDistance < useStopMovingDist){
		horizontalInput = 0;
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		
		var charName : String = gameObject.name;
		if(transform.parent != null) charName = transform.parent.name;
		DebugUtility.DrawArrow(transform.position, targetPosition - transform.position, Color.cyan);
	}
	#endif
}