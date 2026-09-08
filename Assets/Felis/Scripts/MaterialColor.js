#pragma strict

var color : Color;

var rend : Renderer;

var everyFrame : boolean;

function Start () {
	rend = GetComponent.<Renderer>();
	rend.material.color = color;
}

function Update () {
	if(everyFrame){
		rend.material.color = color;
	}
}