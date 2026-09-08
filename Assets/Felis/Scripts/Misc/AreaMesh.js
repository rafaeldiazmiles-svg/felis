#pragma strict

var col : MeshCollider;

var checkChar : boolean = true;
var character : GameObject;
var charTag : String = "Player";

var getTimer : Timer;

var skipFrame : int = 3;

var charInArea : boolean;

var setNoCollideLayer : boolean = true;
var noCollideLayer : int = 21;

var addMeshCollider : boolean = true;

function GetChar(){
	character = GameObject.FindGameObjectWithTag(charTag);
}

function Start () {
	if(col == null){
		col = GetComponent.<MeshCollider>();
	}

	if(getTimer.every == 0.0){
		getTimer.every = 0.1;
	}

	gameObject.layer = noCollideLayer;

	if(col == null){
		col = gameObject.AddComponent.<MeshCollider>();
		col.sharedMesh = GetComponent.<MeshFilter>().mesh;
	}
}

function Update () {
	getTimer.Update();

	if(getTimer.current){
		if(character == null){
			GetChar();
		}
	}

	if(checkChar){
		if(character != null){
			if(Time.frameCount % skipFrame == 0){
				charInArea = TestPoint(character.transform.position);
			}
		}
		else{
			charInArea = false;
		}
	}
}

function TestPoint(point : Vector3){
	var ray : Ray = new Ray(point, -Vector3.forward);
	var hit : RaycastHit;
	if( col.Raycast(ray, hit, 10.0) ){
		return true;
	}
	else{
		return false;
	}
}