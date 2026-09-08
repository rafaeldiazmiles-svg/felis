#pragma strict

var rb : Rigidbody;

var shakeTorqueCurve : AnimationCurve;
var multiplierMin : float = 1.0;
var multiplierMax : float = 1.0;

var shakeTimer : Timer;

var shakeNow : boolean;

function Start () {
	rb = GetComponent.<Rigidbody>();
}

function Update () {
	shakeTimer.Update();

	if(shakeTimer.current ){
		shakeNow = true;
	}

	if(shakeNow){
		if(Time.time > shakeTimer.last + shakeTorqueCurve.keys[shakeTorqueCurve.keys.Length - 1].time){
			shakeNow = false;
		}

		rb.AddTorque(Vector3(0,0,shakeTorqueCurve.Evaluate(Time.time - shakeTimer.last)) * Random.Range(multiplierMin, multiplierMax));
	}
}