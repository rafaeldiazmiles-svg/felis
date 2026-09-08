#pragma strict

var findByTag : boolean;
var tagList : String[];

var objectList : Transform[];

var playerTag : String = "Player";
var character : Transform;

var range : Vector2 = Vector2(9,4);
var rangeVerticalOffset : float = 2.0;

function Start () {
	 GetPlayer();
	
	var objListArray : Array = new Array();
	
	if(findByTag){
		for(var i = 0; i < tagList.Length; i ++){
			var thisTagList : GameObject [] = GameObject.FindGameObjectsWithTag(tagList[i]) as GameObject[];
			for(var n = 0 ; n < thisTagList.Length; n++){
				objListArray.Push(thisTagList[n]);
			}
		}
		objectList = new Transform[objListArray.length];
		for(var m = 0; m < objListArray.length; m++){
			var thisObj : GameObject = objListArray[m];
			objectList[m] = thisObj.transform;
		}
	}
}

function GetPlayer(){
	var characterObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(characterObj != null) character = characterObj.transform;
}

function LateUpdate () {
	if(character == null) GetPlayer();
	
	for(var i = 0; i < objectList.Length; i++){
		if(objectList[i] == null) continue;
		if(character != null && Mathf.Abs(character.position.x - objectList[i].position.x) < range.x && Mathf.Abs(character.position.y + rangeVerticalOffset - objectList[i].position.y) < range.y){
			if(!objectList[i].gameObject.activeInHierarchy){
				objectList[i].gameObject.SetActive(true);
			}
		}
		else{
			if(objectList[i].gameObject.activeInHierarchy){
				objectList[i].gameObject.SetActive(false);
			}			
		}
	}
}