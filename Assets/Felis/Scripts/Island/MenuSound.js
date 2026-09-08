#pragma strict

var menuMusic : AudioSource;
var menuMusicVolume : FloatMoveTowards;
var targetMusicVolume : float = .15;
var islandWind : AudioSource;

var wavesStart : AudioSource;
var playedWaves : boolean;
var startScreen : StartScreen;

function Start () {
	islandWind.Play();
	menuMusic.Play();
	menuMusicVolume.target = targetMusicVolume;
}

function Update () {
	if(!playedWaves && startScreen.currentLevel == -1){
		if(wavesStart != null){
			wavesStart.Play();
		}
		playedWaves = true;
	}
	
	if(startScreen.enteringLevel){
		menuMusicVolume.target = 0.0;
	}
	
	menuMusicVolume.MoveTowards();
	menuMusic.volume = menuMusicVolume.current;
	islandWind.volume = menuMusicVolume.current * 3.0;
}