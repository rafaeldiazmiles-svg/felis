#pragma strict
var arms : Transform[];
@Header("---------------------------")
var targetTags : String[];
var targets : Transform[];
@Header("---------------------------")
var closestTarget : Transform;
var closestTargetDistance : float;
var getTargetTimer : Timer;
@Header("---------------------------")
var rotationCurve : AnimationCurve;
var rotationPivotOffset : Vector3;
var heightCurve : AnimationCurve;
@Header("---------------------------")
var alphaColorGroups : AlphaColorGroups;
var animationComponent : Animation;
var idleAnimation : AnimationClip;
var frames : HoleWHandsFrame[];
@Header("--------Audio-------------")
var audioWhoosh : AudioSource[];
var killAudio : AudioSource;
var killList : Array;
var killDistance : float = 1.0;
var currentHoleDistance : float;
var holeRelativePos : Vector3;

@Space(20)
var debug : boolean;



class HoleWHandsFrame{
	var arm : int;
	var normalizedTime : Vector2;
	var frame : int;
	var playSound : boolean;
}

function Start () {
	 GetTargets();
	 alphaColorGroups = GetComponentInChildren.<AlphaColorGroups>();
	 animationComponent = GetComponent.<Animation>();
	 killList = new Array();
	 if(getTargetTimer.every == 0.0){
	 	getTargetTimer.every = 2.0;
	 }
}

function LateUpdate () {
	getTargetTimer.Update();
	if(getTargetTimer.current){
		GetTargets();
	}
	//Get closest target character.
	for(var i = 0; i < targets.Length; i++){
		if(closestTarget == null){
			closestTarget = targets[i];
			closestTargetDistance = Vector3.Distance(transform.position, closestTarget.position);
			continue;
		}
		else{
			if(Vector3.Distance(targets[i].position, transform.position) < closestTargetDistance){
				closestTarget = targets[i];
			}
		}
	}
	if(closestTarget != null){
		closestTargetDistance = Vector3.Distance(transform.position, closestTarget.position);
	
		//Hands reach to character.
		
		for(var n = 0; n < arms.Length; n++){
			var deltaPos : Vector3 = closestTarget.position - arms[n].position;
			arms[n].position.y += heightCurve.Evaluate(deltaPos.y);
			arms[n].RotateAround(arms[n].position + rotationPivotOffset, Vector3.forward, rotationCurve.Evaluate(deltaPos.x));
		}
		
		if(debug){
			DebugUtility.DrawArrow(transform.position, closestTarget.position - transform.position, Color.cyan);
		}
	
	}
	
	//Hands open & close anim
	var nTime : float = animationComponent[idleAnimation.name].normalizedTime % 1.0;
	for(var m = 0; m < frames.Length; m++){
		if(nTime > frames[m].normalizedTime.x && nTime < frames[m].normalizedTime.y){
			if(alphaColorGroups.alphaFrameGroups[frames[m].arm].currentFrame != frames[m].frame){
				alphaColorGroups.alphaFrameGroups[frames[m].arm].currentFrame = frames[m].frame;
				if(frames[m].playSound){
					audioWhoosh[Random.value * audioWhoosh.Length].Play();
				}
			}
		} 		
	}
	
	//Kill Sound
	if(closestTarget != null){
		currentHoleDistance = Vector3.Distance(closestTarget.position, transform.position + holeRelativePos);
		if(currentHoleDistance < killDistance){
			var playKillSound : boolean = true;
			for(var w = 0; w < killList.length; w++){
				var thisTransform : Transform = killList[w];
				if(thisTransform == closestTarget){
					playKillSound = false;
					break;
				}
			}
			if(playKillSound){
				if(killAudio != null){
					killAudio.Play();
				}
				killList.Push(closestTarget);
			}
		}
	}
}

function GetTargets(){
	var targetsArray = new Array();
	for(var  i = 0; i < targetTags.Length; i++){
		var thisTagGameObjects : GameObject[] = GameObject.FindGameObjectsWithTag(targetTags[i]);
		for(var n = 0; n < thisTagGameObjects.Length; n++){
			if(thisTagGameObjects[n].transform.parent == null){
				targetsArray.Push(thisTagGameObjects[n].transform);
			}
		}
	}
	targets = targetsArray.ToBuiltin(Transform) as Transform[];
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawPoint(transform.position + holeRelativePos, .5);
	DebugUtility.DrawCircle(transform.position + holeRelativePos, killDistance, Vector3.forward);
	#endif
}