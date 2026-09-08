var crouchAnimationClip : AnimationClip;
var crouchAnimClipWeight : FloatLerp;
var layer : int = 3;

var crouching : ToggleBoolean;

var crouchDodgeDuration : float = 1.0;

var sideMovement : SideMovement;
var sideMovementAnimation : SideMovementAnimation;
var jumpSwim : JumpSwim;
var controller : ControllerInput;
var isGrounded : IsGrounded;
var animationComponent : Animation;

var charCollider : CapsuleCollider; 
var standColliderCenter : Vector3;
var standColliderHeight : float;
var crouchColliderCenter : Vector3;
var crouchColliderHeight : float;

var frameGroups : UVFrameGroups;

var disableUntil : float;

function Start () {
	sideMovement = transform.parent.GetComponentInChildren(SideMovement);
	sideMovementAnimation = transform.parent.GetComponentInChildren(SideMovementAnimation);
	jumpSwim = transform.parent.GetComponentInChildren(JumpSwim);
	controller = transform.parent.GetComponentInChildren(ControllerInput);
	isGrounded = transform.parent.GetComponentInChildren(IsGrounded);
	animationComponent = transform.parent.GetComponent.<Animation>();
	charCollider = transform.parent.GetComponent.<Collider>();
	
	frameGroups = transform.parent.GetComponentInChildren(UVFrameGroups);
	
	standColliderCenter = charCollider.center;
	standColliderHeight = charCollider.height;
}

function Update () {
	crouchAnimClipWeight.Lerp();
	
	
	if(Time.time > disableUntil && isGrounded.isGrounded && controller.inputAxis.current.y < -.5 && !sideMovement.isRunning){
		crouching.current = true;
	}
	else{
		crouching.current = false;
	}
	
	crouching.Update();
	
	if(crouching.toggledTrue){
		charCollider.center = crouchColliderCenter;
		charCollider.height = crouchColliderHeight;
		crouchAnimClipWeight.target = 1.0;
		frameGroups.SetFrame("Right Leg", "Side");	
	}
	
	if(crouching.current){
		//bsideMovement.disableMovementUntil = Time.time + .1;
		//sideMovementAnimation.crouching = true;
	}
	else{
		//sideMovementAnimation.crouching = false;
	}
	
	
	if(crouching.toggledFalse){
		charCollider.center = standColliderCenter;
		charCollider.height = standColliderHeight;
		crouchAnimClipWeight.target = 0.0;
		frameGroups.SetFrame("Right Leg", "Front");	
	}
	
	animationComponent[crouchAnimationClip.name].enabled = true;
	animationComponent[crouchAnimationClip.name].layer = layer;
	animationComponent[crouchAnimationClip.name].weight = crouchAnimClipWeight.current;
}

function IsDodging() : boolean{
	if(crouching.current && Time.time < crouching.toggledTrueTime + crouchDodgeDuration){
		return true;
	}
	else{
		return false;
	}
}