#pragma strict

var autoFindComponents : boolean = true;
@Space(30)
var isGroundedScript : IsGrounded;
var sideDetection : SideDetection;
var sideMovementScript : SideMovement;
var idleAnimationScript : IdleAnimation;
var crouch : Crouch;
var characterRigidbody : Rigidbody;
var animationComponent : Animation;
@Space(30)
var idleAnimation : AnimationClip;
var runAnimation : AnimationClip;
var skidAnimation : AnimationClip;
var pushAnimation : AnimationClip;
var climbSlopeAnimation : AnimationClip;
var almostFallAnimation : AnimationClip;
@Space(30)
var layer : int = 1;
var skidLayer : int = 5;
@Space(30)
var runAnimationSpeed : float = 1;
var runAnimationSpeedIncreaseFactor : float = .3;
@Space(30)
var useFrameGroups : boolean;
var frameGroups : UVFrameGroups;
@Space(30)
var crouching : boolean;
@Space(30)
static var blendTime : float = .05;
@Space(30)
var currentRunWeight : float;
var targetRunWeight : float;
var runWeightVelocity : float;

@Space(30)
var skidVel : float = .2;
var currentSkidWeight : float;
var targetSkidWeight : float;
var skidWeightVelocity : float;
@Space(30)
var pushAnimationWeight : FloatSmoothDamp;
var climbSlopeAnimationWeight : FloatSmoothDamp;
@Space(30)
var almostFallAnimationWeight : FloatSmoothDamp;
var almostFallLayer : int;
var almostFalling : ToggleBoolean;
var stairsCancelAlmostFalling : boolean;
@Space(30)
private var slopeBlendCurve : AnimationCurve;
var slopeAnimationAngleStart : float = 20.0;
var slopeAnimationAngleEnd : float = 45.0;
@Space(30)
//Single occurring animation, last trigger time.
var lastFlipTime : float;
@Space(30)
var isGrounded : boolean;
var slopeAngle : float;
@Space(30)
static var left = -1;
static var right = 1;
@Space(30)
var isRunning : ToggleBoolean;
var pushing : ToggleBoolean;
var side : int;
var currentRunTargetSpeed : float;
@Space(30)
var stairCloseby : StairCollider;
var nearStairDistance : float = 6.0;
var allStairs : StairCollider[];
@Space(30)
var almostFallBounds : Bounds[];
@Space(30)
var cancelAnimations : boolean;
@Space(30)
var getStairsTimer : Timer;
@Space(30)
var secondary : AnimSecondary;
@Space(30)
var debug : boolean;

function SetAnimComp(newAnimComp : Animation){
	animationComponent = newAnimComp;
}

function Start () {
	if(autoFindComponents){
		if(transform.parent != null){
			if(animationComponent == null) animationComponent = transform.parent.gameObject.GetComponentInChildren(Animation);
			if(idleAnimationScript == null) idleAnimationScript = transform.parent.gameObject.GetComponentInChildren(IdleAnimation);
			if(isGroundedScript == null) isGroundedScript = transform.parent.gameObject.GetComponentInChildren(IsGrounded);
			if(sideDetection == null) sideDetection = transform.parent.gameObject.GetComponentInChildren(SideDetection);
			if(sideMovementScript == null) sideMovementScript = transform.parent.gameObject.GetComponentInChildren(SideMovement);
			if(characterRigidbody == null) characterRigidbody = transform.parent.gameObject.GetComponentInChildren(Rigidbody);
			if(crouch == null) crouch = transform.parent.GetComponentInChildren(Crouch);
			if(secondary == null) secondary = transform.parent.GetComponentInChildren(AnimSecondary);
		}
		
	}
	
	SetAnimationValues();

	if(pushAnimation != null){
		pushAnimationWeight = new FloatSmoothDamp();
		pushAnimationWeight.time = blendTime;
	}
	
	if(almostFallAnimation != null){
		almostFallAnimationWeight.time = blendTime;
	}
	
	if(climbSlopeAnimation != null){
		climbSlopeAnimationWeight = new FloatSmoothDamp();
		climbSlopeAnimationWeight.time = blendTime * 2.0;
	}
	
	slopeBlendCurve = new AnimationCurve();
	var keys : Keyframe[] = new Keyframe[3];
	keys[0] = Keyframe(0,0); keys[1] = Keyframe(slopeAnimationAngleStart, 0.0); keys[2] = Keyframe(slopeAnimationAngleEnd, 1.0);
	keys[0].outTangent = 0.0; keys[1].inTangent = 0.0;keys[1].outTangent = 0.0;keys[2].inTangent = 0.0;
	slopeBlendCurve.keys = keys;
	
	GetStairs();
	
	if(getStairsTimer.every == 0.0){
		getStairsTimer.every = 3.0;
	}

}

function GetStairs(){
	allStairs = GameObject.FindObjectsOfType.<StairCollider>() as StairCollider[];
}

function Update () {
	if(secondary != null){
		var secondaryBlend : float = secondary.blend.current;
	}

	getStairsTimer.Update();
	if(getStairsTimer.current){
		GetStairs();
	}

	if(animationComponent == null) return;
	
	stairCloseby = null;
	for(var i = 0; i < allStairs.Length; i++){
		if(allStairs[i] == null) continue;
		if(Vector3.Distance(transform.position, allStairs[i].transform.position) < nearStairDistance){
			stairCloseby = 	allStairs[i];
		}
	}	

	SetAnimationValues();

	isGrounded = isGroundedScript.IsGrounded();
	isRunning.current = sideMovementScript.isRunning;
	side = sideMovementScript.currentSide;
	currentRunTargetSpeed = sideMovementScript.smoothRunSpeed.current;
	slopeAngle = isGroundedScript.slopeAngle;
	
	isRunning.Update();
	
	if(isRunning.toggledTrue){
		if(useFrameGroups) frameGroups.SetFrame("Right Leg", "Side");
	}
	if(isRunning.toggledFalse){
		if(useFrameGroups) frameGroups.SetFrame("Right Leg", "Front");
	}
	
	if(isRunning.current){
		
		if((sideMovementScript.isPushing) || (sideDetection.IsLeftSideBlocked() && side == left)
		|| (sideDetection.IsRightSideBlocked() && side == right)){
			//Pushing
			pushing.current = true;
			targetRunWeight = 0.0;
			if(climbSlopeAnimation != null)climbSlopeAnimationWeight.target = 0.0;
			if(pushAnimation != null) pushAnimationWeight.target = 1.0;

		}
		else{
			pushing.current = false;
			if(climbSlopeAnimation != null){
				climbSlopeAnimationWeight.target = slopeBlendCurve.Evaluate(slopeAngle * side);
				if(crouching){
					climbSlopeAnimationWeight.target = 1.0;
				}
				targetRunWeight = 1.0 - climbSlopeAnimationWeight.target;
			}
			else{
				targetRunWeight = 1.0;
			}
			if(pushAnimation != null) pushAnimationWeight.target = 0.0;
		}
	}
	else{
		pushing.current = false;
		
		targetRunWeight = 0.0;
		if(climbSlopeAnimation != null) climbSlopeAnimationWeight.target = 0.0;
		if(pushAnimation != null)pushAnimationWeight.target = 0.0;
		//idleAnimationScript.SetWeightTarget(1.0);
	}

	/*if(!isGrounded){
		pushAnimationWeight.target = 0.0;
		pushing.current = false;
	}*/

	pushing.Update();
	if(pushing.toggledTrue){
		if(useFrameGroups){
			frameGroups.SetFrame("Eyes", "Closed");
			frameGroups.SetFrame("Mouth", "Angry");
		}	
	}
	if(pushing.toggledFalse){
		if(useFrameGroups){
			frameGroups.SetFrame("Eyes", "Open");
			frameGroups.SetFrame("Mouth", "Closed");
		}	
	}

	var targetRunWeight_sec : float = targetRunWeight - secondaryBlend;

	currentRunWeight = Mathf.SmoothDamp(currentRunWeight, targetRunWeight_sec, runWeightVelocity, blendTime);
	animationComponent[runAnimation.name].weight = currentRunWeight;
	
	//Run animation speed.
	var runAnimationSpeedIncrease : float = (currentRunTargetSpeed - sideMovementScript.minRunSpeed)/ (sideMovementScript.targetRunSpeed - sideMovementScript.minRunSpeed);
	runAnimationSpeedIncrease *= runAnimationSpeedIncreaseFactor;
	animationComponent[runAnimation.name].speed = runAnimationSpeed + runAnimationSpeedIncrease;
	if(pushAnimation != null){
		animationComponent[pushAnimation.name].normalizedTime = animationComponent[runAnimation.name].normalizedTime;
	}
	if(climbSlopeAnimation != null){
		animationComponent[climbSlopeAnimation.name].normalizedTime = animationComponent[runAnimation.name].normalizedTime;
	}

	if(Mathf.Abs(characterRigidbody.velocity.x) > skidVel && (!sideMovementScript.SideMatchVelocity() || !isRunning.current) && isGrounded){
		targetSkidWeight = 1.0;
	}
	else{
		targetSkidWeight = 0.0;
	}
	
	if(skidAnimation != null){
		currentSkidWeight = Mathf.SmoothDamp(currentSkidWeight, targetSkidWeight, skidWeightVelocity, blendTime);
		animationComponent[skidAnimation.name].weight = currentSkidWeight;
	}
	
	if(pushAnimation != null){
		pushAnimationWeight.SmoothDamp();
		animationComponent[pushAnimation.name].weight = pushAnimationWeight.current;
	}
	
	if(climbSlopeAnimation != null){
		climbSlopeAnimationWeight.SmoothDamp();
		animationComponent[climbSlopeAnimation.name].weight = climbSlopeAnimationWeight.current;
	}
	
	if(almostFallAnimation != null){
		almostFalling.Update();
		almostFallAnimationWeight.SmoothDamp();
		animationComponent[almostFallAnimation.name].weight = almostFallAnimationWeight.current;
		
		if(isGrounded){
			if((sideDetection.HasLeftDrop() && sideMovementScript.currentSide == -1) || sideDetection.HasRightDrop() && sideMovementScript.currentSide == 1){
				almostFallAnimationWeight.target = 1.0;
				almostFalling.current = true;
			}
			else{
				almostFallAnimationWeight.target = 0.0;
				almostFalling.current = false;
			}
			
			for(var n = 0; n < almostFallBounds.Length; n++){
				if(almostFallBounds[n].Contains(transform.position)){
					almostFallAnimationWeight.target = 1.0;
					break;
				}
			}
			
			if(almostFalling.toggledTrue && !stairsCancelAlmostFalling && stairCloseby == null){
				frameGroups.SetFrame("Eyes", "Worried");
				frameGroups.SetFrame("Mouth", "Worried");
			}
			if(almostFalling.toggledFalse){
				frameGroups.SetFrame("Eyes", "Open");
				frameGroups.SetFrame("Mouth", "Closed");
			}
		}
		
		if(stairsCancelAlmostFalling || stairCloseby != null){
			almostFallAnimationWeight.target = 0.0;
		}
		stairsCancelAlmostFalling = false;
	}
	
	if(crouch != null){
		if(crouch.crouching.toggledTrue){
			frameGroups.SetFrame("Right Leg", "Side");
		}
		if(crouch.crouching.toggledFalse){
			frameGroups.SetFrame("Right Leg", "Front");
		}
	}

	if(cancelAnimations){
		if(idleAnimation != null) animationComponent[idleAnimation.name].weight = 0.0;
		if(runAnimation != null) animationComponent[runAnimation.name].weight = 0.0;
		if(skidAnimation != null) animationComponent[skidAnimation.name].weight = 0.0;
		if(pushAnimation != null) animationComponent[pushAnimation.name].weight = 0.0;
		if(climbSlopeAnimation != null) animationComponent[climbSlopeAnimation.name].weight = 0.0;
		if(almostFallAnimation != null) animationComponent[almostFallAnimation.name].weight = 0.0;
	}
}

function IsPushing() : boolean{
	if(pushAnimationWeight.current > .8 && pushAnimation != null) return true;
	else return false;
}

function SetSkidVel(newSkidVel : float){ //Increase skid vel so shield characters don't skid.
	skidVel = newSkidVel;
}

function SetAnimationValues(){
	if(animationComponent == null) return;
	animationComponent[runAnimation.name].layer = layer;
	animationComponent[runAnimation.name].enabled = currentRunWeight > 0.05 || climbSlopeAnimationWeight.current > 0.05 || pushAnimationWeight.current > 0.05;
	
	if(climbSlopeAnimation != null){
		animationComponent[climbSlopeAnimation.name].layer = layer;
		animationComponent[climbSlopeAnimation.name].enabled = climbSlopeAnimationWeight.current > 0.05;
	}
	
	if(pushAnimation != null){
		animationComponent[pushAnimation.name].layer = layer;
		animationComponent[pushAnimation.name].enabled = pushAnimationWeight.current > 0.05;

	}
	
	if(skidAnimation != null){
		animationComponent[skidAnimation.name].layer = skidLayer;
			animationComponent[skidAnimation.name].enabled = currentSkidWeight > 0.05;

	}
	
	if(almostFallAnimation != null){
		animationComponent[almostFallAnimation.name].layer = layer;
		animationComponent[almostFallAnimation.name].enabled = almostFallAnimationWeight.current > 0.05;
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < almostFallBounds.Length; i++){
			Gizmos.DrawWireCube(almostFallBounds[i].center, almostFallBounds[i].size);
			Handles.Label(almostFallBounds[i].center, "Almost fall animation for " + transform.name);
		}
	}
	#endif
}