#pragma strict

var pRB : PickUpRigidbody;

var rb : Rigidbody;
var sFric : StopFrictionDrag;

var alphaCtrl : AlphaControl;
var alpha : FloatLerp;

var scare : SetFrameBounds;

var lockCam : StayInRoomArea;

var lidOn : ToggleBoolean;
var effectDelay : float = 1.0;

var enableMagic : ToggleBoolean;

var triggerMusic : TriggerMusic;
var jarMusic : AudioClip;

var enemyParticlePrefab : GameObject;
var emitEnemyTimer : Timer;
var part_Layer : int = 21;
var partStartDist : float = 20.0;
var partDrag : float = 3.0;
var absorbDist : float = .3;

var particles : Array;
var maxParticles : int = 5;

var pSideForce : float = 10.0;
var pGravForce : float = 15;
var pGravForceAdd : float = 5.0;

var pRendQueue : int = 3001;

var enemyRBs : Rigidbody[];
var enemyTag : String = "Enemy";
var enemyDragInCurve : AnimationCurve;
var enemyDragInForce : float;
var enemyDragInTimeCurve : AnimationCurve;

var dragonDead : ToggleBoolean;
var dragonDeadScream : AudioSource;

var cameraShakiness : Shakiness;
var minShake : float = .3;
var maxShake : float = .7;

var flyAway : ToggleBoolean;
var flyAwayDelay : float = 2.0;
var squash : SquashPhysics;
var squashAnim : AnimationCurve;
var squashAnimFlyAway : AnimationCurve;

var flyAwayVel : AnimationCurve;
var flyEffect : GameObject;
var fadeOutMusicSpd : float = .2;
var flyAudio : AudioSource;
var flyAudioDelay : float;
var playedFlyAwayAudio : boolean;

function GetEnemyRBs(){
	var allRBs : Rigidbody[] = GameObject.FindObjectsOfType.<Rigidbody>();
	var enemyRBsArray : Array = new Array();
	for(var i = 0; i < allRBs.Length; i++){
		if(allRBs[i].gameObject.tag == enemyTag){
			enemyRBsArray.Add(allRBs[i]);
		}
	}
	enemyRBs = enemyRBsArray.ToBuiltin(Rigidbody);
} 

function Start () {
	pRB = transform.parent.GetComponentInChildren.<PickUpRigidbody>();
	alphaCtrl = GetComponent.<AlphaControl>();
	scare = GetComponentInChildren.<SetFrameBounds>();
	lockCam = GetComponentInChildren.<StayInRoomArea>();

	squash = transform.parent.GetComponentInChildren.<SquashPhysics>();

	triggerMusic = GameObject.FindObjectOfType.<TriggerMusic>();

	particles = new Array();

	if(Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}

	rb = transform.parent.GetComponentInChildren.<Rigidbody>();
	sFric = transform.parent.GetComponentInChildren.<StopFrictionDrag>();
}

function FixedUpdate(){
	if(enableMagic.current){
		//Drag In Dragon
		for(var i = 0; i < enemyRBs.Length; i++){
			if(enemyRBs[i] == null){
				continue;
			}
			var dragInVector : Vector3 = transform.position -  enemyRBs[i].transform.position;
			dragInVector = dragInVector.normalized * enemyDragInCurve.Evaluate(dragInVector.magnitude) * enemyDragInTimeCurve.Evaluate(Time.time - enableMagic.toggledTrueTime) *enemyDragInForce;
			enemyRBs[i].AddForce(dragInVector);

		}
	}

	if(flyAway.current){
		flyEffect.SetActive(true);
		rb.velocity.y = flyAwayVel.Evaluate(Time.time - flyAway.toggledTrueTime);
	}
}

function Update () {
	//Fly Away
	dragonDead.Update();
	if(dragonDead.toggledTrue){
		dragonDeadScream.Play();
	}

	if(dragonDead.current){
		squash.addSquash = squashAnim.Evaluate(Time.time - dragonDead.toggledTrueTime);
		triggerMusic.desiredMusicVolume = Mathf.MoveTowards(triggerMusic.desiredMusicVolume, 0, Time.deltaTime * fadeOutMusicSpd);
	}

	flyAway .current = (dragonDead.current && Time.time > dragonDead.toggledTrueTime + flyAwayDelay);
	flyAway.Update();

	if(flyAway.current){
		squash.addSquash = squashAnimFlyAway.Evaluate(Time.time - flyAway.toggledTrueTime);

		if(!playedFlyAwayAudio && Time.time > flyAway.toggledTrueTime + flyAudioDelay){
			playedFlyAwayAudio = true;
			flyAudio.Play();
		}
	}

	//

	lidOn.current = pRB.isPickingUp;

	lidOn.Update();

	if(lidOn.toggledTrue){
		triggerMusic.music.clip = jarMusic;
		triggerMusic.forceBossMusic = true;
	}

	if(lidOn.current && Time.time > lidOn.toggledTrueTime + effectDelay && !dragonDead.current){
		enableMagic.current = true;
	}

	enableMagic.Update();

	if(enableMagic.toggledTrue){
		lockCam.room.disable = false;
		scare.enabled = true;
		alpha.target = 1.0;
		transform.parent.GetComponent.<ShakeRB>().enabled = true;

		GetEnemyRBs();
	}

	if(enableMagic.toggledFalse){
		alpha.target = 0.0;
		transform.parent.GetComponent.<ShakeRB>().enabled = false;	
	}
	alpha.Lerp();
	alphaCtrl.mainAlpha = alpha.current;

	if(enableMagic.current){
		//Particles
		if(particles.length < 5){
			emitEnemyTimer.Update();

			if(emitEnemyTimer.current){
				var newParticle : GameObject = GameObject.Instantiate(enemyParticlePrefab);

				newParticle.layer = part_Layer;
				var jarPart : JarParticle = newParticle.GetComponent.<JarParticle>();
				//jarPart.pointSpeed = pointSpeeds[currentPointSpeed];

				jarPart.sideForce = pSideForce;
				jarPart.gravForce = pGravForce;
				jarPart.gravForceAdd = pGravForceAdd;
				jarPart.sqrRootGravForce = true;
				var randAngle : float = Random.value * Mathf.PI * 2.0;

				newParticle.transform.position = transform.position + Vector3(Mathf.Cos(randAngle), Mathf.Sin(randAngle), 0) * partStartDist;

				var partRB : Rigidbody = newParticle.GetComponent.<Rigidbody>();
				partRB.drag = partDrag;

				particles.Push(newParticle.transform);

				var rQ : RenderQueue = newParticle.GetComponent.<RenderQueue>();
				rQ.queue = pRendQueue;

			}
		}
	}

	if(particles != null){
		for(var i = particles.length - 1; i >= 0; i--){
			var thisParticle : Transform = particles[i];
			var dist : float =  Vector3.Distance(thisParticle.position, transform.position);
			if(dist < absorbDist || dragonDead.current){
				Destroy(thisParticle.gameObject);
				particles.RemoveAt(i);

				cameraShakiness.multiplier = Random.Range(minShake, maxShake);
			}
		}
	}

}

