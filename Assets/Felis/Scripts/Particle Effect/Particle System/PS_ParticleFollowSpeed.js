#pragma strict

var ps : ParticleSystem;
var particles : ParticleSystem.Particle[];

function Start () {
	if(ps == null){
		ps = GetComponent.<ParticleSystem>();
	}
}

function Update () {
	if(particles == null || particles.Length < ps.maxParticles){
		particles = new ParticleSystem.Particle[ps.maxParticles];
	}
	var pCount : int = ps.GetParticles(particles);

	for(var i = 0; i < pCount; i++){
		particles[i].rotation = Mathf.Atan2(particles[i].velocity.y, particles[i].velocity.x) * Mathf.Rad2Deg;
	}
	
	ps.SetParticles(particles, pCount);
}