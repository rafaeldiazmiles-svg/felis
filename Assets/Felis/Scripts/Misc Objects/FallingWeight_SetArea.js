#pragma strict

var range : float;

var bounds : Bounds;

var setVel : boolean;
var setVelocity : Vector3;

var bTGravs : BoundsTriggerGravity[];

var getTimer : Timer;

function GetScripts(){
	bTGravs = GameObject.FindObjectsOfType.<BoundsTriggerGravity>();
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetScripts();
	}

	if(bTGravs != null){
		for(var i = 0; i < bTGravs.Length; i++){
			if(bTGravs[i] == null){
				continue;
			}
			var dist : float = Vector3.Distance(transform.position, bTGravs[i].transform.position);
			if(dist < range){
				bTGravs[i].center = false;
				bTGravs[i].bounds.size = bounds.size;
				bTGravs[i].bounds.center = transform.position + bounds.center;

				if(setVel){
					bTGravs[i].setVelocity = setVelocity;
				}

				Destroy(gameObject);
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, range, Vector3.forward, Color.white);
	Gizmos.DrawWireCube(transform.position + bounds.center, bounds.size);
	#endif
}