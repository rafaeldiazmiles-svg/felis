#pragma strict

@Space(20)
var cBands : CinematicBands;
var cBandsName : String = "Cinematic Bands";

function Start () {
	cBands = Camera.main.transform.Find(cBandsName).GetComponent.<CinematicBands>();
	cBands.show = true;
}

function Update () {

}