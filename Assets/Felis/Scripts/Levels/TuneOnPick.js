#pragma strict

var pickable : PickableRigidbody;
var radius : float;

var played : boolean;

var tune : PlayRandomSound;

@Space(30)
var createPrefab : GameObject;

function GetPickable(){
	var allPickable : PickableRigidbody[] = GameObject.FindObjectsOfType.<PickableRigidbody>();
	for(var i = 0; i < allPickable.Length; i++){
		var dist : float = Vector3.Distance(transform.position, allPickable[i].transform.position);
		if(dist < radius){
			pickable = allPickable[i];
			break;
		}
	}
}

function Start () {
	
}

function Update () {
	if(!played){
		if(pickable == null){
			GetPickable();
		}
		else{
			if(pickable.beingPicked.toggledTrue){
				tune.Play();
				played = true;

				if(createPrefab != null){
					var newPrefabInstance : GameObject = GameObject.Instantiate(createPrefab);
					newPrefabInstance.transform.position = pickable.transform.position;
				}
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, radius, Vector3.forward);
	#endif
}