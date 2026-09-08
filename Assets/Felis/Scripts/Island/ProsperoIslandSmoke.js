#pragma strict

var prefGen : PrefabGenerator;
var prospero : Transform;
var scaleMultiplier : float = 1.0;
var animComp : Animation;
//var moveAnim : AnimationClip;
var pIsland : ProsperoIsland;

function Start () {
	prefGen = GetComponent(PrefabGenerator);
	prospero = GameObject.FindGameObjectWithTag("Player").transform;
	animComp = prospero.GetComponent.<Animation>();
	pIsland = prospero.GetComponent.<ProsperoIsland>();
}

function Update () {
    if(animComp[pIsland.runAnimationClip.name].weight > .5){
        prefGen.enabled = true;
    }
    else{
        prefGen.enabled = false;
    }
	
	prefGen.scale = prospero.localScale * scaleMultiplier;
}