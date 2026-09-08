#pragma strict

var recentlyCreated : boolean = true;
var deleteCopy : boolean = true;

function Start () {
	GameObject.DontDestroyOnLoad(gameObject);
}

function Update () {
	recentlyCreated = false;
}

function OnLevelWasLoaded(){
	if(!recentlyCreated && deleteCopy){
		var name : String = gameObject.name;
		gameObject.name = "Temp name";
		var newCopy : GameObject = GameObject.Find(name);
		if(newCopy != null){
			Destroy(newCopy);
		}
		gameObject.name = name;
	}
}