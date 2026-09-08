#pragma strict

@script RequireComponent(ParticleFade);

var shadeVariation : float;

private var particleFadeScript : ParticleFade;

function Start () {
	 Reset();

}

function Reset(){
	particleFadeScript = GetComponent.<ParticleFade>();
	
	var variation : float = -Random.value * shadeVariation * .5 + Random.value * shadeVariation;
	
	particleFadeScript.color.r = Mathf.Clamp01(particleFadeScript.color.r + variation);
	particleFadeScript.color.g = Mathf.Clamp01(particleFadeScript.color.g + variation);
	particleFadeScript.color.b = Mathf.Clamp01(particleFadeScript.color.b + variation);	
}