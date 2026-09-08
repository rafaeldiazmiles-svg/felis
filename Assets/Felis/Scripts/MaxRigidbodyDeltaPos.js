#pragma strict

var previousPosition : Vector3;
var maxDelta : float = .5;

var extendMaxDelta : float = 0.1;
var extendMaxDeltaLimit : float = 1.0;
var extendMaxDeltaIncrement : float = .2;
var extendMaxDeltaDecreaseSpeed : float = .1;

var disable : boolean;
var disableUntil : float;

var rb : Rigidbody;

function Start () {
	previousPosition = GetComponent.<Rigidbody>().position;
	
	rb = GetComponent.<Rigidbody>();
}

/*function Update(){
	if(deltaPosition.magnitude > maxDelta){
		transform.position = previousPosition;
	}
}*/

function FixedUpdate() {
	if(disable) return;
	var deltaPosition : Vector3 = rb.position - previousPosition;
	//previousPosition = rb.position;
	
	if(deltaPosition.magnitude > maxDelta + extendMaxDelta && Time.time > disableUntil){
		
		//var movePos : Vector3 = previousPosition;
	
		var movePos : Vector3 = previousPosition + (deltaPosition.normalized * (maxDelta));
		
		rb.MovePosition(movePos);
		transform.position = movePos;
		
		//rb.velocity = Vector3.zero;
		//rb.velocity = (deltaPosition.normalized * (maxDelta + extendMaxDelta)) / Time.deltaTime;
		
		if(extendMaxDelta < extendMaxDeltaLimit){
			extendMaxDelta += extendMaxDeltaIncrement;
		}
	}
	/*else{
		previousPosition = rb.position;
	}*/
	
	previousPosition = rb.position;
	
	extendMaxDelta = Mathf.MoveTowards(extendMaxDelta, 0, Time.deltaTime * extendMaxDeltaDecreaseSpeed);
}
