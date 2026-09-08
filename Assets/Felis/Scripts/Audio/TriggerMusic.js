#pragma strict

var music : AudioSource;
var gameMusic : AudioSource;
var playerTag : String = "Player";
var character : Transform;
var center : boolean;

var triggerBossMusic : boolean;
var bounds : Bounds;

var useUntriggerBounds : boolean;
var unTriggerBounds : Bounds;

var desiredMusicVolume : float = .15;
var desiredGameMusicVolume : float = .3;

var getCharTimer : Timer;

var blendSpeed : float = 5.0;

var forceBossMusic : boolean;

var musicVol : FloatLerp;
var gameMusicVol : FloatLerp;

function Start () {
	if(getCharTimer.every == 0.0){
		getCharTimer.every = 4.0;
	}

}

function GetPlayer(){
	var charObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(charObj != null){
		character = charObj.transform;
	}
}

function Update () {
	getCharTimer.Update();
	if(getCharTimer.current){
		GetPlayer();
	}

	var bCenter : Vector3 = bounds.center;
	var bCenterUnTrigger : Vector3 = unTriggerBounds.center;

	if(center){
		bounds.center += transform.position;
		unTriggerBounds.center += transform.position;
	}


	if(character != null){
		if(!useUntriggerBounds){
			triggerBossMusic = bounds.Contains(character.position);
		}
		else{
			if(bounds.Contains(character.position)){
				triggerBossMusic = true;
			}
			if(unTriggerBounds.Contains(character.position)){
				triggerBossMusic = false;
			}
		}
	} 

	bounds.center = bCenter;
	unTriggerBounds.center = bCenterUnTrigger;

	
	if(triggerBossMusic || forceBossMusic){
		musicVol.target = desiredMusicVolume;
		gameMusicVol.target = 0.0;
		if(!music.isPlaying){
			music.Play();
		}
	}
	else{
		musicVol.target = 0.0;
		gameMusicVol.target = desiredGameMusicVolume;
	}
	




	musicVol.speed = blendSpeed;
	gameMusicVol.speed = blendSpeed;

	musicVol.Lerp();
	gameMusicVol.Lerp();

	music.volume = musicVol.current;
	gameMusic.volume = gameMusicVol.current; 
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	var bCenter : Vector3 = bounds.center;
	var bCenterUnTrigger : Vector3 = unTriggerBounds.center;
	if(center){
		bounds.center += transform.position;
		unTriggerBounds.center += transform.position;
	}
	Gizmos.DrawWireCube(bounds.center, bounds.size);
	
	Gizmos.color = Color.red;
	Gizmos.DrawWireCube(unTriggerBounds.center, unTriggerBounds.size);
	
	bounds.center = bCenter;
	unTriggerBounds.center = bCenterUnTrigger;
	#endif
}