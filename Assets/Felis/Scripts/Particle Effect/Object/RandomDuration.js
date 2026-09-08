#pragma strict

@script RequireComponent(ParticleFade)

var randomizeFadeStart : float = .01;
var randomizeFadeEnd : float = .3;

var minFadeEnd : float = .3;

private var particleFade : ParticleFade;

function Start () {
	particleFade = GetComponent.<ParticleFade>();
	particleFade.fadeStart = particleFade.fadeStart - (Random.value * randomizeFadeStart*.5) + (Random.value * randomizeFadeStart);
	var defaultFadeEnd : float = particleFade.fadeEnd;
	particleFade.fadeEnd = Mathf.Max(minFadeEnd, particleFade.fadeEnd - (Random.value * randomizeFadeEnd*.5) + (Random.value * randomizeFadeEnd));
}