#pragma strict

var update : boolean;
var lateUpdate : boolean;
var fixedUpdate : boolean;

var setX : boolean;
var x : float;
var setY : boolean;
var y : float;
var setZ : boolean;
var z : float;

function Start () {

}

function Update () {
	if(setX) transform.eulerAngles.x = x; 
	if(setY) transform.eulerAngles.y = y;
	if(setZ) transform.eulerAngles.z = z;
}

function LateUpdate () {
	if(setX) transform.eulerAngles.x = x;
	if(setY) transform.eulerAngles.y = y;
	if(setZ) transform.eulerAngles.z = z;
}

function FixedUpdate () {
	if(setX) transform.eulerAngles.x = x;
	if(setY) transform.eulerAngles.y = y;
	if(setZ) transform.eulerAngles.z = z;
}