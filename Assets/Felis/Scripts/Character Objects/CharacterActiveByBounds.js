#pragma strict

var characterIsParent : boolean = true;
var characterObject : GameObject;
var characterRigidbody : Rigidbody;

var affectedScripts : MonoBehaviour[];

var bounds : Bounds;

var followCharacter : boolean = true;
var boundsFollowTransform : Transform;

var usePlayer : boolean = true;
var playerTag : String = "Player";
var checkTransform : Transform;
var containsTransform : ToggleBoolean;

var holdRB : boolean = true;
var holdRBPos : Vector3;
var holdRBRot : Quaternion;
var holdRBVelocity : Vector3;

var disableOnStart : boolean;

var forceUpdate : boolean = true;

var debug : boolean;

function Start () {
	var i : int;
	
	if(characterIsParent){
		characterObject = transform.parent.gameObject;
		characterRigidbody = characterObject.GetComponentInChildren(Rigidbody);
	}
	
	GetScripts();
	
	if(usePlayer){
		GetPlayer();
	}	
	
	if(followCharacter) boundsFollowTransform = characterObject.transform;
	if(boundsFollowTransform != null){
		bounds.center = boundsFollowTransform.position;	
		
		if(holdRB){
			holdRBPos = boundsFollowTransform.transform.position;
			holdRBRot = boundsFollowTransform.transform.rotation;	
			try{
			holdRBVelocity = characterRigidbody.velocity;
			}
			catch(err){
				if(transform.parent!= null) Debug.Log(transform.parent.name);
				else Debug.Log(transform.name);
			}	
		}
	}
	
	if(checkTransform != null && bounds.Contains(checkTransform.position)){
		for(i = 0; i < affectedScripts.Length; i ++){
			affectedScripts[i].enabled = true;	
		}
	}
	else{
		for(i = 0; i < affectedScripts.Length; i ++){
			if(disableOnStart) affectedScripts[i].enabled = false;
		}
	}
	
}

function GetScripts(){
	var allScriptsArray = new Array();
	allScriptsArray = characterObject.GetComponentsInChildren.<MonoBehaviour>() as MonoBehaviour[];
	for(var i = allScriptsArray.length - 1; i >= 0; i --){
		if(allScriptsArray[i] == this){
			allScriptsArray.RemoveAt(i);
			break;
		}
	}
	
	affectedScripts = allScriptsArray.ToBuiltin(MonoBehaviour) as MonoBehaviour[];	
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		checkTransform = playerObj.transform;
	}
}

function LateUpdate () {
	if(checkTransform == null && usePlayer){
		GetPlayer();
	}
	
	var i : int;

	if(boundsFollowTransform != null)
		bounds.center = boundsFollowTransform.position;		
			
	if(forceUpdate){
		forceUpdate = false;
		if(checkTransform != null && bounds.Contains(checkTransform.position)){
			for(i = 0; i < affectedScripts.Length; i ++){
				if(affectedScripts[i] == null) continue;
				affectedScripts[i].enabled = true;
			}
		}
		else{
			for(i = 0; i < affectedScripts.Length; i ++){
				if(affectedScripts[i] == null) continue;
				affectedScripts[i].enabled = false;
			}
		}
	}
	
	if(checkTransform != null){
		containsTransform.current = bounds.Contains(checkTransform.position);
	}
	containsTransform.Update();
	
	if(containsTransform.toggledTrue){
		for(i = 0; i < affectedScripts.Length; i ++){
			if(affectedScripts[i] == null) continue;
			affectedScripts[i].enabled = true;
		}
	}
	
	if(containsTransform.toggledFalse){
		for(i = 0; i < affectedScripts.Length; i ++){
			if(affectedScripts[i] == null) continue;
			affectedScripts[i].enabled = false;
		}
		
		if(holdRB){	
			holdRBPos = boundsFollowTransform.transform.position;
			holdRBRot = boundsFollowTransform.transform.rotation;	
			holdRBVelocity = characterRigidbody.velocity;
		}
	}
	
	if(holdRB && !containsTransform.current){
		characterObject.transform.position = holdRBPos;
		characterObject.transform.rotation = holdRBRot;
		characterRigidbody.velocity = holdRBVelocity;
	}
}

function OnDestroy(){
	for(var i = 0; i < affectedScripts.Length; i ++){
		if(affectedScripts[i] == null) continue;
		affectedScripts[i].enabled = true;
	}	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.gray;
		if(!followCharacter || characterObject == null){
			Gizmos.DrawWireCube(bounds.center, bounds.size);
		}
		else{
			Gizmos.DrawWireCube(characterObject.transform.position, bounds.size);
		}
	}
	#endif
}