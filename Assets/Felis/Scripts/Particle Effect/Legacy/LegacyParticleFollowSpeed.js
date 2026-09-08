#pragma strict

@script ExecuteInEditMode()

var particleComp : ParticleEmitter;

function Start () {
	particleComp = GetComponent.<ParticleEmitter>();
}

function Update () {
	var particles : Particle[] = particleComp.particles;
	
	for(var i = 0; i < particles.Length; i++){
		particles[i].rotation = Mathf.Atan2(particles[i].velocity.y, particles[i].velocity.x) * Mathf.Rad2Deg;
	}
	
	particleComp.particles = particles;
}