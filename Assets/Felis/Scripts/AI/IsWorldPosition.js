#pragma strict

var worldPosition : Vector3;
var debug : boolean = true;
var debugSphereRadius : float= 0.1;
var debugColor : Color = Color.white;

var setExternally : boolean;

var unparent : boolean = true;
var destroyWParent : boolean = true;
var parent : GameObject;

function Start () {

	
	if(!setExternally){
		worldPosition = transform.position;
	}
	else{
		setExternally = false;
	}
}

function LateUpdate () {
	if(unparent){
		parent = transform.parent.gameObject;
		unparent = false;
		transform.parent = null;	
	}
	transform.position = worldPosition;
	
	if(destroyWParent){
		if(parent == null){
			Destroy(gameObject);
		}
	}
}

function OnDrawGizmos(){
	if(debug){
		Gizmos.color = debugColor;
		Gizmos.DrawSphere(transform.position, debugSphereRadius);
	}
}

