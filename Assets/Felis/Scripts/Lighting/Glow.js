#pragma strict

@script RequireComponent(ParticleEmitter)
@script RequireComponent(ParticleRenderer)

var glowItems : GlowItem[];

var pEmitter : ParticleEmitter;

var particleArray : Particle[];

var particleCount : int;

var glowFadeOutAreas : GlowFadeOutArea[];
var fadeSpeed : float = 10.0;

var player : Transform;
var playerTag : String = "Player";

var debug : boolean;

class GlowFadeOutArea{
	var transformCenter : Transform;
	var bounds : Bounds;
	
	var transformName : String;
	var transformTag : String;
	
	function Contains(pos : Vector3) : boolean{
		var center : Vector3 = bounds.center;
		if(transformCenter != null){
			bounds.center += transformCenter.position;
		}
		var containsIt : boolean = bounds.Contains(pos);
		bounds.center = center;
		return containsIt;
	}

}

function Start () {

	pEmitter = GetComponent.<ParticleEmitter>();

	/*var glowObjects : GameObject[] = GameObject.FindGameObjectsWithTag("Glow Item");
	glowItems = new GlowItem[glowObjects.Length];
	for(var n = 0; n < glowObjects.Length; n++) {
		glowItems[n] = glowObjects[n].GetComponent.<GlowItem>();
	}*/
	SetGlowItems();
	
	GetPlayer();//player = GameObject.FindGameObjectWithTag(playerTag).transform;
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) player = playerObj.transform;
}

function LateUpdate () {
	if(player == null) GetPlayer();
	
	UpdateParticles();
}

function UpdateParticles(){
	if(pEmitter == null){
		pEmitter = GetComponent.<ParticleEmitter>();
	}
	particleArray = pEmitter.particles;

	for(var i = 0; i < particleArray.Length; i++){
		if(i >= particleArray.Length || i >= glowItems.Length || glowItems[i] == null || particleArray[i] == null){
			SetGlowItems();
		}		
	}

	for(i = 0; i < particleArray.Length; i++){
		if(i < glowItems.Length && i < particleArray.Length && particleArray[i] != null && glowItems[i] != null){
			particleArray[i].position = glowItems[i].transform.position;
			particleArray[i].size = glowItems[i].size;
			
			particleArray[i].color = glowItems[i].color * RenderSettings.ambientLight;
			
			if(glowItems[i].boundRenderer != null){
				if(glowItems[i].matchAlpha || glowItems[i].matchRGB || glowItems[i].lerpRendColor){
					var col : Color = glowItems[i].boundRenderer.material.GetColor(glowItems[i].propertyName);
				}
				
				if(glowItems[i].matchRGB){
					glowItems[i].startColor.r = col.r;
					glowItems[i].startColor.g = col.g;
					glowItems[i].startColor.b = col.b;
				}
				
				if(glowItems[i].matchAlpha){
					particleArray[i].color.a = col.a * glowItems[i].matchAlphaMultiply;
				}
				
				if(glowItems[i].lerpRendColor){
					particleArray[i].color.r = Mathf.Lerp(glowItems[i].startColor.r, col.r, col.a);
					particleArray[i].color.g = Mathf.Lerp(glowItems[i].startColor.g, col.g, col.a);
					particleArray[i].color.b = Mathf.Lerp(glowItems[i].startColor.b, col.b, col.a);
					
				}
				
				if(glowItems[i].boundToRenderer){
					if(!glowItems[i].boundRenderer.enabled){
						particleArray[i].color = Color.black;
					}
				}
			}
			
			particleArray[i].energy = Mathf.Infinity;
			
			var fade : boolean;
			if(glowFadeOutAreas != null){
				for(var n = 0; n < glowFadeOutAreas.Length; n++){
					if(glowFadeOutAreas[n].Contains(particleArray[i].position)) {
						//fade this particle
						fade = true;
						break; 
					}
				}
			}
			
			if(!glowItems[i].manualFade && fade){
				glowItems[i].color = Color.Lerp(glowItems[i].color, Color(0,0,0,0), Time.deltaTime * fadeSpeed);
			}
			else{
				glowItems[i].color = Color.Lerp(glowItems[i].color, glowItems[i].startColor, Time.deltaTime * fadeSpeed);
			}			
			
		}
	}
	
	pEmitter.particles = particleArray;
	particleCount = pEmitter.particles.Length;	
}

function SetGlowItems(){
	glowItems = GameObject.FindObjectsOfType.<GlowItem>();
	
	particleArray = new Particle[glowItems.Length];
	for(var i = 0; i < particleArray.Length; i++){
		particleArray[i].energy = Mathf.Infinity;
	}	
	GetComponent.<ParticleEmitter>().particles = particleArray;

	UpdateParticles();
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < glowFadeOutAreas.Length; i++){
			Gizmos.color = Color.gray;
			var transformOffset : Vector3;
			if(glowFadeOutAreas[i].transformCenter != null) transformOffset = glowFadeOutAreas[i].transformCenter.position;
			Gizmos.DrawWireCube(glowFadeOutAreas[i].bounds.center + transformOffset, glowFadeOutAreas[i].bounds.size);
		}
	}
	#endif
}