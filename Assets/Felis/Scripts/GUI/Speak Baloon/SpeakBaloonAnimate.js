#pragma strict

var playEvery : Timer;
var playScript : PlayAnimation;  
var colorAnim : ColorAnimation;

var playEnabled : boolean;

var resetAnimOnEnable : boolean;

var disableUntil : float;

var soundList : AudioSource[];

var defEvery : float;
var slowDownUntil : float;
var slowMultiplier : float = 2.3;

function Start () {
	defEvery = playEvery.every;
	playScript = GetComponentInChildren(PlayAnimation);
	colorAnim = GetComponentInChildren(ColorAnimation);
}

function Update () {
	if(Time.time < slowDownUntil){
		playEvery.every = defEvery * slowMultiplier;
	}
	else{
		playEvery.every  = defEvery;
	}
	
	if(playEnabled){
		playEvery.Update();
	}
	else{
		playEvery.current = false;
	}

	if(playEvery.current && Time.time > disableUntil){
		playScript.playAgain = true;
		colorAnim.startTime = Time.time;
		
		if(soundList != null && soundList.Length > 0){
			var id : int = Random.value * soundList.Length;
			if(soundList[id] != null && soundList[id].enabled){
				soundList[id].Play();
			}
		}
	}
}