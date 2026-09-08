#pragma strict

var anim : PlayAnimation;
var cAnim : ColorAnimation;

function Start () {

}

function Update () {
	if(anim.playAgain){
		cAnim.startTime = Time.time;
	}
}