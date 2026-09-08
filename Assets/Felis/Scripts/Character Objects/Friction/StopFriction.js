#pragma strict

private var physicMaterial : PhysicMaterial;

var defaultMaterial : PhysicMaterial;

private var isGroundedScript : IsGrounded;
private var isGrounded : boolean;
private var slopeAngle : float;

var minSpeed : float;

var stopFriction : float;

var applyTime : float = 1.0;

private var stopTime : float;

var controllerInputScript : ControllerInput;
var useSideMovementController : boolean = true;


private var currentFriction : float;

private var slopeAngleCurve : AnimationCurve;

var reduceFrictionAngleStart : float;
var reduceFrictionAngleEnd: float;

function Start () {
	isGroundedScript = GetComponent.<IsGrounded>();
	if(useSideMovementController){
		controllerInputScript = GetComponent(SideMovement).input;
	}
	slopeAngleCurve = new AnimationCurve();
	slopeAngleCurve.AddKey(0,1.0);
	slopeAngleCurve.AddKey(reduceFrictionAngleStart,1.0);
	slopeAngleCurve.AddKey(reduceFrictionAngleEnd,0.0);
}

function LateUpdate () {
	isGrounded = isGroundedScript.IsGrounded();
	slopeAngle = isGroundedScript.slopeAngle;
	
	if(isGrounded && GetComponent.<Rigidbody>().velocity.magnitude < minSpeed && Mathf.Abs(controllerInputScript.inputAxis.current.x) < .1 && !controllerInputScript.inputButtonB.pressed ){
		stopTime += Time.deltaTime;
		currentFriction = Mathf.Min(stopFriction, (stopTime / Mathf.Max(applyTime,0.01) ) * stopFriction * slopeAngleCurve.Evaluate( Mathf.Abs(slopeAngle) ) );
		GetComponent.<Collider>().material.staticFriction = currentFriction;
		GetComponent.<Collider>().material.dynamicFriction = 1.0;
	}
	else{
		GetComponent.<Collider>().material = defaultMaterial;
		stopTime = 0.0;
	}
}

function OnDisable(){
	GetComponent.<Collider>().material = defaultMaterial;
}