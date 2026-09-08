#pragma strict

var targetTransform : Transform;
var yOffset : float;
var yOffsetCurve : AnimationCurve;
var enableYOffsetCurve : boolean = true;
var vel : Vector3;
var smooth : float = .5;
//var tgtBlendSpeed : float = 10.0;

var changeTgt : IntroCamPlayer_ChangeTarget[];

var cameraZPos : FloatLerp;

var fChar : FollowCharacter;

class IntroCamPlayer_ChangeTarget{
	var trigger : boolean;

	var newTarget : Transform;
	var changeTarget : boolean;

	var changeOnBounds : Bounds;

	var changeZoom : boolean;
	var newZoom : float;
}


function Start () {

}

function Update () {
	cameraZPos.Lerp();

	if(targetTransform != null){
		if(enableYOffsetCurve){
			yOffset = yOffsetCurve.Evaluate(transform.position.x);
		}
		transform.position = Vector3.SmoothDamp(transform.position, targetTransform.position + Vector3(0,yOffset,0), vel, smooth);
	}

	for(var i = 0; i < changeTgt.Length; i++){
		if(changeTgt[i].trigger || changeTgt[i].changeOnBounds.Contains(transform.position)){
			changeTgt[i].trigger = false;

			if(changeTgt[i].changeTarget){
				targetTransform = changeTgt[i].newTarget;
				changeTgt[i].changeTarget = false;
			}


			if(changeTgt[i].changeZoom){
				cameraZPos.target = changeTgt[i].newZoom;
				changeTgt[i].changeZoom = false;
			}
		}
	}

	if(fChar != null){
		fChar.zDistance = cameraZPos.current;
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	for(var i = 0; i < changeTgt.Length; i++){
		Gizmos.DrawWireCube(changeTgt[i].changeOnBounds.center, changeTgt[i].changeOnBounds.size);
	}
	#endif
}