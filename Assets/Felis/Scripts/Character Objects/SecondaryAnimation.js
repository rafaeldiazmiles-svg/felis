#pragma strict

var defaultLocalPosition : Vector3;
var defaultLocalRotation : Quaternion;

var offset : Vector3Spring;
var springForce : float;
var damp : float;
var multiplier : Vector2;
var useAccel : boolean = true;
var accelerationCurve : float = 1.0;
var springGravity : float;

var velocity : Vector3;
var previousPosition : Vector3;
var acceleration : Vector3;
var previousVelocity : Vector3;

//Rotation values.
var addRotation : boolean;
var rotationInertia : Vector2;
var rotationTime : float;

private var previousOffset : Vector3;
private var offsetVelocity : Vector3;

private var rotationOffset : FloatSmoothDamp;

var useRoot : boolean = true;
var charRoot : Transform;

var shakeVel : boolean;
var shakeVelAmount : Vector3;

var mulRot_ScaleSign : boolean = true;

var addLocalPosOffset : Vector3;

function AddShakeVelocity(newShakeVel : Vector3){
	shakeVel = true;
	shakeVelAmount = newShakeVel;
}

function Start () {
	defaultLocalPosition = transform.localPosition;
	defaultLocalRotation = transform.localRotation;
	offset = new Vector3Spring();
	rotationOffset = new FloatSmoothDamp();
	
	previousPosition = transform.position;
	
	if(useRoot){
		charRoot = transform.root;	
	}
}


function Update(){
	transform.localPosition = defaultLocalPosition; //Position must be reseted (no offset) before calculating velocity.
	transform.localRotation = defaultLocalRotation;
}


function LateUpdate(){
	if(useRoot){
		charRoot = transform.root;	
	}

	//Position inertia.
	velocity = (transform.position - previousPosition) / Time.deltaTime;
	previousPosition = transform.position;	
	acceleration = (velocity - previousVelocity) / Time.deltaTime;
	previousVelocity = velocity; 

	var accelerationCurved : Vector3 = acceleration.normalized * Mathf.Pow(acceleration.magnitude,accelerationCurve);
	var velocityCurve : Vector3 = velocity.normalized * Mathf.Pow(velocity.magnitude,accelerationCurve);

	offset.springForce = springForce;
	offset.damp = damp;
	offset.gravity.y = springGravity;
	if(useAccel){
		offset.target = -Vector3(accelerationCurved.x * multiplier.x, accelerationCurved.y * multiplier.y,0);
	}
	else{
		offset.target = -Vector3(velocityCurve.x * multiplier.x, velocityCurve.y * multiplier.y,0);
	}

	if(shakeVel){
		offset.velocity += shakeVelAmount;
		shakeVel = false;
	}
	
	offset.Spring();
	
	if(float.IsNaN(offset.current.x) || float.IsNaN(offset.current.y) || float.IsNaN(offset.current.z)){
		return;
	}
	
	transform.position += offset.current;

	transform.localPosition += addLocalPosOffset;

	//Rotation inertia.
	if(addRotation){
		rotationOffset.time = rotationTime;
		
		offsetVelocity = (offset.current - previousOffset) / Time.deltaTime;
		previousOffset = offset.current;
		
		rotationOffset.target = offsetVelocity.x * rotationInertia.x + offsetVelocity.y * rotationInertia.y;
		
		rotationOffset.SmoothDamp();

		var rAngle : float = rotationOffset.current;
		if(mulRot_ScaleSign){
			rAngle *= Mathf.Sign(charRoot.localScale.x);
		}

		transform.RotateAround(transform.position, Vector3.forward, rAngle);
	}
}