#pragma strict

var offset : float;

var rend : Renderer;
function Start () {
	rend = GetComponent.<Renderer>();
}

function Update () {
	if(Time.frameCount % 3 == 0){
		rend.material.SetFloat("_WaterLevel", transform.position.y - offset);
	}
}