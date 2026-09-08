#pragma strict

@Header ("-------------------Quash Head--------------------")
var squashHead : Squash;
var killZone : KillZone;
var squashHeadIdle : float = 0.005;
var squashHeadEat : float = 0.010;
var squashSpeedIdle : float = 7.0;
var squashSpeedEat : float = 8.0;
var eatCurve : AnimationCurve;
var squashPhase : float;
var eatSound : AudioSource;
@Space(30)
var screamCurve : AnimationCurve;
var scream : ToggleBoolean;
var screamMultiplier : float = 5.0;
var bubblesCurrent : GameObject;
var bubblesCurrentOffset : Vector3;
var mouthWave : SinWaveRotation[]; 
var defSpeed : float[];
var screamSounds : AudioSource;
var playerTag : String = "Player";
var player : GameObject;
var getTimer : Timer;
var screamDist : float = 7.0;

function Start () {
	squashHead = GetComponentInChildren.<Squash>();
	killZone = GetComponent.<KillZone>();
	mouthWave = GetComponentsInChildren.<SinWaveRotation>();
	defSpeed = new float[mouthWave.Length];
	for(var i = 0; i < defSpeed.Length;i++){
		defSpeed[i] = mouthWave[i].speed;
	}
	
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}
}

function Update () {
	 //Scream
	getTimer.Update();
	if(getTimer.current){
		if(player == null){
			player = GameObject.FindGameObjectWithTag(playerTag);
		}
	}
	if(player != null){
		if(Vector3.Distance(transform.position, player.transform.position) < screamDist){
			scream.current = true;
		}
	}
	
	scream.Update();
	var screamAmount : float = screamCurve.Evaluate(Time.time - scream.toggledTrueTime) * screamMultiplier;
	if(scream.toggledTrue){
		var bCurrent : GameObject = Instantiate(bubblesCurrent);
		bCurrent.transform.position += bubblesCurrentOffset;
		screamSounds.Play();
	}
	for(var i = 0; i < mouthWave.Length; i++){
		mouthWave[i].speed = defSpeed[i] + screamAmount;
	}
	
	
	//Squash.
	var eatAmmount : float = eatCurve.Evaluate(Time.time - killZone.killedThisFrame.toggledTrueTime);
	var squashAmount : float = squashHeadIdle + squashHeadEat * eatAmmount;
	//var squashSpeed : float = squashSpeedIdle + squashSpeedEat * eatAmmount;
	
	squashPhase += squashSpeedIdle * Time.deltaTime;
	squashPhase += squashSpeedEat * eatAmmount * Time.deltaTime;
	squashPhase += squashSpeedEat * screamAmount * Time.deltaTime;
	
	squashHead.squashAmount = Mathf.Sin(squashPhase) * squashAmount;
	
	 if(killZone.killedThisFrame.toggledTrue && eatSound != null){
	 	eatSound.Play();
	 }
	 

	 
}