#pragma strict

var flyAnimClip : AnimationClip;

var idleAnim : PlayLoopAnimation;
var flyAnim : PlayLoopAnimation;
var chirpAnim : PlayStillAnimation;

var flyTo : Transform;
var tDistance : float;
var animDeadZone : float = .05;

var flySpeed : float = 10.0;
var flyCurrentSpeed : FloatLerp;
var flySinSpeed : float = 2.0;
var flySinLenght : float = 5;
var moveDeadZone : float = .15;

var scare : boolean = true;
var scareDist : float = 2.0;
var scareTag : String = "Player";
var scareObj : GameObject;
var flyAway : boolean;
var flyAwayDir : float = 120;

var getTimer : Timer;

var attachTo : String;
var attachLocalOffset : Vector3;
var attachObj : GameObject;

var attachDirectly : boolean; //For later use, attach without creating attachObj with Offset

var prevXPos : float;
var sidesDeadZone : float = .2;

var chirpTimer : Timer;

var startPos : Vector3;
var destroyAfterTraveledDist : float = 50;

function FindScareObj(){
	scareObj = GameObject.FindGameObjectWithTag(scareTag);
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}
	
	if(chirpTimer.every == 0.0){
		chirpTimer.every = 4.0;
		chirpTimer.randomize = 2.0;
	}
	
	if(flyCurrentSpeed.speed == 0.0){
		flyCurrentSpeed.speed = 5.0;
	}

	startPos = transform.position;
	//idleAnim = GetComponentInChildren.<PlayLoopAnimation>();
}

function Update () {
	if((transform.position - startPos).magnitude > destroyAfterTraveledDist){
		Destroy(gameObject);
	}
	
	//Chirp
	if(chirpAnim != null){
		
		chirpTimer.Update();
		if(chirpTimer.current){
			if(tDistance < .1 || flyTo == null){
				if(flyAway == false){
						chirpAnim.animationPlay.current = true;
				}
			}
		}
		
		if(flyAway){
			chirpAnim.animationPlay.current = false;
		}
	}

	//Side
	/*var deltaPos : float = transform.position.x - prevXPos;
	prevXPos = transform.position.x;
	if(Mathf.Abs(deltaPos) > sidesDeadZone){
		transform.localScale.x = Mathf.Abs(transform.localScale.x) * -Mathf.Sign(deltaPos);
	}*/

	//Land on something (e.g. a boat)
	getTimer.Update();
	if(getTimer.current){
		if(scare && scareObj == null){
			FindScareObj();
		}
		
		if(attachTo != "" && attachObj == null){
			TryToAttach();
		}
	}
	
	if(scare && scareObj != null){
		var sObjDist : float = Vector3.Distance(transform.position, scareObj.transform.position);
		if(sObjDist < scareDist){
			flyAway = true;
		}
	}
	
	if(flyTo != null){
		tDistance = Vector3.Distance(transform.position, flyTo.position);
	}

	flyCurrentSpeed.Lerp();

	if(tDistance > moveDeadZone || flyAway){
		flyCurrentSpeed.target = flySpeed;
	}
	else{
		flyCurrentSpeed.target = 0;
	}

	
	if(flyAway){
		transform.position.x += (Mathf.Cos(flyAwayDir * Mathf.Deg2Rad)) * flyCurrentSpeed.current * Time.deltaTime;
		transform.position.y += (Mathf.Sin(flyAwayDir * Mathf.Deg2Rad)) * flyCurrentSpeed.current * Time.deltaTime;
		AddSinWave();
		
		PlayFlyAnim();
	}	
	else{
		if(flyTo != null){
			transform.position = Vector3.MoveTowards(transform.position, flyTo.position, Time.deltaTime * flyCurrentSpeed.current);
			AddSinWave();
		}
		
		if(tDistance < animDeadZone || flyTo == null){
			PlayIdleAnim();
		}
		else{
			PlayFlyAnim();
		}
	}

}

function AddSinWave(){
	//transform.position.y += Mathf.Sin(Time.time * flySinSpeed) * flySinLenght * Time.deltaTime;
	flyAwayDir += Mathf.Sin(Time.time * flySinSpeed) * flySinLenght * Time.deltaTime; 
}

function TryToAttach(){
	var findAttachObj : GameObject = GameObject.Find(attachTo);
	if(findAttachObj != null){
		attachObj = new GameObject(findAttachObj.name + " Attach Object");
		attachObj.transform.parent = findAttachObj.transform;
		attachObj.transform.localPosition = attachLocalOffset;
		flyTo = attachObj.transform;
	}	
}

function PlayIdleAnim(){
	if(idleAnim != null && flyAnim != null){
		idleAnim.animationPlay.current = true;
		flyAnim.animationPlay.current = false;
	}
}

function PlayFlyAnim(){
	if(idleAnim != null && flyAnim != null){
		idleAnim.animationPlay.current = false;
		flyAnim.animationPlay.current = true;
	}
}

