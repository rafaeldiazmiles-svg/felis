#pragma strict

var trailPos : TrailPosition;

var pEmitter : ParticleEmitter;
var pRenderer : ParticleRenderer;

var speed : float = .5;

var rate : float = 1.0;

var nextParticle : float;

var show : boolean;
var currentColor : Color;
var blendSpeed : float = 7.0;

var reverse : boolean;

function Start () {
	trailPos = GetComponent.<TrailPosition>();
	pEmitter = GetComponent.<ParticleEmitter>();
	pRenderer = GetComponent.<ParticleRenderer>();
	SetStartParticles(pEmitter);

	pEmitter.maxEnergy = trailPos.GetTrailLength() / speed;
	pEmitter.minEnergy = pEmitter.maxEnergy;

	pEmitter.emit = false;
	NewParticle();
}

function NewParticle(){
	pEmitter.Emit(transform.position, Vector3.zero, pEmitter.maxSize, pEmitter.maxEnergy, Color.white);
	nextParticle = Time.time + (1.0 / rate);

}

function Update () {
	if(show){
		currentColor = Color.Lerp(currentColor, Color(1,1,1,1), Time.deltaTime * blendSpeed);
	}
	else{
		currentColor = Color.Lerp(currentColor, Color(1,1,1,0), Time.deltaTime * blendSpeed);
	}

	if(Time.time > nextParticle){
		NewParticle();
	}
	pRenderer.material.color = currentColor;

	pEmitter.maxEnergy = trailPos.GetTrailLength() / speed;
	pEmitter.minEnergy = pEmitter.maxEnergy;

	pEmitter.maxEmission = rate;
	pEmitter.minEmission = pEmitter.maxEmission;

	var particles : Particle[] = pEmitter.particles;
	for(var i = 0; i < particles.Length; i++){
		particles[i].energy -= Time.deltaTime;
		var life : float = particles[i].energy / particles[i].startEnergy;
		if(!reverse){
			life = 1 - life;
		}
		particles[i].position = trailPos.GetCurvePos(life);
	}
	pEmitter.particles = particles;


}

function SetStartParticles(pEmitter : ParticleEmitter){
	var particleDuration : float = trailPos.GetTrailLength() / speed;

	var count : int = particleDuration * rate;
	var startParticles : Particle[] = new Particle[count];
	for(var i = 0; i < count; i ++){
		startParticles[i].startEnergy = particleDuration;
		startParticles[i].energy = i * (particleDuration / count);
		startParticles[i].size = pEmitter.maxSize;
		startParticles[i].color = Color.white;
		var life : float = 1.0 - (startParticles[i].energy / startParticles[i].startEnergy);
		startParticles[i].position = trailPos.GetCurvePos(life);
	}
	pEmitter.particles = startParticles;
}

/*function OnGUI(){
	for(var i = 0; i < pEmitter.particleCount; i++){
		var life : float = 1.0 - (pEmitter.particles[i].energy / pEmitter.particles[i].startEnergy);
		GUILayout.Label(life.ToString());
	}
}*/