#pragma strict

var otherObject : GameObject;

function Start () { 

}

function Update () {
	if(otherObject == null){
		Destroy(gameObject);
	}
}