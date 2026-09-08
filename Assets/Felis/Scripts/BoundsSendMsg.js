#pragma strict

var bounds : Bounds;
var checkObj : GameObject;
var searchTag : String = "Player";
@Space(30)
var tgtObj : GameObject;


@Space(30)
var msg : String;
var sent : boolean;

function Start () {

}

function Update () {
	if(checkObj == null){
		checkObj = GameObject.FindWithTag(searchTag);
	}

	if(checkObj != null){
		if(bounds.Contains(checkObj.transform.position - transform.position)){
			if(!sent){
				if(tgtObj != null){
					sent = true;
					tgtObj.SendMessage(msg);
				}
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	//DebugUtility.DrawCircle(transform.position + searchCenter, searchRadius, Vector3.forward);
	Gizmos.DrawWireCube(transform.position + bounds.center, bounds.size);
	#endif
}