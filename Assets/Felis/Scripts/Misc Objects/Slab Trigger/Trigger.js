#pragma strict

var playAnim : PlayAnimation;
var shake : Shakiness;

var stepTime : float;

var stepped : ToggleBoolean;
var stepDelay : float = .3;
var stepping : boolean;

var bounds : Bounds;

var useTags : boolean = true;
var tagList : String[];
var stepTransforms : Transform[];
var stepT_useEditorList : boolean;

var fallingWeightTag : String = "Falling Weight";
var enableRBGravity : Rigidbody[];
var setTriggerObjectVelocity : Vector3 = Vector3(0,-2,0);

var slabSound : AudioSource;

var enableUnstep : boolean;

var getCharsTimer : Timer;

var debug : boolean;

function Start () {
	playAnim = GetComponent.<PlayAnimation>();
	shake = GetComponent.<Shakiness>();
	
	if(useTags){
		GetStepTransforms();
	}
}

function GetStepTransforms(){
	var stepTransformsArray = new Array();
	for(var i = 0; i < tagList.Length; i++){
		var tagListObjs : GameObject[] = GameObject.FindGameObjectsWithTag(tagList[i]);
		for(var n = 0; n < tagListObjs.Length; n++){
			stepTransformsArray.Push(tagListObjs[n].transform);
		}
	}
	stepTransforms = stepTransformsArray.ToBuiltin(Transform) as Transform[];	
}

function Update () {
	getCharsTimer.Update();
	if(getCharsTimer.current){
		if(!	stepT_useEditorList){
			GetStepTransforms();
		}
	}

	stepped.Update();
	
	bounds.center = transform.position;
	stepping = false;
	for(var i = 0; i < stepTransforms.Length; i++){
		if(stepTransforms[i] == null) continue;
		if(bounds.Contains(stepTransforms[i].position)){
			stepping = true;
		}
	}
	if(stepping){
		stepTime += Time.deltaTime;
	}
	else{
		stepTime = Mathf.MoveTowards(stepTime, 0.0, Time.deltaTime);
	}
	
	if(!stepped.current && stepTime > stepDelay && stepping){
		//playAnim.playAgain = true;
		stepped.current = true;
		stepTime = 0.0;
		if(enableRBGravity != null){
			for(var rbID : int = 0; rbID < enableRBGravity.Length; rbID++){
				if(enableRBGravity[rbID] == null) continue;
				enableRBGravity[rbID].useGravity = true;
				enableRBGravity[rbID].velocity = setTriggerObjectVelocity;
				var objRenderer : Renderer = enableRBGravity[rbID].GetComponentInChildren(Renderer);
				if(objRenderer != null) objRenderer.enabled = true;
			}
		}
	}
	
	if(stepped.current && enableUnstep && !stepping){
		stepped.current = false;
		//playAnim.PlaySecondary(0);
		stepTime = 0.0;
		
	}

	if(playAnim != null){
		if(stepped.current){
			
			playAnim.Set(Mathf.Min(1.0,Time.time - stepped.toggledTrueTime), true);
		}
		if(!stepped.current){
			playAnim.SetSecondary(0, Mathf.Min(1.0,Time.time - stepped.toggledFalseTime), true);
		} 
	}
	
	if(stepped.toggledTrue){
		if(slabSound != null){
			slabSound.Play();
		}
	}
	
	if(stepped.toggledFalse){
		if(slabSound != null){
			slabSound.Play();
		}
	}
	
	if(shake != null){
		if(!stepped.current){
			shake.multiplier = stepTime;
		}
		else{
			shake.multiplier = 0.0;
		}
		if(stepTime == 0.0 || stepped.current){
			shake.enabled = false;
		}
		else{
			shake.enabled = true;
		}
	}
}

function OnCollisionStay(collision : Collision){
	stepTime += Time.deltaTime;
}

function LinkToFallingWeight(){
	var fWeights : GameObject[] = GameObject.FindGameObjectsWithTag(fallingWeightTag);
	var closest : GameObject;
	var closestDist : float = Mathf.Infinity;
	for(var i = 0; i < fWeights.Length; i++){
		var thisDist : float = Vector3.Distance(transform.position, fWeights[i].transform.position);
		if(thisDist < closestDist){
			closest = fWeights[i];
			closestDist = thisDist;
		}
	}
	if(closest != null){
		var rb : Rigidbody = closest.GetComponentInChildren.<Rigidbody>();
		if( rb != null){
			enableRBGravity = new Rigidbody[1];
			enableRBGravity[0] = rb;
		}
		var trigger : BoundsTriggerGravity = closest.GetComponentInChildren.<BoundsTriggerGravity>();
		if(trigger != null){
			trigger.active = false;
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.white;
		Gizmos.DrawWireCube(transform.position, bounds.size);
		if(enableRBGravity != null){
			for(var rbID : int = 0; rbID < enableRBGravity.Length; rbID++){
				if(enableRBGravity[rbID] == null) continue;
				DebugUtility.DrawArrow(transform.position, enableRBGravity[rbID].position - transform.position, Color.cyan);
			}
		}
	}
	
	#endif
}