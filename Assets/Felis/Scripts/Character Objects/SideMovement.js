#pragma strict

var autoFindComponents : boolean = true;
var characterRigidbody : Rigidbody;
var isGrounded : IsGrounded;
var input : ControllerInput;
var sideDetection : SideDetection;
var forceFrictionScript : ForceFriction;
var underWaterScript : UnderWater;
var animComp : Animation;
@Space(30)
var isRunning : boolean;
var maxRunForce : float = 200;
var maxRunForce_StairAdd : float;
//var runForceCurve : float = 0.9;
var targetRunSpeed : float = 7.0;
var runForce : float;
var forceVector : Vector3;
@Space(30)
var runForceSlopeCurve : AnimationCurve;
var horizontalRunForce : float = 1.0;
var lowSlopeRunForce : float = 1.0;
var highSlopeRunForce : float = .1;
var lowSlope : float = 40;
var highSlope : float = 60;
var slopeMultiplier : float = .7;
@Space(30)
var runForceVelocityAdjust : float;
var charVel : float;
var smoothRunSpeed : FloatLerp; //The speed that character is targetting.
var runAcceleration : float = 2.0;
var waterRunAcceleration : float = 0.2;
var minRunSpeed : float = 3.0;
@Space(30)
var currentSide : int = 1;
static var left = -1;
static var right = 1;
@Space(30)
var flipMesh : Transform;
var lastFlipTime : float;
var flipDelay : float;
var currentHorizontalScale : float;
@Space(30)
var airMul : float = .4;
var airRunAccelMul : float = 1.5;
var waterMultiplier : float = .3;
static var maxFlipSpeed : float = 1.0;
@Space(30)
var skidRunForceMultiplier : float = .2;
var skidFriction : float = 3.0;
var skidVelocity : float = .5;
var skidThisFrame : boolean;
var forceSkidUntil : float; //Force skid until certain time.
@Space(30)
var stairAddFriction : float;
var standFriction : float = 9.0;
var runFriction : float = 4.0;
var waterHorizontalDrag : float = 5.0;
@Space(30)
var blockMultiplier : float = .1;
var blockFriction : float = 3.0;
var isPushing : boolean;
var forcePushThisFrame : boolean;
@Space(30)
var disableMovementUntil : float; //disable until specified time.
var disableMovementAtLevelStart : boolean;
var disableMovementUntil_LevelStart : float = 1.0;
@Space(30)
var characterXAxis : Vector3;
private var isPlayer : boolean;
@Space(30)
//Sometimes some non running animations, with higher layer value, are played over the run animation. If this happens, it looks
//bad that the running (or rather sliding) still takes effect. 
var disablingAnimations : AnimationClip[]; 
var disablingWeightCombined : float;
var maxWeightAllowed : float = .2;
@Space(30)
var debug : boolean;


function SetStandFric(newFric : float){
	standFriction = newFric;
}

function IsPlayerCharacter() : boolean {
	var t : Transform = transform;
	while(t != null){
		if(t.tag == "Player"){
			return true;
		}
		t = t.parent;
	}
	return false;
}

function DisableMovementFor(duration : float){
	disableMovementUntil = Time.time + duration;
}

function Start () {

	if(autoFindComponents){
		if(transform.parent != null){
			if(animComp == null) animComp = transform.parent.GetComponentInChildren.<Animation>();
			if(isGrounded == null) isGrounded = transform.parent.gameObject.GetComponentInChildren(IsGrounded);
			if(sideDetection == null) sideDetection = transform.parent.gameObject.GetComponentInChildren(SideDetection);
			if(forceFrictionScript == null) forceFrictionScript = transform.parent.gameObject.GetComponentInChildren(ForceFriction);
			if(underWaterScript == null) underWaterScript = transform.parent.gameObject.GetComponentInChildren(UnderWater);
			if(input == null) input = transform.parent.gameObject.GetComponentInChildren(ControllerInput);
			if(characterRigidbody == null) characterRigidbody = transform.parent.gameObject.GetComponentInChildren(Rigidbody);
			if(flipMesh == null) flipMesh = transform.parent;
		}
	}

	// Soften wall/slope stall a little without changing run speed or jump force.
	if(blockMultiplier <= 0.12) blockMultiplier = 0.22;
	if(slopeMultiplier <= 0.72) slopeMultiplier = 0.85;
	if(highSlopeRunForce <= 0.12) highSlopeRunForce = 0.22;

	isPlayer = IsPlayerCharacter();

	// Slightly more steering while airborne, player only. Enemies keep their original air control.
	if(isPlayer && airMul >= 0.38 && airMul <= 0.42){
		airMul = 0.7;
	}

	// Turning around used to cut run force to a fifth and spike friction, which felt sticky.
	if(isPlayer){
		if(skidRunForceMultiplier >= 0.18 && skidRunForceMultiplier <= 0.22) skidRunForceMultiplier = 0.35;
		if(skidFriction >= 2.8 && skidFriction <= 3.2) skidFriction = 2.2;
	}

	runForceSlopeCurve = new AnimationCurve(Keyframe(0,horizontalRunForce) , Keyframe(lowSlope,lowSlopeRunForce), Keyframe(highSlope,highSlopeRunForce));
	runForceSlopeCurve = AnimationCurveUtility.SetLinear(runForceSlopeCurve);
	
	currentHorizontalScale = 1.0;

	transform.parent.gameObject.AddComponent.<ColDisableMovement>();

	StairAddFriction_GetSideMovs();
}

function StairAddFriction_GetSideMovs(){
	var sm_StairAddFric : SideMovement_StairAddFriction[] = GameObject.FindObjectsOfType.<SideMovement_StairAddFriction>();
	for(var i = 0; i < 	sm_StairAddFric.Length; i++){
		sm_StairAddFric[i].GetSideMovs();
	}
}

function SetAnimComp(newAnimComp : Animation){
	animComp = newAnimComp;
}

function FixedUpdate(){
	charVel = characterRigidbody.velocity.magnitude;

	runForceVelocityAdjust = Mathf.Max(smoothRunSpeed.current  - charVel,0) / smoothRunSpeed.current;
	//runForceVelocityAdjust = Mathf.Clamp01(runForceVelocityAdjust);
	//runForceVelocityAdjust = Mathf.Pow(runForceVelocityAdjust, runForceCurve);


	if(disableMovementAtLevelStart){
		disableMovementAtLevelStart = false;
		DisableMovementFor(disableMovementUntil_LevelStart);
	}
			
	skidThisFrame = false;

	//Set default values.
	isRunning = false;

	//Assume standing friction.
	forceFrictionScript.friction = standFriction + stairAddFriction;// + standFriction * Mathf.Abs(isGrounded.deltaAngle)*Mathf.Deg2Rad;
	
	//Multiplier meant to decrease force so it doesn't go over max desired speed.

	

	//Process horizontalAxis and run force.

	if(Mathf.Abs(input.inputAxis.current.x) > 0.1 && Time.time > disableMovementUntil){ //If there is input.
		if(Mathf.Sign(input.inputAxis.current.x) != currentSide){ //Input towards other side.
			currentSide *= -1;
			//Mid-air turns keep the speed ramp, so steering answers at once instead of restarting.
			if(!isPlayer || isGrounded.isGrounded){
				smoothRunSpeed.current = minRunSpeed;
			}
		}
		else{ //Input towards same side.
			isRunning = true;
			runForce = (maxRunForce + maxRunForce_StairAdd) *  runForceVelocityAdjust;
		}
	}
	else{ //No input.
		runForce = 0.0;
	}
	
	//Set running target speed.
	if(isRunning){
		smoothRunSpeed.target = targetRunSpeed;
	}
	else{
		smoothRunSpeed.target = minRunSpeed;
	}

	//Ground and air friction.
	characterXAxis = transform.right;
	characterXAxis.z = 0;
	characterXAxis.Normalize();

	//Skid		
	if(isGrounded.isGrounded && isRunning){
		if(Mathf.Sign(characterRigidbody.velocity.x) != Mathf.Sign(currentSide) || Mathf.Abs(characterRigidbody.velocity.x) < skidVelocity){
			//Velocity is in favor of current side.
			forceFrictionScript.friction = runFriction + stairAddFriction;
		}
		else{//Skid.
			ApplySkid();
		}
	}
	else{//Not grounded.
		characterXAxis.y = 0.0;//Don't push on y axis if mid-air;
	}
	
	if(Time.time < forceSkidUntil){
		ApplySkid(); //Force Skid.
	}

	//Side obstacles avoid character to climb.
	isPushing = false;//First assume it's not pushing.
	if(forcePushThisFrame){
		isPushing = true;
	}
	forcePushThisFrame = false;

	var walkableHill : boolean = isGrounded.isGrounded && Mathf.Abs(isGrounded.slopeAngle) > 8.0 && Mathf.Abs(isGrounded.slopeAngle) < 70.0;
	var sideBlockedAhead : boolean = (sideDetection.IsLeftSideBlocked() && currentSide == left) || (sideDetection.IsRightSideBlocked() && currentSide == right);
			
	if(sideBlockedAhead && !walkableHill){
		runForce *= blockMultiplier;
		if(HasInput()){
			isPushing = true;
		}
	}
	
	//Run force affected by slope angle
	if(isGrounded.isGrounded) {
		runForce *= runForceSlopeCurve.Evaluate(Mathf.Abs(isGrounded.slopeAngle));
	}

	//Water slows character down.
	if(underWaterScript != null  && underWaterScript.isUnderwater.current){
		runForce *= waterMultiplier;
	}

	//Set either ground or water run accleration.
	if(underWaterScript != null  && underWaterScript.isUnderwater.current){
		smoothRunSpeed.speed = waterRunAcceleration;
	}
	else{
		smoothRunSpeed.speed = runAcceleration;
	}

	//A standstill jump starts the ramp at minRunSpeed, which made air steering feel rigid.
	if(isPlayer && !isGrounded.isGrounded){
		smoothRunSpeed.speed *= airRunAccelMul;
	}

	smoothRunSpeed.Lerp();
	
	disablingWeightCombined = 0;
	if(animComp != null){
		for(var i = 0; i < disablingAnimations.Length; i++){
			disablingWeightCombined += animComp[disablingAnimations[i].name].weight;
		}
	}
	
	if(sideDetection.AreLeftFeetBlocked() && runForce > 0.0 || sideDetection.AreRightFeetBlocked() && runForce < 0.0){
		runForce *= slopeMultiplier;
	}
	if(!walkableHill){
		if(sideDetection.IsLeftSideBlocked() && runForce > 0.0 || sideDetection.IsRightSideBlocked() && runForce < 0.0){
			runForce *= slopeMultiplier;
		}
	}

	//Apply Force.
	if(disablingWeightCombined < maxWeightAllowed){

		//Clamp run force.	
		runForce = Mathf.Clamp(runForce, 0, maxRunForce + maxRunForce_StairAdd);

		if(!isGrounded.isGrounded){
			runForce *= airMul;
		}



		forceVector = characterXAxis * runForce * -currentSide;

		if(!float.IsNaN(forceVector.x)){
			characterRigidbody.AddForce(forceVector);
		}

		if(debug){
			DebugUtility.DrawArrow(transform.position, forceVector * .2);	
		}
	}
	
	//Water friction.
	if(underWaterScript != null  && underWaterScript.isUnderwater.current && !isGrounded.isGrounded){
		characterRigidbody.AddForce(Vector3.right * -characterRigidbody.velocity.x * waterHorizontalDrag);	
	}

	stairAddFriction = 0.0;
	maxRunForce_StairAdd = 0.0;
}

function LateUpdate(){
	if(Time.time > lastFlipTime + flipDelay){
		currentHorizontalScale =  Mathf.Sign(currentSide);
		lastFlipTime = Time.time;
	}
	flipMesh.localScale.x = Mathf.Abs(flipMesh.localScale.x) * currentHorizontalScale;

}

function SideMatchVelocity() : boolean{ //Character is facing the same direction as velocity.
	if(currentSide != Mathf.Sign(characterRigidbody.velocity.x)) return true;
	else return false;
}

function SkidThisFrame() : boolean{
	return skidThisFrame;
}

function IsPushing() : boolean{
	return isPushing;
}

function HasInput() : boolean{
	if(Mathf.Abs(input.inputAxis.current.x) > .9) return true;
	else return false;
}

function ApplySkid(){
	skidThisFrame = true;
	runForce *= skidRunForceMultiplier;
	forceFrictionScript.friction = skidFriction + stairAddFriction;
}