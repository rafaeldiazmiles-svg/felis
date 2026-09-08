#pragma strict

var multiplier : float = 1.0;

var changeSpeed : float;

var setNewEvery : Vector2;
var nextSetTime : float;

var localPositionControl : Vector3Lerp;
var localRotationControl : QuaternionLerp;
var localScaleControl : Vector3Lerp;

var minPos : Vector3;
var maxPos : Vector3;
var minRot : Vector3;
var maxRot : Vector3;
var minScale : Vector3;
var maxScale : Vector3;

var defaultLocalPosition : Vector3;
var defaultLocalRotation : Quaternion;
var defaultLocalScale : Vector3;

var dynamicMultiplier : boolean;
var lowQuake : boolean;
var highQuake : boolean;

function Start () {
	defaultLocalPosition = transform.localPosition;
	defaultLocalRotation = transform.localRotation;
	defaultLocalScale = transform.localScale;
	
	localRotationControl.current = Quaternion.identity;
	localRotationControl.target = Quaternion.identity;
}

function LateUpdate () {
	if(multiplier  > .05){
		localPositionControl.speed = changeSpeed;
		localPositionControl.Lerp();
		transform.localPosition = defaultLocalPosition + localPositionControl.current * multiplier;
		
		localRotationControl.speed = changeSpeed;
		localRotationControl.Lerp();
		transform.localRotation = defaultLocalRotation * Quaternion.Lerp(Quaternion.identity, localRotationControl.current, multiplier);
		
		localScaleControl.speed = changeSpeed;
		localScaleControl.Lerp();
		transform.localScale = defaultLocalScale + localScaleControl.current * multiplier;
		
		if(Time.time > nextSetTime){
			nextSetTime = Time.time + Random.Range(setNewEvery.x, setNewEvery.y);
			
			localPositionControl.target = Vector3(Random.Range(minPos.x,maxPos.x), Random.Range(minPos.y,maxPos.y), Random.Range(minPos.z,maxPos.z));
			localRotationControl.target = Quaternion.Euler(Vector3(Random.Range(minRot.x,maxRot.x), Random.Range(minRot.y,maxRot.y), Random.Range(minRot.z,maxRot.z)));
			localScaleControl.target = Vector3(Random.Range(minScale.x,maxScale.x), Random.Range(minScale.y,maxScale.y), Random.Range(minScale.z,maxScale.z));
		}
	}
	else{	
		transform.localPosition = defaultLocalPosition;
	}
	
	if(dynamicMultiplier){
		multiplier = Mathf.MoveTowards(multiplier, 0.0, Time.deltaTime);
	}
	
	if(lowQuake){
		multiplier = 0.4;
		lowQuake =false;
	}
	
	if(highQuake){
		multiplier = 1.0;
		highQuake = false;
	}
}