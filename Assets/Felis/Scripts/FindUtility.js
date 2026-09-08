#pragma strict

static function ReverseFindRenderer(startSearchFrom : Transform) : Renderer{
	var returnComponent : Renderer = startSearchFrom.GetComponentInChildren(Renderer);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindRenderer(startSearchFrom.parent);

	return returnComponent;
}

static function ReverseFindAnimation(startSearchFrom : Transform) : Animation{
	var returnComponent : Animation = startSearchFrom.GetComponentInChildren(Animation);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindAnimation(startSearchFrom.parent);

	return returnComponent;
}

static function ReverseFindSideMovement(startSearchFrom : Transform) : SideMovement{
	var returnComponent : SideMovement = startSearchFrom.GetComponentInChildren(SideMovement);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindSideMovement(startSearchFrom.parent);

	return returnComponent;
}

static function ReverseFindPickUpRigidbody(startSearchFrom : Transform) : PickUpRigidbody{
	var returnComponent : PickUpRigidbody = startSearchFrom.GetComponentInChildren(PickUpRigidbody);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindPickUpRigidbody(startSearchFrom.parent);

	return returnComponent;
}

static function ReverseFindJumpSwim(startSearchFrom : Transform) : JumpSwim{
	var returnComponent : JumpSwim = startSearchFrom.GetComponentInChildren(JumpSwim);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindJumpSwim(startSearchFrom.parent);

	return returnComponent;
}

static function ReverseFindRigidbody(startSearchFrom : Transform) : Rigidbody{
	var returnComponent : Rigidbody = startSearchFrom.GetComponentInChildren(Rigidbody);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindRigidbody(startSearchFrom.parent);

	return returnComponent;
}

static function ReverseFindUVFrameGroups(startSearchFrom : Transform) : UVFrameGroups{
	var returnComponent : UVFrameGroups = startSearchFrom.GetComponentInChildren(UVFrameGroups);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindUVFrameGroups(startSearchFrom.parent);

	return returnComponent;
}

static function ReverseFindIsGrounded(startSearchFrom : Transform) : IsGrounded{
	var returnComponent : IsGrounded = startSearchFrom.GetComponentInChildren(IsGrounded);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindIsGrounded(startSearchFrom.parent);

	return returnComponent;
}

static function ReverseFindSideDetection(startSearchFrom : Transform) : SideDetection{
	var returnComponent : SideDetection = startSearchFrom.GetComponentInChildren(SideDetection);
	if(returnComponent == null && startSearchFrom.parent != null) returnComponent = ReverseFindSideDetection(startSearchFrom.parent);

	return returnComponent;
}

//////////////////////////////////////////////////////////

static function FindWithTagAndName(tag : String, name : String) : GameObject{
	var tagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(tag);
	
	if(tagObjs != null){
	 	if(tagObjs.Length == 1){
			return tagObjs[0];
		}
		else{
			for(var i = 0; i < tagObjs.Length; i++){
				if(tagObjs[i].name == name){
					return tagObjs[i];
				}
			}
		}
		
		return null;
	}
	else{
		return null;
	}
}

static function FindWithNameInArray(array : GameObject[], name : String) : GameObject{

	for(var i = 0; i < array.Length; i++){
		if(array[i].name == name){
			return array[i];
		}
	}

	return null;
}

static function FindWithNameInObjChildren(obj : GameObject, name : String) : GameObject{

	var array : Transform[] = obj.GetComponentsInChildren.<Transform>();

	for(var i = 0; i < array.Length; i++){
		if(array[i].name == name){
			return array[i].gameObject;
		}
	}

	return null;
}

static function FindWithNameInObjChildren_Contains(obj : GameObject, name : String) : GameObject{

	var array : Transform[] = obj.GetComponentsInChildren.<Transform>();

	for(var i = 0; i < array.Length; i++){
		if(array[i].name.Contains(name)){
			return array[i].gameObject;
		}
	}

	return null;
}



static function GetClosest(to : Vector3, objs : GameObject[]) : GameObject{
	var closest : GameObject;
	var closestDist : float = Mathf.Infinity;
	for(var i = 0; i < objs.Length; i++){
		var thisDist : float = Vector3.Distance(to, objs[i].transform.position);
		if(thisDist < closestDist){
			closest = objs[i];
			closestDist = thisDist;
		}
	}
	return closest;
}

static function GetClosestComp(to : Vector3, objs : Component[]) : Component{
	var closest : Component;
	var closestDist : float = Mathf.Infinity;
	
	for(var i = 0; i < objs.Length; i++){
		var cTransform : Transform = objs[i].GetComponent.<Transform>();
		var thisDist : float = Vector3.Distance(to, cTransform.position);
		if(thisDist < closestDist){
			closest = objs[i];
			closestDist = thisDist;
		}
	}
	return closest;
}
