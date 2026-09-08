#pragma strict

var audioSource : AudioSource;

var volume : AnimationCurve;

function Start () {
	if(audioSource == null){
		audioSource = GetComponent(AudioSource);
	}
}

function Update () {
	audioSource.volume = volume.Evaluate(Time.time);
}