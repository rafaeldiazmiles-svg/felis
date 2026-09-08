#pragma strict

var characterIsParent : boolean = true;
var character : Transform;

var scale : Vector3 = Vector3.one;
var useEditorScale : boolean = true;
var useAnimationScale : boolean;
var squashAmount : float = 0.0;
var maxSquash : float = .5;
var minSquash : float = -.5;

var controlScale : FloatSpring;

var testSpawnEffect : boolean;
var holdSpawnEffectUntil : float;

function SpawnScaleEffect(){
	controlScale.current = 0.0;
}

function SpawnScaleEffectHold(duration : float){
	holdSpawnEffectUntil = Time.time + duration;
}

function Start () {
	if(characterIsParent && transform.parent != null) character = transform.parent;
	else character = transform;
			
	if(useEditorScale) scale = character.localScale;

	if(controlScale.target == 0.0){
		controlScale.target = 1.0;
		controlScale.current = 1.0;
		controlScale.springForce = 1.0;
		controlScale.damp = 10.0;
	}
}

function Update(){

}

function LateUpdate () {
	if(testSpawnEffect){
		testSpawnEffect = false;
		SpawnScaleEffect();
	}

	if(useAnimationScale) scale = character.localScale;

	character.localScale = scale;

	squashAmount = Mathf.Clamp(squashAmount, minSquash, maxSquash);
	
	if(!float.IsNaN(squashAmount)){
		character.localScale.y -= squashAmount;
	}
	
	var inverseScale : float = scale.y/character.localScale.y;
	
	character.localScale.z *= inverseScale;
	character.localScale.x *= inverseScale;

	controlScale.Spring();

	if(Time.time < holdSpawnEffectUntil){
		controlScale.current = 0.0;
	}

	character.localScale *= controlScale.current;
}