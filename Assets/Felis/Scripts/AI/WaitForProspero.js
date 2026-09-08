#pragma strict

var waitArea : WaitProspero[];
var movementAI : MovementAI;
var faceAnim : FaceAnim;
var pickedRB : PickableRigidbody;
var pickRB : PickUpRigidbody;

var animationComponent : Animation;

var debug : boolean;

var prospero : Transform;
var playerTag : String = "Player";
var catFollowOrder : CatFollowOrder;


var askHelpAnim : AnimationClip;
var frameGroups : UVFrameGroups;
var mouthOpen : boolean;
var mouthOpenTime : float;
var mouthCloseTime : float;

var askHelpDistance : float;
var blendSpeed : float = 10.0;
var layer : int = 3;

var needsHelp : ToggleBoolean;
var activateAnimation : ToggleBoolean;

var catInWaitAreaGlobal : boolean;
var catInHelpAreaGlobal : boolean;
var dontMove : boolean;
//var catInWaitArea : ToggleBoolean;

//var followMaxDist : float = 5.0;
var targetPos : Vector3;
var targetDist : float;

var disableUntil : float;

var getTimer : Timer;

var forceHelpUntil : float; 

var testHelp : boolean;
@Space(20)
var baloonCreatePrefab : GameObject;
var baloonCreate : GameObject;
var baloonCreate_PGen : PrefabGenerator;
@Space(10)
var baloon_AlsoWhenCaged : boolean = true;
var caged : Caged;
var caged_NotOverThumbsUp : boolean = true; //When cat is in hanging cage asking for help, thelp baloon creates over thumbs up. Thumbs up baloon is delayed, in that time do not create help baloons when caged.
var caged_NotOverThumbsUp_Persist_TimeLeft : float;
var caged_NotOverThumbsUp_Persist_Duration : float = 2.0;
@Space(10)
var baloon_AlsoWhenKeepDist : boolean = true;
var keepingDist_BaloonChance : float = .3;
var maxBaloonPlayerDist : float = 6.0;

@Space(20)
var getWaitAreas : boolean;

function ForceHelpDuration(duration : float){
	forceHelpUntil = Time.time + duration;
}

class WaitProspero{
	var useCenter : Transform;
	var waitBounds : Bounds;
	var followProsperoOn : Bounds[];
	var helpAnimBounds : Bounds;
	
	var charOnFollowArea : boolean;
	
	var catInWaitArea : boolean;
	var catInHelpArea : boolean;
	
	var disableWObject : Bounds;
	var objNameSearch : String;
	var objSearchGlobalBound : Bounds;
	var disableObj : Transform;
	
	function GetDisableObj(){
		if(objNameSearch != ""){
			var allT : Transform[] = GameObject.FindObjectsOfType.<Transform>();
			for(var i = 0; i < allT.Length; i++){
				if(objSearchGlobalBound.Contains(allT[i].position)){
					if(allT[i].name.ToLower().Contains(objNameSearch.ToLower())){
						disableObj = allT[i];
						break;
					}
				}
			}
		}
	}
	
	function HasDisableObj(t : Transform): boolean{
		if(disableObj != null){
			var bCenter : Vector3 = disableWObject.center;
			if(useCenter != null){
				disableWObject.center += t.position;
			}
			
			var contains : boolean = disableWObject.Contains(disableObj.position);
			
			disableWObject.center = bCenter;
			
			return contains;
		}
		return false;
	}
}

function GetWaitAreas(){
	yield WaitForSeconds(1.0);

	var allSceneWaitAreas : WaitProsperoArea[] = GameObject.FindObjectsOfType.<WaitProsperoArea>();
	var allWaitProspero : Array = new Array();
	for(var n = 0; n < allSceneWaitAreas.Length; n++){
		for(var m = 0; m < allSceneWaitAreas[n].waitArea.Length; m++){
			var thisWaitArea : WaitProspero = allSceneWaitAreas[n].waitArea[m];
			if(thisWaitArea.useCenter != null){
				allWaitProspero.Add(thisWaitArea);
			}
		}
	}
	waitArea = allWaitProspero.ToBuiltin(WaitProspero);
}

function Start () {
	baloonCreatePrefab = Resources.Load("Prefabs/GUI/Baloons/For Cat/Baloon Help Create_Cat", GameObject);


	GetWaitAreas();
	
	if(getTimer.every == 0.0){
		getTimer.every = 5.0;
	}
	
	GetPlayer();
	

	pickedRB = transform.parent.GetComponentInChildren(PickableRigidbody);
	pickRB = transform.parent.GetComponentInChildren(PickUpRigidbody);
	frameGroups = transform.parent.GetComponentInChildren(UVFrameGroups);
	movementAI = transform.parent.GetComponentInChildren(MovementAI);
	catFollowOrder = transform.parent.GetComponentInChildren(CatFollowOrder);
	animationComponent = transform.parent.GetComponentInChildren.<Animation>();
	faceAnim = transform.parent.GetComponentInChildren.<FaceAnim>();
	caged = transform.parent.GetComponent.<Caged>();
}

function GetPlayer(){
	var prosperoObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(prosperoObj != null) prospero = prosperoObj.transform;
}

function Update (){
	if(getWaitAreas){
		GetWaitAreas();
		getWaitAreas = false;
	}

	if(testHelp){
		ForceHelpDuration(1.0);
		testHelp = false;
	}

	getTimer.Update();
	if(getTimer.current){
		if(prospero == null) GetPlayer();
		GetWaitAreas();
	}
	
	activateAnimation.Update();
	needsHelp.Update();
	
	if(targetDist > askHelpDistance){
		needsHelp.current = true;
	}
	else{
		needsHelp.current = false;
	}	
	
	if(needsHelp.toggledFalse && mouthOpen){
		frameGroups.SetFrame("Mouth","Normal");
		mouthOpen = false;
	}	

	var debugColor : Color;
	if(prospero != null && catFollowOrder == null){
		targetPos = prospero.position;
		debugColor = Color.blue;
	}
	else{
		if(catFollowOrder != null && catFollowOrder.currentTargetPos != null){
			targetPos = catFollowOrder.currentTargetPos;
			debugColor = Color.red;
		}
	}
	
	if(debug)DebugUtility.DrawArrow(transform.position, targetPos - transform.position, debugColor);	
	targetDist = Vector3.Distance(transform.position, targetPos);

	var center : Vector3;
	
	activateAnimation.current = false;
	catInWaitAreaGlobal = false;
	catInHelpAreaGlobal = false;
	
	dontMove = false;
	
	if(Time.time < disableUntil){
		dontMove = false;
	}
	else{
		for(var i = 0; i < waitArea.Length; i++){
			if(waitArea[i].useCenter == null){
				GetWaitAreas();
				break;
			}
			//Cat in wait area.
			center = waitArea[i].waitBounds.center;
			if(waitArea[i].useCenter != null){
				waitArea[i].waitBounds.center = center + waitArea[i].useCenter.position;
			}
			waitArea[i].catInWaitArea = waitArea[i].waitBounds.Contains(transform.position);
			waitArea[i].waitBounds.center = center;
			
			if(!catInWaitAreaGlobal) catInWaitAreaGlobal = waitArea[i].catInWaitArea;
			
			//Cat in help area.
			center = waitArea[i].helpAnimBounds.center;
			if(waitArea[i].useCenter != null){
				waitArea[i].helpAnimBounds.center = center + waitArea[i].useCenter.position;
			}
			waitArea[i].catInHelpArea = waitArea[i].helpAnimBounds.Contains(transform.position);
			waitArea[i].helpAnimBounds.center = center;
			
			if(!catInHelpAreaGlobal){
				catInHelpAreaGlobal = waitArea[i].catInHelpArea;
			}

			waitArea[i].charOnFollowArea = false;
			for(var n = 0 ; n < waitArea[i].followProsperoOn.Length; n++){
				center = waitArea[i].followProsperoOn[n].center;
				if(waitArea[i].useCenter != null){
					waitArea[i].followProsperoOn[n].center = center + waitArea[i].useCenter.position;
				}
				waitArea[i].charOnFollowArea = waitArea[i].followProsperoOn[n].Contains(targetPos);
				waitArea[i].followProsperoOn[n].center = center;
				
				if(waitArea[i].charOnFollowArea){
					break;
				}
			}
			
			if(prospero != null && waitArea[i].catInWaitArea){
				var wBoundsX : float = waitArea[i].waitBounds.center.x;
				if(waitArea[i].useCenter != null) wBoundsX += waitArea[i].useCenter.position.x;
				
				var catSide : float = Mathf.Sign(wBoundsX - transform.position.x);
				var playerSide : float = Mathf.Sign(wBoundsX - prospero.position.x);
				var targetSide : float = Mathf.Sign(wBoundsX - targetPos.x);
				
				if(!waitArea[i].charOnFollowArea && catSide == targetSide || catSide != targetSide){
					dontMove = true;
				}
				
			}
			
			//Disable with object
			if(getTimer.current){
				if(waitArea[i].disableObj == null){
					waitArea[i].GetDisableObj();
				}
			}
			if(waitArea[i].HasDisableObj(transform)){
				
				disableUntil = Time.time + .5;
			}
		}
	}
	
	if(Time.time < forceHelpUntil){
		dontMove = true;
		needsHelp.current = true;
		catInHelpAreaGlobal = true;
		if(pickRB != null){
			pickRB.Drop();
		}
	}
	
	if(dontMove){
		movementAI.disableUntil = Time.time + .5;
		if(needsHelp.current && catInHelpAreaGlobal && !pickedRB.beingPicked.current){
			activateAnimation.current = true;
		}
	}
	
	var helpBlendTarget : float;

	//Baloon help

	var isCaged : boolean = baloon_AlsoWhenCaged && caged != null && caged.isCaged;
	var keepingDist : boolean = baloon_AlsoWhenKeepDist && movementAI != null && movementAI.keepingDist;

	if(caged_NotOverThumbsUp){
		if(pickedRB!= null && pickedRB.pickingObject != null 
		&& pickedRB.pickingObject.health != null && pickedRB.pickingObject.health.healthAudio_DelayedP != null && pickedRB.pickingObject.health.healthAudio_DelayedP.length > 0){
			caged_NotOverThumbsUp_Persist_TimeLeft = caged_NotOverThumbsUp_Persist_Duration;
		}
		else{
			caged_NotOverThumbsUp_Persist_TimeLeft -= Time.deltaTime;
		}

		if(caged_NotOverThumbsUp_Persist_TimeLeft > 0){
			isCaged = false;
		}
	}

	var inBaloonPlayerRange : boolean;
	if(prospero != null){
		inBaloonPlayerRange = Vector3.Distance(transform.position, prospero.position) < maxBaloonPlayerDist;
	}

	if((activateAnimation.current || isCaged || keepingDist) && inBaloonPlayerRange){
			if(baloonCreatePrefab != null && baloonCreate == null){
				baloonCreate = GameObject.Instantiate(baloonCreatePrefab);
				baloonCreate_PGen = baloonCreate.GetComponent.<PrefabGenerator>();
			}

			if(baloonCreate != null){
				if(keepingDist){
					baloonCreate_PGen.chance = keepingDist_BaloonChance;
				}
				else{
					baloonCreate_PGen.chance = 1.0;
				}

				if(!baloonCreate.activeSelf){
					baloonCreate.SetActive(true);
				}
				baloonCreate.transform.position = transform.position;
			}		
	}
	else{
		if(baloonCreate != null){
			baloonCreate.SetActive(false);
		}
	}

	//Animation
	if(activateAnimation.current){
		animationComponent[askHelpAnim.name].enabled = true;
		helpBlendTarget = 1.0;
		animationComponent[askHelpAnim.name].layer = layer;
		if(frameGroups != null){
			MouthUVAnimation();
		}
	}
	else{
		helpBlendTarget = 0.0;
	}	
	
	if(!catInWaitAreaGlobal){
		if(animationComponent[askHelpAnim.name].weight < 0.1){
			animationComponent[askHelpAnim.name].weight = 0.0;
			animationComponent[askHelpAnim.name].enabled = false;
		}
	}
	
	animationComponent[askHelpAnim.name].weight = Mathf.Lerp(animationComponent[askHelpAnim.name].weight, helpBlendTarget, Time.deltaTime * blendSpeed);
	
	if(frameGroups != null && activateAnimation.toggledFalse){
		frameGroups.SetFrame("Mouth","Normal");
	}	
	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		var center : Vector3;
		for(var i = 0; i < waitArea.Length; i++){
			Gizmos.color = Color.white;
			center = waitArea[i].waitBounds.center;
			if(waitArea[i].useCenter != null){
				waitArea[i].waitBounds.center = center +  waitArea[i].useCenter.position;
			}
			Gizmos.DrawWireCube(waitArea[i].waitBounds.center, waitArea[i].waitBounds.size);
			waitArea[i].waitBounds.center = center;
			
			Gizmos.color = Color.blue;
			for(var n = 0; n < waitArea[i].followProsperoOn.Length; n++){
				center = waitArea[i].followProsperoOn[n].center;
				if(waitArea[i].useCenter != null){
					waitArea[i].followProsperoOn[n].center = center + waitArea[i].useCenter.position;
				}
				Gizmos.DrawWireCube(waitArea[i].followProsperoOn[n].center, waitArea[i].followProsperoOn[n].size);
				waitArea[i].followProsperoOn[n].center = center;
			}
			
			Gizmos.color = Color.red;
			center = waitArea[i].helpAnimBounds.center;
			if(waitArea[i].useCenter != null){
				waitArea[i].helpAnimBounds.center = center + waitArea[i].useCenter.position;
			}	
			Gizmos.DrawWireCube(waitArea[i].helpAnimBounds.center, waitArea[i].helpAnimBounds.size);
			waitArea[i].helpAnimBounds.center = center;
			
			Handles.Label(targetPos, "Wait For Prospero - Distance:" + targetDist.ToString() + " - " + transform.name);
			
			center = waitArea[i].disableWObject.center;
			if(waitArea[i].useCenter != null){
				waitArea[i].disableWObject.center = center + waitArea[i].useCenter.position;
			}
			Gizmos.color = Color.gray;
			Gizmos.DrawWireCube(waitArea[i].disableWObject.center, waitArea[i].disableWObject.size);
			waitArea[i].disableWObject.center = center;
			
			Gizmos.color += Color(.2,.2,.2);
			Gizmos.DrawWireCube(waitArea[i].objSearchGlobalBound.center, waitArea[i].objSearchGlobalBound.size);
		}
	}
	#endif
}


function MouthUVAnimation(){
	if(faceAnim != null){
		faceAnim.MouthUVAnimation();
	}
}