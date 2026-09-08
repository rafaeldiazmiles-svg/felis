#pragma strict

var lastPosAboveGround : Vector3; //Item or character will be re-dropped from this height;

var fallForeverBounds : Bounds[];

var mDelta : MaxRigidbodyDeltaPos;

var debug : boolean;

function Start () {
	lastPosAboveGround = transform.position;
	
	if( transform.parent != null){
		mDelta = transform.parent.GetComponentInChildren.<MaxRigidbodyDeltaPos>();
	}
	else{
		mDelta = GetComponentInChildren.<MaxRigidbodyDeltaPos>();	
	}
	
	
	
}

function Update () {
	var hit : RaycastHit;
	Physics.Raycast(transform.position, Vector3.down, hit, 10.0);
	if(hit != null && hit.point != Vector3.zero){
		lastPosAboveGround = hit.point;
	}
	
	for(var i = 0; i < fallForeverBounds.Length; i++){
		if(fallForeverBounds[i].Contains(transform.position)){
			Physics.Raycast(lastPosAboveGround + Vector3(0,1,0), Vector3.down, hit, 10.0);
			transform.parent.position = hit.point;
			if(mDelta != null){
				mDelta.previousPosition = hit.point;
			}
			break;
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
	
		Gizmos.color = Color.gray;
		for(var i = 0; i < fallForeverBounds.Length; i++){
			Gizmos.DrawWireCube(fallForeverBounds[i].center, fallForeverBounds[i].size);
		}
		
	}
	#endif
}