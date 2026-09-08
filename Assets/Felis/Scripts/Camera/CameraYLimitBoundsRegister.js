#pragma strict


var limitBounds: CameraYLimitBound;

var debug : boolean;

function Start () {
	var camLimits : CameraYLimitBounds = GameObject.FindObjectOfType.<CameraYLimitBounds>();
	var limitBoundsArray : Array = new Array();
	for(var i = 0; i < camLimits.limitBounds.Length; i++){
		limitBoundsArray.Push(camLimits.limitBounds[i]);
	}
	/*if(limitBounds.centerOnTransform){
		limitBounds.transformCenter = transform;
	}*/
	
	limitBoundsArray.Push(limitBounds);
	camLimits.limitBounds = limitBoundsArray.ToBuiltin(CameraYLimitBound) as CameraYLimitBound[];
}


function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		var center : Vector3 = limitBounds.bounds.center;
		var maxY : float = limitBounds.maxY;
		var minY : float = limitBounds.minY;
		var cameraMaxY : float = limitBounds.cameraMaxY;
		var cameraMinY : float = limitBounds.cameraMinY;
		if(limitBounds.centerOnTransform){
			limitBounds.bounds.center += limitBounds.transformCenter.position;
			limitBounds.maxY += limitBounds.transformCenter.position.y;
			limitBounds.minY += limitBounds.transformCenter.position.y;
			limitBounds.cameraMaxY += limitBounds.transformCenter.position.y;
			limitBounds.cameraMinY += limitBounds.transformCenter.position.y;
			
		}
	
		if(limitBounds.active){
			Gizmos.color = Color.magenta;
		}
		else{
			Gizmos.color = Color.cyan;
		}
		
		Gizmos.DrawWireCube(limitBounds.bounds.center, limitBounds.bounds.size);
		Gizmos.color = Color.red;
		Gizmos.DrawLine(Vector3(limitBounds.bounds.min.x, limitBounds.minY, limitBounds.bounds.center.z), 
		Vector3(limitBounds.bounds.max.x, limitBounds.minY, limitBounds.bounds.center.z));
		Gizmos.color = Color.green;
		Gizmos.DrawLine(Vector3(limitBounds.bounds.min.x, limitBounds.maxY, limitBounds.bounds.center.z), 
		Vector3(limitBounds.bounds.max.x, limitBounds.maxY, limitBounds.bounds.center.z));
		
		if(limitBounds.useCameraValues){
			Gizmos.color = Color(1,.1,.1);
			Gizmos.DrawLine(Vector3(limitBounds.bounds.min.x, limitBounds.cameraMinY, limitBounds.bounds.center.z), 
			Vector3(limitBounds.bounds.max.x, limitBounds.cameraMinY, limitBounds.bounds.center.z)); 
		}
		limitBounds.bounds.center = center;
		limitBounds.maxY = maxY;
		limitBounds.minY = minY;
		limitBounds.cameraMaxY = cameraMaxY;
		limitBounds.cameraMinY = cameraMinY;
	}
	#endif
}