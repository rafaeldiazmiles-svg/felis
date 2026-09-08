#pragma strict

var animComp : Animation;

var clipA : AnimationClip;
var clipB : AnimationClip;

var weight : float;

function Start () {
	animComp[clipA.name].enabled = true;
	animComp[clipB.name].enabled = true;
}

function Update () {
	weight = Mathf.Clamp01(weight);


	animComp[clipA.name].weight = weight;
	animComp[clipB.name].weight = 1 - weight;

}