#pragma strict

@script RequireComponent(GrassFlow)

var applyMode : ApplyMode;

var onlyPositive : boolean = true;

private var grassFlowScript : GrassFlow;


var sinSpeedA : float;
var sinSpeedB : float;

var waveSizeA : float;
var waveSizeB : float;

var curve : float;

var offset : float;

function Start () {
	grassFlowScript = GetComponent(GrassFlow);
}

function FixedUpdate () {
	
	var finalValue : float;
	
	finalValue = Mathf.Sin(Time.time * sinSpeedA + (transform.position.x / waveSizeA) + offset) * Mathf.Sin(Time.time * sinSpeedB + (transform.position.x / waveSizeB) + offset);

	finalValue = Mathf.Pow(Mathf.Abs(finalValue), curve) * Mathf.Sign(finalValue);
	
	if(onlyPositive) finalValue = Mathf.Abs(finalValue);
	
	Debug.DrawRay(transform.position, Vector3.up * finalValue, Color.Lerp(Color.blue, Color.red, (finalValue+1) * .5));
	
	if(applyMode == ApplyMode.absolute) grassFlowScript.masterValue = finalValue;
	if(applyMode == ApplyMode.additive) grassFlowScript.masterValue += finalValue;
}