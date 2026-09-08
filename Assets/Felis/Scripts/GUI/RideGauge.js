#pragma strict

var enableOnStart : boolean;

var rideGauge : GameObject;
var catsGauge : GameObject;

function Start () {
	if(enableOnStart){
		SetRideGauge(true);
	}
}

function SetRideGauge(setState : boolean){
	rideGauge.SetActive(setState);
	catsGauge.SetActive(!setState);	
}


function Update () {

}