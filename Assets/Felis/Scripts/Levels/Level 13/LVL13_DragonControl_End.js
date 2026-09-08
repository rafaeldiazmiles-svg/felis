#pragma strict

var gotDragon : ToggleBoolean;
var dragon : GameObject;
var dragonFrames : UVFrameGroups;
var dragonPL : PoseLerp;
var dragonFaceAnim : FaceAnim;
var dragonHead : Transform;
var dragonCols : CollisionControl[];
var throwFlame : ThrowFlame;
var dragonScale : ScaleJointChar;
@Space(20)
var dragonLookAt : Transform;
var dragonTarget : Transform;
@Space(20)
var player : GameObject;
var playerRide : Ride;
var playerTag : String = "Player";
var getTimer : Timer;
var playerController : ControllerInput;
var playerLookUp : LookUp;

@Header("--------------Sleeping-----------------")
var tgAnims : TriggerAnimation[];
var sleepClip : AnimationClip;
var idleClip : AnimationClip;
@Header("--------------Follow-----------------")
var followOffset : Vector3 = Vector3(2,.5,0);
var lookAtOffset : Vector3 = Vector3(-.2,.5,0);
var camFollow : StayInRoomArea;
var dragonCamPriority : int = 6;
var boundsPos : LVL13_DragonControl_BoundPos[];

class LVL13_DragonControl_BoundPos{
	var dragonTargetPos : Vector3;
	var xWaveLength : float = 1.0;
	var xWaveSpeed : float = 1.0;
	var playerBounds : Bounds;
	var debugColor : Color;
}

@Header("--------------Spit Fire-----------------")
var spitFire : boolean = true;
var fireTimer : Timer;
var fireDist : float = 12.0;
var dragonAbsorbDist : float = .2;
var dragonAbsorbDist_Bigger : float = .5;
var dragonAbsorbDist_Bigger_Delay : float = 27.0;
  
var dragonDestroyPrefab : GameObject;

@Header("-------------Evil Jar---------------")
var evilJar : EvilJar_Magic;
var noColLayer : int = 21;
var shrinkCurve : AnimationCurve;
var dragonDeadShake : float = 1.3;

var screamEveryEnd : float = 4.0;

@Header("-------------Player Pos--------------")
var playerAI : MovementAI;


@Header("------------Victory---------------")
var victoryAudio : AudioSource;
var victoryDelay : float;
var playedVictoryAudio : boolean;
var victoryTime : float;
var spiralDelay : float = 6.0;

var screenSpiral : ScreenSpiral;
var spiralHoldDuration : float;
var closedSpiral : boolean;
var closeSpiralTime : float;

var victorySceneName : String = "Island";

var lockPos : GameObject;

var islandCleared_Prefab : GameObject;

var cinematicBands : CinematicBands;
var cinematicBandsName : String = "Cinematic Bands";

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 1.0;
	}

	screenSpiral = Camera.main.transform.GetComponentInChildren.<ScreenSpiral>();
}

function Update () {
	//PlayerPos
	if(evilJar.dragonDead.toggledTrue){
		playerController.controllerType = ControllerType.Ai;
		playerAI.enabled = true;
		playerAI.Setup(player.transform);
		playerAI.targetPosition = playerAI.transform.position;
	}

	if(playerLookUp != null){
		playerLookUp.forceLookUp = evilJar.playedFlyAwayAudio;
	}

	if(evilJar.dragonDead.current){
		if(playerAI.onTarget.current){
			playerAI.sideMovement.currentSide = -1;
		}
	}

	//Victory Audio
	if(!playedVictoryAudio && evilJar.flyAway.current && Time.time > evilJar.flyAway.toggledTrueTime + victoryDelay){
		playedVictoryAudio = true;
		victoryTime = Time.time;
		victoryAudio.Play();
		GameObject.Instantiate(islandCleared_Prefab);
	}

	if(!closedSpiral && playedVictoryAudio && Time.time > victoryTime + spiralDelay){
		screenSpiral.open = false;
		closedSpiral = true;
		closeSpiralTime = Time.time;
	}

	if(closedSpiral && Time.time > closeSpiralTime + spiralHoldDuration){
		UnityEngine.SceneManagement.SceneManager.LoadScene(victorySceneName);
	}

	var i : int;

	//scale dragon


	if(evilJar.enableMagic.toggledTrue){

		lockPos.SetActive(true);

		playerRide.dontRide = true;

		//spitFire = false;
		throwFlame.screamChance = 1.0;
		fireTimer.every = screamEveryEnd;

		dragonScale.SetScalePivot(evilJar.transform.position);

		//dragon dont collide
		var dragonColliders : Collider[] = dragon.GetComponentsInChildren.<Collider>();

		for(i = 0; i < dragonColliders.Length; i++){
			dragonColliders[i].gameObject.layer = noColLayer;
		}

		if(cinematicBands == null){
			cinematicBands = Camera.main.transform.Find(cinematicBandsName).GetComponent.<CinematicBands>();
		}
			
		cinematicBands.show = true;
	}

	if(evilJar.enableMagic.current){
		if(dragon != null){
			dragonScale.scaleRange = shrinkCurve.Evaluate(Time.time - evilJar.enableMagic.toggledTrueTime);
			var dragonJarDist : float = Vector3.Distance(dragonHead.position, evilJar.transform.position);
			if(Time.time > evilJar.enableMagic.toggledTrueTime + dragonAbsorbDist_Bigger_Delay){
				dragonAbsorbDist = dragonAbsorbDist_Bigger;
			}
			if(dragonJarDist < dragonAbsorbDist){
				Destroy(dragon);
				evilJar.cameraShakiness.multiplier = dragonDeadShake;
				var dragonDestroyEffect : GameObject = GameObject.Instantiate(dragonDestroyPrefab);
				dragonDestroyEffect.transform.position = evilJar.transform.position;
			}
		}
		else{
			evilJar.dragonDead.current = true;
			evilJar.enableMagic.current = false;
			evilJar.scare.enabled = false;
		}
	}

	//spit fire
	if(spitFire){
		fireTimer.Update();
		if(dragonHead != null && player != null){
			var playerDist : float = Vector3.Distance(dragonHead.position, player.transform.position);
			if(player.transform.position.x < dragonHead.position.x && playerDist < fireDist){
				if(fireTimer.current){
					throwFlame.throwFlame.current = true;
				}
			}
		}
	}

	//follow

	if(dragon != null){
		if(player != null){
			for(i = 0; i < boundsPos.Length; i++){
				if(boundsPos[i].playerBounds.Contains(player.transform.position)){
					dragonTarget.position = boundsPos[i].dragonTargetPos;
					dragonTarget.position += Vector3(Mathf.Sin(Time.time * boundsPos[i].xWaveSpeed) * boundsPos[i].xWaveLength,0,0);
					DebugUtility.DrawPoint(dragonTarget.position, 3.0);
					break;
				}
			}

			dragonLookAt.position = player.transform.position + lookAtOffset;
		}
	}

	//get player
	if(player == null){
		getTimer.Update();
		if(getTimer.current){
			player = GameObject.FindGameObjectWithTag(playerTag);
			if(player != null){
				playerRide = player.GetComponentInChildren.<Ride>();
				playerController = player.GetComponentInChildren.<ControllerInput>();
				playerLookUp = player.GetComponentInChildren.<LookUp>();
			}
		}
	}

	//Get Dragon
	gotDragon.Update();

	if(gotDragon.toggledTrue){
		camFollow.room.forceRoom = true;
		camFollow.room.useMovingTarget = dragonHead.parent.parent;
		camFollow.room.priority = dragonCamPriority;
	}
}

function GetDragon(newDragon : GameObject){
	dragon = newDragon;
	dragonFrames = dragon.GetComponentInChildren.<UVFrameGroups>();

	tgAnims = dragon.GetComponentsInChildren.<TriggerAnimation>();

	dragonPL = dragon.GetComponentInChildren.<PoseLerp>();

	gotDragon.current = true;

	var dragonChildren : Transform[] = dragon.GetComponentsInChildren.<Transform>();

	for(var n = 0; n < dragonChildren.Length; n++){
		if(dragonChildren[n].name == "Head"){
			dragonHead = dragonChildren[n];
			break;
		}
	}

	dragonFaceAnim = dragon.GetComponentInChildren.<FaceAnim>();

	var allDragonCols : CollisionControl[]= dragon.GetComponentsInChildren.<CollisionControl>();
	var dragonColsArray : Array = new Array();
	for(var i = 0; i < allDragonCols.Length; i++){
		if(allDragonCols[i].name.Contains("Leg")){
			continue;
		}

		dragonColsArray.Add(allDragonCols[i]);
	}
	dragonCols = dragonColsArray.ToBuiltin(CollisionControl);

	throwFlame = dragon.GetComponentInChildren.<ThrowFlame>();

	dragonScale = dragon.GetComponentInChildren.<ScaleJointChar>();
}

function OnDrawGizmos(){
	#if UNITY_EDITOR

	if(boundsPos != null){
		for(var i = 0; i < boundsPos.Length; i++){
			Gizmos.color = boundsPos[i].debugColor;
			Gizmos.DrawWireCube(boundsPos[i].playerBounds.center, boundsPos[i].playerBounds.size);
			DebugUtility.DrawPoint(boundsPos[i].dragonTargetPos, 2.5, boundsPos[i].debugColor);
			Debug.DrawLine(boundsPos[i].playerBounds.center, boundsPos[i].dragonTargetPos, boundsPos[i].debugColor);

			Debug.DrawRay(boundsPos[i].dragonTargetPos + Vector3(-boundsPos[i].xWaveLength,0,0), Vector3(boundsPos[i].xWaveLength * 2.0,0,0), boundsPos[i].debugColor);
			Debug.DrawRay(boundsPos[i].dragonTargetPos + Vector3(-boundsPos[i].xWaveLength,-1.0,0), Vector3.up * 2.0, boundsPos[i].debugColor);
			Debug.DrawRay(boundsPos[i].dragonTargetPos + Vector3(boundsPos[i].xWaveLength,-1.0,0), Vector3.up * 2.0, boundsPos[i].debugColor);
		}
	}
	#endif
}