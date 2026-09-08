#pragma strict

var cannonBallTag : String = "Cannon Ball";

var feedRadius : float = .5;
var feedDelay : float = .5;

var cannonBalls : GameObject[];
var inside : ToggleBoolean[];

var getTimer : Timer;

var cannonBallFed : ToggleBoolean;

function GetCannonBalls(){
	cannonBalls = GameObject.FindGameObjectsWithTag(cannonBallTag);
	inside = new ToggleBoolean[cannonBalls.Length];
	for(var i = 0; i < inside.Length; i++){
		inside[i] = new ToggleBoolean();
	}
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetCannonBalls();
	}

	if(inside != null){
		for(var i = 0; i < inside.Length; i++){
			if(cannonBalls[i] == null){
				continue;
			}
			var dist : float = Vector3.Distance(transform.position, cannonBalls[i].transform.position);
			if(dist < feedRadius){
				inside[i].current = true;
			}
			else{
				inside[i].current = false;
			}

			inside[i].Update();

			if(inside[i].current && Time.time > inside[i].toggledTrueTime + feedDelay){
				cannonBallFed.current = true;
				Destroy(cannonBalls[i]);
			}
		}
	}

	cannonBallFed.Update();
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, feedRadius, Vector3.forward);
	#endif
}