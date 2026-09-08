#pragma strict

var characterIsParent : boolean = true;
var character : Transform;

var autoFindComponents : boolean = true;

var animationComponent : Animation;
var characterRigidbody : Rigidbody;
var sideMovement : SideMovement;
var jumpSwim : JumpSwim;
var pickUp : PickUpRigidbody;
var dragFriction : StopFrictionDrag;
var uvFrameGroups : UVFrameGroups;

var applyHurt : boolean;
var hurt: ToggleBoolean;

var hurtClip : AnimationClip;
var hurtClipWeightControl : FloatLerp;
var layer : int;
var hurtBlendSpeed : float;
var hurtStartTime : float;
var holdVelocity : float;
var disableMovementDuration : float = 2.0;;
var disablePickUpDuration : float = 4.0;

var disableAfterHurtDuration : float = 2.5;
var disableUntil : float;

var hurtSounds : AudioSource[];

function SetAnimComp(newAnimComp : Animation){
	animationComponent = newAnimComp;
}

function Start () {
	if(characterIsParent){
		character = transform.parent;
	}
	
	if(autoFindComponents){
		animationComponent = gameObject.GetComponentInChildren(Animation);
		characterRigidbody = gameObject.GetComponentInChildren(Rigidbody);
		sideMovement = gameObject.GetComponentInChildren(SideMovement);
		jumpSwim = gameObject.GetComponentInChildren(JumpSwim); 
		pickUp = gameObject.GetComponentInChildren(PickUpRigidbody);
		dragFriction = gameObject.GetComponentInChildren(StopFrictionDrag);
		uvFrameGroups = gameObject.GetComponentInChildren(UVFrameGroups);
		
		if(transform.parent != null){
			if(animationComponent == null) animationComponent = transform.parent.gameObject.GetComponentInChildren(Animation);
			if(characterRigidbody == null) characterRigidbody = transform.parent.gameObject.GetComponentInChildren(Rigidbody);
			if(sideMovement == null) sideMovement = transform.parent.gameObject.GetComponentInChildren(SideMovement);
			if(jumpSwim == null) jumpSwim = transform.parent.gameObject.GetComponentInChildren(JumpSwim);
			if(pickUp == null) pickUp = transform.parent.gameObject.GetComponentInChildren(PickUpRigidbody);
			if(dragFriction == null) dragFriction = transform.parent.gameObject.GetComponentInChildren(StopFrictionDrag);
			if(uvFrameGroups == null) uvFrameGroups = transform.parent.gameObject.GetComponentInChildren(UVFrameGroups);
		}
	}
	
}

function Update () {
	hurt.Update();
	hurtClipWeightControl.Lerp();
	
	hurtClipWeightControl.speed = hurtBlendSpeed;
	
	if(hurt.toggledTrue){
		if(Time.time < disableUntil){
			hurt.current = false;
		}
		else{
			disableUntil = Time.time + disableAfterHurtDuration;
			hurtClipWeightControl.target = 1.0;
			if(animationComponent != null){
				animationComponent[hurtClip.name].enabled = true;
				animationComponent[hurtClip.name].time = 0;
				animationComponent[hurtClip.name].layer = layer;
			}
			hurtStartTime = Time.time;
			if(sideMovement != null) sideMovement.disableMovementUntil = Time.time + disableMovementDuration;
			if(jumpSwim != null) jumpSwim.disableJumpUntil = Time.time + disableMovementDuration;
			
			if(pickUp != null){
				pickUp.Drop();
				//pickUp.pickUp = false;
				pickUp.disableUntil = Time.time + disablePickUpDuration;
			}
		}
	}
	
	if(hurt.toggledFalse){
		hurtClipWeightControl.target = 0.0;
	}
	
	if(animationComponent != null && hurt.current && Time.time > hurtStartTime + animationComponent[hurtClip.name].length - (1 / hurtBlendSpeed)
	|| animationComponent == null) hurt.current = false;
	
	if(hurt.current){
		if(animationComponent != null){
			animationComponent[hurtClip.name].weight = hurtClipWeightControl.current;
		}
		characterRigidbody.velocity = Vector3.Lerp(characterRigidbody.velocity, Vector3.zero, Time.deltaTime * holdVelocity);
		
		if(dragFriction!=null)	dragFriction.BreakDrag();
		
		if(uvFrameGroups != null){
			uvFrameGroups.SetFrame("Eyes", "Closed");
			uvFrameGroups.SetFrame("Mouth", "Angry");
		}
	}
	if(hurt.toggledFalse){
		if(uvFrameGroups != null){
			uvFrameGroups.SetFrame("Eyes", "Open");
			uvFrameGroups.SetFrame("Mouth", "Closed");
		}		
	}
	
	if(hurt.toggledTrue && hurtSounds != null && hurtSounds.Length > 0){
		hurtSounds[Random.value * hurtSounds.Length].Play();
	}	
}