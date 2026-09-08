#pragma strict
var character : Transform;
var isGrounded : IsGrounded;
var groundBias : float = .8;
@Space(20)
var maxAngle : float = 60.0;
var currentAngle : float;
var smoothTime : float = .2;
var angleVelocity : float;
@Space(20)
var deltaAngle : float;
var targetAngle : float;
@Space(20)
var setZeroUntil : float;
@Space(20)
var angleOffset : float;
@Space(20)
var useMantAngle : MaintainAngle;


function Start () {
	if(transform.parent == null){
		isGrounded = GetComponentInChildren.<IsGrounded>();
		character = transform;
	}
	else{
		isGrounded = transform.parent.GetComponentInChildren.<IsGrounded>();
		character = transform.parent;
	}	
}

function Update () {
	if(isGrounded.isGrounded){
		deltaAngle = isGrounded.slopeAngle;
		targetAngle = deltaAngle * groundBias;
	}
	else{
		targetAngle = 0.0;	
	}
	targetAngle = Mathf.Clamp(targetAngle, -maxAngle, maxAngle);
	
	if(Time.time < setZeroUntil){
		targetAngle = 0.0;	
	}

	targetAngle += angleOffset;

	if(useMantAngle != null){
		useMantAngle.defaultAngle = -targetAngle;
	}
	else{
		currentAngle = Mathf.SmoothDamp(currentAngle, targetAngle, angleVelocity, smoothTime);
		character.RotateAround(character.position, character.TransformDirection(0,0,1), currentAngle);
	}
}