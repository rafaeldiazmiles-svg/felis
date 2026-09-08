#pragma strict

var confettiEmitter : ParticleSystem[];

var emitting : ToggleBoolean;

function Start () {
	confettiEmitter = GetComponentsInChildren.<ParticleSystem>() as ParticleSystem[];
}

function Update () {
	emitting.Update();
	
	if(emitting.toggledTrue){
		for(var i = 0; i < confettiEmitter.Length; i ++){
			confettiEmitter[i].Play();
		}
	}
}