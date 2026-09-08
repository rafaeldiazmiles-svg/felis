#pragma strict

var tiedAnim : AnimationClip;
var untieAnim : AnimationClip;

var untied : ToggleBoolean;

var catAnimComp : Animation;
var catTiedAnim : AnimationClip;

var untieWeightControl : FloatLerp;
var untieTimeControl : FloatMoveTowards;

var catTag : String = "Cat";

var anim : Animation;

var col : Collider;
var rb : Rigidbody;

function GetCat(){
	var cats : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
	var closestCat : GameObject = FindUtility.GetClosest(transform.position, cats);
	if(closestCat != null){
		catAnimComp = closestCat.GetComponent.<Animation>();
	}
}

function Start () {
	anim = GetComponent.<Animation>();
	col = GetComponent.<Collider>();
	rb = GetComponent.<Rigidbody>();
	
	anim[tiedAnim.name].enabled = true;
	anim[tiedAnim.name].weight = 1.0;
	
	col.enabled = false;
	rb.useGravity = false;
}

function LateUpdate () {
	if(catAnimComp == null){
		GetCat();
	}
	if(catAnimComp == null) return;
	
	untied.Update();
	untieWeightControl.Lerp();
	untieTimeControl.MoveTowards();
	anim[untieAnim.name].weight = untieWeightControl.current;
	anim[untieAnim.name].time = untieTimeControl.current;
	anim[tiedAnim.name].weight = 1 - untieWeightControl.current;
	anim[tiedAnim.name].enabled = true;
	
	if(anim[tiedAnim.name].weight < .1){	
		anim[tiedAnim.name].enabled = false;
	}

	if(!untied.current){
		anim[tiedAnim.name].normalizedTime = catAnimComp[catTiedAnim.name].normalizedTime;
	}
	
	if(untied.toggledTrue){
		anim[untieAnim.name].enabled = true;
		anim[untieAnim.name].layer = 2;
		untieWeightControl.target = 1.0;
		untieTimeControl.target = anim[untieAnim.name].length;
		col.enabled = true;
		rb.useGravity = true;		
	}
	
	
}