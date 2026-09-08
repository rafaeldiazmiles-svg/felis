#pragma strict

var list : GameObject[];

function Start () {
	for(var i = 0; i < list.Length; i++){
		Destroy(list[i]);
	}
}

function Update () {

}