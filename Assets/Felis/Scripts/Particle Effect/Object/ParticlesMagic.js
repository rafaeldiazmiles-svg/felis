#pragma strict

var particleComp : ParticleEmitter;
var rb : Rigidbody;


var drag : float = 1.0;
var originGravityRange : float = 1.0;
var originGravityForce : float = 1.0;

var redCurve : AnimationCurve;
var greenCurve : AnimationCurve;
var blueCurve : AnimationCurve;
var alphaCurve : AnimationCurve;

function Start () {
	particleComp = GetComponent.<ParticleEmitter>();

}

function Update () {
	var particles : Particle[] = particleComp.particles;
	
	for(var i = 0; i < particles.Length; i++){
		if(particles[i].energy == particles[i].startEnergy){
			particles[i].velocity = rb.velocity;
		} 
		else{
			particles[i].velocity = Vector3.Lerp(particles[i].velocity, Vector3.zero, Time.deltaTime * drag);

			var originDist : float = Vector3.Distance(rb.transform.position, particles[i].position);

			particles[i].velocity += (rb.transform.position - particles[i].position).normalized * originGravityForce * (Mathf.Max(0, originGravityRange  - originDist) / originGravityRange);
		}
		particles[i].energy -= Time.deltaTime;

		particles[i].position += particles[i].velocity * Time.deltaTime;

		var life : float = (particles[i].startEnergy - particles[i].energy) / particles[i].startEnergy;
		particles[i].color = Color(redCurve.Evaluate(life), greenCurve.Evaluate(life), blueCurve.Evaluate(life), alphaCurve.Evaluate(life));
	}
	
	particleComp.particles = particles;
}