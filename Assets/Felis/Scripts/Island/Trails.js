#pragma strict

var startScreen : StartScreen;

var levelBranches : LevelBranches[];

var allTrails : ParticleFollowTrail[];

class LevelBranches{
	var level : int;
	var branches : levelBranchTrail[];
}

class levelBranchTrail{
	var trail : ParticleFollowTrail;
	var reverse : boolean;
	var targetLevel : int;
}

var hideUntil : float;
var hideDuration : float = .35;

var animationPathComp : Animation;

function Start () {
	startScreen = GameObject.FindObjectOfType.<StartScreen>();
	allTrails = GameObject.FindObjectsOfType.<ParticleFollowTrail>();
}

function Update () {
	for(var n = 0; n < allTrails.Length; n++){
		allTrails[n].show = false;
	}
	if(Time.time > hideUntil){
		for(var i = 0; i < levelBranches.Length; i++){
			if(startScreen.currentLevel == levelBranches[i].level){
				for(var m = 0; m < levelBranches[i].branches.Length; m++){
					if(startScreen.IsLevelAvailable(levelBranches[i].branches[m].targetLevel)){
						levelBranches[i].branches[m].trail.show  = true;
						levelBranches[i].branches[m].trail.reverse = levelBranches[i].branches[m].reverse;
					}
				}
			}
		}
	}

	if(startScreen.changedLevel || animationPathComp != null && animationPathComp.isPlaying){
		hideUntil = Time.time + hideDuration;
	}
}