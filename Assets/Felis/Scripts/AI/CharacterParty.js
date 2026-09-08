#pragma strict

var partyAnimation : PlayLoopAnimation;
var frameGroups : UVFrameGroups;
var isGrounded : IsGrounded;
var jumpSwim : JumpSwim;
var movementAI : MovementAI;
var controller : ControllerInput;
@Space(30)
var partying : ToggleBoolean;
@Space(30)
var patrol : PatrolAI;
var patrolStayTime : Vector2;
@Space(30)
var partyRange : float = 3.0;
var jumpEvery : float;
@Space(30)
var safeCheckEvery : float = 1.0;
var safeCheckTime : float;
@Space(30)
var partyDuration : float = 1.5;
var charSaved : ToggleBoolean;
@Space(30)
var thanksBaloon : GameObject;
var thanksBaloonTimer : Timer;
@Space(30)
var usePartyTimer : boolean;
var partyTimer : Timer;
var partyTimer_Every : float = 5.0;
var partyTimer_Randomize : float = 8.0;

function PartyTimer(){
	partyTimer.every = partyTimer_Every;
	partyTimer.randomize = partyTimer_Randomize;
	partyTimer.next = Time.time + Random.value * partyTimer_Randomize;
	usePartyTimer = true;
}

function Start () {
	if(transform.parent != null){
		isGrounded = transform.parent.GetComponentInChildren(IsGrounded);
		patrol = transform.parent.GetComponentInChildren(PatrolAI);
		frameGroups = transform.parent.GetComponentInChildren.<UVFrameGroups>();
	}

	if(thanksBaloon == null){
		thanksBaloon = Resources.Load("Prefabs/GUI/Baloons/For Cat/Thanks Baloon_Cat", GameObject);	
	}

	if(thanksBaloonTimer.every == 0.0){
		thanksBaloonTimer.every = 2.0;
	}
}

function Update () {
	if(usePartyTimer){
		partyTimer.Update();
		if(partyTimer.current){
			partying.current = true;
		}
	}

	if(charSaved.toggledTrue){
		partying.current = true;
	}

	charSaved.Update();
	partying.Update();

	if(Time.time > partying.toggledTrueTime + partyDuration){
		partying.current = false;
		charSaved.current = false;
	}
	
	if(partying.toggledTrue){
		partyAnimation.animationPlay.current = true;
		patrol.enablePatrol = true;
		patrol.stayTime = patrolStayTime;
		
		patrol.points = new Vector3[2];
		patrol.points[0] = transform.position + Vector3(-partyRange*.5,0,0);
		patrol.points[1] = transform.position + Vector3(partyRange*.5,0,0);
		
		movementAI.enableMovement = true;
	}
	
	if(partying.toggledFalse){
		partyAnimation.animationPlay.current = false;
		patrol.enablePatrol = false;

		if(frameGroups != null){
			frameGroups.SetFrame("Mouth", "Normal");
		}
	}

	thanksBaloonTimer.Update();

	if(partying.current){
		if(frameGroups != null){
			frameGroups.SetFrame("Mouth", "Happy");
		}

		if(thanksBaloon != null && thanksBaloonTimer.current){
			var newThanksBaloon : GameObject = GameObject.Instantiate(thanksBaloon);
			newThanksBaloon.transform.position = transform.position;
			var propAttach : PropAttach = newThanksBaloon.GetComponent.<PropAttach>();
			propAttach.FindBoneForChar(transform);
		}
	}
	
	if(partying.current){
		if(isGrounded.isGrounded && Time.time % jumpEvery < 0.1){
			controller.inputButtonB.pressed = true;
		}
		else{
			controller.inputButtonB.pressed = false;
		}
	}
	
	if(Time.time > safeCheckTime && !charSaved.current){
		if(!partying.current) partyAnimation.animationPlay.current = false;
		safeCheckTime = Time.time + safeCheckEvery;
	}
}