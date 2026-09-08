#pragma strict

var bodyParts : BodyPartProportion[];

class BodyPartProportion{
	var transformName : String;
	var transform : Transform;
	
	var defPos : Vector3;
	var defRot : Vector3;
	var defScale : Vector3;
	
	
	var deltaPosition : Vector3;
	var deltaRotation : Vector3;
	var deltaScale : Vector3;
	
	function Start(){
		if(transform != null){
			defPos = transform.localPosition;
			defRot = transform.localEulerAngles;
			defScale = transform.localScale;
		}		
	}
	
	function Update(){
		if(transform != null){
			transform.localPosition = defPos;
			transform.localEulerAngles = defRot;
			transform.localScale = defScale;
		}		
	}
	
	function LateUpdate(){
		if(transform != null){
			transform.localPosition += deltaPosition;
			transform.localEulerAngles += deltaRotation;
			transform.localScale += deltaScale;
		}
	}
}

function Start () {
	for(var bodyPart : BodyPartProportion in bodyParts){
		bodyPart.Start();
	}
}

function Update () {
	for(var bodyPart : BodyPartProportion in bodyParts){
		bodyPart.Update();
	}
}

function LateUpdate () {
	for(var bodyPart : BodyPartProportion in bodyParts){
		bodyPart.LateUpdate();
	}
}