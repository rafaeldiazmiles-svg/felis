#pragma strict


var ZsParticles : ParticleSystem;
var zsPart_LocalPos : Vector3;
@Space(20)
var gotDragon : ToggleBoolean;
var dragon : GameObject;
var dragonFrames : UVFrameGroups;
var dragonPL : PoseLerp;
var dragonFaceAnim : FaceAnim;
var dragonHead : Transform;
var dragonCols : CollisionControl[];
var allDragonColliders : Collider[];
var throwFlame : ThrowFlame;
var dragonRend : Renderer;
@Space(20)
var triggerMusic : TriggerMusic;

@Space(20)
var player : GameObject;
var playerTag : String = "Player";
var getTimer : Timer;
@Space(20)
var dragonLookAt : Transform;
var dragonTarget : Transform;
@Header("--------------Sleeping-----------------")
var tgAnims : TriggerAnimation[];
var sleepClip : AnimationClip;
var idleClip : AnimationClip;
@Header("--------------Wake Up-----------------")
var wakeUp : ToggleBoolean;
var dragonWakeUpLookPos : Transform;
@Header("--------------Follow-----------------")
var following : ToggleBoolean;
var unFollowBounds : Bounds;
var followDelay : float = 2.0;
var followOffset : Vector3 = Vector3(2,.5,0);
var lookAtOffset : Vector3 = Vector3(-.2,.5,0);
var camFollow : StayInRoomArea;

var showFlyHeight : boolean = true;
var dragonFlyHeightParent : Transform;
var dragonFlyHeight : Transform[];

var escaped : boolean;

@Header("--------------Spit Fire-----------------")
var fireTimer : Timer;
var fireDist : float = 12.0;

@Header("-------------Misc-----------------")
var dragonDisableBounds : Bounds;
@Space(30)
var dragonVisible : ToggleBoolean;


function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 1.0;
	}

	if(dragonFlyHeightParent != null){
		dragonFlyHeight = dragonFlyHeightParent.GetComponentsInChildren.<Transform>();
	}

	triggerMusic = GameObject.FindObjectOfType.<TriggerMusic>();
}

function Update () {
	if(dragon == null){
		return;
	}
	var i : int;

	//Dragon Visible
	dragonVisible.current = dragonRend.isVisible;
	dragonVisible.Update();

	if(dragonVisible.toggledTrue){
		for(i = 0; i < allDragonColliders.Length; i++){
			allDragonColliders[i].enabled = true;
		}
	}

	if(dragonVisible.toggledFalse){
		for(i = 0; i < allDragonColliders.Length; i++){
			allDragonColliders[i].enabled = false;
		}
	}


	//Hide dragon outside cave 2
	if(player != null && dragon != null){
		if(dragonDisableBounds.Contains(player.transform.position)){
			dragon.SetActive(false);
		}
	}

	//spit fire
	fireTimer.Update();
	if(following.current){
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
	/*if(player != null){
		if(!escaped && unFollowBounds.Contains(player.transform.position)){
			escaped = true;
			triggerMusic.forceBossMusic = false;
			triggerMusic.gameMusic.time = 0.0;
		}
	}*/
	if(wakeUp.current && Time.time > wakeUp.toggledTrueTime + followDelay && player != null && !escaped){
		following.current = true;
	}
	else{
		following.current = false;
	}
	following.Update();

	if(following.toggledTrue){
		camFollow.room.forceRoom = true;
		camFollow.room.useMovingTarget = dragonHead.parent.parent;

		//triggerMusic.forceBossMusic = true;
	}

	if(following.current){
		if(player != null){
			dragonTarget.position = player.transform.position + followOffset;
			dragonTarget.position.y = GetFlyHeight();
			DebugUtility.DrawPoint(dragonTarget.position, .5);
			dragonLookAt.position = player.transform.position + lookAtOffset;
		}
	}

	//get player


	if(player == null){
		getTimer.Update();
		if(getTimer.current){
			player = GameObject.FindGameObjectWithTag(playerTag);
		}
	}

	//Wake Up
	if(dragonCols != null){
		for(var n = 0; n < dragonCols.Length; n++){
			if(dragonCols[n].collision.current){
				wakeUp.current = true;
			}
		}
	}

	wakeUp.Update();
	if(wakeUp.toggledTrue){
		dragonFaceAnim.autoBlink = true;
		dragonPL.playNow = true;
		dragonLookAt.position = dragonWakeUpLookPos.position;
		ZsParticles.emission.enabled = false;

		for(i = 0; i < tgAnims.Length; i++){
			tgAnims[i].animationClip = idleClip;
			tgAnims[i].played = false;
			tgAnims[i].play = true;
		}
	}

	//Sleep
	gotDragon.Update();

	if(gotDragon.toggledTrue){
		dragonFaceAnim.autoBlink = false;
		dragonFrames.SetFrame("Eyes", "Closed");

		ZsParticles.transform.parent = dragonHead;
		ZsParticles.transform.localPosition = zsPart_LocalPos;

		for(i = 0; i < tgAnims.Length; i++){
			tgAnims[i].animationClip = sleepClip;
			tgAnims[i].played = false;
			tgAnims[i].play = true;
		}

		dragonPL.anim = FindUtility.FindWithNameInObjChildren(dragon, "Scream").GetComponent.<PlayStillAnimation>();
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

	allDragonColliders = dragon.GetComponentsInChildren.<Collider>();

	throwFlame = dragon.GetComponentInChildren.<ThrowFlame>();

	dragonRend = dragon.GetComponentInChildren.<Renderer>();
}

function GetFlyHeight() : float{
	if(dragonHead.position.x > dragonFlyHeight[0].position.x){
		return dragonFlyHeight[0].position.y;
	}
	if(dragonHead.position.x < dragonFlyHeight[dragonFlyHeight.Length - 1].position.x){
		return dragonFlyHeight[dragonFlyHeight.Length - 1].position.y;
	}

	for(var i = 0; i < dragonFlyHeight.Length - 1; i++){
		if(dragonHead.position.x < dragonFlyHeight[i].position.x && dragonHead.position.x >  dragonFlyHeight[i+1].position.x){
			var lerp : float = (dragonHead.position.x - dragonFlyHeight[i+1].position.x) / (dragonFlyHeight[i].position.x - dragonFlyHeight[i+1].position.x);

			return Mathf.Lerp(dragonFlyHeight[i+1].position.y, dragonFlyHeight[i].position.y, lerp);
		}
	}
}

function OnDrawGizmos(){
	#if UNITY_EDITOR

	if(showFlyHeight){
		if(dragonFlyHeightParent != null){
			dragonFlyHeight = dragonFlyHeightParent.GetComponentsInChildren.<Transform>();
		}

		if(dragonFlyHeight != null){
			for(var i = 0; i < dragonFlyHeight.Length - 1; i++){
				if(dragonFlyHeight[i] == null || dragonFlyHeight[i+1] == null){
					continue;
				}
				Debug.DrawLine(dragonFlyHeight[i].position, dragonFlyHeight[i+1].position);
				Handles.Label(dragonFlyHeight[i].position, i.ToString());
			}
		}
	}

	Gizmos.DrawWireCube(unFollowBounds.center, unFollowBounds.size);

	Gizmos.color = Color.red;
	Gizmos.DrawWireCube(dragonDisableBounds.center, dragonDisableBounds.size);
	Handles.Label(dragonDisableBounds.center, "Dragon Disable");

	#endif
}