#pragma strict

var characterIsParent : boolean = true;
var character : Transform;
@Space(30)
var party : CharacterParty;
@Space(30)
var partying : ToggleBoolean;
@Space(30)
var partyCheckRange : float = 3.0;
var partyDuration : float;
var startPartyTime : float;
@Space(30)
var getTimer : Timer;
var enemyTag : String = "Enemy";
var partyOnDestroyObjects : PartyOnDestroyObject[];


class PartyOnDestroyObject{
	var object : Transform;
	var destroyed : ToggleBoolean;
	var lastObjectPosition : Vector3;
	
	function PartyOnDestroyObject(){
		destroyed = new ToggleBoolean();
	}
	
	function Update(){
		if(object == null) destroyed.current = true;
		else{
			lastObjectPosition = object.position;
		}
		
		destroyed.Update();
	}
}

function GetEnemies(){
	var allEnemies : GameObject[] = GameObject.FindGameObjectsWithTag(enemyTag);
	partyOnDestroyObjects = new PartyOnDestroyObject[allEnemies.Length];
	for(var i = 0; i < partyOnDestroyObjects.Length; i++){
		partyOnDestroyObjects[i] = new PartyOnDestroyObject();
		partyOnDestroyObjects[i].object = allEnemies[i].transform;
	}	
}

function Start () {
	if(characterIsParent){
		character = transform.parent;
	}
	
	party = character.gameObject.GetComponentInChildren(CharacterParty);
	GetEnemies();
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetEnemies();
	}

	for(var i = 0; i < partyOnDestroyObjects.Length; i++){
		partyOnDestroyObjects[i].Update();
		
		if(partyOnDestroyObjects[i].destroyed.toggledTrue){
			if(Vector3.Distance(character.position, partyOnDestroyObjects[i].lastObjectPosition) < partyCheckRange){
				partying.current = true;
				startPartyTime = Time.time;
			}
		}
	}
	
	if(Time.time > startPartyTime + partyDuration){
		partying.current = false;
	}
	
	partying.Update();
	if(partying.toggledTrue)party.partying.current = true;
	if(partying.toggledFalse) party.partying.current = false;
}