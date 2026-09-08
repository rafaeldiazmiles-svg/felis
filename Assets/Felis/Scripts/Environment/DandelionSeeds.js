#pragma strict

function Update () {
	//Flying seeds.
	var particles : Particle[] = GetComponent.<ParticleEmitter>().particles;
	for(var i = 0; i < particles.Length; i++){
		particles[i].position.x -= Time.deltaTime;
		particles[i].position.y += (particles[i].energy + Mathf.Sin(Time.time * 2.0 + particles[i].position.x )) * Time.deltaTime *.1;
		particles[i].rotation += 60 * Mathf.Sin(Time.time * 3.0 + particles[i].position.x ) * Time.deltaTime;;
		particles[i].color.a = particles[i].energy / 6.0;
		//particles[i].size = particleSize;
		
		particles[i].energy -= Time.deltaTime;
	}
	GetComponent.<ParticleEmitter>().particles = particles;
}