#pragma strict

var autoFindComponents : boolean = true;
var characterAnimation : Animation;

static var left = -1;
static var right = 1;

var idleAnimation : AnimationClip;
var almostFallAnimation : AnimationClip;

static var blendTime : float = .1;


private var almostFallAnimationWeight : FloatSmoothDamp;


private var idleRandomize : float;

var useFrameGroups : boolean;
var frameGroups : UVFrameGroups;

var lookUp : LookUp;

var cancelAnimations : boolean;
@Space(30)
var secondary : AnimSecondary;

function Start () {
	if(autoFindComponents){
		characterAnimation = GetComponentInChildren(Animation);
		lookUp =  GetComponentInChildren(LookUp);
	
		if(transform.parent != null){
			if(characterAnimation == null) characterAnimation = transform.parent.gameObject.GetComponentInChildren(Animation);
			if(lookUp == null) lookUp = transform.parent.GetComponentInChildren(LookUp);
			if(secondary == null) secondary = transform.parent.GetComponentInChildren(AnimSecondary);

		}
	}
	
	characterAnimation[idleAnimation.name].enabled = true;
	
	
	if(almostFallAnimation != null) characterAnimation[almostFallAnimation.name].enabled = true;

	if(almostFallAnimation != null){
		almostFallAnimationWeight = new FloatSmoothDamp();
		almostFallAnimationWeight.time = blendTime;
	}
	
	idleRandomize = Random.value;
}


function Update () {
	if(secondary != null){
		var secondaryBlend : float = secondary.blend.current;
	}

	characterAnimation[idleAnimation.name].enabled = true;
	if(almostFallAnimation != null) characterAnimation[almostFallAnimation.name].enabled = true;
	
	if(useFrameGroups){
		frameGroups.SetFrame("Eyes", "Open");
		frameGroups.SetFrame("Mouth", "Closed");
	}
	
	if(characterAnimation != null){
		characterAnimation[idleAnimation.name].enabled = true;
		if(almostFallAnimation != null) characterAnimation[almostFallAnimation.name].enabled = true;
		
		characterAnimation[idleAnimation.name].time = Time.time * (1.0 + (idleRandomize*.1)) + idleRandomize;
		var idleWeight : float;
		if(lookUp == null){
			idleWeight = 1.0 - secondaryBlend;
		}
		else{
			idleWeight = 1 - characterAnimation[lookUp.lookUpAnimationClip.name].weight - secondaryBlend;
		}
		characterAnimation[idleAnimation.name].weight = idleWeight;
		characterAnimation[idleAnimation.name].enabled = idleWeight > .05;

		//characterAnimation[idleAnimation.name].weight = 1.0;
		
		if(cancelAnimations){
			if(idleAnimation != null) characterAnimation[idleAnimation.name].weight = 0.0;
			if(almostFallAnimation != null) characterAnimation[almostFallAnimation.name].weight = 0.0;
		}
	}
}

function SetAnimComp(newAnimComp : Animation){
	characterAnimation = newAnimComp;
}

function IsAlmostFalling() : boolean{
	if(almostFallAnimation != null && almostFallAnimationWeight.current  > .1) return true;
	else return false;
}

/*function OnGUI(){
	if(transform.name == "Prospero Castle Tower"){
		var guiStyle = new GUIStyle();
		
		
		for(var state : AnimationState in animation){
			
			guiStyle.normal.textColor = Color(state.weight,0,1-state.weight);
			
			GUILayout.Label(state.name + " " + state.weight, guiStyle);
		}
	}
}*/