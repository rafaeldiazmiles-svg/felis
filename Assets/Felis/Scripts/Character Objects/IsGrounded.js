var useSingleRay : boolean;
var rays : int;

var isGrounded : boolean;
var isFullyGrounded : boolean; //All rays touch ground;

var groundedCount : int;//For mostlyGrounded variable
var notGroundedCount : int; 
var mostlyGrounded : boolean; //Most rays touch ground;
var wasGrounded : boolean;
var touchedGround : boolean;

var useParent : boolean = true;
var characterCollider : Collider;
var otherCols : Collider[];

var rayOriginOffset : float;
var useWorldDirection : boolean;
var secondaryRaysOffset : float = .1;
var minFloorDistance : float = .1;
var minFloorDistanceScale : boolean;
var minFloorDistanceScale_Mul : float = 1.0;


var horizontalBias : float;



var floorNormal : Vector3;
var deltaAngle : float;
var slopeAngle : float;

var groundDistance : float [];
var avgGroundDistance : float;

var currentGroundCollider : Collider [];
var previousGroundCollider : Collider [];
var currentGroundPoint : Vector3 [];

var closestToGroundHit : RaycastHit[]; 

var currentRay : int;
var slopeAverage : float[];// = new float[3];
var normalAverage : Vector3[];// = new Vector3[3];
          
var debug : boolean;

var forceGroundUntil : float;
var forceNotGroundedUntil : float;

var ignoreLayers : int[];

var onlyGroundCollider : boolean;
var groundLayer : int = 9;

var groundDeltaPosAvg : Vector3;

var groundColliders : Array;

var additionalRays : Vector3[];

var rnd : int;

var skip : int = 2;

 

class GroundCol{
	var collider : Collider;
	var deltaPos : Vector3;
	var previousPos : Vector3;
}



function Start () {
	rnd = Mathf.RoundToInt(Random.value * 2);
	
	if(useParent && transform.parent != null){
		characterCollider = transform.parent.GetComponent(Collider);
	}
	else{
		characterCollider = GetComponent.<Collider>();
	}
	
	
	rays = 1;
	if(!useSingleRay) rays += 2;
	rays += additionalRays.Length;
	
	groundDistance = new float[rays];
	slopeAverage = new float[rays];
	normalAverage = new Vector3[rays];
	currentGroundCollider = new Collider[rays];
	previousGroundCollider = new Collider[rays];
	currentGroundPoint = new Vector3[rays];
	
	closestToGroundHit = new RaycastHit[rays];
	
	groundColliders = new Array();

	/*if(transform.parent != null){
		pickUp = transform.parent.GetComponentInChildren.<PickUpRigidbody>();
	}*/
}

function Update () {
	//if(Time.frameCount % 2 == rnd) return;

	if(Time.frameCount % skip != 0){
		return;
	}

	//Touched ground this frame.
	if(isGrounded && !wasGrounded){
		touchedGround = true;
	}
	else{
		touchedGround = false;
	}
	wasGrounded = isGrounded;
	
	//Reset info.
	isGrounded = false;
	isFullyGrounded = true; //Only a single ray not touching ground sets it false.
	groundedCount = 0;
	notGroundedCount = 0;

																							
	currentRay = 0;
	
	//Cast rays.
	var rayDirection : Vector3;
	if(useWorldDirection){
		rayDirection = Vector3.down;
		
		CastRays(transform.position + Vector3(0,rayOriginOffset,0), rayDirection);
		if(!useSingleRay){
			CastRays(transform.position + Vector3(0,rayOriginOffset,0) + Vector3(secondaryRaysOffset,0,0), rayDirection);
			CastRays(transform.position + Vector3(0,rayOriginOffset,0) + Vector3(-secondaryRaysOffset,0,0), rayDirection);
		}
		
		for(var m = 0; m < additionalRays.Length; m++){
			CastRays(transform.position + additionalRays[m], rayDirection);
		}
	}
	else{
		rayDirection = Vector3.Lerp(transform.TransformDirection(0,-1,0), Vector3.down, horizontalBias);

		CastRays(transform.position + transform.TransformDirection(0,rayOriginOffset,0), rayDirection);
		if(!useSingleRay){
			CastRays(transform.position + transform.TransformDirection(secondaryRaysOffset,rayOriginOffset,0), rayDirection);
			CastRays(transform.position + transform.TransformDirection(-secondaryRaysOffset,rayOriginOffset,0), rayDirection);
		}

		for(m = 0; m < additionalRays.Length; m++){
			CastRays(transform.position + transform.TransformDirection(additionalRays[m]), rayDirection);
		}
	}

	if(groundedCount > notGroundedCount){
		mostlyGrounded = true;
	}
	else{
		mostlyGrounded = false;
	}
	
	//Process ray information.
	//normal
	floorNormal = normalAverage[0];
	slopeAngle = slopeAverage[0];
	avgGroundDistance = groundDistance[0];

	if(!useSingleRay){
		floorNormal +=  normalAverage[1] +  normalAverage[2];
		slopeAngle += slopeAverage[1] + slopeAverage[2];
		avgGroundDistance += groundDistance[1] + groundDistance[2];
	}

	for(m = 0; m < additionalRays.Length; m++){
		floorNormal += normalAverage[3+m];
	}
	floorNormal /= rays;

	for(m = 0; m < additionalRays.Length; m++){
		slopeAngle += slopeAverage[3+m];
	}
	slopeAngle /= rays;

	for(m = 0; m < additionalRays.Length; m++){
		avgGroundDistance += groundDistance[3+m];
	}	
	avgGroundDistance /= rays;

	if(debug)DebugUtility.DrawArrow(transform.position, floorNormal * 3.0, Color.green);
	
	deltaAngle = Mathf.DeltaAngle( slopeAngle, Mathf.Atan2(transform.up.x, transform.up.y) * Mathf.Rad2Deg);	
	
	//avg ground dist

	if(Time.time < forceGroundUntil){
	    isGrounded = true;
	    isFullyGrounded = true;
	}
	if(Time.time < forceNotGroundedUntil){
	    isGrounded = false;
	    isFullyGrounded = false;
	}
	//Update ground colliders.
	var  thisGroundCol : GroundCol;
	for(var i = 0; i < groundColliders.length; i++){
		thisGroundCol = groundColliders[i];
		if(thisGroundCol.collider == null) continue;
		thisGroundCol.deltaPos = (thisGroundCol.collider.transform.position - thisGroundCol.previousPos) / Time.deltaTime;
		thisGroundCol.previousPos = thisGroundCol.collider.transform.position;
	}	
	
	for(i = groundColliders.length - 1; i >= 0 ; i--){
		thisGroundCol = groundColliders[i];
		if(thisGroundCol == null){
			continue;
		}
		var beingUsed : boolean = false;
		for(var n = 0; n < currentGroundCollider.Length; n++){
			if(currentGroundCollider[n] != null){
				if(thisGroundCol.collider == currentGroundCollider[n]){
					beingUsed = true;
					break;
				}
			}
			if(previousGroundCollider[n] != null){
				if(thisGroundCol.collider == previousGroundCollider[n]){
					beingUsed = true;
					break;
				}
			} 
		}
		if(!beingUsed){
			groundColliders.RemoveAt(i);
			//thisGroundCol.removeMe = true;
		}
	}
	
	//RemoveUnusedGroundCol();
	
	//Get deltapos.
	groundDeltaPosAvg = Vector3.zero;
	for(i = 0 ; i < groundColliders.length; i ++){
		thisGroundCol = groundColliders[i];
		groundDeltaPosAvg += thisGroundCol.deltaPos;
	}
	if(groundColliders.length != 0){
		groundDeltaPosAvg /= groundColliders.length;
	}
	else{
		groundDeltaPosAvg = Vector3.zero;
	}
	
	DebugUtility.DrawArrow(transform.position, groundDeltaPosAvg);

	/*if(pickUp != null && pickUp.pickedObject != null){
		if(pickUp.pickedObject.isGrounded.isGrounded){
			isGrounded = true;
		}
	}*/
}

/*function RemoveUnusedGroundCol(){
	for(var i = 0; i < groundColliders.length; i++){
		var thisGC : GroundCol = groundColliders[i];
		if(thisGC.removeMe){
			groundColliders.RemoveAt(i);
			RemoveUnusedGroundCol();
			break;
		}
	}
}*/

function CastRays(origin : Vector3, direction : Vector3){
	groundDistance[currentRay] = Mathf.Infinity;
	var hits : RaycastHit[];
	hits = Physics.RaycastAll(origin, direction, 10.0);
	
	previousGroundCollider[currentRay] = currentGroundCollider[currentRay];
	for(var i = 0; i < hits.Length; i++){
		var hit : RaycastHit = hits[i];
		var cont : boolean;		
		if(hit.collider == characterCollider){
			cont = true;
		}
		for(var p = 0; p < otherCols.Length; p++){
			if(hit.collider == otherCols[p]){
				cont = true;
			}
		}
	
		for(var n = 0; n < ignoreLayers.Length; n++){
			if(hit.transform.gameObject.layer == ignoreLayers[n]) cont = true;
		}

		if(onlyGroundCollider){
			if(hit.transform.gameObject.layer != groundLayer){
				cont = true;
			}
		}
		
		if(cont) continue;

		if(hit != null){
			if(hit.distance -  rayOriginOffset < groundDistance[currentRay]){
				groundDistance[currentRay] = hit.distance - rayOriginOffset;
				
				closestToGroundHit[currentRay] = hit;

				currentGroundPoint [currentRay] = hit.point;
			}
		}

	}
	
	var useMinFloorDist : float = minFloorDistance;
	
	if(minFloorDistanceScale){
		if(transform.parent != null){
			useMinFloorDist *= transform.parent.localScale.magnitude * minFloorDistanceScale_Mul;
		}
	}
	
	if(groundDistance[currentRay] < useMinFloorDist){
	    isGrounded = true;
	    groundedCount ++;

	    currentGroundCollider[currentRay] = hit.collider;
	}
	else{
		currentGroundCollider[currentRay] = null;
	}

	if(groundDistance[currentRay] > useMinFloorDist){
	    isFullyGrounded = false;
	    notGroundedCount ++;
	}

	normalAverage[currentRay] = closestToGroundHit[currentRay] .normal;
	slopeAverage[currentRay] = Mathf.Atan2(normalAverage[currentRay].x, normalAverage[currentRay].y ) * Mathf.Rad2Deg;
	
	var debugColor : Color = Color.cyan;
	if(groundDistance[currentRay] < useMinFloorDist) debugColor = Color.red;

	if(debug)Debug.DrawRay(origin, direction, debugColor);
	
	var storingCol : boolean;
	for(i = 0; i < groundColliders.length; i++){
		var thisGC : GroundCol = groundColliders[i];
		if(thisGC.collider == currentGroundCollider[currentRay]){
			storingCol = true;
			break;
		}
	}
			
	if(!storingCol){
		if(currentGroundCollider[currentRay] != null){
			var newGroundCol : GroundCol = new GroundCol();
			newGroundCol.collider = currentGroundCollider[currentRay];
			newGroundCol.previousPos = currentGroundCollider[currentRay].transform.position;
			newGroundCol.deltaPos = Vector3.zero;
			groundColliders.Push(newGroundCol);
		}
	}
	
	currentRay++;
}

function IsGrounded() : boolean{
	return isGrounded;
}

function GetGroundDistance() : float{
	return avgGroundDistance;
}

function GetDeltaAngleRadians() : float{
	return deltaAngle * Mathf.Deg2Rad;
}
