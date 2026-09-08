#pragma strict

var xRange : Vector2;
var yRange : Vector2;
var zRange : Vector2;


function Start () {
	transform.Rotate(Random.Range(xRange.x, xRange.y), Random.Range(yRange.x,yRange.y), Random.Range(zRange.x, zRange.y));

}

function LateUpdate(){

}