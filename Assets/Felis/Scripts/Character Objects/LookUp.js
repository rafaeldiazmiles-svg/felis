#pragma strict

var lookUpAnimationClip : AnimationClip;
var lookUpAnimClipWeight : FloatLerp;
var layer : int = 1;

var lookingUp : ToggleBoolean;

var sideMovement : SideMovement;
var jumpSwim : JumpSwim;
var controller : ControllerInput;
var isGrounded : IsGrounded;
var animationComponent : Animation;
var charRB : Rigidbody;

var maxVelocity : float = .3;

var neckRotationInertia : RotationInertia;
var neckName : String = "Neck";

var disableUntil : float;

var forceLookUp : boolean;

function Start () {
	sideMovement = transform.parent.GetComponentInChildren(SideMovement);
	jumpSwim = transform.parent.GetComponentInChildren(JumpSwim);
	controller = transform.parent.GetComponentInChildren(ControllerInput);
	isGrounded = transform.parent.GetComponentInChildren(IsGrounded);
	animationComponent = transform.parent.GetComponent.<Animation>();
	charRB = transform.parent.GetComponent.<Rigidbody>();
	
	var allChildren : RotationInertia[] = transform.parent.GetComponentsInChildren.<RotationInertia>() as RotationInertia[];
	for(var i = 0; i < allChildren.Length; i++){
		if(allChildren[i].gameObject.name == neckName){
			neckRotationInertia = allChildren[i];
			break;
		}
	}
}

function Update () {
	lookUpAnimClipWeight.Lerp();
	lookingUp.Update();
	
	if(Time.time > disableUntil && isGrounded.isGrounded && charRB.velocity.magnitude < maxVelocity && controller.inputAxis.current.y > .5 || forceLookUp){
		lookingUp.current = true;
	}
	else{
		lookingUp.current = false;
	}
	
	if(lookingUp.toggledTrue){
		lookUpAnimClipWeight.target = 1.0;	
		if(neckRotationInertia != null) neckRotationInertia.enabled = false;
		
	}
	
	if(lookingUp.current){
		//sideMovement.disableMovementUntil = Time.time + .1;
	}	
	
	
	if(lookingUp.toggledFalse){
		lookUpAnimClipWeight.target = 0.0;
		if(neckRotationInertia != null) neckRotationInertia.enabled = true;
	}
	
	animationComponent[lookUpAnimationClip.name].enabled = true;
	animationComponent[lookUpAnimationClip.name].layer = layer;
	animationComponent[lookUpAnimationClip.name].weight = lookUpAnimClipWeight.current;
}