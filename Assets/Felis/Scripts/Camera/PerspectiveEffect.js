#pragma strict

var centerZ : float;
var centerY : float;

var hRotation : float;
var vRotation : float;
var roll : float;


var maxRotation : float;
var maxRoll : float;

var settleSpeed : float;

var curve : float;

var sensitivity : float;

var dependOnDefaultPositionScript : boolean;
var defaultPositionScript : DefaultTransformFixedUpdate;	

function Start () {
	Input.gyro.enabled = true;
	
	defaultPositionScript = GetComponent(DefaultTransformFixedUpdate);

}

function FixedUpdate () {
	if(dependOnDefaultPositionScript && !defaultPositionScript.enabled) return;
	
	hRotation += Mathf.Pow(Mathf.Abs(Input.gyro.rotationRate.y) * Time.deltaTime * Mathf.Rad2Deg,curve) * Mathf.Sign(Input.gyro.rotationRate.y) * sensitivity;
	vRotation += Mathf.Pow(Mathf.Abs(Input.gyro.rotationRate.x) * Time.deltaTime * Mathf.Rad2Deg,curve) * Mathf.Sign(Input.gyro.rotationRate.x) * sensitivity;
	roll += Input.gyro.rotationRate.z * Time.deltaTime * Mathf.Rad2Deg * .5;
	
	hRotation = Mathf.Lerp(hRotation, 0, Time.deltaTime * settleSpeed * (1-((maxRotation - Mathf.Abs(hRotation))/maxRotation)) );
	vRotation = Mathf.Lerp(vRotation, 0, Time.deltaTime * settleSpeed * (1-((maxRotation - Mathf.Abs(vRotation))/maxRotation)) );
	roll = Mathf.Lerp(roll, 0, Time.deltaTime * settleSpeed * (1-((maxRoll - Mathf.Abs(roll))/maxRoll)) );
									
	hRotation = Mathf.Clamp(hRotation, -maxRotation, maxRotation);
	vRotation = Mathf.Clamp(vRotation, -maxRotation, maxRotation);
	roll = Mathf.Clamp(roll, -maxRoll, maxRoll);
	
	transform.RotateAround(Vector3(transform.position.x, transform.position.y, centerZ), 
	Vector3.up, -hRotation);

	transform.RotateAround(Vector3(transform.position.x, transform.position.y, centerY), 
	Vector3.right, vRotation);
	
	transform.RotateAround(transform.position, transform.forward, roll);
}

function OnGUI(){
;
}