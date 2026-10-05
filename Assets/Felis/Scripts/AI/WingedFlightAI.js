#pragma strict

var wingedFlight : WingedFlight;

var characterRigidbody : Rigidbody;

var targetPosition : Vector3;
var targetTransform : Transform;

var constantForceHelp : float;
var wingForceHelp : float;
var forceHelp_DistanceCurve : AnimationCurve;
var forceHelp_DistVerticalOffsetCurve : AnimationCurve;

var targetDirection : Vector3;

var addOffset : Vector3;

var predictVelocity : float;
var predictAngle :float;

var targetAngle : float;
var deltaAngle : float;
var maxTargetAngle : float;
var angleMultiplier : float;

var angleDeadZone : float = 10; //Angle at which both wings are flapped.

var disableLeftWing : boolean;
var disableRightWing : boolean;

var useExtraHeight : boolean;
var addHeightForHorizontalDistance : float;
var heightForHDistanceMultiplier : float = 2.0;
var maxHeightForHDistance : float = 1.0;

var sideDetection : SideDetection;
var obstacleDistance : float = 1.0;

var onTarget : ToggleBoolean;
var targetRange : float;

var faceTarget : boolean;
var flipTransform : Transform;
var direction : int;
var changeDirection : Timer;

var useFlyArea : boolean;
var centerFlyArea : boolean;
var flyAreaCenterOffset : Vector3;
var flyArea : Bounds;



var debug : boolean;
var debugGUIStyle : GUIStyle;
var disableUntil : float;

function Start () {
	debugGUIStyle = new GUIStyle();

	if(GetComponent.<Rigidbody>() != null) characterRigidbody = GetComponent.<Rigidbody>();
	else{
		if(transform.parent != null){
			characterRigidbody = transform.parent.GetComponentInChildren(Rigidbody);
		}
		
	}
	
	if(sideDetection == null && transform.parent != null){
		sideDetection = transform.parent.GetComponentInChildren.<SideDetection>();
	}

	wingedFlight = GetComponentInChildren(WingedFlight);
	if(transform.parent != null){
		if(wingedFlight == null) wingedFlight = transform.parent.GetComponentInChildren(WingedFlight);
	}
	
	if(transform.parent != null) flipTransform = transform.parent;
	else flipTransform = transform;
	
	if(centerFlyArea){
		centerFlyArea = true;
		flyArea.center = transform.position + flyAreaCenterOffset;
	}

	//LEVEL PARAMS
	var setParams : SetParams[] = SetParams.GetSetParams(gameObject);
	for(var i = 0; i < setParams.Length; i++){
		if(setParams[i].wingedAITarget){
			targetTransform = setParams[i].transform;
			break;
		}
	}
}

function Update () {
	if(Time.time < disableUntil){
		return;
	}

	if(targetTransform != null){
		targetPosition = targetTransform.position;
		targetPosition += addOffset;
	}

	if(useFlyArea){
		targetPosition.x = Mathf.Clamp(targetPosition.x, flyArea.min.x, flyArea.max.x);
		targetPosition.y = Mathf.Clamp(targetPosition.y, flyArea.min.y, flyArea.max.y);
		targetPosition.z = Mathf.Clamp(targetPosition.z, flyArea.min.z, flyArea.max.z);
	}
	
	targetDirection = targetPosition - transform.position ;
	
	addHeightForHorizontalDistance = Mathf.Min(Mathf.Pow(Mathf.Abs(targetDirection.x),2) * heightForHDistanceMultiplier, maxHeightForHDistance);
	
	if(useExtraHeight) targetDirection.y += addHeightForHorizontalDistance; 
	
	if(targetDirection.y > Mathf.Max(characterRigidbody.velocity.y,0) * predictVelocity){
		if(!disableLeftWing) wingedFlight.flapLeft = true;
		if(!disableRightWing) wingedFlight.flapRight = true;
	}
	
	//Obstacle.
	if((sideDetection.leftFeetBlockDistance < obstacleDistance &&  targetDirection.x > 0)
	|| (sideDetection.rightFeetBlockDistance < obstacleDistance && targetDirection.x < 0)){
		wingedFlight.flapRight = true;
		wingedFlight.flapLeft = true;
	} 	
	
	targetAngle = Mathf.Clamp(-targetDirection.x * angleMultiplier - characterRigidbody.velocity.x * predictVelocity, -maxTargetAngle, maxTargetAngle);
	
	deltaAngle = targetAngle - wingedFlight.angle.current - wingedFlight.angle.speed * predictAngle;
	
	if(deltaAngle < -angleDeadZone){
		if(transform.parent.localScale.x > 0){
			disableRightWing = true;
		}
		else{
			disableLeftWing = true;
		}
	}
	else{
		if(transform.parent.localScale.x > 0){
			disableRightWing = false;
		}
		else{
			disableLeftWing = false;
		}		
	}


	if(deltaAngle > angleDeadZone){
		if(wingedFlight.side > 0){
			disableLeftWing = true;
		}
		else{
			disableRightWing = true;
		}
	}
	else{
		if(wingedFlight.side > 0){
			disableLeftWing = false;
		}
		else{
			disableRightWing = false;
		}		
	}




	//On Target.
	if(targetDirection.magnitude < targetRange) onTarget.current = true;
	else onTarget.current = false;
	onTarget.Update();
}

function FixedUpdate(){
	if(Time.time < disableUntil){
		return;
	}
	var dist : float = Vector3.Distance(transform.position, targetPosition);
	var forceHelp : float = forceHelp_DistanceCurve.Evaluate(dist) * constantForceHelp;
	var vOffset : float = 0;//forceHelp_DistVerticalOffsetCurve.Evaluate(dist);

	characterRigidbody.AddForce((targetPosition - transform.position + Vector3(0,vOffset,0)).normalized * forceHelp);
}

function LateUpdate(){
	if(Time.time < disableUntil){
		return;
	}
	if(faceTarget){
		changeDirection.Update();
		if(changeDirection.current){
			if(targetPosition.x < transform.position.x){
				direction = 1.0;
			}
			else{
				direction = -1.0;
			}
		}
		//flipTransform.localScale.x = Mathf.Abs(flipTransform.localScale.x) * direction;
		wingedFlight.side = direction;
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.white;
		Gizmos.DrawWireCube(flyArea.center, flyArea.size);
		debugGUIStyle.normal.textColor = Color.white;
		Handles.Label(flyArea.center, transform.name + ": Fly Area", debugGUIStyle);
	}
	#endif
}
