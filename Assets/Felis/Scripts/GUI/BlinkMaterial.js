#pragma strict

var show : ToggleBoolean;
var blink : TimerToggle;
var colorProperty : String = "_Color";

function Start () {

}

function Update () {
	blink.Update();
	show.Update();
	
	if(show.toggledTrue){
		GetComponent.<Renderer>().enabled = true;
	}
	
	if(show.current){
		if(blink.A.toggledTrue){
			GetComponent.<Renderer>().material.SetColor(colorProperty, Color.white);
		}
		if(blink.B.toggledTrue){
			GetComponent.<Renderer>().material.SetColor(colorProperty, Color(1,1,1,0));
		}
	}
	
	if(show.toggledFalse){
		GetComponent.<Renderer>().enabled = false;
	}
}