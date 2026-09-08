#pragma strict

var scrollGroups : ScrollTextureGroup[]; 

class ScrollTextureGroup{
	var propertyName : String;
	var materialID : int;
	var speed : Vector2;
	var currentOffset : Vector2;
}

function Start () {

}

function Update () {
	for(var i = 0; i < scrollGroups.Length; i++){
		scrollGroups[i].currentOffset += Time.deltaTime * scrollGroups[i].speed;
		GetComponent.<Renderer>().materials[scrollGroups[i].materialID].SetTextureOffset(scrollGroups[i].propertyName, scrollGroups[i].currentOffset);
		scrollGroups[i].currentOffset.x = scrollGroups[i].currentOffset.x % 1;
		scrollGroups[i].currentOffset.y = scrollGroups[i].currentOffset.y % 1;
	}
}