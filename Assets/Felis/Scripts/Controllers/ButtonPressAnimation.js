#pragma strict

var pressed : boolean = false;

var damp : float = 10.0;
var springForce : float = 10.0;;

private var springValue : float;
private var springValueTarget : float;
private var springValueVelocity : float;

private var defaultPosition : Vector3;
private var defaultScale : Vector3;

var pushDeltaPosition : Vector3;
var pushDeltaScale : Vector3;

function Start () {
	defaultPosition = transform.localPosition;
	defaultScale = transform.localScale;
}

function FixedUpdate () {
	//1) Target value based on boolean.
	if(pressed)springValueTarget = 1.0;
	else springValueTarget = 0.0;
	
	//2) Value that springs fast.
	springValueVelocity += (springValueTarget - springValue) * Time.deltaTime * springForce; //Increase velocity.
	springValueVelocity = Mathf.Lerp(springValueVelocity, 0, Time.deltaTime * damp); //Slow down velocity.
	springValue += springValueVelocity;
	
	//3) Set scale and position in relation to value that springs.
	transform.localPosition = defaultPosition + pushDeltaPosition * springValue;
	transform.localScale = defaultScale + pushDeltaScale * springValue;
}