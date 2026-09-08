#pragma strict

var character : Transform;
var playerTag : String = "Player";
var door : OpenDoor;
var getDoorTimer : Timer;

var sideDetection : SideDetection;
var controller : ControllerInput;

var doorName : String = "Castle Door";

var baloonAnimate : SpeakBaloonAnimate;

function Start () {

	baloonAnimate = GetComponent(SpeakBaloonAnimate);
	
	GetDoor();
	
	if(getDoorTimer.every == 0.0){
		getDoorTimer.every = 3.0;
	}
}

function GetPlayer(){
	var characterObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(characterObj != null){
		character = characterObj.transform;
		sideDetection = character.GetComponentInChildren(SideDetection);
		controller = character.GetComponentInChildren(ControllerInput);	
	}
}

function GetDoor(){
	var doors : OpenDoor[] = GameObject.FindObjectsOfType.<OpenDoor>();
	var closestDoor : OpenDoor;
	var closestDoorDist : float;
	for(var i = 0; i < doors.Length; i++){
		if(closestDoor == null){
			closestDoor = doors[i];
			closestDoorDist = Vector3.Distance(transform.position, closestDoor.transform.position);
		}
		else{
			var thisDist : float = Vector3.Distance(transform.position, doors[i].transform.position);
			if(thisDist < closestDoorDist){
				closestDoor = doors[i];
				closestDoorDist = thisDist;
			}
		}
	}
	door = closestDoor;
}

function Update () {
	getDoorTimer.Update();
	if(getDoorTimer.current){
		GetDoor();
	}
	
	if(character == null){
		GetPlayer();
	}
	
	var nearCastleDoor : boolean;
	
	if(character != null && door != null){
		if(sideDetection.hitsLeft != null && door.requiresKey && door.openArea.Contains(character.position)){
			for(var i = 0; i < sideDetection.hitsLeft.Length; i++){
				if(sideDetection.hitsLeft[i].transform.name == doorName){
					nearCastleDoor = true;
				}
			}
			for(i = 0; i < sideDetection.hitsRight.Length; i++){
				if(sideDetection.hitsRight[i].transform.name == doorName){
					nearCastleDoor = true;
				}
			}
		}
	}
	
	if(nearCastleDoor){
		baloonAnimate.playEnabled = true;
	}
	else{
		baloonAnimate.playEnabled = false;
	}
}