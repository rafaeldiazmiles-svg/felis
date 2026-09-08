#pragma strict

var waveStartPos : float;
var waveSpeed : float;
var waveCurrentPos : float;

function Start () {

}

function Update () {
	waveCurrentPos = waveStartPos + Time.time * waveSpeed;
	GetComponent.<Renderer>().material.SetVector("_Scroll", Vector4(waveCurrentPos,0,0,0));
}