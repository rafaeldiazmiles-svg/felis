#pragma strict

var pAnim : PlayStillAnimation;

var playDelayed : boolean;

var playNow : boolean;

function Start () {
	if(pAnim != null){
		pAnim.playDelayed.current = playDelayed;
		pAnim.animationPlay.current = playNow;
	}
}

function Update () {

}