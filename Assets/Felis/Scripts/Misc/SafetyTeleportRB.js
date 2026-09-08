#pragma strict

var bounds : Bounds;
var teleportY : float;
@Space(20)
var getTimer : Timer;
var rbs : Rigidbody[];
var useTags : String[];

function GetRBs(){
	if(useTags != null && useTags.Length > 0){
		var allRBs : Rigidbody[] = GameObject.FindObjectsOfType.<Rigidbody>();
		var allRBsArray : Array = new Array();
		for(var n = 0; n < useTags.Length; n++){
			for(var i = 0; i < allRBs.Length; i++){
				if(allRBs[i].gameObject.tag == useTags[n]){
					allRBsArray.Add(allRBs[i]);
				}
			}
		}
		rbs = allRBsArray.ToBuiltin(Rigidbody);
	}
	else{
		rbs = GameObject.FindObjectsOfType.<Rigidbody>();
	}

}

function Start () {

}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetRBs();
	}

	if(teleportY < bounds.max.y){
		teleportY = bounds.max.y;
	}

	for(var i = 0; i < rbs.Length; i++){
		if(rbs[i] == null){
			continue;
		}
		if(bounds.Contains(rbs[i].transform.position - transform.position)){
			var delta : MaxRigidbodyDeltaPos = rbs[i].gameObject.GetComponent.<MaxRigidbodyDeltaPos>();
			rbs[i].transform.position.y = teleportY + transform.position.y;
			if(delta != null){
				delta.previousPosition = rbs[i].transform.position;
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.gray;
	Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);
	Debug.DrawLine(Vector3(bounds.min.x, teleportY, bounds.center.z) + transform.position, Vector3(bounds.max.x, teleportY, bounds.center.z) + transform.position, Color.cyan);
	#endif
}