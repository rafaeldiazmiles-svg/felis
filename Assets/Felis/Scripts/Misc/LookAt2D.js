#pragma strict

@Header("-------------Input-------------")
var target : Transform;
var autoFindWithTag : boolean;
var targetTag : String = "Player";
@Space(30)
var negativeAngle : boolean;
var invertX : boolean;
var invertY : boolean;
var multiplyByRootXScaleSign : boolean;
var angleOffset : float;
var angleOffsetOnNegativeScale : float;
var localAngle : boolean;
@Space(30)
var useRoot : boolean = true;
var charRoot : Transform;
@Space(30)
var smoothAngle : boolean;
var smoothAngleSpeed : float = 5.0;
@Space(30)
var handleAngle : float;
var defaultHandleAngle : float;
@Space(30)
var clamp : boolean;
var clampMin : float;
var clampMax : float;
@Space(30)
var useHingeJoint : HingeJoint;

@Header("-------------Values-------------")
var angle : float;
var defaultRotation : Quaternion;
var defaultLocalRotation : Quaternion;
var smoothAngleVal : float;

function Start () {
	if(autoFindWithTag){
		GetTarget();
	}

	if(useRoot) charRoot = transform.root;

		defaultLocalRotation = transform.localRotation;
		defaultRotation = transform.rotation;

	if(transform.parent != null){
		var worldHandlePos : Vector3 = transform.parent.TransformPoint(Vector3.right);
		defaultHandleAngle = Mathf.Atan2(worldHandlePos.y - transform.parent.position.y, worldHandlePos.x - transform.parent.position.x)  * Mathf.Rad2Deg;
	}

	var setParams : SetParams[] = SetParams.GetSetParams(gameObject);
	for(var i = 0; i < setParams.Length; i++){
		if(setParams[i].lookAt2DTarget){
			target = setParams[i].transform;
			break;
		}
	}
}

function GetTarget(){
	var possibleTargets : GameObject[] = GameObject.FindGameObjectsWithTag(targetTag);
	for(var i = 0; i < possibleTargets.Length; i++){
		if(target == null){
			target = possibleTargets[i].transform;
		}
		else{
			var thisDist : float = Vector3.Distance(transform.position, target.transform.position);
			var currentTargetDist : float = Vector3.Distance(transform.position, possibleTargets[i].transform.position);
			if(thisDist < currentTargetDist){
				target = possibleTargets[i].transform;						
			}
		}
	}	
}

function LateUpdate () {
	if(target == null) GetTarget();
	if(target == null) return;

	var dx : float = target.position.x - transform.position.x;
	var dy : float = target.position.y - transform.position.y;

	if(invertX){
		dx = -dx;
	}
	if(invertY){
		dy = -dy;
	}

	var targetAngle = Mathf.Atan2(dy, dx) * Mathf.Rad2Deg;
	if(negativeAngle){
		targetAngle = -targetAngle;
	}

	var rootXScaleSign : float = 1.0;

	if(multiplyByRootXScaleSign){
		if(charRoot != null){
			 rootXScaleSign = Mathf.Sign(charRoot.localScale.x);
		}
		targetAngle *= rootXScaleSign;
	}

	var useAngle : float;




	if(localAngle && transform.parent != null){
		if(!useHingeJoint){
			transform.localRotation = defaultLocalRotation;
		}

		var worldHandlePos : Vector3 = transform.parent.TransformPoint(Vector3.right);
		handleAngle = Mathf.Atan2(worldHandlePos.y - transform.parent.position.y, worldHandlePos.x - transform.parent.position.x) * Mathf.Rad2Deg;
		var deltaHandleAngle : float = Mathf.DeltaAngle(defaultHandleAngle, handleAngle);
		targetAngle -= deltaHandleAngle;
	}
	else{
		if(!useHingeJoint){
			transform.rotation = defaultRotation;
		}
	}


	targetAngle += angleOffset;
	if(rootXScaleSign < 0){
		targetAngle += angleOffsetOnNegativeScale;
	}

	if(clamp){
		targetAngle = Mathf.Clamp(targetAngle,clampMin, clampMax);
	}

	if(smoothAngle){
		angle = Mathf.LerpAngle(angle, targetAngle, Time.deltaTime * smoothAngleSpeed);
}
	else{
		angle = targetAngle;
	}

	if(useHingeJoint != null){
		useHingeJoint.spring.targetPosition = targetAngle;
	}
	else{
		transform.RotateAround(transform.position, Vector3.forward, angle);
	}

}