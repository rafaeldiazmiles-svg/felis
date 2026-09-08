#pragma strict

var door : OpenDoor;
var baloonAnim : SpeakBaloonAnimate;
var doorOpened : ToggleBoolean;

var delayAfterDoor : float = 1.0;

function Start () {
	baloonAnim = GetComponent(SpeakBaloonAnimate);
}

function Update () {
	doorOpened.current = door.alreadyOpened;
	doorOpened.Update();
	
	if(!doorOpened.current){
		baloonAnim.playEnabled = false;
	}
	   
	if(doorOpened.toggledTrue){
		baloonAnim.playEvery.next = door.openTime + delayAfterDoor;		
	}
}