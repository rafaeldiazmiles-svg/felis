#pragma strict

var animationComponent : Animation;

var characterRigidbody : Rigidbody;

var leftWingAnimation : AnimationClip;
var leftWingWeight : FloatLerp;
var leftWingSpeed : float = 1.0;;

var rightWingAnimation : AnimationClip;
var rightWingWeight : FloatLerp;
var rightWingSpeed : float = 1.0;

var layer : int;

@Space(30)
var side : int;
var changeSide : boolean;
var setNewSide : int;

@Space(30)
var useForceCurve : boolean;
var forceCurve : AnimationCurve;
var curveWingLength : float;
var fCurveArray : Array; // WingedFlightCurve Array
var maxForceAdd : float = 1.5;
@Space(30)

var wingForce : float;
var defaultWingForce : float;

var horizontalForce : float;
var applyLeftForce: boolean;
var applyRightForce : boolean;
//var wingSeparation : float;
var wingRotationTorque : float;
var wingApplyForceTime : float;
@Space(30)
var fish : boolean;
var underwater : UnderWater;

@Space(30)
var faceFlyDirection : boolean;
var faceFlyDirDeadZone : float = 1.0;
@Space(30)
var flapLeft : boolean;
var flapRight : boolean;

var lastFlapLeftTime : float;
var lastFlapRightTime : float;

var leftWingBone : Transform;
var rightWingBone : Transform;
@Space(30)
var rootRotation : Transform;
var rootRotationUseAnim : boolean;
var rootRotationDefaultRotation : Quaternion;
var angle : FloatPhysics; //positive is going right, negative angle is going left.
var angleMax : float = 40;
var angleMin : float = -40;
var doubleWing_Max : float = 10.0; //when angle is close to max, animate both wings.
var maintainVerticalAngle : float = .1;
var maintainVerticalAngleGround : float = .5;
@Space(10)
var useRBAngle : boolean;
var angleHandlePos : Vector3 = Vector3(1,0,0);
var currentAngle : float;
var deltaAngle : float;
var torqueMultiplier : float = 1.0;

@Space(30)
var isGrounded : IsGrounded;

var secondaryAnimationObjects : WingedFlightSecondaryAnimationObject[];
@Space(30)
var fastWingSpeed = 1.1;
var normalWingSpeed = 0.9;
var maxUnsyncTime : float = .1;
@Space(30)
var flapSounds : AudioSource[];
var flapPitchRange : Vector2 = Vector2(.9, 1.2);
@Space(30)
var useHeightCurve : boolean;
var heightCurve : AnimationCurve;
var heightCurveVal : float;
var heightCurveVal_Multiplier : float = 1.0;
@Space(30)
var useStrArea : boolean;
var loseStrengthArea : AreaMesh;
var loseStrArea_SkipFrame : int = 10;
var charInLoseStrArea : ToggleBoolean;
var loseStrArea_SearchString : String = "No Fly Area";
@Space(15)
var sweatDropBaloonPrefab : GameObject;
var localPos : Vector3 = Vector3(-.5,5,1);
var disableBaloonDuration : float = 1.5;
var disableBaloonUntil : float;

@Space(30)
var allowInput : boolean;
var input : ControllerInput;
@Space(30)
var disableUntil : float;

class WingedFlightCurve{
	var wing : Direction;
	var startTime : float;
}

function Start () {
	defaultWingForce = wingForce;

	underwater = transform.parent.GetComponentInChildren.<UnderWater>();

	if(useStrArea){
		var allAreaMeshes : AreaMesh[] = GameObject.FindObjectsOfType.<AreaMesh>();
		for(var i = 0; i < allAreaMeshes.Length; i++){
			if(allAreaMeshes[i].gameObject.name.Contains(loseStrArea_SearchString)){
				loseStrengthArea = allAreaMeshes[i];
				break;
			}
		}
	}

	input = transform.parent.GetComponentInChildren.<ControllerInput>();

	if(forceCurve != null && forceCurve.keys != null && forceCurve.keys.length > 0){
		curveWingLength = AnimationCurveUtility.GetLength(forceCurve);
	}

	fCurveArray = new Array();

	if(animationComponent == null && transform.parent != null){
		animationComponent = transform.parent.GetComponentInChildren(Animation);
	}
	
	if(characterRigidbody== null){
		if(transform.parent != null){
			characterRigidbody = transform.parent.GetComponentInChildren(Rigidbody);
		}
	}

	rootRotationDefaultRotation = rootRotation.rotation;
	
	if(transform.parent != null && isGrounded == null){
		isGrounded = transform.parent.GetComponentInChildren.<IsGrounded>();
	}

	side = Mathf.Sign(transform.parent.localScale.x);
}

class WingedFlightSecondaryAnimationObject{
	var bone : Transform;
	var rotation : FloatSpring;
	var multiplier : float;
}

function SetSide(newSide : int){
	setNewSide = newSide;

}

function EnableDelay(delay : float){
	disableUntil = Time.time + delay;
}

function LateUpdate(){
	if(loseStrengthArea != null){
		if(Time.frameCount % loseStrArea_SkipFrame == 0){
			charInLoseStrArea.current = loseStrengthArea.TestPoint(transform.position);
		}
	}
	else{
		charInLoseStrArea.current = false;
	}

	charInLoseStrArea.Update();



	if(faceFlyDirection){
		if(characterRigidbody.velocity.x < -faceFlyDirDeadZone){
			side = 1;
			//transform.parent.localScale.x = Mathf.Abs(transform.parent.localScale.x);
		}
		if(characterRigidbody.velocity.x > faceFlyDirDeadZone){
			//transform.parent.localScale.x = -Mathf.Abs(transform.parent.localScale.x);
			side = -1;
		}
	}

	if(setNewSide != 0){
		//transform.parent.localScale.x = Mathf.Abs(transform.parent.localScale.x);
		side = setNewSide;
		setNewSide = 0;
		
	}

	transform.parent.localScale.x = Mathf.Abs(transform.parent.localScale.x) * side;

	//Sweat Drop Baloon when losing strength flying too high
	if(charInLoseStrArea.toggledTrue && Time.time > disableBaloonUntil){
		if(sweatDropBaloonPrefab != null){
			var newBaloon : GameObject = GameObject.Instantiate(sweatDropBaloonPrefab);
			var newBaloonParent : Parent = newBaloon.GetComponent.<Parent>();
			newBaloonParent.target = transform;
			newBaloonParent.relativePosition = localPos;

			disableBaloonUntil = Time.time + disableBaloonDuration;
		}
	}

	if(!isGrounded.isGrounded){
		angle.speed -= angle.current * maintainVerticalAngle * Time.deltaTime;
	}
	else{
		angle.speed -= angle.current * maintainVerticalAngleGround * Time.deltaTime;
	}

	angle.current = Mathf.Clamp(angle.current, angleMin, angleMax);
	angle.Update();


	if(!useRBAngle){
		if(!rootRotationUseAnim){
			rootRotation.rotation = rootRotationDefaultRotation;
		}
		rootRotation.RotateAround(rootRotation.position, Vector3.forward, angle.current * side);
	}

	//Secondary animation.
	for(var i = 0; i < secondaryAnimationObjects.Length; i++){
		secondaryAnimationObjects[i].rotation.target = angle.speed * secondaryAnimationObjects[i].multiplier;
		secondaryAnimationObjects[i].rotation.Spring();
		secondaryAnimationObjects[i].bone.RotateAround(secondaryAnimationObjects[i].bone.position, Vector3.forward, secondaryAnimationObjects[i].rotation.current);
	}


}

function FixedUpdate(){
	var angleHandlePosWorld : Vector3 = transform.TransformPoint(angleHandlePos);
	currentAngle = Mathf.Atan2(angleHandlePosWorld.y - transform.position.y, angleHandlePosWorld.x - transform.position.x) * Mathf.Rad2Deg;

	if(useRBAngle){
		deltaAngle = Mathf.DeltaAngle(currentAngle, angle.current);
		characterRigidbody.AddTorque(Vector3(0,0,deltaAngle * torqueMultiplier * Time.deltaTime));
	}

	if(useHeightCurve){
		heightCurveVal = heightCurve.Evaluate(isGrounded.avgGroundDistance) * heightCurveVal_Multiplier;
		if(float.IsNaN(heightCurveVal)){
			heightCurveVal = 1.0;
		}
	}
	else{
		heightCurveVal = 1.0;
	}

	if(fCurveArray != null && fCurveArray.length > 0){
		var forceAdd : float;

		for(var i = fCurveArray.length-1; i >= 0; i--){
			var thisWingedFlightC : WingedFlightCurve = fCurveArray[i];
			var curveWingForce : float = forceCurve.Evaluate(Time.time - thisWingedFlightC.startTime);
			forceAdd += curveWingForce;

			if(thisWingedFlightC.wing == Direction.Left){
				angle.speed -= wingRotationTorque * Time.deltaTime * curveWingForce * side;
			}
			if(thisWingedFlightC.wing == Direction.Right){
				angle.speed += wingRotationTorque * Time.deltaTime * curveWingForce * side;
			}
			if(Time.time > thisWingedFlightC.startTime + curveWingLength){
				fCurveArray.RemoveAt(i);
			}
		}	

		forceAdd = Mathf.Clamp(forceAdd, -maxForceAdd, maxForceAdd);

		if(fish && !underwater.isUnderwater.current){
			wingForce = 0.0;
		}
		else{
			wingForce = defaultWingForce;
		}

		if(!charInLoseStrArea.current){
			characterRigidbody.AddForce(Vector3(-angle.current * horizontalForce * Time.deltaTime,  wingForce * forceAdd * Time.deltaTime * heightCurveVal, 0));
		}
	}
		
}


function Update () {
	if(applyLeftForce){
		if(Time.time > lastFlapLeftTime + (wingApplyForceTime / leftWingSpeed) ){
			if(useForceCurve){
				var wingedFlightCurve : WingedFlightCurve = new WingedFlightCurve();
				wingedFlightCurve.startTime = Time.time;
				wingedFlightCurve.wing = Direction.Left;
				fCurveArray.Push(wingedFlightCurve);
			}
			else{
				if(!charInLoseStrArea.current){
					if(fish && !underwater.isUnderwater.current){
						wingForce = 0.0;
					}
					characterRigidbody.AddForce(Vector3(-angle.current * horizontalForce,wingForce * heightCurveVal,0));
				}
				angle.speed -= wingRotationTorque * side;
			}
			applyLeftForce = false;
		}
	}
	if(applyRightForce){
		if(Time.time > lastFlapRightTime + (wingApplyForceTime / rightWingSpeed) ){
			if(useForceCurve){
				wingedFlightCurve = new WingedFlightCurve();
				wingedFlightCurve.startTime = Time.time;
				wingedFlightCurve.wing = Direction.Right;
				fCurveArray.Push(wingedFlightCurve);		
			}
			else{
				if(!charInLoseStrArea.current){
					if(fish && !underwater.isUnderwater.current){
						wingForce = 0.0;
					}
					characterRigidbody.AddForce(Vector3(-angle.current * horizontalForce,wingForce * heightCurveVal,0));
				}
				angle.speed += wingRotationTorque * side;
			}
			applyRightForce = false;
		}
	}

	if(allowInput && input != null){
		if(side == 1){
			if(input.inputButtonB.pressed){
				flapLeft = true;
			}
			if(input.inputButtonA.pressed){
				flapRight = true;
			}
		}
		else{
			if(input.inputButtonA.pressed){
				flapLeft = true;
			}
			if(input.inputButtonB.pressed){
				flapRight = true;
			}
		}
	}

	var bothWings : boolean = angle.current != Mathf.Clamp(angle.current, angleMin + doubleWing_Max, angleMax - doubleWing_Max);

	var flapRightAnim : boolean;
	var flapLeftAnim : boolean;

	if(Time.time > disableUntil){
		if(flapRight && Time.time > lastFlapRightTime + animationComponent[rightWingAnimation.name].length / animationComponent[rightWingAnimation.name].speed){
			flapRightAnim = true;
			applyRightForce = true;

			if(bothWings){
				flapLeftAnim = true;
			}

		}

		if(flapLeft && Time.time > lastFlapLeftTime + animationComponent[leftWingAnimation.name].length / animationComponent[leftWingAnimation.name].speed){
			flapLeftAnim = true;
			applyLeftForce = true;

			if(bothWings){
				flapRightAnim = true;
			}

		}



		//sync
		if(flapRight && flapLeft){
			if(lastFlapLeftTime < lastFlapRightTime){
				lastFlapLeftTime = lastFlapRightTime;
			}
		}

		if(flapRightAnim){
			FlapRight();
		}
		if(flapLeftAnim){
			FlapLeft();
		}

		flapLeft = false;
		flapRight = false;
	}
	

	if(Time.time > lastFlapLeftTime  + (animationComponent[leftWingAnimation.name].length / leftWingSpeed) - (1/leftWingWeight.speed) ){
		leftWingWeight.target = 0.0;
	}

	if(Time.time > lastFlapRightTime + (animationComponent[rightWingAnimation.name].length / rightWingSpeed) - (1/rightWingWeight.speed) ){
		rightWingWeight.target = 0.0;
	}
		
	leftWingWeight.Lerp();
	rightWingWeight.Lerp();
	
	animationComponent[leftWingAnimation.name].weight = leftWingWeight.current;
	animationComponent[rightWingAnimation.name].weight = rightWingWeight.current;
	

}

function FlapLeft(){
	leftWingWeight.target = 1.0;
	animationComponent[leftWingAnimation.name].enabled = true;
	animationComponent[leftWingAnimation.name].speed = (fastWingSpeed + normalWingSpeed) * .5;
	animationComponent[leftWingAnimation.name].layer = layer;
	animationComponent[leftWingAnimation.name].time = 0.0;
	animationComponent[leftWingAnimation.name].AddMixingTransform(leftWingBone);
	animationComponent[leftWingAnimation.name].blendMode = AnimationBlendMode.Additive;
	lastFlapLeftTime = Time.time;

	if(flapSounds != null && flapSounds.Length > 0){
		var id : int = Random.value * flapSounds.Length;
		flapSounds[id].pitch = Random.Range(flapPitchRange.x, flapPitchRange.y);
		flapSounds[id].Play();
	}
}

function FlapRight(){
	rightWingWeight.target = 1.0;
	animationComponent[rightWingAnimation.name].enabled = true;
	animationComponent[rightWingAnimation.name].speed = (fastWingSpeed + normalWingSpeed) * .5;
	animationComponent[rightWingAnimation.name].layer = layer;
	animationComponent[rightWingAnimation.name].time = 0.0;
	animationComponent[rightWingAnimation.name].AddMixingTransform(rightWingBone);
	//animationComponent[rightWingAnimation.name].blendMode = AnimationBlendMode.Additive;
	lastFlapRightTime = Time.time;
	
	if(flapSounds != null && flapSounds.Length > 0){
		flapSounds[Random.value * flapSounds.Length].Play();
	}	
}


/*function OnGUI(){
	GUILayout.Label("Right: " + animationComponent[rightWingAnimation.name].speed.ToString());
	GUILayout.Label("Left: " + animationComponent[leftWingAnimation.name].speed.ToString()); 
}*/
