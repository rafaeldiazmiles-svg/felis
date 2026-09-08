#pragma strict

var playerTag : String = "Player";
var character : Transform;

var inDoorFogs : InDoorColorFog[];

var fadeSpeed : float = .4;

var debug : boolean;

class InDoorColorFog{
	var elements : InDoorColorFogElement[];
	
	var bounds : Bounds[];

	var hasCharacter : boolean;

	var disableThisGroup : boolean;
	
	var lerpValue : float;
}

class InDoorColorFogElement{
	var colorRenderer : Renderer;
	var multipleRenderers : Renderer[];
	var propertyName : String;
	
	
	var hasCharacterColor : Color;
	var noCharacterColor : Color;
	
	var invert : boolean;
}

function GetPlayer(){
	var charObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(charObj != null){
		character = charObj.transform;
	}	
}

function Start () {
	GetPlayer();
}

function Update () {
	if(character == null){
		GetPlayer();
	}
	else{
		for(var i = 0; i < inDoorFogs.Length; i++){
			//Fog group.
			if(inDoorFogs[i].disableThisGroup) continue;
			
			var targetLerp : float = 1.0;
			inDoorFogs[i].hasCharacter = false;
			
			//Check if any of the bounds has the character.
			for(var n = 0; n < inDoorFogs[i].bounds.Length; n ++){
				if(inDoorFogs[i].bounds[n].Contains(character.position)){
					targetLerp = 0.0;
					inDoorFogs[i].hasCharacter = true;
				}
			}
			
			//Smoothly change lerp value.
			inDoorFogs[i].lerpValue = Mathf.MoveTowards(inDoorFogs[i].lerpValue, targetLerp, Time.deltaTime * fadeSpeed);
			
			//Don't calculate and change color if already on target color.
			if(inDoorFogs[i].lerpValue == 1.0 && targetLerp == 1.0) continue;
			if(inDoorFogs[i].lerpValue == 0.0 && targetLerp == 0.0) continue;
			
			//Reach target value if close enough.
			if(inDoorFogs[i].lerpValue > .99 && targetLerp == 1.0) targetLerp = 1.0;
			if(inDoorFogs[i].lerpValue < .01 && targetLerp == 0.0) targetLerp = 0.0;	
			
			//Change elements' color.
			for(var m = 0; m < inDoorFogs[i].elements.Length; m++){
				var fadeColor : Color = Color.Lerp(inDoorFogs[i].elements[m].noCharacterColor, inDoorFogs[i].elements[m].hasCharacterColor, inDoorFogs[i].lerpValue);
				
				if(	inDoorFogs[i].elements[m].colorRenderer != null)
					inDoorFogs[i].elements[m].colorRenderer.material.SetColor(inDoorFogs[i].elements[m].propertyName, fadeColor);

				for(var w = 0; w < inDoorFogs[i].elements[m].multipleRenderers.Length; w++)
					inDoorFogs[i].elements[m].multipleRenderers[w].material.SetColor(inDoorFogs[i].elements[m].propertyName, fadeColor);

			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < inDoorFogs.Length; i++){
			for(var n = 0; n < inDoorFogs[i].bounds.Length; n++){
				Gizmos.color = Color.magenta;
				Gizmos.DrawWireCube(inDoorFogs[i].bounds[n].center, inDoorFogs[i].bounds[n].size);
			}

		}
	}
	#endif
}