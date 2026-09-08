#pragma strict

var autoGetComponents : boolean = true;
var followCharacter : FollowCharacter;

var followAgainXOffset : float = 1.5;

var limitBounds : CameraYLimitBound[];

var debug : boolean;

class CameraYLimitBound{
	var centerOnTransform : boolean;
	var transformCenter : Transform;
	
	var bounds : Bounds;
	var maxY : float;
	var minY : float;
	var active : boolean;
	
	var useCameraValues : boolean;
	var cameraMaxY : float;
	var cameraMinY : float;

	var boundToKillZone : KillZone;
}

function Start () {
	if(autoGetComponents){
		followCharacter = GetComponent(FollowCharacter);
	}
}

function Update () {
	for(var i = 0; i < limitBounds.Length; i++){
		if(limitBounds[i].boundToKillZone != null && !limitBounds[i].boundToKillZone.enabled){
			continue;
		}

		if(followCharacter.character == null) continue;
		var center : Vector3 = limitBounds[i].bounds.center;
		var maxY : float = limitBounds[i].maxY;
		var minY : float = limitBounds[i].minY;
		var cameraMaxY : float = limitBounds[i].cameraMaxY;
		var cameraMinY : float = limitBounds[i].cameraMinY;		
		
		if(limitBounds[i].centerOnTransform && limitBounds[i].transformCenter != null){
			limitBounds[i].bounds.center += limitBounds[i].transformCenter.position;
			limitBounds[i].maxY		     += limitBounds[i].transformCenter.position.y;
			limitBounds[i].minY 		 += limitBounds[i].transformCenter.position.y;
			limitBounds[i].cameraMaxY    += limitBounds[i].transformCenter.position.y;
			limitBounds[i].cameraMinY    += limitBounds[i].transformCenter.position.y;
		}
		
		if(limitBounds[i].bounds.Contains(followCharacter.character.position)){
			limitBounds[i].active = true;
		}
		else{
			if(!followCharacter.lockX){
				limitBounds[i].active = false;
			}
		}
		
		if(limitBounds[i].active){
			if(followCharacter.character.position.y < limitBounds[i].minY){
				followCharacter.lockX = true;
				followCharacter.lockXPos = limitBounds[i].bounds.center.x;
				
				var useMinY : float;
				if(limitBounds[i].useCameraValues){
					useMinY = limitBounds[i].cameraMinY;
				}
				else{
					useMinY = limitBounds[i].minY;
				}
				
				if(followCharacter.heightTarget < useMinY){
					followCharacter.heightTarget = useMinY;
				}
			}
			
			if(followCharacter.character.position.x > limitBounds[i].bounds.center.x + limitBounds[i].bounds.extents.x + followAgainXOffset
			|| followCharacter.character.position.x < limitBounds[i].bounds.center.x - limitBounds[i].bounds.extents.x - followAgainXOffset){
				limitBounds[i].active = false;
				followCharacter.lockX = false;
			}
		}
		limitBounds[i].bounds.center = center;
		limitBounds[i].maxY = maxY;
		limitBounds[i].minY = minY;
		limitBounds[i].cameraMaxY = cameraMaxY;
		limitBounds[i].cameraMinY = cameraMinY;
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < limitBounds.Length; i ++){
			var center : Vector3 = limitBounds[i].bounds.center;
			var maxY : float = limitBounds[i].maxY;
			var minY : float = limitBounds[i].minY;
			var cameraMaxY : float = limitBounds[i].cameraMaxY;
			var cameraMinY : float = limitBounds[i].cameraMinY;			
		
			if(limitBounds[i].centerOnTransform && limitBounds[i].transformCenter != null){
				limitBounds[i].bounds.center += limitBounds[i].transformCenter.position;
				limitBounds[i].maxY		     += limitBounds[i].transformCenter.position.y;
				limitBounds[i].minY 		 += limitBounds[i].transformCenter.position.y;
				limitBounds[i].cameraMaxY    += limitBounds[i].transformCenter.position.y;
				limitBounds[i].cameraMinY    += limitBounds[i].transformCenter.position.y;
			}
			
			if(limitBounds[i].active){
				Gizmos.color = Color.magenta;
			}
			else{
				Gizmos.color = Color.cyan;
			}
			
			Gizmos.DrawWireCube(limitBounds[i].bounds.center, limitBounds[i].bounds.size);
			Gizmos.color = Color.red;
			Gizmos.DrawLine(Vector3(limitBounds[i].bounds.min.x, limitBounds[i].minY, limitBounds[i].bounds.center.z), 
			Vector3(limitBounds[i].bounds.max.x, limitBounds[i].minY, limitBounds[i].bounds.center.z));
			Gizmos.color = Color.green;
			Gizmos.DrawLine(Vector3(limitBounds[i].bounds.min.x, limitBounds[i].maxY, limitBounds[i].bounds.center.z), 
			Vector3(limitBounds[i].bounds.max.x, limitBounds[i].maxY, limitBounds[i].bounds.center.z));
			
			if(limitBounds[i].useCameraValues){
				Gizmos.color = Color(1,.1,.1);
				Gizmos.DrawLine(Vector3(limitBounds[i].bounds.min.x, limitBounds[i].cameraMinY, limitBounds[i].bounds.center.z), 
				Vector3(limitBounds[i].bounds.max.x, limitBounds[i].cameraMinY, limitBounds[i].bounds.center.z)); 
			}
			
			limitBounds[i].bounds.center = center;
			limitBounds[i].maxY = maxY;
			limitBounds[i].minY = minY;
			limitBounds[i].cameraMaxY = cameraMaxY;
			limitBounds[i].cameraMinY = cameraMinY;

		}
	}
	#endif
}