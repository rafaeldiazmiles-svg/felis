#pragma strict

var particleComp : ParticleEmitter;

var centerTransform : Transform;
var center : Vector3;
var gravForce : float = 1.0;

var drag : float;

var destroyRadius : float = .3;

function Start () {
	particleComp = GetComponent.<ParticleEmitter>();
}

function Update () {
	if(centerTransform != null){
		center = centerTransform.position;
	}

	var particles : Particle[] = particleComp.particles;
	
	for(var i = 0; i < particles.Length; i++){
		particles[i].velocity += (center - particles[i].position).normalized * gravForce * Time.deltaTime;

		particles[i].velocity = Vector3.Lerp(particles[i].velocity, Vector3.zero, Time.deltaTime * drag);

		particles[i].position += particles[i].velocity * Time.deltaTime;

		if(Vector3.Distance(particles[i].position, center) < destroyRadius){
			particles[i].energy -= Time.deltaTime;
		}
	}
	
	particleComp.particles = particles;
}