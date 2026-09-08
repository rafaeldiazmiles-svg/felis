#pragma strict

var rend : Renderer;

var queue : int;



function Start () {
	if(rend == null){
		rend = GetComponent.<Renderer>();
	}
}

function Update () {
	if(rend == null){
		rend = GetComponent.<Renderer>();
	}
	else{
		rend.material.renderQueue = queue;
	}
}