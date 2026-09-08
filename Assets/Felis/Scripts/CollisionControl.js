#pragma strict

var collision : ToggleBoolean;

var col : Collider;

function Start(){
	col = GetComponent.<Collider>();
}

function Update(){
	collision.Update();
}

function OnCollisionEnter(col : Collision){
	collision.current = true;
}

function OnCollisionExit(col : Collision){
	collision.current = false;
}