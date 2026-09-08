#pragma strict
var camPlayer : IntroCameraPlayer;
var catchB : CatchButterfly;
var sweat : SweatDropsParticles;
var fAnim : FaceAnim;
@Space(30)
var collide : ToggleBoolean;
var collideForce : ExplosionForce;
@Space(30)
var impactPrefab : GameObject;
var impactSound : AudioSource;
@Space(30)
var catBump : PlayStillAnimation;
@Space(30)
var cameraShakiness : Shakiness;
@Space(30)
var catExclamation : SpeakBaloonAnimate;
var exclamationDelay : float = .7;
var exclamationDuration : float = .5;
var exclamationTrigger : ToggleBoolean;
@Space(30)
var gotCloseToLid : boolean;
var moveTowardsLidDelay : float = 1.5;
var catMoveTowardsLid : ToggleBoolean;
var lidPickable : PickableRigidbody;
var getCloseToLidDuration : float = .2;
@Space(30)
var pickedLid : boolean;
var catPickRB : PickUpRigidbody;
var pickLidAnim : PlayStillAnimation;
var pickLidDelay : float = .15;
var jarShake : ShakeRB;
@Space(30)
var stepBackFromLid : ToggleBoolean;
var stepBackDuration : float = .5;
@Space(30)
var jarGlowControl : FloatLerp;
var jarGlowAlpha : AlphaControl;
var jarGlowMaxYScale : float = .3;
var jarGlowMinYSclae : float = .15;
var jarShakeAmount : float = 80;
var zoomOutAfterGlow : ToggleBoolean;
var ZoomeOutAfterGlowDelay : float = 1.0;
var zoomOutAfterGlowValue : float = 20.0;
@Space(30)
var emitEnemy : ToggleBoolean;
var emitEnemyDelay : float = .5;
var emitEnemyTimer : Timer;
var enemyParticlePrefab : GameObject;

var pointSpeeds : Vector3 [];
var currentPointSpeed : int;
var emitPos : Transform;
var particlesLeft : int = 11;

var particleCount : int;

var enemySpawn : LoadPrefabByBounds;
var spawnParticlesID : int[];
var spawnParticles : INTRO_Control_EnemyParticles[];

class INTRO_Control_EnemyParticles{
	var spawnLocation : Vector3;
	var spawnID : int;
}
var currentSpawnValID : int;
@Space(30)
var scareCatNow : ToggleBoolean;

var scareCatDelay : float = 2.0;

var askHelpDuration : float = 4.0;
@Space(30)

var emitDragonParticle : ToggleBoolean;
var jarSquashP : SquashPhysics;
var jarSquashEffectCurve : AnimationCurve;
var jarSquashEffectCurve_Multiplier : float = 1.0;
var dragonParticleDelay : float = 2.1;
var emittedDragon : boolean;
var dragonPointSpeed : Vector3;
var dragonSpawnEffectSize : float = 2.5;
var offsetDragonSpawnEffectPosition : Vector3 = Vector3(0,-1.5,0);
var dragonParticleSize : float = 2.5;
var dragonParticleTexture : Texture;
@Space(10)
var dragonParticle_ShootEffect : GameObject ;
var dragonParticle_ShootEffectPrefab : GameObject;
var dragonParticle_ShootEffect_Offset : Vector3;
@Space(20)
var dragonPrefab : int;;
var dragonSpawnLocation : Vector3;
var dragonSpawned : ToggleBoolean;
var dragon : GameObject;
var dragonWF : WingedFlightAI;
var dragonTargetPos_Jar : Vector3;
var dragonTargetPos_Fly : Vector3;
var dragonPickJarDelay : float = 2.0;
var dragonLookAt: LookAt2D[];
var dragonPoseLerp : PoseLerp;
var dragonLookAtTarget : Transform;
var dragonLookUpPos : Vector3;
var dragonLookAtTPos : Vector3Lerp;
var dragonFlyDelay : float = 3.0;
@Space(20)
var dragonFocusBoneName : String = "Head";
var dragonFlyingCamYOffset : float = 0.0;
@Space(20)
var cloudsRenderer : Renderer;
var focusOnCloudsAtYPos : float;
var focusCloudsTrigger : ToggleBoolean;
var finalCameraTarget : Transform;
var finalCameraRatLocation : Vector3;
var finalCameraPos : Vector3Lerp;
var focusOnRatAtDragonHeight : float = 5.0;
var dragonPos : Transform;
var focusOnRat : ToggleBoolean;
var blueButterFlyRend : Renderer;
@Space(20)
var lidQueue : RenderQueue;
var lidFrontQueue : int = 3002;
@Space(20)
var finalRatFrames : UVFrameGroups;
var ratMTarget : Transform;
var ratLidPos : Vector3;
var ratMoveToLidDelay : float = 8.0;
var ratMoveToLidTrigger : ToggleBoolean;
var finalRatAI : RatEnemy;
var lid : GameObject;
var lidPO : PickableRigidbody;
var ratExcl : SpeakBaloonAnimate;
var exclTrigger : ToggleBoolean;
var exclDist : float = .5;
var ratExclDuration : float = .7;
@Space(20)
var spiral : ScreenSpiral;
var spiralDelay : float = 4.0;
var music : TriggerMusic;
var fadeOutBlendSpeed : float = .6;
var goToLevel : String;
var loadLevelDelay : float = 6.0;
@Space(20)
var skip : boolean;
var screenTap : boolean;
var enableSTapDelay : float = 2.0;
var screenTapTime : float;
var fadeOutBlendSpeedFast : float = 3.0;
@Space(20)
var input : ControllerInput;
var pause : Pause;
var popupQuestionPrefab : GameObject;
var popupQuestion : GameObject;
var popupQuestion_InputQ : InputQuestion;
@Space(20)
var cBands : CinematicBands;
var cBandsName : String = "Cinematic Bands";

@Space(20)
var gVals : HoldGlobalValues;
var previousQuit : boolean;

function CreatePopupQuestion(){
	if(popupQuestionPrefab == null){
		popupQuestionPrefab = Resources.Load("Prefabs/GUI/Popup Question", GameObject);
	}
	popupQuestion = GameObject.Instantiate(popupQuestionPrefab);
	popupQuestion_InputQ = popupQuestion.GetComponent.<InputQuestion>();

	if(input != null){
		input.GetTouchPoints();
	}
}

function PopupQuestionReady() : boolean{
	if(popupQuestion_InputQ != null && popupQuestion_InputQ.ready){
		return true;
	}
	else{
		return false;
	}
}

function BringPopupQuestion(question : String){
	if(popupQuestion_InputQ == null){
		CreatePopupQuestion();
	}
	if(popupQuestion_InputQ != null){
		popupQuestion_InputQ.showingSign.current = true;
		popupQuestion_InputQ.SetTextLine(question);
	}	
}

function HidePopupQuestion(){
	if(popupQuestion_InputQ != null){
		popupQuestion_InputQ.showingSign.current = false;
	}	
}

function CleanPopupQuestion(){
	if(popupQuestion_InputQ != null){
		if(!skip){
			if(popupQuestion_InputQ.hidden){
				Destroy(popupQuestion);
			}
		}
	}	
}

function GetDragon(newDragon : GameObject){
	dragon = newDragon;
	dragonSpawned.current = true;
	dragonWF = dragon.GetComponentInChildren.<WingedFlightAI>();
	dragonLookAt = dragon.GetComponentsInChildren.<LookAt2D>();
	dragonPoseLerp = dragon.GetComponent.<PoseLerp>();

	for(var i = 0; i < dragonLookAt.Length; i++){
		dragonLookAt[i].target = dragonLookAtTarget;
	}

	var pRB : PickUpRigidbody = dragon.GetComponentInChildren.<PickUpRigidbody>();
	pRB.onlyPickID = new int[1];
	pRB.onlyPickID[0] = 1;
	pRB.ID = 1;

	var dragonChildren : Transform[] = dragon.GetComponentsInChildren.<Transform>();

	for(var n = 0; n < dragonChildren.Length; n++){
		if(dragonChildren[n].name == dragonFocusBoneName){
			camPlayer.changeTgt[2].newTarget = dragonChildren[n];
			dragonPos = dragonChildren[n];
			break;
		}
	}


}

function Start () {
	cBands = Camera.main.transform.Find(cBandsName).GetComponent.<CinematicBands>();
	cBands.show = true;

	spiral = GameObject.FindObjectOfType.<ScreenSpiral>();
	lidPO = lid.GetComponentInChildren.<PickableRigidbody>();
	if(Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}

	dragonLookAtTPos.target = dragonLookAtTarget.position;
	dragonLookAtTPos.current = dragonLookAtTPos.target;

	cloudsRenderer.enabled = false;

	finalCameraPos.current = finalCameraTarget.position;
	finalCameraPos.target = finalCameraPos.current;

	gVals = GameObject.FindObjectOfType.<HoldGlobalValues>();
}

function Update () {
	CleanPopupQuestion();

	//Rat Exclamation
	if(Mathf.Abs(finalRatAI.transform.position.x - lid.transform.position.x) < exclDist){
		exclTrigger.current = true;
	}
	exclTrigger.Update();
	if(exclTrigger.toggledTrue){
		ratExcl.playEnabled = true;
	}
	if(exclTrigger.current && Time.time > exclTrigger.toggledTrueTime + ratExclDuration){
		ratExcl.playEnabled = false;
	}

	var quit : boolean;
	quit = gVals != null && (gVals.quit || Input.GetKeyDown(gVals.quitKey));

	previousQuit = quit;

	//Screen tap
	if(skip && PopupQuestionReady()){
		if(input.inputButtonA.down|| input.startButton.down){
			//Debug.Log("Skip");
			HidePopupQuestion();
			spiral.open = false;

			music.desiredMusicVolume = 0.0;
			music.desiredGameMusicVolume = 0.0;
			music.blendSpeed = fadeOutBlendSpeedFast;
			return;
		}
		if(input.inputButtonB.down || input.selectButton.down || quit){
			//Debug.Log("Do not skip");
			HidePopupQuestion();
			skip = false;
			pause.UnStopGame();
			pause.UnstopAudio();
			return;
		}
	}
	else{
		if(!quit){
			if(Time.timeSinceLevelLoad > enableSTapDelay && (Input.touchCount > 0 || Input.GetMouseButtonDown(0) || Input.anyKeyDown)){
				skip = true;

				if(pause == null){
					pause = GameObject.FindObjectOfType.<Pause>();
				}
				pause.StopAudio();
				pause.StopGame();

				BringPopupQuestion("skip intro?");
			}
		}
	}



	//End
	var endScene : boolean = focusOnRat.current && lidPO.beingPicked.current && Time.time > lidPO.beingPicked.toggledTrueTime + spiralDelay;

	if(endScene){
		spiral.open = false;
	}

	if(endScene|| skip){
		if(spiral.IsClosed()){
			UnityEngine.SceneManagement.SceneManager.LoadScene(goToLevel);
		}
	}

	//Rat move to lid
	if(focusOnRat.current && Time.time > focusOnRat.toggledTrueTime + ratMoveToLidDelay){
		ratMoveToLidTrigger.current = true;
	}
	ratMoveToLidTrigger.Update();
	if(ratMoveToLidTrigger.toggledTrue){
		finalRatAI.enabled = true;
		//finalRatAI.movementAI.target = null;
		lid.tag = "Key";
		 
		lidPO.offset = Vector3.zero;
		lidPO.offsetAngle = Vector3.zero;
	}

	//Focus on Rat
	if(focusCloudsTrigger.current && dragonPos.position.y >= focusOnRatAtDragonHeight){
		focusOnRat.current = true;
		lidQueue.queue = lidFrontQueue;
		finalRatFrames.SetFrame(0, 2);
		finalRatFrames.SetFrame(1, 1);
		music.desiredMusicVolume = 0.0;
		music.desiredGameMusicVolume = 0.0;
		music.blendSpeed = fadeOutBlendSpeed;
	}
	focusOnRat.Update();
	if(focusOnRat.toggledTrue){
		finalCameraPos.target = finalCameraRatLocation;
	}

	finalCameraPos.Lerp();
	finalCameraTarget.position = finalCameraPos.current;

	//Focus on clouds
	if(dragonSpawned.current && camPlayer.transform.position.y >= focusOnCloudsAtYPos){
		focusCloudsTrigger.current = true;
	}
	focusCloudsTrigger.Update();

	if(focusCloudsTrigger.toggledTrue){
		focusCloudsTrigger.current = true;
		camPlayer.targetTransform = finalCameraTarget;
		camPlayer.smooth = 2.0;		
	}

	//Dragon
	dragonLookAtTPos.Lerp();
	dragonLookAtTarget.position = dragonLookAtTPos.current;

	dragonSpawned.Update();
	if(dragonSpawned.toggledTrue){
		//dragon.GetComponent.<ScaleJointChar>().ApplySpawnEffect();

		dragonWF.targetPosition = dragonTargetPos_Jar;
	}

	//Pick Jar
	if(dragonSpawned.current && Time.time > dragonSpawned.toggledTrueTime + dragonPickJarDelay){
		dragonPoseLerp.playNow = true;
		dragonLookAtTPos.target = dragonLookUpPos;//dragonLookAtTarget.position = dragonLookUpPos;
	}

	//Fly
	if(dragonSpawned.current && Time.time > dragonSpawned.toggledTrueTime + dragonFlyDelay){
		//dragonLookAtTPos.target = dragonLookUpPos;//dragonLookAtTarget.position = dragonLookUpPos;
		dragonWF.targetPosition = dragonTargetPos_Fly;
		camPlayer.changeTgt[2].trigger = true;
		camPlayer.enableYOffsetCurve = false;
		camPlayer.yOffset = dragonFlyingCamYOffset;
		cloudsRenderer.enabled = true;
	}

	//EmitDragonParticle
	if(!emittedDragon && emitDragonParticle.current && Time.time > emitDragonParticle.toggledTrueTime + dragonParticleDelay){
		emittedDragon = true;

		var dragonParticle : GameObject = GameObject.Instantiate(enemyParticlePrefab);
		dragonParticle.transform.position = emitPos.position;
		var dragonPJar : JarParticle = dragonParticle.GetComponent.<JarParticle>();
		dragonPJar.enableSpawn = true;
		dragonPJar.pointSpeed = dragonPointSpeed;
		dragonPJar.spawnEnemyPrefab = dragonPrefab;
		dragonPJar.spawnLocation = dragonSpawnLocation;
		dragonPJar.spawnEffectSize = dragonSpawnEffectSize;
		dragonPJar.offsetSpawnEffectPosition = offsetDragonSpawnEffectPosition;

		dragonPJar.enemySpawnPrefabLoader = enemySpawn;

		dragonPJar.spawnAtGlobalSL = true;

		var dragonPaticleSquash : Squash = dragonPJar.gameObject.GetComponentInChildren.<Squash>();
		dragonPaticleSquash.scale = Vector3.one * dragonParticleSize;
		dragonPaticleSquash.useEditorScale = false;

		var dragonParticleRend : Renderer = dragonPJar.gameObject.GetComponentInChildren.<Renderer>();
		dragonParticleRend.material.mainTexture = dragonParticleTexture;

		dragonParticle_ShootEffect = GameObject.Instantiate(dragonParticle_ShootEffectPrefab);
		dragonParticle_ShootEffect.transform.position = emitPos.position + dragonParticle_ShootEffect_Offset;
	}

	if(particlesLeft == 0){
		emitDragonParticle.current = true;
	}

	emitDragonParticle.Update();

	if(emitDragonParticle.current){
		jarSquashP.externalSquashInput = jarSquashEffectCurve.Evaluate(Time.time - emitDragonParticle.toggledTrueTime) * jarSquashEffectCurve_Multiplier;
	}

	//Scare cat
	if(zoomOutAfterGlow.current && Time.time > zoomOutAfterGlow.toggledTrueTime + scareCatDelay){
		scareCatNow.current = true;
	}
	scareCatNow.Update();
	if(scareCatNow.toggledTrue){
		catchB.transform.parent.BroadcastMessage("ForceHelpDuration", askHelpDuration);
	}

	//Emit enemy
	emitEnemy.Update();
	if(emitEnemy.current){
		emitEnemyTimer.Update();
		if(emitEnemyTimer.current){
			cameraShakiness.lowQuake = true;
			var newEnemy : GameObject = GameObject.Instantiate(enemyParticlePrefab);
			var jarPart : JarParticle = newEnemy.GetComponent.<JarParticle>();
			jarPart.pointSpeed = pointSpeeds[currentPointSpeed];
			currentPointSpeed ++;
			currentPointSpeed = currentPointSpeed % pointSpeeds.Length;

			newEnemy.transform.position = emitPos.position;

			//Set Spawn Values
			for(var i = 0; i < spawnParticlesID.Length; i++){
				if(spawnParticlesID[i] == particleCount){
					jarPart.enableSpawn = true;

					jarPart.spawnEnemyPrefab = spawnParticles[currentSpawnValID].spawnID;
					jarPart.spawnLocation = spawnParticles[currentSpawnValID].spawnLocation;
					jarPart.enemySpawnPrefabLoader = enemySpawn;

					currentSpawnValID ++;
					currentSpawnValID = currentSpawnValID % spawnParticles.Length;

					break;
				}
			}

			particlesLeft --;
			particleCount ++;
			if(particlesLeft == 0){
				emitEnemy.current = false;
				jarGlowControl.target = 0.0;
			}
		}
	}

	//Activate Glow
	if(stepBackFromLid.toggledFalseTime != 0.0 && Time.time > stepBackFromLid.toggledFalseTime + ZoomeOutAfterGlowDelay){
		zoomOutAfterGlow.current = true;
	}
	zoomOutAfterGlow.Update();
	if(zoomOutAfterGlow.toggledTrue){
		camPlayer.cameraZPos.target = zoomOutAfterGlowValue;
		emitEnemy.current = true;
	}

	jarGlowControl.Lerp();
	jarGlowAlpha.mainAlpha = jarGlowControl.current;
	jarShake.multiplierMin = jarShakeAmount * .5 * jarGlowControl.current;
	jarShake.multiplierMax = jarShakeAmount  * jarGlowControl.current;

	//Step back from lid
	if(pickLidAnim.animationPlay.toggledFalseTime != 0.0 && pickLidAnim.animationPlay.toggledFalse){
		stepBackFromLid.current = true;
	}

	stepBackFromLid.Update();

	if(stepBackFromLid.current){
		catchB.movAI.controller.inputAxis.target.x = 1.0;

		if(Time.time > stepBackFromLid.toggledTrueTime + stepBackDuration){
			stepBackFromLid.current = false;
			catchB.movAI.controller.inputAxis.target.x = 0.0;
			catchB.movAI.controller.inputAxis.current.x = 0.0;
		}
	}

	if(stepBackFromLid.toggledFalse){
		catchB.movAI.sideMovement.currentSide = -1;
		jarGlowControl.target = 1.0;
	}


	//Pick Lid
	if(!pickedLid && pickLidAnim.animationPlay.toggledTrueTime != 0.0 && Time.time > pickLidAnim.animationPlay.toggledTrueTime + pickLidDelay){
		pickedLid = true;
		catPickRB.pickUp = true;
		//jarShake.enabled = true;
		//cameraShakiness.lowQuake = true;
		blueButterFlyRend.enabled = false;
	}

	//Get close to lid after colliding

	if(!gotCloseToLid && exclamationTrigger.current && Time.time > exclamationTrigger.toggledTrueTime + moveTowardsLidDelay){
		catMoveTowardsLid.current = true;
		gotCloseToLid = true;
	}
	catMoveTowardsLid.Update();

	if(catMoveTowardsLid.toggledTrue){
		catchB.movAI.controller.inputAxis.target.x = -1.0;
	}
	if(catMoveTowardsLid.current && Time.time > catMoveTowardsLid.toggledTrueTime + getCloseToLidDuration){
		catchB.movAI.controller.inputAxis.target.x = 0.0;
		catMoveTowardsLid.current = false;
		pickLidAnim.playDelayed.current = true;
	}

	//Collide With Jar
	if(catchB.transform.position.x > transform.position.x){
		collide.current = true;
	}

	collide.Update();

	if(collide.toggledTrue){
		fAnim.PlayAnim(1);
		
		sweat.forceSweatDropUntil = Time.time + 1.5;
		
		catchB.enabled = false;
		catchB.movAI.enabled = false;
		catchB.movAI.controller.inputAxis.target.x = 0.0;
		collideForce.explode = true;

		var impact : GameObject = GameObject.Instantiate(impactPrefab);
		impact.transform.position = transform.position;
		impactSound.Play();

		catBump.animationPlay.current = true;

		cameraShakiness.lowQuake = true;

		//catExclamation.playEnabled = true;
		exclamationTrigger.current = true;
	}


	//Exclamation baloon after collision
	exclamationTrigger.Update();

	if(exclamationTrigger.current && Time.time > exclamationTrigger.toggledTrueTime + exclamationDelay){
		catExclamation.playEnabled = true;
	}

	if(exclamationTrigger.current && Time.time > exclamationTrigger.toggledTrueTime + exclamationDuration + exclamationDelay){
		catExclamation.playEnabled = false;
	}


}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Debug.DrawRay(transform.position + Vector3.up, Vector3.down * 2.0);
	Handles.Label(transform.position + Vector3.up, "Collide here");

	for(var i = 0; i < spawnParticles.Length; i++){
		DebugUtility.DrawPoint(spawnParticles[i].spawnLocation, .5, Color.green);
		Handles.Label(spawnParticles[i].spawnLocation, "Spawn Location " + i.ToString());
	}

	DebugUtility.DrawPoint(dragonSpawnLocation, .8, Color.green);
	Handles.Label(dragonSpawnLocation, "Dragon Spawn Location ");

	DebugUtility.DrawArrow(dragonSpawnLocation, dragonTargetPos_Jar - dragonSpawnLocation, Color.red);

	DebugUtility.DrawPoint(dragonTargetPos_Jar, .4, Color.blue);
	Handles.Label(dragonTargetPos_Jar, "Dragon Stand Location ");

	DebugUtility.DrawPoint(dragonLookUpPos, .8, Color.gray);
	Handles.Label(dragonLookUpPos, "Dragon Look Up Location ");

	DebugUtility.DrawArrow(dragonTargetPos_Jar, dragonTargetPos_Fly - dragonTargetPos_Jar, Color.red);

	DebugUtility.DrawPoint(dragonTargetPos_Fly, .4, Color.blue);
	Handles.Label(dragonTargetPos_Fly, "Dragon Fly Location ");



	DebugUtility.DrawPoint(finalCameraRatLocation, .6, Color.red);
	Handles.Label(finalCameraRatLocation, "Rat Location");

	//DebugUtility.DrawPoint(ratLidPos, .6, Color.red);
	//Handles.Label(ratLidPos, "Rat Lid Pos");

	#endif
}