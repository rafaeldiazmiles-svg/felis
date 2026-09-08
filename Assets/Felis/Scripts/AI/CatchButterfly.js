#pragma strict

var butterflyList : Transform[];
var changeButterFly : Timer;

var currentB : int;

var movAI : MovementAI;

var catchAnim : PlayStillAnimation;

var catchRange : float = .4;

function Start () {
	movAI = transform.parent.GetComponentInChildren.<MovementAI>();

	NewTgt();

	if(catchAnim == null){
		catchAnim = GetComponent.<PlayStillAnimation>();
	}
}

function Update () {
	changeButterFly.Update();

	if(changeButterFly.current){
		NewTgt();
	}

	if(Mathf.Abs(movAI.moveVector) < catchRange && !catchAnim.animationPlay.current){
		catchAnim.animationPlay.current = true;
	}
}

function NewTgt(){
	currentB = Mathf.FloorToInt(Random.value * butterflyList.Length);
	movAI.target = butterflyList[currentB];
}