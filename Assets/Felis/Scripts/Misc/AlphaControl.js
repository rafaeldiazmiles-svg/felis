#pragma strict

var mainAlpha : float;
var viewed : boolean;
@Space(20)
var cAnims : AlphaControl_ColorAnimation[];

var glows : GlowItem[];

var rends : Renderer[];

var rendsArray : Array;

var audioMainMultiply : float = 1.0;
var audioSources : AudioSource[];

@Space(40)
var animate : boolean;
var curve : AnimationCurve;
var startTime : float;
var dontSetStartTimeOnStart : boolean;
var playAgain : boolean;
var animSpeed : float = 1.0;

@Space(20)
var dontControlOutsideAnimation : boolean;
var dontControl : boolean;

@Space(40)
var useBounds : boolean;
var bounds : Bounds;
var delay : float;
var delay_TimeLeft : float;
var boundsCenter : Transform;
var inBounds : ToggleBoolean;
var checkTag : String = "Player";
var getTimer : Timer;
var checkObj : GameObject;
var lerpAlpha : FloatLerp;
@Space(20)
var boundsTimeLimit : float; //0 for no time limit
var timeOut : boolean;
@Space(20)
var viewOnlyOnce : boolean;
var destroyNow : boolean;
@Space(20)
var needsActivate : boolean;;
var activated : boolean;
var activateBounds : Bounds;
@Space(20)
var doorActivate : OpenDoor;
var activateWhen : DoorState;

enum DoorState{Open, Close}
@Space(20)
var triggerActivate : Trigger;
var activateWhen_Trigger : TriggerState;

enum TriggerState{On, Off}

@Space(20)
var boundsRequire_Ride : boolean;
var boundsRequire_NotRide: boolean;
var ride : Ride;

@Space(20)
var forceHideFirstFrame : boolean;
var unHide : boolean;

@Space(20)
var noEnemyBounds : Bounds;
var enemies : GameObject[];
var enemyTag : String = "Enemy";
var enemyFound : boolean;

function GetObj(){
	checkObj = GameObject.FindWithTag(checkTag);
	if((boundsRequire_Ride ||  boundsRequire_NotRide) && checkObj != null){
		ride = checkObj.GetComponentInChildren.<Ride>();
	}
}


class AlphaControl_ColorAnimation{
	var defColor : Color;

	var cAnim : ColorAnimation;
}

function PlayAgain(){
	startTime = Time.time;

	for(var i = 0; i < cAnims.Length; i++){
		cAnims[i].cAnim.startTime = Time.time;
	}

	mainAlpha = curve.Evaluate(0.0);

	if(rendsArray != null){
		for(var m = 0; m < rendsArray.length; m++){
			var thisRend : Renderer = rendsArray[m];
			thisRend.enabled = true;
			thisRend.material.color.a = mainAlpha;
		}
	}
}

function Awake(){
	if(forceHideFirstFrame){
		for(var i = 0; i < rends.Length; i++){
			rends[i].enabled = false;
		}
		for(i = 0; i < cAnims.Length; i++){
			if(cAnims[i].cAnim.rend == null){
				cAnims[i].cAnim.GetRend();
			}
			cAnims[i].cAnim.rend.enabled = false;
		}
	}	
}

function Start () {
	for(var i = 0; i < cAnims.Length; i++){
		cAnims[i].defColor = cAnims[i].cAnim.multiplyColor;
	}

	for(var n = 0; n < glows.Length; n++){
		glows[n].manualFade = true;
	}

	if(!dontSetStartTimeOnStart){
		startTime = Time.time;
	}

	if(checkObj == null){
		GetObj();
	}

	if(getTimer.every == 0.0){
		getTimer.every = 1.0;
	}

	if(lerpAlpha.speed == 0.0){
		lerpAlpha.speed = 5.0;
	}

	delay_TimeLeft = delay;


}

function GetRend(newRend : Renderer){
	if(rendsArray == null){
		rendsArray = new Array();
	}
	rendsArray.Add(newRend);
}

function Update (){
	if(unHide){
		unHide = false;
		for(var i = 0; i < rends.Length; i++){
			rends[i].enabled = true;
		}

		for(i = 0; i < cAnims.Length; i++){
			cAnims[i].cAnim.rend.enabled = true;
		}		
	}

	if(forceHideFirstFrame){
		unHide = true;
		forceHideFirstFrame = false;
	}

	getTimer.Update();
	if(getTimer.current){
		if(checkObj == null || (boundsRequire_Ride || boundsRequire_NotRide) && ride == null){
			GetObj();
		}
	}

	if(playAgain){
		playAgain = false;
		startTime = Time.time;
	}

	var subCenter : Vector3;
	if(boundsCenter != null){
		subCenter = boundsCenter.position;
	}

	if(activated || !needsActivate){
		if(animate){
			mainAlpha = curve.Evaluate((Time.time - startTime) * animSpeed);
		}

		if(useBounds){
			if(checkObj != null){
				//inBounds.current = bounds.Contains(checkObj.transform.position - subCenter);
				var boundsCheck : boolean;
				boundsCheck = bounds.Contains(checkObj.transform.position - subCenter);

				if(boundsRequire_Ride && ride != null && !ride.ride.current){
					//inBounds.current = false;
					boundsCheck = false;
				}
				if(boundsRequire_NotRide && ride != null && ride.ride.current){
					boundsCheck = false;
				}

				if(boundsCheck && !enemyFound){
					delay_TimeLeft -= Time.deltaTime;
				}
				else{
					delay_TimeLeft = delay;
				}
				inBounds.current = delay_TimeLeft < 0;
			}

			inBounds.Update();

			if(inBounds.current && !timeOut){
				lerpAlpha.target = 1.0;

			}
			else{
				lerpAlpha.target = 0.0;
			}

			//If there is alpha animation, multiply lerp alpha by animated mainAlpha
			if(!animate){
				mainAlpha = lerpAlpha.current;
			}
			else{
				mainAlpha *= lerpAlpha.current;
			}

			if(boundsTimeLimit > 0 && inBounds.current && Time.time > inBounds.toggledTrueTime + boundsTimeLimit){
				timeOut = true;
			}
			if( inBounds.toggledFalse ){
				timeOut = false;
			}

			if(viewed){
				if(viewOnlyOnce  && inBounds.toggledFalse){
					destroyNow = true;
				}
			}
		}
	}

	enemyFound = false;

	if(noEnemyBounds.size.x > 0){
		if(getTimer.current){
			GetEnemies();
		}

		if(enemies != null){
			for(i = 0; i < enemies.Length; i++){
				if(enemies[i] == null){
					continue;
				}
				if(noEnemyBounds.Contains(enemies[i].transform.position - subCenter)){
					//if(enemies[i].health > 0){
						lerpAlpha.target = 0.0;
						enemyFound = true;
						break;
					//}
				}
			}
		}
	}

	lerpAlpha.Lerp();



	if(needsActivate){

		if(!activated){
			mainAlpha = 0.0;
		}

		if(checkObj != null && activateBounds.Contains(checkObj.transform.position - subCenter)){
			activated = true;
		}
	}

	if(doorActivate != null){
		if(activateWhen == DoorState.Open){
			if(!doorActivate.alreadyOpened){
				mainAlpha = 0.0;
			}
		}

		if(activateWhen == DoorState.Close){
			if(doorActivate.alreadyOpened){
				mainAlpha = 0.0;
			}
		}
	}

	if(triggerActivate != null){
		if(activateWhen_Trigger == TriggerState.On){
			if(!triggerActivate.stepped.current){
				mainAlpha = 0.0;
			}
		}

		if(activateWhen_Trigger == TriggerState.Off){
			if(triggerActivate.stepped.current){
				mainAlpha = 0.0;
			}
		}
	}

	if(destroyNow && mainAlpha < .1){
		Destroy(gameObject);
	}



	////////////// VIEW //////////////////

	if(mainAlpha > .9){
		viewed = true;
	}

	dontControl = false;
	if(animate && dontControlOutsideAnimation){
		if(Time.time > startTime + curve.keys[curve.keys.Length - 1].time){
			dontControl = true;
		}
	}

	if(!dontControl){
		for(i = 0; i < cAnims.Length; i++){
			cAnims[i].cAnim.multiplyColor = Color.Lerp(cAnims[i].defColor * Color(1,1,1,0), cAnims[i].defColor, mainAlpha);
		}

		for(var n = 0; n < glows.Length; n++){
			glows[n].color = Color.Lerp(glows[n].startColor * Color(1,1,1,0), glows[n].startColor, mainAlpha);
		}

		for(var m = 0; m < rends.Length; m++){
			if(rends[m] == null){
				continue;
			}
			rends[m].material.color.a = mainAlpha;
		}

		if(rendsArray != null){
			for(m = 0; m < rendsArray.length; m++){
				var thisRend : Renderer = rendsArray[m];
				thisRend.material.color.a = mainAlpha;
			}
		}

		for(var a = 0; a < audioSources.Length; a++){
			audioSources[a].volume = mainAlpha * audioMainMultiply;
		}
	}
}

function GetEnemies(){
	/*var enemyObjs : GameObject[] = GameObject.FindGameObjectsWithTag(enemyTag);
	var enemiesArray : Array = new Array();
	for(var i = 0; i < enemyObjs.Length; i++){
		if(enemyObjs[i].transform.parent != null){
			//var enemyHealth : Health = enemyObjs[i].transform.parent.GetComponentInChildren.<Health>();
			//if(enemyHealth != null){
				enemiesArray.Add(enemyHealth);
			//}
		}
	}
	enemies = enemiesArray.ToBuiltin(GameObject);*/

	enemies = GameObject.FindGameObjectsWithTag(enemyTag);
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.gray;
	var addCenter : Vector3;
	if(boundsCenter != null){
		addCenter = boundsCenter.position;
	}
	Gizmos.color = Color.red;
	Gizmos.DrawWireCube(noEnemyBounds.center + addCenter, noEnemyBounds.size);
	Gizmos.color = Color.yellow;
	Gizmos.DrawWireCube(bounds.center + addCenter, bounds.size);
	Gizmos.color = Color.cyan;
	Gizmos.DrawWireCube(activateBounds.center + addCenter, activateBounds.size);
	#endif
}