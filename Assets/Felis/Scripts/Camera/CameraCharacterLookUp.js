#pragma strict

var applyMode : ApplyMode;

var characterTag : String = "Player";
var character : Transform;

var lookUp : LookUp;

var heightOffset : FloatSmoothDamp;

var lookUpTime : float = 4.0;
var lookDownTime : float = 1.0;
var lookUpOffset : float = 2.0;

var defaultYOffset : float = .5;



function Start () {
	GetPlayer();//character = GameObject.FindGameObjectWithTag(characterTag).transform;
	
}

function GetPlayer(){
	var characterObj : GameObject = GameObject.FindGameObjectWithTag(characterTag);
	if(characterObj != null){
		character = characterObj.transform;	
		lookUp = character.GetComponentInChildren(LookUp);
	}
}

function LateUpdate () {
	if(character == null) GetPlayer();
	
	heightOffset.SmoothDamp();
	
	if(lookUp != null){
		if(lookUp.lookingUp.current){
			heightOffset.time = lookUpTime;
			heightOffset.target = lookUpOffset;
		}
		else{
			heightOffset.time = lookDownTime;
			heightOffset.target = defaultYOffset;
		}
	}
	
	if(applyMode == ApplyMode.additive){
		transform.localPosition.y += heightOffset.current;
	}
	if(applyMode == ApplyMode.absolute){
		transform.localPosition.y = heightOffset.current;
	}
}