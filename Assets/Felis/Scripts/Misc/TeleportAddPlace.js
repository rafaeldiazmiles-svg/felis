#pragma strict

var teleportPosition : TeleportPosition;


function Start () {
}

function Update () {
}

function OnDrawGizmos(){
	#if UNITY_EDITOR
		teleportPosition.position = transform.position;
		Gizmos.color  = Color.blue;
		Gizmos.DrawSphere(teleportPosition.position,.2);
		Handles.Label(teleportPosition.position, teleportPosition.key.ToString());
	#endif
}