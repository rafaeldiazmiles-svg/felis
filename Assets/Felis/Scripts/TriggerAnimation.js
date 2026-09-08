#pragma strict

var animComp : Animation;
var animationClip : AnimationClip;
@Space(20)
var play : boolean;
var speed : float = 1.0;
var reverse : boolean;
var disableOtherAnimsOnPlay : boolean;
var nTime : float;
@Space(20)
var alwaysPlay : boolean;
@Space(10)
var playDelated : boolean;
var playDelatedAlways: boolean;
var delay : float = 1.0;
@Space(10)
var useTimer : boolean;
var playTimer : Timer;
var timer_NextPlayDeletesObject : GameObject;
@Space(20)
var playSound : AudioSource;
var soundSequence : SoundSequence[];
@Space(20)
var playedTime : float;
var played : boolean;
var useKey : KeyCode;
@Space(20)
var mixingTransform : Transform;
var mixingTransformSelect : Transform[];
@Space(30)
var endAnimTrigger : AnimationClip;
var endAnimSpeed : float = 1.0;
@Space(30)
var triggerAlphaControl : AlphaControl;
@Space(20)
var triggerOtherAnim : TriggerAnimation[];
@Space(20)
var triggerUVAnim : FaceAnim;
var animID : int;
@Space(20)
var disableAfterAnim : boolean;
var disableDelay : float = 3.0;
var lockDelayedPlay : boolean;
@Space(20)
var triggerPauseOverlay : boolean;
var overlayTgtSet : float;
var pauseObj : Pause;
var triggerPauseOverlay_Delay : float;
@Space(20)
var sendMsg : TrigggerAnim_SendMsg[];
@Space(20)
var condition_Underwater : UnderWater;
var condition_Underwater_TimeLeft : float;
var condition_Underwater_Delay : float = 1.0;
@Space(20)
var triggerSetCols : TriggerAnim_SetCol[];

@Space(20)
var unPauseStoreNTime : boolean;

@Space(20)
var offsetFramesAnim_Reset : OffsetFramesAnim[];

@Space(20)
var restoringNTime : boolean;
//var temp : boolean;

function RestoreNTime(){
	restoringNTime = true;

	yield;
	animComp[animationClip.name].normalizedTime = nTime;
	restoringNTime = false;
	//if(temp) Debug.Log(">>>>>>>>>>>>>>>>>>>>>>>>> RESTORED Normalized Time: " + nTime + " animComp: " + animComp.enabled);
}

function FixedUpdate(){
	if(unPauseStoreNTime){
		if(pauseObj.unStoppedThisFrame){
			//animComp[animationClip.name].normalizedTime = nTime;
			RestoreNTime();
			//if(temp) Debug.Log(">>>>>>>>>>>>>>>>>>>>>>>>> RESTORED Normalized Time: " + nTime + " animComp: " + animComp.enabled);

		}
	}

	if(animComp[animationClip.name].enabled){
		if(!restoringNTime){
			nTime = animComp[animationClip.name].normalizedTime;
		}
	}


	/*if(temp){
		Debug.Log("Normalized Time: " + nTime + " animComp: " + animComp.enabled);
		if(restoringNTime) Debug.Log("restoring nTime");
	}*/
}

class TrigggerAnim_SendMsg{
	var msg : String[];
	var tgt : GameObject[];
	var toChildrenAsWell : boolean;
}

class TriggerAnim_SetCol{
	var cols : Collider[];
	var setEnabled : boolean;
}

function SendMsg(){
	for(var i = 0; i < sendMsg.Length; i++){
		for(var n = 0; n < sendMsg[i].tgt.Length; n++){
			for(var m = 0; m < sendMsg[i].msg.Length; m++){
				if(sendMsg[i].toChildrenAsWell){
					sendMsg[i].tgt[n].BroadcastMessage(sendMsg[i].msg[m]);
				}
				else{
					sendMsg[i].tgt[n].SendMessage(sendMsg[i].msg[m]);
				}
			}
		}
	}
}

class SoundSequence{
	var sound : AudioSource;
	var triggerTime : float;
	var played : boolean;
	var quake : int;
	@Space(20)
	var makePrefab : GameObject;
	var makePrefab_UseBonePos : Transform;
	var parent : boolean;
	var changeScale : boolean;
	var newScale : Vector3;
}

function Start () {
	if(animComp == null){
		animComp = GetComponent.<Animation>();
	}

	if(animComp != null){
		if(mixingTransform != null){
			animComp[animationClip.name].AddMixingTransform(mixingTransform);
		}

		if(mixingTransformSelect != null && mixingTransformSelect.Length > 0){
			for(var i = 0; i < mixingTransformSelect.Length; i++){
				animComp[animationClip.name].AddMixingTransform(mixingTransformSelect[i], false);
			}
		}
	}

	pauseObj = GameObject.FindObjectOfType.<Pause>();

	condition_Underwater_TimeLeft = condition_Underwater_Delay;
}




function Update () {
	

	if(useTimer){
		playTimer.Update();
		if(playTimer.current){
			if(timer_NextPlayDeletesObject != null){
				Destroy(timer_NextPlayDeletesObject);
			}
			play = true;
		}
	}

	if(playDelated){
		playDelated = false;
		Invoke("Play", delay);
		lockDelayedPlay = true;
	}

	#if UNITY_EDITOR
	if(Input.GetKeyDown(useKey)){
		play = true;
	}
	#endif

	if(alwaysPlay){
		if(!animComp[animationClip.name].enabled || animComp[animationClip.name].weight < .1){
			play = true;
		}
	}



	//Triggered by underwater, used for underwater helmet's hatch.
	if(!animComp[animationClip.name].enabled && condition_Underwater != null){
		if(nTime > .9){
			if(condition_Underwater.isUnderwater.current){
				condition_Underwater_TimeLeft -= Time.deltaTime;
				if(condition_Underwater_TimeLeft <= 0){
					condition_Underwater_TimeLeft = condition_Underwater_Delay;
					reverse = true;
					play = true;
				}
			}
			else{
				condition_Underwater_TimeLeft = condition_Underwater_Delay;
			}
		}
		if(nTime < .1){
			if(!condition_Underwater.isUnderwater.current){
				condition_Underwater_TimeLeft -= Time.deltaTime;
				if(condition_Underwater_TimeLeft <= 0){
					condition_Underwater_TimeLeft = condition_Underwater_Delay;
					reverse = false;
					play = true;
				}
			}
			else{
				condition_Underwater_TimeLeft = condition_Underwater_Delay;
			}			
		}
	}

	if(play){
		if(playDelatedAlways){
			Invoke("Play", delay);
			lockDelayedPlay = true;
		}
		else{
			Play();
		}
		play = false;

		for(var offsetFramesAnim in offsetFramesAnim_Reset){
			offsetFramesAnim.ResetAnim();
		}

		if(timer_NextPlayDeletesObject != null){
			Destroy(timer_NextPlayDeletesObject);
		}
	}
	
	
	if(played){
		var timePassed : float = Time.time - playedTime;

		for(var i = 0; i < soundSequence.Length; i++){
			if(!soundSequence[i].played){
				if(timePassed > soundSequence[i].triggerTime){
					if(soundSequence[i].sound != null){
						soundSequence[i].sound.Play();
					}
					soundSequence[i].played = true;

					if(soundSequence[i].quake > 0){
						var cameraShakiness : Shakiness;
					
						if(Camera.main.transform.parent != null){
							cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
						}		
					
						if(cameraShakiness != null){
							if(soundSequence[i].quake == 1){
								cameraShakiness.lowQuake = true;
							}
							if(soundSequence[i].quake == 2){
								cameraShakiness.highQuake = true;
							}							
						}	
										
					}

					if(soundSequence[i].makePrefab != null){
						var newPrefab : GameObject = GameObject.Instantiate(soundSequence[i].makePrefab);
						if(soundSequence[i].makePrefab_UseBonePos != null){
							newPrefab.transform.position = soundSequence[i].makePrefab_UseBonePos.position;
							if(soundSequence[i].parent){
								newPrefab.transform.parent = soundSequence[i].makePrefab_UseBonePos;
							}
						}
						else{
							newPrefab.transform.position = transform.position;
							if(soundSequence[i].parent){
								newPrefab.transform.parent = transform;
							}
						}
						if(soundSequence[i].changeScale){
							newPrefab.transform.localScale = soundSequence[i].newScale;
						}

					}
				}
			}
		}

		if(animComp[animationClip.name].normalizedTime > .9){
			if(endAnimTrigger != null){
				animComp[endAnimTrigger.name].enabled = true;
				animComp[endAnimTrigger.name].weight = Mathf.Lerp(animComp[endAnimTrigger.name].weight, 1.0, Time.deltaTime * 10.0);
				animComp[endAnimTrigger.name].speed = endAnimSpeed;
			}
		}

		//Disable after play?
		if(disableAfterAnim && timePassed > disableDelay){
			gameObject.SetActive(false);
		}
	}





}

function Play(){
	if(disableOtherAnimsOnPlay){
		for(var state : AnimationState in animComp){
			state.enabled = false;
		}
	}

	if(played){
		for(var i = 0; i < soundSequence.Length; i++){
			soundSequence[i].played = false;
		}			
	}
	else{
		if(mixingTransform != null){
			animComp[animationClip.name].AddMixingTransform(mixingTransform);
		}

		if(mixingTransformSelect != null && mixingTransformSelect.Length > 0){
			for(i = 0; i < mixingTransformSelect.Length; i++){
				animComp[animationClip.name].AddMixingTransform(mixingTransformSelect[i], false);
			}
		}			
	}
	
	animComp[animationClip.name].enabled = true;
	animComp[animationClip.name].weight = 1.0;
	if(reverse){
		animComp[animationClip.name].time = animComp[animationClip.name].length;
		animComp[animationClip.name].speed = -speed;
	}
	else{
		animComp[animationClip.name].time = 0.0;
		animComp[animationClip.name].speed = speed;
	}

	
	playedTime = Time.time;
	played = true;
	
	if(playSound != null){
		playSound.Play();
	}

	if(triggerAlphaControl != null){
		triggerAlphaControl.enabled = true;
		triggerAlphaControl.unHide = true;
		triggerAlphaControl.PlayAgain();
	}

	if(triggerOtherAnim != null){
		for(i = 0; i < triggerOtherAnim.Length; i++){
			if(triggerOtherAnim[i] != null){
				triggerOtherAnim[i].play = true;
			}
		} 
	}

	if(triggerUVAnim != null){
		triggerUVAnim.animID = animID;
		triggerUVAnim.playingAnim.current = true;
	}

	if(triggerPauseOverlay){
		Invoke("SetOverlay", triggerPauseOverlay_Delay);
	}

	SendMsg();

	if(triggerSetCols != null){
		for(i = 0; i < triggerSetCols.Length; i++){
			for(var n = 0; n < triggerSetCols[i].cols.Length; n++){
				triggerSetCols[i].cols[n].enabled = triggerSetCols[i].setEnabled;
			}
		}
	}
}

function SetOverlay(){
	if(pauseObj != null){
		pauseObj.overlayLerp.target = overlayTgtSet;
	}	
}