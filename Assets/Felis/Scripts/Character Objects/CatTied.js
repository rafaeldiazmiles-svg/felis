#pragma strict

var catTag : String = "Cat";
var character : Transform;

var tied : ToggleBoolean;


var sideMovement : SideMovement;
var movementAI : MovementAI;
var jumpSwim : JumpSwim;
var pickableRB : PickableRigidbody;
var frameGroups : UVFrameGroups;
var caged : Caged;

var tiedAnimation : AnimationClip;
var tiedAnimWeightControl : FloatLerp;
var animLayer : int = 5;

var rope : Rope;

var eyesGroup : int = 0;
var blinkFrame : int = 1;
var openFrame : int = 0;

function GetRope(){
	var ropes : Rope[] = GameObject.FindObjectsOfType.<Rope>();
	rope = FindUtility.GetClosestComp(transform.position, ropes) as Rope;
}

function GetCat(){
	var cats : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
	var closest : GameObject = FindUtility.GetClosest(transform.position, cats);
	if(closest != null){
		character = closest.transform; 
	}
	if(character != null){
		transform.position = character.position;
		transform.parent = character;
		
		sideMovement = character.GetComponentInChildren.<SideMovement>();
		movementAI = character.GetComponentInChildren.<MovementAI>();
		jumpSwim = character.GetComponentInChildren.<JumpSwim>();
		frameGroups = character.GetComponentInChildren.<UVFrameGroups>();
		pickableRB = character.GetComponentInChildren.<PickableRigidbody>();
		caged = character.GetComponentInChildren.<Caged>();

	}
}

function Start () {

}

function Update () {
	if(character == null) GetCat();
	if(character == null) return;

	if(rope == null) GetRope();
	if(rope == null) return;

	tied.Update();
	tiedAnimWeightControl.Lerp();
	
	if(pickableRB.beingPicked.toggledTrue){
		tied.current = false;
	}
	
	if(tied.toggledTrue){
		transform.parent.GetComponent.<Animation>()[tiedAnimation.name].enabled = true;
		transform.parent.GetComponent.<Animation>()[tiedAnimation.name].layer = animLayer;
		tiedAnimWeightControl.target = 1.0;
		sideMovement.currentSide = 1.0;
		caged.isCaged = true;
	}
	if(tied.toggledFalse){
		caged.isCaged = false;
		tiedAnimWeightControl.target = 0.0;
		frameGroups.SetFrame(eyesGroup, openFrame);
		//transform.parent.GetComponentInChildren.<CharacterParty>().charSaved.current = true;
	}
	
	transform.parent.GetComponent.<Animation>()[tiedAnimation.name].weight = tiedAnimWeightControl.current;
	
	if(tied.current){
		sideMovement.disableMovementUntil = Time.time + .5;
		jumpSwim.disableJumpUntil = Time.time + .5;
		movementAI.disableUntil = Time.time + .5;
		frameGroups.SetFrame(eyesGroup, blinkFrame);
	}
	
	if(rope != null){
		if(!rope.untied.current){
			rope.transform.position = transform.position;
			rope.transform.localScale = transform.parent.localScale;
		}
		if(tied.toggledFalse)
			rope.untied.current = true;
	}
	
}