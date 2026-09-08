#pragma strict

var slab : Trigger;

var rb : Rigidbody;

var newWeight : float;

function Start () {

}

function Update () {
	if(slab.stepped.toggledTrue){
		rb.mass = newWeight;	
	}
}