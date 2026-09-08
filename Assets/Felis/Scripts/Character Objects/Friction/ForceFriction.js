#pragma strict

var isGrounded : IsGrounded;
var input : ControllerInput;
var rb : Rigidbody;
var sideMovement : SideMovement;
var friction : float = 1.0;

var frictionMultiplier : float = 1.0;

@Space(30)
var slopeFrictionCurve : AnimationCurve;
var horizontalFriction : float = .5;
var lowSlopeFriction : float = .75;
var highSlopeFriction : float = 0.0;
var lowSlopeAngle : float = 50.0;
var highSlopeAngle : float = 55.0;

@Space(30)
var speedFrictionCurve : AnimationCurve;

var staticFriction : float = 1.0;
var movingFriction : float = 0.5;
var overSpeedFriction : float = 5.0;
var lowSpeed : float = 4.0;
var lowSpeedDrag : float = 0.5;
var overSpeed : float = 8.0;
var overspeedDrag : float = 5.0;
 var frictionForce : Vector3;
 var stopVelocity : float = 0.2;
 var stopDrag : float = 5.0;
 var noFricUntil : float;

@Space(30)
var loopingDragSound : AudioSource;
var reduceNoise : float = 0.0;
var dragSoundMultiplier : float = 1.0;
var dragVolumeSpeed : float = 5.0;

var useDragSoundPitch : boolean;
var dragSoundPitchCurve : AnimationCurve;

@Space(30)
var maxWeightForce : float = 30.0; //Friction can't be more than these many times the weight.

@Space(30)
var disableUntil : float;

@Space(30)
var debug : boolean;
var debugArrowSize : float = .2;

function MultiplyWeight(mulValue : float){
	if(rb == null && transform.parent != null){
		rb = transform.parent.GetComponent.<Rigidbody>();
	}
	
	rb.mass *= mulValue;
	friction *= mulValue;
}

function MultiplyWeightOnly(mulValue : float){
	if(rb == null && transform.parent != null){
		rb = transform.parent.GetComponent.<Rigidbody>();
	}
	
	rb.mass *= mulValue;
}

function Start () {
	if(transform.parent != null){
		if(isGrounded == null) isGrounded = transform.parent.GetComponentInChildren.<IsGrounded>();
		if(input == null) input = transform.parent.GetComponentInChildren(ControllerInput);
		if(rb == null) rb = transform.parent.GetComponent.<Rigidbody>();
		if(sideMovement == null) sideMovement = transform.parent.GetComponentInChildren(SideMovement);
	}
	else{
		if(isGrounded == null) isGrounded = GetComponentInChildren.<IsGrounded>();
		if(input == null) input = GetComponentInChildren(ControllerInput);
		if(rb == null) rb = GetComponent.<Rigidbody>();
		if(sideMovement == null) sideMovement = GetComponentInChildren(SideMovement);
	}
	slopeFrictionCurve = new AnimationCurve(Keyframe(0,horizontalFriction) , Keyframe(lowSlopeAngle,lowSlopeFriction), Keyframe(highSlopeAngle,highSlopeFriction));
	slopeFrictionCurve = AnimationCurveUtility.SetLinear(slopeFrictionCurve);
	
	speedFrictionCurve = new AnimationCurve(Keyframe(0,staticFriction) , Keyframe(lowSpeed,movingFriction), Keyframe(overSpeed,overSpeedFriction));
	speedFrictionCurve = AnimationCurveUtility.SetLinear(speedFrictionCurve);	
}


function Update () {
	if(isGrounded.isGrounded){
		frictionForce = -rb.velocity * friction; //Global. Must remove vertical forces from ground friction.
		
		var convertionMatrix : Matrix4x4;
		convertionMatrix.SetTRS(transform.position, Quaternion.LookRotation(Vector3.forward, isGrounded.floorNormal), Vector3.one);
		var groundNormalRelativeFrictionForce : Vector3 = convertionMatrix.inverse.MultiplyVector(frictionForce);
		groundNormalRelativeFrictionForce.y = 0.0;
		frictionForce = convertionMatrix.MultiplyVector(groundNormalRelativeFrictionForce);
		
		frictionForce *= friction * frictionMultiplier 
		* slopeFrictionCurve.Evaluate(Mathf.Abs(isGrounded.slopeAngle))
		* speedFrictionCurve.Evaluate(rb.velocity.magnitude);

		if(sideMovement != null && sideMovement.forceVector.magnitude > .1){ //This doesn't allow frictionForce to be opposite to sideMovement
			var movementMatrix : Matrix4x4 = Matrix4x4.TRS(Vector3.zero, Quaternion.LookRotation(sideMovement.forceVector, Vector3(0,0,-1)), Vector3.one);
			frictionForce = movementMatrix.inverse.MultiplyPoint3x4(frictionForce);
			frictionForce.z = Mathf.Max(frictionForce.z, 0);
			frictionForce = movementMatrix.MultiplyPoint3x4(frictionForce);

		}

		if(frictionForce.magnitude > rb.mass * maxWeightForce){
			frictionForce = frictionForce.normalized * rb.mass * maxWeightForce;
		}
		
		if(debug){
			var debugColor : Color = Color.gray;
			if(Time.time > disableUntil){
				debugColor = Color.red;
			}
			DebugUtility.DrawArrow(transform.position, frictionForce * debugArrowSize, debugColor);	
		}
	}
	else{
		frictionForce = Vector3.zero;
	}
	
	if(loopingDragSound != null){
		var targetVolume : float = 0.0;
		if(isGrounded.isGrounded){
			targetVolume = rb.velocity.magnitude * dragSoundMultiplier;
		}
		loopingDragSound.volume = Mathf.Lerp(loopingDragSound.volume - reduceNoise, targetVolume, Time.deltaTime * dragVolumeSpeed);

		if(useDragSoundPitch){
			var targetPitch : float = dragSoundPitchCurve.Evaluate(rb.velocity.magnitude);
			var newPitch : float = Mathf.Lerp(loopingDragSound.pitch, targetPitch, Time.deltaTime * dragVolumeSpeed);
			//A NaN or negative pitch makes FMOD resample backwards past the start of the
			//sample buffer, which takes the whole process down instead of throwing.
			if(float.IsNaN(newPitch)) newPitch = 1.0;
			loopingDragSound.pitch = Mathf.Clamp(newPitch, 0.05, 3.0);
		}
	}
}

function FixedUpdate(){
	//Apply friction.

	if(Time.time > noFricUntil){
		if(Time.time > disableUntil){
			if(isGrounded.isGrounded){
				rb.AddForce(frictionForce);
			}
		}


		if(Mathf.Abs(rb.velocity.x) > overSpeed){
			rb.velocity.x = Mathf.Lerp(rb.velocity.x, 0, overspeedDrag * Time.deltaTime);
		}

		if(Mathf.Abs(rb.velocity.x) > lowSpeed){
			rb.velocity.x = Mathf.Lerp(rb.velocity.x, 0, lowSpeedDrag * Time.deltaTime);
		}
	

		if(input != null){
			if(Mathf.Abs(input.inputAxis.current.x) < .1  && isGrounded.isGrounded){
				if(Mathf.Abs(rb.velocity.x) < stopVelocity){
					rb.velocity.x = Mathf.Lerp(rb.velocity.x, 0, stopDrag * Time.deltaTime);
				}
			 }
		}
	}

}