#pragma strict

var searchParent : boolean;
var searchTagString : String;
var searchByName : boolean;
@Space(15)
var targetIsParent : boolean = true;
@Space(15)
var target : Transform;
@Space(30)
var setRelativeVals : boolean = true;
var ignoreRelativePos : boolean;
var relativePosition : Vector3;
var globalOffset : Vector3;
var relativeForwardDir: Vector3;
var relativeUpdDir : Vector3;
var skipRotation : boolean;
var dirScaleX : boolean;
var dir : int;
var maintainDir : boolean;
var invertDir : boolean;

@Space(30)
var justParent : boolean;
var setLocalVals : boolean;
var localPos : Vector3;
var localRot : Vector3;
var localScale : Vector3;

@Space(30)
var addPhysics : AddPhysics;

@Space(30)
var holdUntilHasTarget : boolean;
var hasTarget : ToggleBoolean;
var hold_AlphaControl : AlphaControl;
var holdAllTimedDestroys : boolean = true;
var unHold_playTriggerAnims : boolean = true;
var startTime : float;
var hold_DestroyIfFail : boolean;
var hold_DestroyIfFailDuration : float = 2.0;

function Awake(){
	if(holdUntilHasTarget){
		Hold(true);
	}	
}

function Start () {
	startTime = Time.time;
	
	if(searchParent && target == null){
		var targetObj : GameObject;
		if(!searchByName){
			targetObj = GameObject.FindGameObjectWithTag(searchTagString);
		}
		else{
			targetObj = GameObject.Find(searchTagString);
		}

		if(targetObj != null){
			target = targetObj.transform;
		}
	}

	if(target == null && targetIsParent){
		target = transform.parent;
	}
	if(target != null && setRelativeVals){
		SetRelativeVals();
		setRelativeVals = false;
	}
	
	addPhysics = GetComponent.<AddPhysics>();

}

function Hold(hold : boolean){
	var rends : Renderer[] = GetComponentsInChildren.<Renderer>();
	if(rends != null){
		for(var i = 0; i < rends.Length; i++){
			rends[i].enabled = !hold;
		}
	}

	if(hold_AlphaControl != null){
		if(hold){
			hold_AlphaControl.mainAlpha = 0.0;
			hold_AlphaControl.animate = false;
		}
		else{
			hold_AlphaControl.animate = true;
			hold_AlphaControl.startTime = Time.time;
		}

	}

	if(holdAllTimedDestroys){
		var allTD : TimedDestroy[] = GetComponentsInChildren.<TimedDestroy>();
		for(i = 0; i < allTD.Length; i++){
			if(hold){
				allTD[i].activate = false;
				allTD[i].currentlyActive = false;
			}
			else{
				allTD[i].Reset();
			}
		}
	}

	if(unHold_playTriggerAnims){
		if(!hold){
			var anims : TriggerAnimation[] = GetComponentsInChildren.<TriggerAnimation>();
			for(i = 0; i < anims.Length; i++){
				anims[i].play = true;
			}
		}
	}
}


function SetRelativeVals(){
		if(!ignoreRelativePos){
			relativePosition = target.InverseTransformPoint(transform.position);
		}
		relativeForwardDir = target.InverseTransformDirection(transform.forward);
		relativeUpdDir = target.InverseTransformDirection(transform.up);
}

function LateUpdate () {
	if(setRelativeVals && target != null){
		SetRelativeVals();
		setRelativeVals = false;
	}

	if(target != null){
		Apply(target);
	}

	if(holdUntilHasTarget){
		hasTarget.current = (target != null);
		hasTarget.Update();
		if(hasTarget.toggledTrue){
			Hold(false);
		}
	}

	if(hold_DestroyIfFail && Time.time > startTime + hold_DestroyIfFailDuration && target == null){
		Destroy(gameObject);
	}
}

function Apply(setTarget : Transform){
	target = setTarget;
	if(justParent){
		transform.parent = target;
		if(setLocalVals){
			transform.localPosition = localPos;
			transform.localEulerAngles = localRot;
			transform.localScale = localScale;
		}
		
		if(addPhysics != null){
			transform.parent = null;
			addPhysics.wScale = transform.localScale;
			transform.parent = target;
		}
		
		Destroy(this);
	}
	else{
		transform.position = target.TransformPoint(relativePosition);

		if(!skipRotation){
			var targetFW : Vector3 = target.TransformDirection(relativeForwardDir);
			var targetUP : Vector3 = target.TransformDirection(relativeUpdDir);

			transform.LookAt(transform.position + targetFW, targetUP);
		}

		//Dir
		var parent : Transform = target.parent;
		var scale : Vector3 = target.localScale;
		target.parent = null;
		if(maintainDir && dir == 0 || !maintainDir){
			dir = Mathf.Sign(target.localScale.x * target.localScale.y * target.localScale.z);
			if(invertDir){
				dir = -dir;
			}
		}
		target.parent = parent;
		target.localScale = scale;

		var useGlobalOffset : Vector3 = globalOffset; //global offset value here so we use dir value if dirScaleX is set to true
		if(dirScaleX){
			transform.localScale.x = Mathf.Abs(transform.localScale.x) * dir;
			useGlobalOffset.x = Mathf.Abs(useGlobalOffset.x) * -dir;
		}

		transform.position += useGlobalOffset;
	}

}	


function SetParent(newParent : Transform, setRelativeValues : boolean){
	target = newParent;
	
	if(setRelativeValues){
		if(!ignoreRelativePos){
			relativePosition = target.InverseTransformPoint(transform.position);
		}
		relativeForwardDir = target.InverseTransformDirection(transform.forward);
		relativeUpdDir = target.InverseTransformDirection(transform.up);
	}
}