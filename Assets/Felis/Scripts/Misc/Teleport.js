#pragma strict

var teleportPositions : TeleportPosition[];

var maxRBDelta : MaxRigidbodyDeltaPos;

var ride : Ride;

var debug : boolean;

class TeleportPosition{
	var position : Vector3;
	var key : KeyCode;
}

function Start () {
	maxRBDelta = GetComponentInChildren(MaxRigidbodyDeltaPos);

	ride = GetComponentInChildren.<Ride>();
}

function Update () {
	#if UNITY_EDITOR
	for(var i = 0; i < teleportPositions.Length; i++){
		if(Input.GetKeyDown(teleportPositions[i].key)){

			if(ride.ride.current && ride.rideMng != null){
				//ride.transform.position = teleportPositions[i].position;
				ride.rideMng.maxRBDelta.previousPosition = teleportPositions[i].position;

			}
			//else{
				transform.position = teleportPositions[i].position;
				maxRBDelta.previousPosition = transform.position;			
			//}

		}
	}
	#endif
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < teleportPositions.Length; i++){
			Gizmos.color  = Color.blue;
			Gizmos.DrawSphere(teleportPositions[i].position,.2);
			Handles.Label(teleportPositions[i].position, teleportPositions[i].key.ToString());
		}				
	}
	#endif
}