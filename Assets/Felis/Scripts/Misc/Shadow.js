var distanceTolerance : float = 0.4;
var maxOpacity : float = 1.0;

var multiplier : float = 1.2;

var opacity : float = 1.0;
var useParentAsCastingPoint : boolean = true;
var castingPoint : Transform;
var castingPointRend : Renderer;
var buffer : float = 0.01;

var offsetRay : Vector3 = Vector3(0,.5,0);
var shadowHit : Transform;

var currentShadowYPosition : float;

var ignoreColliders : Collider[];

var useColliderList : boolean;
var shadowTag : String = "Ground Collider";
var colliderList : Collider[];
var getTimer : Timer;

var shadowAngle : float;

var skip : boolean;

var scale : Vector3 = Vector3.one;

var useGroundAngle : float = .5;

var linkUnderWater : UnderWater;

var rend : Renderer;

function Start(){
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}
	
	linkUnderWater = transform.parent.GetComponentInChildren.<UnderWater>();
	
	rend = GetComponent.<Renderer>();
	
	rend.enabled = true;
	//castingPoint = transform.Find("Casting Point");
	//castingPoint.parent = transform.parent;
	if(useParentAsCastingPoint) castingPoint = transform.parent;
	
	if(castingPoint != null && castingPointRend == null){
		castingPointRend = castingPoint.GetComponentInChildren.<Renderer>();
	}
	
	gameObject.name += " - " + transform.parent.name;
	transform.parent = null;
	
	if(useColliderList){
		GetCols();
		/*var colliderArray = new Array();
		var getTagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(shadowTag) as GameObject[];
		for(var i = 0; i < getTagObjs.Length; i++){
			if(getTagObjs[i].GetComponent.<Collider>() != null){
				colliderArray.Push(getTagObjs[i].GetComponent.<Collider>());
			}
		}
		colliderList = colliderArray.ToBuiltin(Collider) as Collider[];*/
	}
}

function GetCols(){
	var colliderArray = new Array();
	var getTagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(shadowTag) as GameObject[];
	for(var i = 0; i < getTagObjs.Length; i++){
		if(getTagObjs[i].GetComponent.<Collider>() != null){
			colliderArray.Push(getTagObjs[i].GetComponent.<Collider>());
		}
	}
	colliderList = colliderArray.ToBuiltin(Collider) as Collider[];	
}

function LateUpdate () {
	getTimer.Update();
	if(getTimer.current){
		if(useColliderList){
			GetCols();
		}
	}
	
	//Shadow position.
	if(castingPoint == null || castingPointRend != null && !castingPointRend.enabled){
		Destroy(gameObject);
		return;
	}
	transform.position = castingPoint.position;
	//DebugUtility.DrawPoint(castingPoint.position, .5, Color.cyan);
	var hits : RaycastHit[];
	var rayOrigin : Vector3 = transform.position + offsetRay;
	hits = Physics.RaycastAll(rayOrigin, Vector3.down, 10.0);
	
	//Debug.DrawRay(rayOrigin, Vector3.down,Color.cyan);
	
	currentShadowYPosition = Mathf.NegativeInfinity;
	
	//var foundFloor : boolean;
	
	var currentHit : RaycastHit;
	
	for (var i = 0; i < hits.Length; i++){
		var hit : RaycastHit = hits[i];
		shadowHit = hit.transform;
		skip = false;
		for(var n = 0; n < ignoreColliders.Length; n++){
			if(hit.collider == ignoreColliders[n]){
				skip = true;
				break;
			}
		}
		
		if(skip) continue;
		
		skip = true;
		if(useColliderList){
			for(n = 0; n < colliderList.Length; n++){
				if(hit.collider == colliderList[n]){
					skip = false;
					break;
				}
			}
		}
		
		if(skip) continue;
		
		if(hit.point.y > currentShadowYPosition){
			currentShadowYPosition = hit.point.y;
			currentHit = hit;
			/*foundFloor = true;
			currentShadowYPosition = hit.point.y+buffer;
			transform.position.y = currentShadowYPosition;
			transform.LookAt(transform.position + hit.normal, Vector3.forward);*/
		}

	}
	

	
	if(currentHit != null){
		transform.position.y = currentHit.point.y + buffer;
		transform.LookAt(transform.position + currentHit.normal, Vector3.forward);	
		var normalRot : Quaternion = transform.rotation;
		transform.LookAt(transform.position + Vector3.up, Vector3.forward);
		transform.rotation = Quaternion.Lerp(transform.rotation, normalRot, useGroundAngle);
		
		//Debug.DrawRay(currentHit.point, currentHit.normal, Color.red);
		
		//Opacity distance.
		var distanceShadow : float = Vector3.Distance(transform.position, castingPoint.position);
		opacity = Mathf.Lerp(maxOpacity, 0.0,  distanceShadow * (1/distanceTolerance));
		if(hits.Length == 0){
			opacity = 0.0;
		}
		opacity *= multiplier;
		
		if(linkUnderWater != null){
			if(linkUnderWater.isUnderwater.current){
				opacity = 0.0;
			}
		}	
		
		if(opacity > .1)
			rend.enabled = true;
		else
			rend.enabled = false;
		rend.material.color.a = opacity;
		//renderer.material.GetColor("_Color").a = opacity;
		
		transform.RotateAround(transform.position, Vector3.right, shadowAngle);
	}
	else{
		rend.enabled = false;
	}

}