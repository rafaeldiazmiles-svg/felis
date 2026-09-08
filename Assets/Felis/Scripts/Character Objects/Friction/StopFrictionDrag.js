#pragma strict

var defaultDrag : float;

var autoFind : boolean = true;

var rb : Rigidbody;

var isGroundedScript : IsGrounded;
var isGrounded : boolean;
var slopeAngle : float;

var minSpeed : float = .5;
var minAngularVel : float = 3.0;

var stopDragFriction : float = 50;

var applyTime : float = 1.0;

var stopTime : float;

var controllerInputScript : ControllerInput;

var currentDragFriction : float;
var currentAngularDragFriction : float;

private var slopeAngleCurve : AnimationCurve;

var reduceFrictionAngleStart : float = 10;
var reduceFrictionAngleEnd: float = 50;

var underWaterScript : UnderWater;

var applyAngularDrag : boolean;
var defaulAngularDrag : float;
var stopAngularDragFriction : float = 5.0;

var dragThisFrame : boolean;

var setAngleDragUntil : float;
var angleDrag : float;

@Space(30)
var holdItem : boolean;
var startTime : float;
var holdDelay : float = 0.5;
var restoreGrav : boolean;

function HoldItem(){
	holdItem = true;
}

function Start () {
	startTime = Time.time;

	slopeAngleCurve = new AnimationCurve();
	slopeAngleCurve.AddKey(0,1.0);
	slopeAngleCurve.AddKey(reduceFrictionAngleStart,1.0);
	slopeAngleCurve.AddKey(reduceFrictionAngleEnd,0.0);

	if(autoFind){
		isGroundedScript = GetComponentInChildren(IsGrounded);
		controllerInputScript = GetComponentInChildren(ControllerInput);
		underWaterScript = GetComponentInChildren(UnderWater);
		rb = GetComponent.<Rigidbody>();
		
		if(transform.parent != null){
			if(isGroundedScript == null) isGroundedScript = transform.parent.gameObject.GetComponentInChildren(IsGrounded);
			if(controllerInputScript == null) controllerInputScript = transform.parent.gameObject.GetComponentInChildren(ControllerInput);
			if(underWaterScript == null) underWaterScript = transform.parent.gameObject.GetComponentInChildren(UnderWater);
			if(rb == null) rb = transform.parent.GetComponent.<Rigidbody>();
		}
		
		
	}
	
	defaultDrag = rb.drag;
	defaulAngularDrag = rb.angularDrag;
}

function LateUpdate () {
	if(holdItem && Time.time > startTime + holdDelay){
		holdItem = false;
		rb.useGravity = false;
		rb.velocity = Vector3.zero;
		restoreGrav = true;
	}

	isGrounded = isGroundedScript.IsGrounded();
	slopeAngle = isGroundedScript.slopeAngle;
	
	var receivingInput : boolean;
	if(controllerInputScript != null){
		if(Mathf.Abs(controllerInputScript.inputAxis.current.x) > .1 || controllerInputScript.inputButtonB.pressed){
			receivingInput = true;
			stopTime = 0.0;
		 }
	}



	if(isGrounded && rb.velocity.magnitude < minSpeed && rb.angularVelocity.magnitude < minAngularVel && !receivingInput){
		//Is stopping.
		stopTime += Time.deltaTime;
		currentDragFriction = Mathf.Min(stopDragFriction, (stopTime / Mathf.Max(applyTime,0.01) ) * stopDragFriction * slopeAngleCurve.Evaluate( Mathf.Abs(slopeAngle) ) );
		rb.drag = currentDragFriction;
		
		if(applyAngularDrag){
			currentAngularDragFriction = Mathf.Min(stopAngularDragFriction, (stopTime / Mathf.Max(applyTime,0.01) ) * stopAngularDragFriction * slopeAngleCurve.Evaluate( Mathf.Abs(slopeAngle) ) );
			rb.angularDrag = currentAngularDragFriction;
		}
	}
	else{
		if(underWaterScript != null && underWaterScript.isUnderwater.current){
			//Is underwater.
			rb.drag = underWaterScript.waterDrag;
			if(underWaterScript.waterAngularDrag > defaulAngularDrag){
				rb.angularDrag = underWaterScript.waterAngularDrag;
			}
			/*if(applyAngularDrag){
				rb.angularDrag = stopAngularDragFriction;
			}*/
		}
		else{
			//Is moving.
			rb.drag = defaultDrag;
			if(applyAngularDrag){
				rb.angularDrag = defaulAngularDrag;
			}
		}
		stopTime = 0.0;
		if(restoreGrav){
			rb.useGravity = true;
		}
	}

	if(dragThisFrame){
		rb.drag = stopDragFriction;
		dragThisFrame = false;
	}

	if(Time.time < setAngleDragUntil){
		rb.angularDrag = angleDrag;
	}

}

function BreakDrag(){
	stopTime = 0.0;
	rb.drag = defaultDrag;
	rb.angularDrag = defaulAngularDrag;	
}

function OnDisable(){
	if(rb != null) rb.drag = defaultDrag;
}