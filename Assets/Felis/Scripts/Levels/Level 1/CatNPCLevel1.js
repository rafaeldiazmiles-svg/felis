#pragma strict

var currentStage : CatLVL1NPC_Stages;
var previousStage : CatLVL1NPC_Stages;

enum CatLVL1NPC_Stages{WaitingProspero, LeadingProspero, CatBehaviour, NoAction}

var character : Transform;
var characterAnimation : Animation;
var catTag : String = "Cat";

var sideMovement : SideMovement;
var movementAI : MovementAI;
var frameGroups : UVFrameGroups;
var pickableRB : PickableRigidbody;
var party : CharacterParty;
var faceAnim : FaceAnim;

var wProspero : WaitForProspero;

var prospero : Transform;
var playerTag : String = "Player";

var prosperoDistance : float;
var idleAnim : AnimationClip;
var askHelpAnimation : AnimationClip;
var blendSpeed : float;
var askHelpAnimationLayer : int;
var mouthOpen : boolean;
var mouthOpenTime : float;
var mouthCloseTime : float;
var startLeadingDistance : float;

var leadDistance : float;
var comeBackDistance : float;
var standingStillStartTime : float;
var askHelpWaitTime : float;
var waitingForProspero : boolean;
var leadUntilXPosition : float;
var followProsperoDistance : float;
@Space(20)
var baloonCreatePrefab : GameObject;
var baloonCreate : GameObject;
var pGen : PrefabGenerator;
var baloon_FollowMe : GameObject;

var endOfLevelBounds : Bounds;
var debug : boolean;

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) prospero = playerObj.transform;
}

function GetCat(){
	var cats : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
	character = FindUtility.GetClosest(transform.position, cats).transform; 
	if(character != null){
		transform.position = character.position;
		transform.parent = character;
		characterAnimation = character.GetComponent.<Animation>();
		sideMovement = character.GetComponentInChildren.<SideMovement>();
		movementAI = character.GetComponentInChildren.<MovementAI>();
		frameGroups = character.GetComponentInChildren.<UVFrameGroups>();
		pickableRB = character.GetComponentInChildren.<PickableRigidbody>();
		party = character.GetComponentInChildren.<CharacterParty>();
		wProspero =character.GetComponentInChildren.<WaitForProspero>();
		wProspero.enabled = false;
		faceAnim = character.GetComponentInChildren.<FaceAnim>();

		movementAI.useDisableAnim = false;
	}
}

function Start () {
	baloonCreatePrefab = Resources.Load("Prefabs/GUI/Baloons/For Cat/Baloon Help Create_Cat", GameObject);
	if(baloonCreatePrefab != null){
		baloonCreate = GameObject.Instantiate(baloonCreatePrefab);
		pGen = baloonCreate.GetComponent.<PrefabGenerator>();
	}
	baloon_FollowMe = Resources.Load("Prefabs/GUI/Baloons/For Cat/Follow Me Baloon_Cat", GameObject);

	GetPlayer();

}



function Update () {
	if (prospero == null) GetPlayer();
	if(prospero == null) return;
	
	if(character == null) GetCat();
	if(character == null) return;
	
	var changedStage : boolean;
	if(previousStage != currentStage){
		changedStage = true;
		previousStage = currentStage;
	}
	
	if(party.partying.toggledTrue && endOfLevelBounds.Contains(transform.position)){
		currentStage = CatLVL1NPC_Stages.NoAction;
		wProspero.enabled = true;
		//frameGroups.SetFrame("Mouth","Normal");
	}
	
	if(prospero != null){
		prosperoDistance = Vector3.Distance(transform.position, prospero.position);
	}
	
 	switch(currentStage){
 		case CatLVL1NPC_Stages.WaitingProspero:
			if(baloonCreate != null){
				baloonCreate.transform.position = transform.position;
			}

 			sideMovement.currentSide = -1;
 			characterAnimation[askHelpAnimation.name].enabled = true;
 			characterAnimation[askHelpAnimation.name].weight = 1.0;
 			characterAnimation[askHelpAnimation.name].layer = askHelpAnimationLayer;
			
			characterAnimation[idleAnim.name].weight = 0.0;
			
 			MouthUVAnimation();			
 			
 			movementAI.targetPosition = transform.position;
 			
 			if(prosperoDistance < startLeadingDistance || prospero != null && prospero.position.x < transform.position.x){
 				currentStage = CatLVL1NPC_Stages.LeadingProspero;
 				frameGroups.SetFrame("Mouth","Normal");
 				movementAI.enableMovement = true;
 				movementAI.useDisableAnim = true;

 				if(baloon_FollowMe != null){
 					pGen.prefab = baloon_FollowMe;
 				}
 				//Destroy(baloonCreate);
 			}
 			
 			if(wProspero != null){
 				wProspero.enabled = false;
 			}
 		break;
 		
  		case CatLVL1NPC_Stages.LeadingProspero:
  			if(baloonCreate != null){
				baloonCreate.transform.position = transform.position;
			}
 			
 			if(prospero != null){
				if(movementAI.targetPosition.x > prospero.position.x - leadDistance)
					movementAI.targetPosition.x = prospero.position.x - leadDistance;
				if(prospero.position.x > transform.position.x + comeBackDistance)
					movementAI.targetPosition.x = prospero.position.x;
			}	
				
			if(movementAI.onTarget.toggledTrue){
				standingStillStartTime = Time.time;
				waitingForProspero = true;
				wProspero.enabled = false;
			}
			
			if(Time.time > standingStillStartTime + askHelpWaitTime && waitingForProspero && !pickableRB.beingPicked.current){
				characterAnimation[askHelpAnimation.name].enabled = true;
				characterAnimation[askHelpAnimation.name].weight = Mathf.Lerp(characterAnimation[askHelpAnimation.name].weight,1.0,Time.deltaTime * blendSpeed);
				sideMovement.currentSide = -1;
				movementAI.enableMovement = false;
				movementAI.useDisableAnim = false;
				MouthUVAnimation();
				pGen.enabled = true;
			}
			else{
				characterAnimation[askHelpAnimation.name].weight = Mathf.Lerp(characterAnimation[askHelpAnimation.name].weight,0.0,Time.deltaTime * blendSpeed);
				pGen.enabled = false;
			}

			if(movementAI.onTarget.toggledFalse){
				frameGroups.SetFrame("Mouth","Normal");
				movementAI.enableMovement = true;
				movementAI.useDisableAnim = true;
				waitingForProspero = false;
			}
			
			if(transform.position.x < leadUntilXPosition){
				currentStage = CatLVL1NPC_Stages.CatBehaviour;
				if(baloonCreate != null){
					Destroy(baloonCreate);
				}
				frameGroups.SetFrame("Mouth","Normal");
				wProspero.enabled = true;
			}
 		break;
 			
 		case CatLVL1NPC_Stages.CatBehaviour:
 			if(prospero != null) movementAI.targetPosition.x = prospero.position.x;
 			movementAI.moveTowardsTargetDistance = followProsperoDistance;
 			movementAI.stopMovingDistance = followProsperoDistance * .5;
 			
 			characterAnimation[askHelpAnimation.name].weight = Mathf.Lerp(characterAnimation[askHelpAnimation.name].weight,0.0,Time.deltaTime * blendSpeed);
 			
 			if(characterAnimation[askHelpAnimation.name].weight < .1){
 				characterAnimation[askHelpAnimation.name].weight  = 0.0;
 				//movementAI.target = prospero;
 				currentStage = CatLVL1NPC_Stages.NoAction;
 			}
 			
 		break;
 		
 		case CatLVL1NPC_Stages.NoAction:
 		
 		break;
 	}
 	
 	if(pickableRB.beingPicked.toggledTrue){
 		frameGroups.SetFrame("Mouth","Normal");
	}
}

function MouthUVAnimation(){
	if(faceAnim != null){
		faceAnim.MouthUVAnimation();
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR 
	if(debug){
		Gizmos.color = Color.yellow;
		Gizmos.DrawRay(Vector3(leadUntilXPosition,-5,0),Vector3.up * 10);
		var guiStyle : GUIStyle = new GUIStyle(); guiStyle.normal.textColor = Color.white;
		Handles.Label(Vector3(leadUntilXPosition,0,0), "Lead Prospero here", guiStyle);
		
		Gizmos.color = Color.red;
		Gizmos.DrawWireCube(endOfLevelBounds.center, endOfLevelBounds.size);
	}
	#endif
}