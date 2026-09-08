#pragma strict

var masterTransform : Transform;
var usePlayer : boolean = true;
var playerTag : String = "Player";
var destroyObject : GameObject;
var bounds : Bounds;
var onBoundsEnter : boolean;
var useCenter : Transform;
@Space(30)
var debug : boolean;

function Start () {
	if(usePlayer){
		GetPlayer();
	}
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		masterTransform = playerObj.transform;
	}
}
function Update () {
	if(masterTransform == null && usePlayer){
		GetPlayer();
	}

	var centerSub : Vector3;
	if(useCenter != null){
		centerSub = useCenter.position;
	}
	if(masterTransform != null){
		if(!onBoundsEnter && !bounds.Contains(masterTransform.position - centerSub)){
			Destroy(destroyObject);
			Destroy(this);
		}
		if(onBoundsEnter && bounds.Contains(masterTransform.position - centerSub)){
			Destroy(destroyObject);
			Destroy(this);			
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.green;

		var centerAdd : Vector3;
		if(useCenter != null){
			centerAdd = useCenter.position;
		}
		Gizmos.DrawWireCube(bounds.center + centerAdd, bounds.size);
	}
	#endif
}