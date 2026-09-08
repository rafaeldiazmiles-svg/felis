#pragma strict

var raySegments : RaySegment[];

var start : Transform;

var finish : Transform;


var heightCurve : AnimationCurve;
var heightCurveMultiplier : Vector2;
var localHeightCurveMultiplier : Vector2;


class RaySegment{
	var bone : Transform;
	var defaultRotation : Quaternion;
	var angle : float;

}

function Start () {
	for(var i = 0; i < raySegments.Length; i++){
		raySegments[i].defaultRotation = raySegments[i].bone.rotation;
	}
}

function Update () {
	var circleCenter : float;
	
	for(var i = 0; i < raySegments.Length; i++){
		var lerpValue : float = i*1.0 / (raySegments.Length-1);
		//raySegments[i].bone.position = Vector3.Lerp(start.position, finish.position, lerpValue);
		
		var useHeightMultiplier  : float = heightCurveMultiplier.x + (Mathf.Sin(Time.time)*.5+.5) * (heightCurveMultiplier.y - heightCurveMultiplier.x);
		//raySegments[i].bone.position.y += heightCurve.Evaluate(lerpValue) * useHeightMultiplier;
	
		if(i != raySegments.Length-1){
			raySegments[i].angle = 180 + 
			Mathf.Atan2(raySegments[i].bone.position.y - raySegments[i+1].bone.position.y, raySegments[i].bone.position.x - raySegments[i+1].bone.position.x) *Mathf.Rad2Deg;
		}
		else{
			raySegments[i].angle = 
			Mathf.Atan2(raySegments[i].bone.position.y - raySegments[i-1].bone.position.y, raySegments[i].bone.position.x - raySegments[i-1].bone.position.x) *Mathf.Rad2Deg;	
		}
		
		raySegments[i].bone.rotation = raySegments[i].defaultRotation;
		raySegments[i].bone.RotateAround(raySegments[i].bone.position,Vector3.forward, raySegments[i].angle);
		
		var useLocalHeightMultiplier : float = localHeightCurveMultiplier.x + (Mathf.Cos(Time.time)*.5+.5) * (localHeightCurveMultiplier.y - heightCurveMultiplier.x);
		
		//raySegments[i].bone.position += raySegments[i].bone.TransformDirection(0,0,heightCurve.Evaluate(lerpValue) * useLocalHeightMultiplier);
	}
}