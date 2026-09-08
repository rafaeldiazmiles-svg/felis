#pragma strict

var top : ConfigurableJoint;
var bottom : ConfigurableJoint;

var anchorOpen : float = 3.5;

var closed : ToggleBoolean;

var anchorYTarget : float;
var anchorYOpenSpeed : float;
var anchorYCloseSpeed : float;

var openClose : TimerToggle;

var pauseOnObj : boolean;
var pauseForTag : String;
var pauseObjs : GameObject[];
var getTimer : Timer;
var pauseBounds : Bounds;

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 6.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		if(pauseOnObj){
			pauseObjs = GameObject.FindGameObjectsWithTag(pauseForTag);
		}
	}

	var pause : boolean;

	if(pauseOnObj && pauseObjs != null){
		for(var i = 0; i < pauseObjs.Length; i++){
			if(pauseObjs[i] == null){
				continue;
			}
			if(pauseBounds.Contains(pauseObjs[i].transform.position - transform.position)){
				pause = true;
				break;
			}
		}
	}

	if(pause){
		closed.current = true;
	}
	else{
		openClose.Update();
		if(openClose.A.toggledTrue){
			closed.current = true;
		}
		if(openClose.B.toggledTrue){
			closed.current = false;
		}
	}

	closed.Update();
	if(closed.toggledTrue){
		anchorYTarget = anchorOpen;
	}

	if(closed.toggledFalse){
		anchorYTarget = 0;
	}


	var anchorSpeed : float;

	if(anchorYTarget > 0){
		anchorSpeed = anchorYOpenSpeed;
	}
	else{
		anchorSpeed = anchorYCloseSpeed;
	}

	top.anchor.y = Mathf.MoveTowards(top.anchor.y, -anchorYTarget, Time.deltaTime * anchorSpeed);
	bottom.anchor.y = Mathf.MoveTowards(bottom.anchor.y, anchorYTarget, Time.deltaTime * anchorSpeed);
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.DrawWireCube(pauseBounds.center + transform.position, pauseBounds.size);

	#endif
}