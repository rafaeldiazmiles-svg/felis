#pragma strict

var autoGetComponents : boolean = true;

var anim : Animation;
var isGrounded : IsGrounded;
var sideMovement : SideMovement;
var jumpSwim : JumpSwim;
var underwater : UnderWater;
var rb : Rigidbody;

var layer : int = 1;

var jumpUpAnimation : AnimationClip;
var fallDownAnimation : AnimationClip;
var landAnimation : AnimationClip;
var compressAnimation : AnimationClip;
var swimIdle : AnimationClip;
var swim : AnimationClip;
//var climbCliffEdgeAnimation : AnimationClip;

var wallJumpAnim : AnimationClip;
var grabLedgeAnim : AnimationClip;
var grabLedgeFallAnim : AnimationClip;

var useFrameGroups : boolean;
var frameGroups : UVFrameGroups;

var blendTime : float = .1;

var blendSpeedCurve : AnimationCurve;

var landMultiplier : float = 1.0;

var blendValue : float;

var targetJumpUpBlend : float;
var currentJumpUpBlend : float;
var jumpUpBlendVelocity : float;

var targetFallDownBlend : float;
var currentFallDownBlend : float;
var fallDownBlendVelocity : float;

var targetLandBlend : float;
var currentLandBlend : float;
var landBlendVelocity : float;

var swimIdleBlend : FloatSmoothDamp;
var swimBlend : FloatSmoothDamp;
var grabLedgeWeight : FloatLerp;
var grabLedgeFallWeight : FloatLerp;

var grabLedgelayer : int = 4;

var grabLedgeBlendCurve : AnimationCurve;

var lockLand : boolean;
var landTime : float;

var compressMultiplier : float = 1.0;

var cancelAnimations : boolean;
@Space(30)
var secondary : AnimSecondary;

function Start () {
	//guiStyle = new GUIStyle();
	
	if(autoGetComponents){
		if(transform.parent != null){
			if(anim == null) anim = transform.parent.gameObject.GetComponentInChildren(Animation);
			if(isGrounded == null) isGrounded = transform.parent.gameObject.GetComponentInChildren(IsGrounded);
			if(sideMovement == null) sideMovement = transform.parent.gameObject.GetComponentInChildren(SideMovement);
			if(jumpSwim == null) jumpSwim = transform.parent.gameObject.GetComponentInChildren(JumpSwim);
			if(underwater == null) underwater = transform.parent.gameObject.GetComponentInChildren(UnderWater);
			if(rb == null) rb = transform.parent.gameObject.GetComponentInChildren(Rigidbody);
			if(secondary == null) secondary = transform.parent.GetComponentInChildren(AnimSecondary);
		}
	}
	
	SetAnims();
	
	swimIdleBlend = new FloatSmoothDamp();
	swimIdleBlend.time = blendTime;
	swimBlend = new FloatSmoothDamp();
	swimBlend.time = blendTime;

	if(grabLedgeWeight.speed == 0.0){
		grabLedgeWeight.speed = 3.0;
	}
	if(grabLedgeFallWeight.speed == 0.0){
		grabLedgeFallWeight.speed = 3.0;
	}
}

function SetAnimComp(newAnimComp : Animation){
	anim = newAnimComp;
	SetAnims();
}

function SetAnims(){
	if(anim != null){
		anim[jumpUpAnimation.name].enabled = currentJumpUpBlend > .1;
		anim[fallDownAnimation.name].enabled = currentFallDownBlend > .1;	
		anim[landAnimation.name].enabled = currentLandBlend > .1;	
		//anim[compressAnimation.name].enabled = true;

		anim[jumpUpAnimation.name].layer = layer;
		anim[fallDownAnimation.name].layer = layer;
		anim[landAnimation.name].layer = layer;

		if(swimIdle != null && swim != null){
			anim[swimIdle.name].enabled = swimIdleBlend.current > .1;
			anim[swim.name].enabled = swimBlend.current > .1;	

			anim[swimIdle.name].layer = layer;
			anim[swim.name].layer = layer;	
		}
	}
}

function Update () {
	if(secondary != null){
		var secondaryBlend : float = secondary.blend.current;
	}

	SetAnims();
	
	if(anim == null) return;
	
	var jumpButtonTime : float = jumpSwim.GetJumpButtonTime();
	var lastJumpTime : float = jumpSwim.GetLastJumpTime();

	if(isGrounded.isGrounded){
		targetJumpUpBlend = 0;
		targetFallDownBlend = 0;
		if(swimIdle != null && swim != null){
			swimIdleBlend.target = 0;
			swimBlend.target = 0;
		}

		if(!lockLand){
			targetLandBlend = Mathf.Clamp01((-rb.velocity.y * landMultiplier));
			currentLandBlend = -rb.velocity.y * landMultiplier;
			lockLand = true;
		}
		else{
			if(Time.time > landTime + anim[landAnimation.name].length - blendTime){
				targetLandBlend = 0.0;
			}
		}	
	}
	else{
		if(useFrameGroups) frameGroups.SetFrame("Right Leg", "Side");
		
		
		if(swimIdle != null && swim != null && underwater.isUnderwater.current){//Water.
			targetJumpUpBlend = 0;
			targetFallDownBlend = 0;
			
			anim[swim.name].time = Mathf.Min(Time.time - lastJumpTime, anim[swim.name].length * .95);
			
			if(Time.time < lastJumpTime + anim[swim.name].length){
				swimBlend.target = 1;
				swimIdleBlend.target = 0;
			}
			else{
				swimBlend.target = 0;
				swimIdleBlend.target = 1;
			}
		}
		else{//AIR.
			if(swimIdle != null && swim != null){
				swimIdleBlend.target = 0;
				swimBlend.target = 0;
			}		

			blendValue = blendSpeedCurve.Evaluate(rb.velocity.y);
			targetJumpUpBlend = blendValue;
			targetFallDownBlend = 1 - blendValue;
			
			lockLand = false;
			targetLandBlend = 0.0;
		}
	}
	
	currentJumpUpBlend = Mathf.SmoothDamp(currentJumpUpBlend, targetJumpUpBlend, jumpUpBlendVelocity, blendTime);
	currentFallDownBlend = Mathf.SmoothDamp(currentFallDownBlend, targetFallDownBlend, fallDownBlendVelocity, blendTime);
	currentLandBlend = Mathf.SmoothDamp(currentLandBlend, targetLandBlend, landBlendVelocity, blendTime);
	if(swimIdle != null && swim != null){
		swimIdleBlend.SmoothDamp();
		swimBlend.SmoothDamp();
	}

	if(jumpSwim.grabbingLedgeLeft.current || jumpSwim.grabbingLedgeRight.current){
		if(grabLedgeFallAnim != null){
			grabLedgeWeight.target = grabLedgeBlendCurve.Evaluate(rb.velocity.y);
			grabLedgeFallWeight.target = 1.0 - grabLedgeWeight.target;			
		}
		else{
			grabLedgeWeight.target = 1.0;
		}
	}
	else{
		grabLedgeWeight.target = 0.0;
		grabLedgeFallWeight.target = 0.0;
	}
	grabLedgeWeight.Lerp();
	grabLedgeFallWeight.Lerp();

	if(grabLedgeAnim != null){
		currentJumpUpBlend -= grabLedgeWeight.current;
		if(grabLedgeWeight.current > .01){
			anim[grabLedgeAnim.name].enabled = true;
			anim[grabLedgeAnim.name].layer = grabLedgelayer;
			anim[grabLedgeFallAnim.name].enabled = true;
			anim[grabLedgeFallAnim.name].layer = grabLedgelayer;
		}
		else {
			anim[grabLedgeAnim.name].enabled = false;
			anim[grabLedgeFallAnim.name].enabled = false;
		}
		anim[grabLedgeAnim.name].weight = grabLedgeWeight.current;
		if(grabLedgeFallAnim != null){
			anim[grabLedgeFallAnim.name].weight = grabLedgeFallWeight.current;
		}
	}


	anim[jumpUpAnimation.name].weight = currentJumpUpBlend;
	anim[fallDownAnimation.name].weight = currentFallDownBlend;
	anim[landAnimation.name].weight = currentLandBlend;
	if(swimIdle != null && swim != null){
		anim[swimIdle.name].weight =  swimIdleBlend.current;
		anim[swim.name].weight =  swimBlend.current;
	}

	if(wallJumpAnim != null){
		anim[jumpUpAnimation.name].weight -= anim[wallJumpAnim.name].weight;
		anim[fallDownAnimation.name].weight -= anim[wallJumpAnim.name].weight;
	}
	
	if(cancelAnimations){
		anim[jumpUpAnimation.name].weight = 0.0;
		anim[fallDownAnimation.name].weight = 0.0;
		anim[landAnimation.name].weight = 0.0;
		if(swimIdle != null && swim != null){
			anim[swimIdle.name].weight =  0.0;
			anim[swim.name].weight =  0.0;
		}
		if(compressAnimation != null){
			anim[compressAnimation.name].weight = 0.0;
		}
	}	

	anim[landAnimation.name].enabled =  currentLandBlend > .05;
	anim[jumpUpAnimation.name].enabled = currentJumpUpBlend > .05;
	anim[fallDownAnimation.name].enabled = currentFallDownBlend > .05;
	if(swimIdle != null && swim != null){
		anim[swimIdle.name].enabled =  swimIdleBlend.current > .05;
		anim[swim.name].enabled =  swimBlend.current > .05;
	}
}