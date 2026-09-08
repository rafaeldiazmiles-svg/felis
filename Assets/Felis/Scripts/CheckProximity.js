#pragma strict

var resetLocalPosition : boolean = true;
var checkObjects : Transform[];
var range : float;

var inRange : ToggleBoolean;

function Start () {
	if(resetLocalPosition) transform.localPosition = Vector3.zero;
}

function Update () {
	inRange.current = false;
	for(var i = 0; i < checkObjects.Length; i++){
		if(checkObjects[i] == null) continue;
		if(Vector3.Distance(checkObjects[i].position, transform.position) < range){
			inRange.current = true;
		}
	}
	inRange.Update();
}