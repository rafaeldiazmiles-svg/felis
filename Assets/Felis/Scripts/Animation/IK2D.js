#pragma strict

@Header("--------------------Input-----------------------")
var target : Transform;
var targetPos : Vector3;
var transitionIK : FloatLerp;
var transitionIK_UpSpeed : float = 10.0;
var transitionIK_DownSpeed : float = 10.0;
var updateIK : ToggleBoolean;;

@Space(30)
var ZOffsetCamera : float;
var localYOffset : float;
var thisIsUpperArm : boolean = true;
var upperArm : Transform;
var upperArmAngleZero : Vector3;
var upperArmShoulderReachCurve : AnimationCurve;
var stretchCurve : AnimationCurve;
@Space(10)
var childIsForearm : boolean = true;
var forearm : Transform;
var forearmAngleZero : Vector3;
var forearmUpperArmRatio : float = 1.0;
@Space(10)
var useRoot : boolean = true;
var useRBasRoot : boolean = true;
var charRoot : Transform;
@Space(5)
var boneFlipSearch : String = "Root";
var boneFlip : Transform;
var rootAngle : float;


@Header("--------------------Values-----------------------")
var side : int;
var upperArmAngle : float;
var upperArmIKAngle : float;
var forearmAngle : float;
var targetDist : float;

function Start () {
	if(thisIsUpperArm){
		upperArm = transform;
	}
	if(upperArm != null && childIsForearm){
		forearm = upperArm.GetChild(0);
	}
	
	if(useRoot) charRoot = transform.root;
	if(useRBasRoot){
		var rb : Rigidbody = FindUtility.ReverseFindRigidbody(transform);
		if(rb != null){
			charRoot = rb.transform;
		}
	}
	
	var allBones : Transform[] = charRoot.GetComponentsInChildren.<Transform>();
	for(var i = 0; i < allBones.Length; i++){
		if(allBones[i].name.ToLower().Contains(boneFlipSearch.ToLower())){
			boneFlip = allBones[i];
			break;
		}
	}
}

function LateUpdate () {
	if(transitionIK.target > transitionIK.current){
		transitionIK.speed = transitionIK_UpSpeed;
	}
	else{
		transitionIK.speed = transitionIK_DownSpeed;
	}
	transitionIK.Lerp();
	updateIK.Update();
	
	if(transitionIK.current < .05 && !updateIK.current){
		return;
	}
	
	if(target != null) targetPos = target.position;
	
	if(updateIK.toggledTrue){
		transitionIK.target = 1.0;
	}
	if(updateIK.toggledFalse){
		transitionIK.target = 0.0;
	}

	if(transitionIK.current > 0.01){
		var originalUpperArmPosition : Vector3 = upperArm.position;
		var originalUpperArmAngle : Quaternion = upperArm.rotation;
		var originalUpperArmScale : Vector3 = upperArm.localScale;
		var originalForearmAngle : Quaternion = forearm.rotation;
		
		var vectorZero : Vector3 = boneFlip.TransformDirection(1,0,0);
		var dy : float = vectorZero.y;
		var dx : float = vectorZero.x;
		rootAngle = Mathf.Atan2(dy, dx) * Mathf.Rad2Deg;
		
		//Side
		side = Mathf.Sign(charRoot.localScale.x) * Mathf.Sign(boneFlip.localScale.x);
		
		//Upper arm
		targetDist = Vector3.Distance(upperArm.position, targetPos);
		
		upperArm.localScale.x *= stretchCurve.Evaluate(targetDist);
		upperArm.localScale.y /= stretchCurve.Evaluate(targetDist);
		
		upperArm.position += (Camera.main.transform.position - upperArm.position).normalized * ZOffsetCamera;
		upperArm.eulerAngles = upperArmAngleZero;
		upperArm.position += (targetPos - upperArm.position).normalized * upperArmShoulderReachCurve.Evaluate(targetDist);
		AdjustOnSide(upperArm);
		upperArmAngle = LookAtAngle(upperArm);
		upperArm.RotateAround(upperArm.position, -Vector3.forward, upperArmAngle);
		upperArm.Rotate(Vector3(0,localYOffset,0), Space.Self);
		
		var upperArmLength : float = Vector3.Distance(upperArm.position, forearm.position);;
		var forearmLength : float = upperArmLength * forearmUpperArmRatio;
		var armLength = upperArmLength + forearmLength;
		var clampedTargetDistance = Mathf.Min(targetDist, armLength - 0.00001);		
		
		var adjacent : float =
		((upperArmLength*upperArmLength) - (forearmLength*forearmLength) + (clampedTargetDistance*clampedTargetDistance))/(2*clampedTargetDistance);
		
		upperArmIKAngle = -Mathf.Acos(adjacent/upperArmLength) * Mathf.Rad2Deg;
		upperArm.RotateAround(upperArm.position, -Vector3.forward, upperArmIKAngle);
		
		//Forearm
		forearm.eulerAngles = forearmAngleZero;
		AdjustOnSide(forearm);
		upperArmAngle = LookAtAngle(forearm);
		forearm.RotateAround(forearm.position, -Vector3.forward, upperArmAngle);	
		
		//Transition
		upperArm.position = Vector3.Lerp(originalUpperArmPosition, upperArm.position, transitionIK.current);
		upperArm.rotation = Quaternion.Lerp(originalUpperArmAngle, upperArm.rotation, transitionIK.current);
		upperArm.localScale = Vector3.Lerp(originalUpperArmScale, upperArm.localScale, transitionIK.current);
		forearm.rotation = Quaternion.Lerp(originalForearmAngle, forearm.rotation, transitionIK.current);
	}
}

function AdjustOnSide(limb : Transform){
	if(side == -1){
		limb.RotateAround(limb.position, -Vector3.forward, 180);
	}
	if(boneFlip.localScale.x < 0){
		limb.RotateAround(limb.position, -Vector3.forward, -rootAngle * 2);
	}	
}

function LookAtAngle(limb : Transform) : float{
	var dx : float = targetPos.x - limb.position.x;
	var dy : float = targetPos.y - limb.position.y;
	var angle : float = Mathf.Atan2(dy, -dx) * Mathf.Rad2Deg * side;
	if(angle < 0) angle = 360 + angle;
	return angle;
}

