#pragma strict

var target : Transform;
@Space(20)
var rootCharacter : Transform; //Used for side
var getRootCharacerFrom : Follow;
var useRootCharSide : boolean;
var invertSide : boolean;
@Space(20)
var findTag : String;
var useStartingOffset : boolean = true;
@Space(20)
var offset : Vector3;
@Space(20)
var x : boolean;
var y : boolean;
var z : boolean;

var lerp : float;

function FindTarget(){
	var targetObj : GameObject = GameObject.FindGameObjectWithTag(findTag);
	if(targetObj != null){
		target = targetObj.transform;
	}
}


function Start () {
	if(findTag != ""){
		FindTarget();
	}
	if(target != null){
		if(useStartingOffset) offset = transform.position - target.position;
	}
}

function Update () {
	if(target == null){
		if(findTag != ""){
			FindTarget();
		}
	}
	else{
		var useOffset : Vector3 = offset;

		if(getRootCharacerFrom != null){
			rootCharacter = getRootCharacerFrom.rootCharacter;
		}

		if(rootCharacter != null && useRootCharSide){
			var side : int = Mathf.Sign(rootCharacter.localScale.x);

			if(invertSide){
				side = -side;
			}

			useOffset.x *= side;
		}
				
		if(x){
			if(lerp == 0){
				transform.position.x = target.position.x + useOffset.x;
			}
			else{
				transform.position.x = Mathf.Lerp(transform.position.x, target.position.x + useOffset.x, Time.deltaTime * lerp);
			}
		}

		if(y){
			if(lerp == 0){
				transform.position.y = target.position.y + useOffset.y;
			}
			else{
				transform.position.y = Mathf.Lerp(transform.position.y, target.position.y + useOffset.y, Time.deltaTime * lerp);
			}
		}
		
		if(z){
			if(lerp == 0){
				transform.position.z = target.position.z + useOffset.z;
			}
			else{
				transform.position.z = Mathf.Lerp(transform.position.z, target.position.z + useOffset.z, Time.deltaTime * lerp);
			}
		}
	}
	
}
