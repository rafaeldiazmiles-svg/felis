#pragma strict

var useParent : boolean = true;
var characterCollider : Collider;
var pickRB : PickUpRigidbody;

//Si variables.
var keepHorizontal : boolean;
var rayOrigin : Vector3;
var varyRayOriginHeight : boolean;
var varyRayOriginHeightRange : Vector2;
var varyRayOriginHeightSpeed : float;

var rayDistance : float = 1.0;
var sideDetectionRange : float = .4;

var horizontalBias : float = .5;

var leftDistance : float;
var rightDistance : float;


//Cliff variables.
var cliffEdgeRayOrigin : Vector3;
var cliffEdgeHorizontalOffset : float = 1.0;
var cliffEdgeRayDistance : float = 1.5;

var cliffEdgeDetectionRange : float = .5;
var dropMinDistance : float = 1.5;

var leftGroundHeight : float;
var rightGroundHeight : float;

//Feet block.
var feetBlockRayOrigin : Vector3;
var leftFeetBlockDistance : float;
var rightFeetBlockDistance : float;

//var excludeColliders : Collider[];

var detectRigidbody : boolean;
var detectRigidbodyRange : float = .6;
var leftRigidbody : boolean;
var rightRigidbody : boolean;

var hitsLeft : RaycastHit[];
var hitsRight : RaycastHit[];

var ignoreColliders : Collider[];
var ignoreCollidersEnabled : boolean[];

var debug : boolean;
//var guiStyle : GUIStyle;

static var ignoredLayer : int = 17;

function IgnoreOwn(){
	ignoreColliders = transform.parent.GetComponentsInChildren.<Collider>();

	/*var ignoreCollidersArray : Array = new Array();
	var hierarchyColliders : Collider[] = transform.parent.GetComponentsInChildren.<Collider>();
	for(var i = 0; i < hierarchyColliders.Length; i++){
		ignoreCollidersArray.Add(hierarchyColliders[i]);
	}
	if(pickRB != null){
		var pickedObjectColliders : Collider[] = pickRB.character.GetComponentsInChildren.<Collider>();
		for(i = 0; i < pickedObjectColliders.Length; i++){
			ignoreCollidersArray.Add(pickedObjectColliders[i]);
		}
	}
	ignoreColliders = ignoreCollidersArray.ToBuiltin(Collider);*/
}

function Start () {
	if(useParent){
		characterCollider = transform.parent.GetComponent(Collider);
	}

	pickRB = transform.parent.GetComponentInChildren.<PickUpRigidbody>();

	//guiStyle = new GUIStyle();
	
	if(transform.parent != null){
		characterCollider = transform.parent.GetComponent.<Collider>();
	}
	else{
		characterCollider = GetComponent.<Collider>();
	}

	if(sideDetectionRange >= 0.38 && sideDetectionRange <= 0.42) sideDetectionRange = 0.32;
}

function LateUpdate () {
	//Disable ignored colliders;
	if(ignoreCollidersEnabled != null && ignoreCollidersEnabled.Length != ignoreColliders.Length){
		ignoreCollidersEnabled = new boolean[ignoreColliders.Length];
	}
	if(ignoreCollidersEnabled != null){
		for(var n = 0; n < ignoreColliders.Length; n++){
			if(ignoreColliders[n] == null) continue;
			ignoreCollidersEnabled[n] = ignoreColliders[n].enabled;
		}
		for(var i = 0; i < ignoreColliders.Length; i++){
			if(ignoreColliders[i] == null) continue;
			ignoreColliders[i].enabled = false;
		}
	}
	//
	
	leftRigidbody = false;
	rightRigidbody = false;
	
	//for(var i = 0; i < excludeColliders.Length; i++) excludeColliders[i].enabled = false;
	
	var colliderState : boolean;
	
	if(characterCollider == null){
		if(transform.parent != null){
			characterCollider = transform.parent.GetComponentInChildren.<Collider>();
		}
	}
	if(characterCollider == null){
		//Debug.Log(transform.name + "'s side detection script has no collider");
		return;
	}
	
	colliderState = characterCollider.enabled;
	//characterCollider.enabled = false;

	//Var Ray Origin.
	if(varyRayOriginHeight){
		rayOrigin.y = varyRayOriginHeightRange.x + ((Mathf.Sin(Time.time * varyRayOriginHeightSpeed)+1)*.5) * (varyRayOriginHeightRange.y - varyRayOriginHeightRange.x);
	}
	
	var rayLeft : Ray;
	var rayRight : Ray;
	
	//Side detection.
	if(keepHorizontal){
		rayLeft = new Ray(transform.position + rayOrigin, Vector3.right);
		rayRight = new Ray(transform.position + rayOrigin, Vector3.left);
	}
	else{
		rayLeft = new Ray(transform.TransformPoint(rayOrigin), transform.TransformDirection(1,0,0)); 
		rayRight = new Ray(transform.TransformPoint(rayOrigin), transform.TransformDirection(-1,0,0));		
	}
	
	horizontalBias = Mathf.Clamp01(horizontalBias);
	rayLeft.direction.y *= 1-horizontalBias; 
	rayRight.direction.y *= 1-horizontalBias; 
	
	if(debug){
		Debug.DrawRay(rayLeft.origin, rayLeft.direction * rayDistance, Color.blue);
		Debug.DrawRay(rayRight.origin, rayRight.direction * rayDistance, Color.blue);
	}
	

		
	hitsLeft = Physics.RaycastAll(rayLeft, rayDistance);
	hitsRight = Physics.RaycastAll(rayRight, rayDistance);
	
	leftDistance = Mathf.Infinity;
	rightDistance = Mathf.Infinity;

	for(var leftHit : RaycastHit  in hitsLeft){
		if(leftHit.distance < leftDistance && leftHit.transform.gameObject.layer != ignoredLayer){
			leftDistance = leftHit.distance;
		}
	}
	for(var rightHit : RaycastHit  in hitsRight){
		if(rightHit.distance < rightDistance && rightHit.transform.gameObject.layer != ignoredLayer ){
			rightDistance = rightHit.distance;
		}
	}
	if(detectRigidbody){
		for(var leftHit : RaycastHit  in hitsLeft){
			if(leftHit.rigidbody != null && leftHit.distance < detectRigidbodyRange){
				leftRigidbody = true;
			}
		}
		for(var rightHit : RaycastHit  in hitsRight){
			if(rightHit.rigidbody != null && rightHit.distance < detectRigidbodyRange){
				rightRigidbody = true; 
			}
		}
	} 
	
	//Cliff detection.
	rayLeft =  new Ray(transform.TransformPoint(cliffEdgeRayOrigin) + Vector3.right*cliffEdgeHorizontalOffset, -Vector3.up); 
	rayRight = new Ray(transform.TransformPoint(cliffEdgeRayOrigin) - Vector3.right*cliffEdgeHorizontalOffset, -Vector3.up);
	
	if(debug){
		Debug.DrawRay(transform.TransformPoint(cliffEdgeRayOrigin) + Vector3.right*cliffEdgeHorizontalOffset, -Vector3.up * cliffEdgeRayDistance, Color.yellow);
		Debug.DrawRay(transform.TransformPoint(cliffEdgeRayOrigin) - Vector3.right*cliffEdgeHorizontalOffset, -Vector3.up * cliffEdgeRayDistance, Color.yellow);		
	}
	
	hitsLeft = Physics.RaycastAll(rayLeft, 10.0);
	hitsRight = Physics.RaycastAll(rayRight, 10.0);
	
	leftGroundHeight = Mathf.Infinity;
	rightGroundHeight = Mathf.Infinity;	
	
	for(var leftHit : RaycastHit  in hitsLeft){
		if(leftHit.distance < leftGroundHeight && leftHit.transform.gameObject.layer != ignoredLayer){	
			leftGroundHeight = leftHit.distance;
		}
	}
	for(var rightHit : RaycastHit  in hitsRight){	
		if(rightHit.distance < rightGroundHeight && rightHit.transform.gameObject.layer != ignoredLayer){
			rightGroundHeight = rightHit.distance;
		}
	}
	//Feet block detection.
	if(keepHorizontal){
		rayLeft = new Ray(transform.position + feetBlockRayOrigin, Vector3.right);
		rayRight = new Ray(transform.position + feetBlockRayOrigin, Vector3.left);		
	}
	else{
		rayLeft = new Ray(transform.TransformPoint(feetBlockRayOrigin), transform.TransformDirection(1,0,0)); 
		rayRight = new Ray(transform.TransformPoint(feetBlockRayOrigin), transform.TransformDirection(-1,0,0));
	}
	
	horizontalBias = Mathf.Clamp01(horizontalBias);
	rayLeft.direction.y *= 1-horizontalBias; 
	rayRight.direction.y *= 1-horizontalBias; 
	
	if(debug){
		Debug.DrawRay(rayLeft.origin, rayLeft.direction * rayDistance, Color.cyan);
		Debug.DrawRay(rayRight.origin, rayRight.direction * rayDistance, Color.cyan);
	}
	
	hitsLeft = Physics.RaycastAll(rayLeft, rayDistance);
	hitsRight = Physics.RaycastAll(rayRight, rayDistance);
	
	leftFeetBlockDistance = Mathf.Infinity;
	rightFeetBlockDistance = Mathf.Infinity;
	
	for(var leftHit : RaycastHit  in hitsLeft){
		if(leftHit.distance < leftFeetBlockDistance && leftHit.transform.gameObject.layer != ignoredLayer){
			leftFeetBlockDistance = leftHit.distance;
		}
	}
	for(var rightHit : RaycastHit  in hitsRight){
		if(rightHit.distance < rightFeetBlockDistance && rightHit.transform.gameObject.layer != ignoredLayer){
			 rightFeetBlockDistance = rightHit.distance;
		 }
	}	
	if(detectRigidbody){
		for(var leftHit : RaycastHit  in hitsLeft){
			if(leftHit.rigidbody != null && leftHit.distance < detectRigidbodyRange && leftHit.transform.gameObject.layer != ignoredLayer){
				leftRigidbody = true;
			}
		}
		for(var rightHit : RaycastHit  in hitsRight){
			if(rightHit.rigidbody != null && rightHit.distance < detectRigidbodyRange && rightHit.transform.gameObject.layer != ignoredLayer){
				rightRigidbody = true;
			}
		}
	} 	
	
	characterCollider.enabled = colliderState;
	
	//for(i = 0; i < excludeColliders.Length; i++) excludeColliders[i].enabled = true;
	
	
	//Enable ignored colliders back.
	if(ignoreColliders != null){
		for(i = 0; i < ignoreColliders.Length; i++){
			if(ignoreColliders[i] == null) continue;
			ignoreColliders[i].enabled = ignoreCollidersEnabled[i];
		}	
	}
}


function OnDrawGizmosSelected(){ 
	if(debug){
		
		//Gizmos.DrawCube(Vector3.zero, Vector3.one);
		if(Application.isPlaying){
			try{
			#if UNITY_EDITOR
			//var guiStyle : GUIStyle = new GUIStyle();
			//guiStyle.normal.textColor = Color.blue;
			
			Handles.Label(transform.TransformPoint(rayOrigin) + Vector3.right * rayDistance, leftDistance.ToString().Substring(0,3));
			Handles.Label(transform.TransformPoint(rayOrigin) - Vector3.right* rayDistance, rightDistance.ToString().Substring(0,3));
			
			//guiStyle.normal.textColor = Color.yellow;
			Handles.Label(transform.TransformPoint(cliffEdgeRayOrigin) + Vector3.right*cliffEdgeHorizontalOffset 
			- Vector3.up * cliffEdgeRayDistance, leftGroundHeight.ToString().Substring(0,3));
			
			Handles.Label(transform.TransformPoint(cliffEdgeRayOrigin) - Vector3.right*cliffEdgeHorizontalOffset 
			- Vector3.up * cliffEdgeRayDistance, rightGroundHeight.ToString().Substring(0,3));
			
			//guiStyle.normal.textColor = Color.cyan;
			Handles.Label(transform.TransformPoint(feetBlockRayOrigin) + Vector3.right * rayDistance, leftFeetBlockDistance.ToString().Substring(0,3));
			Handles.Label(transform.TransformPoint(feetBlockRayOrigin) - Vector3.right* rayDistance, rightFeetBlockDistance.ToString().Substring(0,3));
					
			#endif
			}
			catch(err){}
		}
		
	}
}

function OnGUI(){
	/*if(debug){
		guiStyle.normal.textColor = Color.yellow;
		
		if(hitsLeft != null){
			for(var i = 0; i < hitsLeft.Length; i++){
				GUILayout.Label("Left: " + hitsLeft[i].transform.name, guiStyle);
			}
		}
		if(hitsRight != null) {
			for(i = 0; i < hitsRight.Length; i++){
				GUILayout.Label("Right: " + hitsRight[i].transform.name, guiStyle);
			}
		}
	}*/
}


//Sides functions.
function GetLeftDistance() : float{
	return leftDistance;
}
function GetRightDistance() : float{
	return rightDistance;
}

function IsLeftSideBlocked() : boolean{
	var isBlocked : boolean = false;
	if(leftDistance < sideDetectionRange) isBlocked = true;
	return isBlocked;
}

function IsRightSideBlocked() : boolean{
	var isBlocked : boolean = false;
	if(rightDistance < sideDetectionRange) isBlocked = true;
	return isBlocked;
}

//Cliff functions.
function GetLeftGroundHeight() : float{
	return leftGroundHeight;
}
function GetRightGroundHeight() : float{
	return rightGroundHeight;
}

function HasLeftEdge() : boolean{
	var leftCliff : boolean = false;
	if(leftGroundHeight < cliffEdgeDetectionRange) leftCliff = true;
	return leftCliff;
}

function HasRightEdge() : boolean{
	var rightCliff : boolean = false;
	if(rightGroundHeight < cliffEdgeDetectionRange) rightCliff = true;
	return rightCliff;
}

function HasLeftDrop() : boolean{
	var leftDrop : boolean = false;
	if(leftGroundHeight > dropMinDistance) leftDrop = true;
	return leftDrop;
}

function HasRightDrop() : boolean{
	var rightDrop : boolean = false;
	if(rightGroundHeight > dropMinDistance) rightDrop = true;
	return rightDrop;
}

//Feet block.

function AreLeftFeetBlocked() : boolean{
	var areBlocked : boolean = false;
	if(leftFeetBlockDistance < sideDetectionRange) areBlocked = true;
	return areBlocked;
}

function AreRightFeetBlocked() : boolean{
	var areBlocked : boolean = false;
	if(rightFeetBlockDistance < sideDetectionRange) areBlocked = true;
	return areBlocked;
}

