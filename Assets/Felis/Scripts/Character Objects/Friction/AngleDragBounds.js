#pragma strict

var dragBounds : Bounds;
var drag : float;

var getTimer : Timer;

var searchTag : String;

var fricTargets : StopFrictionDrag[];

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetRbs();
	}

	if(fricTargets != null){
		for(var i = 0; i < fricTargets.Length; i++){
			if(fricTargets[i] == null){
				continue;
			}
			if(dragBounds.Contains(fricTargets[i].transform.position - transform.position)){
				fricTargets[i].setAngleDragUntil = Time.time + .1;
				fricTargets[i].angleDrag = drag;
			}
		}
	}
}



function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
		
	Gizmos.color = Color.red;
	Gizmos.DrawWireCube(dragBounds.center + transform.position, dragBounds.size);


	#endif
}

function GetRbs(){
	var tagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(searchTag);

	if(tagObjs != null){
		var fricTargetsArray : Array =new Array();
		for(var i = 0; i < tagObjs.Length; i++){
			var stopFDrag : StopFrictionDrag = tagObjs[i].GetComponentInChildren.<StopFrictionDrag>();
			if(stopFDrag != null){
				fricTargetsArray.Push(stopFDrag);
			}
		}
		if(fricTargetsArray.length > 0){
			fricTargets = fricTargetsArray.ToBuiltin(StopFrictionDrag);
		}
	}

}