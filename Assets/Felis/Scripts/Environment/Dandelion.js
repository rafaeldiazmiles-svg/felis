#pragma strict

private var grassFlow : GrassFlow;

private var rotationSpeed : float;
private var previousRotation : float;

var releaseSpeed : float;
var totalSeeds : float = 20;
var seedStrength : float = 50;
var maxRipForce : float = 200;

private var seedsLeft : float;
private var ripSeedForce : float; 

private var seedFrame : int = 0;
static var totalFrames : float = 4;

var frameOffset : Vector2[];

private var DandelionFull : Transform;
private var DandelionHalf : Transform;
private var DandelionQuarter : Transform;
var emitRadius : float = .1;

var dandelionSeedParticleObject : GameObject;

var seedSize : float = .3;

function Start () {
	grassFlow = GetComponentInChildren(GrassFlow);
	seedsLeft = totalSeeds;
	seedFrame = totalFrames;
	var allChildren : Transform[] = GetComponentsInChildren.<Transform>() as Transform[];
	for(var child : Transform in allChildren){
		if(child.name.StartsWith("Dandelion Full")){DandelionFull = child;}
		if(child.name.StartsWith("Dandelion Half")){DandelionHalf = child; }
		if(child.name.StartsWith("Dandelion Quarter")){DandelionQuarter = child;}
	}
	if(DandelionFull == null){
		Debug.DrawRay(transform.position, Vector3.up * 20, Color.red);
		Debug.Break();
	}
	DandelionHalf.position = DandelionFull.position;
	DandelionQuarter.position = DandelionFull.position;
	SetFrame(4);
}

function Update () {
	if(Time.time < 1.0) return;
	
	var grassFlowMasterValue : float = grassFlow.masterValue;
	
	rotationSpeed = Mathf.Abs(grassFlow.GetCurrentRotation() - previousRotation) / Time.deltaTime;
	previousRotation = grassFlow.GetCurrentRotation();
	
	var debugColor : Color;
	if(rotationSpeed < releaseSpeed) debugColor = Color.gray;
	else debugColor = Color.green;
	DebugUtility.DrawArrow(transform.position + Vector3.up*.5, -Vector3.right*.5, debugColor);
	
	if(rotationSpeed > releaseSpeed) ripSeedForce += rotationSpeed * Time.deltaTime;
	
	if(ripSeedForce > seedStrength && seedsLeft > 0){
		ripSeedForce = 0;
		seedsLeft--;
		//Release seed.
		dandelionSeedParticleObject.GetComponent.<ParticleEmitter>().Emit(DandelionFull.position + Random.insideUnitSphere * emitRadius * (seedsLeft / totalSeeds)
		, Vector3.zero, seedSize, 6.0, Color.white);
		var particles : Particle[] = dandelionSeedParticleObject.GetComponent.<ParticleEmitter>().particles;
		particles[particles.Length-1].rotation = Random.value *360;
		dandelionSeedParticleObject.GetComponent.<ParticleEmitter>().particles = particles;
		//newParticle.rotation = Random.value * 360;
	}
	
	var calculateSeedFrame : float = ((seedsLeft / totalSeeds) * (totalFrames-1));
	if(seedFrame != calculateSeedFrame){
		seedFrame = Mathf.CeilToInt(calculateSeedFrame);
		SetFrame(seedFrame);
	}
	
	ripSeedForce -= Time.deltaTime;
	ripSeedForce = Mathf.Clamp(ripSeedForce, 0, maxRipForce); 
	
	/*//Flying seeds.
	particles = particleEmitter.particles;
	for(var i = 0; i < particles.Length; i++){
		particles[i].position.x -= Time.deltaTime;
		particles[i].position.y += (0.3 + Mathf.Sin(Time.time * 2.0 + particles[i].position.x )) * Time.deltaTime *.2;
		particles[i].rotation += 60 * Mathf.Sin(Time.time * 3.0 + particles[i].position.x ) * Time.deltaTime;;
		particles[i].color.a = particles[i].energy / 4.0;
		//particles[i].size = particleSize;
		
		particles[i].energy -= Time.deltaTime;
	}
	particleEmitter.particles = particles;*/
}

function SetFrame(frame : int){
	switch(frame){
		case 3:
			DandelionFull.localEulerAngles = Vector3(0,0,0);
 			DandelionHalf.localEulerAngles = Vector3(0,0,180);
			DandelionQuarter.localEulerAngles = Vector3(0,0,180);
		break;
		
		case 2:
			DandelionFull.localEulerAngles = Vector3(0,0,180);
 			DandelionHalf.localEulerAngles = Vector3(0,0,0);
			DandelionQuarter.localEulerAngles = Vector3(0,0,180);
		break;
		
		case 1:
			DandelionFull.localEulerAngles = Vector3(0,0,180);
 			DandelionHalf.localEulerAngles = Vector3(0,0,180);
			DandelionQuarter.localEulerAngles = Vector3(0,0,0);
		break;
		
		case 0:
			DandelionFull.localEulerAngles = Vector3(0,0,180);
 			DandelionHalf.localEulerAngles = Vector3(0,0,180);
			DandelionQuarter.localEulerAngles = Vector3(0,0,180);
		break;
	}
}

function OnDrawGizmos(){
	#if UNITY_EDITOR
	Handles.Label(transform.position, "R:" + rotationSpeed.ToString());
	Handles.Label(transform.position + Vector3.down * .2, "S:" + dandelionSeedParticleObject.GetComponent.<ParticleEmitter>().particles.Length.ToString());
	#endif
}