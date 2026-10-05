#pragma strict

var loopingAudio : AudioSource;

var movingRB : Rigidbody;
var useTransformSpeed : boolean;

var volumeMultiplier : float = .5;
var volumeChangeSpeed : float = 5.0;

var previousPos : Vector3;

var changePitch : boolean;
var pitchCurve : AnimationCurve;
var pitchChangeSpeed : float;

var minSpeed : float;

var enableSleep : boolean;
var sleepSpeed : float = .1;
var awakeSpeed : float = .3;
var dontSleepUntil : float;

function Start () {
	if(loopingAudio == null){
		loopingAudio = GetComponent.<AudioSource>();
	}
}

function Update () {


	var useSpeed : float;
	
	if(movingRB != null) useSpeed = movingRB.velocity.magnitude;
	
	if(useTransformSpeed){
		useSpeed = (transform.position - previousPos).magnitude / Time.deltaTime;
		previousPos = transform.position;
	}
	
	useSpeed -= minSpeed;
	useSpeed = Mathf.Max(0, useSpeed);

	if(enableSleep && Time.time > dontSleepUntil){
		if(useSpeed < sleepSpeed){
			loopingAudio.Stop();

		}
		if(useSpeed > awakeSpeed){
			loopingAudio.Play();
			dontSleepUntil = Time.time + loopingAudio.clip.length;
		}
	}
	
	loopingAudio.volume = Mathf.Lerp(loopingAudio.volume, useSpeed * volumeMultiplier, Time.deltaTime * volumeChangeSpeed);
	
	if(changePitch){
		var newPitch : float = Mathf.Lerp(loopingAudio.pitch, pitchCurve.Evaluate(useSpeed), Time.deltaTime * pitchChangeSpeed);
		//A NaN or negative pitch makes FMOD resample backwards past the start of the
		//sample buffer, which takes the whole process down instead of throwing.
		if(float.IsNaN(newPitch)) newPitch = 1.0;
		loopingAudio.pitch = Mathf.Clamp(newPitch, 0.05, 3.0);
	}
}
