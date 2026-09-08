#pragma strict

var image : Texture;

function Start () {

}

function Update () {

}

function OnGUI(){
	for(var touch : Touch in Input.touches){
		var position : Rect = Rect(0,0,image.width,image.height);
		position.center = Vector2(touch.position.x, Screen.height - touch.position.y);
		GUI.Box(position, image);
	}
	/*var mousePosition : Rect = Rect(0,0,image.width,image.height);
	mousePosition.center = Vector2(Input.mousePosition.x, Screen.height - Input.mousePosition.y);
	GUI.Box(mousePosition, image);*/
}