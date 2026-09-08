#pragma strict

var bounds : Bounds;
var boundsMultiple : Bounds[];
var followThis : boolean;
var boundsFollowTransform : Transform;

var addTransformCenter : Transform;

var usePlayer : boolean = true;
var playerTag : String = "Player";
var checkTransform : Transform;

var useTheseScripts : boolean;
var affectedScripts : MonoBehaviour[]; 

var containsTransform : ToggleBoolean;


var checkedFirstFrame : boolean;

var activateAndDestroy : boolean;

var debug : boolean;

function Start () {
	if(usePlayer){
		GetPlayer();
	}
	
	if(followThis){
		boundsFollowTransform = transform;
	}
	
	if(useTheseScripts){
		affectedScripts = gameObject.GetComponentsInChildren.<MonoBehaviour>();
	}
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null){
		checkTransform = playerObj.transform;
	}
}

function Update () {
	if(usePlayer && checkTransform == null){
		GetPlayer();
	}
	else{
		var subTransformPos : Vector3;
		if(addTransformCenter != null){
			subTransformPos = addTransformCenter.position;
		}

		if(boundsFollowTransform != null){
			if(bounds != null) bounds.center = boundsFollowTransform.position;
			
			for(var i = 0; i < boundsMultiple.Length; i++){
				boundsMultiple[i].center = boundsFollowTransform.position;
			}
		}
		
		containsTransform.current = false;
		if(bounds != null && bounds.Contains(checkTransform.position - subTransformPos)) containsTransform.current = true;
		if(boundsMultiple != null){
			for(i = 0; i < boundsMultiple.Length; i++){
				if(boundsMultiple[i].Contains(checkTransform.position - subTransformPos)){
					containsTransform.current = true;
					break;
				}
			}
		}
		
		containsTransform.Update();
		
		if(containsTransform.toggledTrue){
			for(i = 0; i < affectedScripts.Length; i ++){
				if(affectedScripts[i] == this) continue;
				if(affectedScripts[i] != null){
					affectedScripts[i].enabled = true;
				}	
			}

			if(activateAndDestroy){
				Destroy(this);
			}
		}
		
		if(containsTransform.toggledFalse){
			for(i = 0; i < affectedScripts.Length; i ++){
				if(affectedScripts[i] == this) continue;
				if(affectedScripts[i] != null){
					affectedScripts[i].enabled = false;
				}
			}
		}
		
		if(!checkedFirstFrame){
			checkedFirstFrame = true;
			var contains : boolean = false;
			if(bounds != null && bounds.Contains(checkTransform.position)) contains = true;
			for(i = 0; i < boundsMultiple.Length; i++){
				if(boundsMultiple[i].Contains(checkTransform.position)){
					contains = true;
					break;
				}
			}
			
			if(!contains){
				for(i = 0; i < affectedScripts.Length; i ++){
					if(affectedScripts[i] == this) continue;
					if(affectedScripts[i] != null){
						affectedScripts[i].enabled = false;
					}
				}
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		var addTransformPos : Vector3;
		if(addTransformCenter != null){
			addTransformPos = addTransformCenter.position;
		}	

		Gizmos.color = Color.gray;
		Gizmos.DrawWireCube(bounds.center + addTransformPos, bounds.size);
		for(var i = 0; i < boundsMultiple.Length; i++){
			Gizmos.DrawWireCube(boundsMultiple[i].center + addTransformPos, boundsMultiple[i].size);
		}
	}
	#endif
}