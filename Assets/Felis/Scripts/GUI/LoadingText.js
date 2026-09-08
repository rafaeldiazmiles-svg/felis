#pragma strict

var parentScript : Parent;

var spiral : ScreenSpiral;

var renderers : Renderer[];

var hideForSeconds : float = 2.0;

function Start () {
	parentScript = GetComponent(Parent);
	var spiralObj : GameObject = GameObject.Find("Screen Spiral");
	if(spiralObj != null) spiral = spiralObj.GetComponent(ScreenSpiral);
	
	renderers = GetComponentsInChildren.<Renderer>() as Renderer[];
}

function Update () {
	if(Time.time > hideForSeconds){
		if(spiral != null){
			if(spiral.offsetMaterial.offset.x == spiral.openOffset)
				for(var rend : Renderer in renderers)	rend.enabled = false;
			else
				for(var rend : Renderer in renderers)	rend.enabled = true;
		}
	}
	else{
		for(var rend : Renderer in renderers)	rend.enabled = false;
	}
}

function OnLevelWasLoaded(){
	if(parentScript == null)
		parentScript = GetComponent(Parent);
		
	parentScript.SetParent(Camera.main.transform, false);
	
	var spiralObj : GameObject = GameObject.Find("Screen Spiral");
	if(spiralObj != null) spiral = spiralObj.GetComponent(ScreenSpiral);		
}