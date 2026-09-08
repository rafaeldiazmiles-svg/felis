#pragma strict

var inv : Inventory;

var defScale : Vector3;

var scale : Vector3Spring;

var rend : Renderer;

function Start () {
	rend = GetComponent.<Renderer>();
	defScale = transform.localScale;

	if(scale.damp == 0.0){
		scale.damp = 20;
	}
	if(scale.springForce == 0.0){
		scale.springForce = 12;
	}
}

function Update () {
	if(inv != null && inv.hasInvItem){
		scale.target = defScale;
	}
	else{
		scale.target = Vector3.zero;
	}

	scale.Spring();

	rend.enabled = scale.current.x > .1;

	transform.localScale = scale.current;
}