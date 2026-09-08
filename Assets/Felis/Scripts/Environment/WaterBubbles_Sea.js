#pragma strict

var player : GameObject;
var getPlayerFromFollowComp : boolean = true;
var playerRB : Rigidbody;
var playerUnderwater : UnderWater;
var playerTag : String = "Player";
var getTimer : Timer;
@Space(30)
var follow : Follow;
var offsetMul : Vector3 = Vector2(5.0,2.0);
var maxOffset : Bounds;
var comeBackSpeed : float = 3;
@Space(30)
var particleSyst : ParticleSystem;
var particles : ParticleSystem.Particle[];
var particles_rateByRBVel : AnimationCurve;
var particles_ReduceLifetimeByRBVel : float = .5;

@Space(30)
var waterAreas : WaterArea[];


function Start () {
	follow = GetComponent.<Follow>();
	particleSyst = GetComponent.<ParticleSystem>();
}

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
	GetPlayerComps();
}

function GetPlayerComps(){
	if(player != null){
		playerRB = player.GetComponent.<Rigidbody>();
		playerUnderwater = player.GetComponentInChildren.<UnderWater>();
	}	
}

function GetWaterAreas(){
	waterAreas = GameObject.FindObjectsOfType.<WaterArea>();
}

function Update () {
	if(getPlayerFromFollowComp && player == null && follow != null && follow.target != null){
		player = follow.target.gameObject;
		GetPlayerComps();
	}

	getTimer.Update();
	if(getTimer.current){
		if(player == null){
			GetPlayer();
		}
		GetWaterAreas();
	}

	if(playerRB != null && follow != null){
		follow.offset.x += playerRB.velocity.x * Time.deltaTime * offsetMul.x;
		follow.offset.y += playerRB.velocity.y * Time.deltaTime * offsetMul.y;
		follow.offset = Vector3.MoveTowards(follow.offset, Vector3.zero, Time.deltaTime * comeBackSpeed);
		follow.offset = maxOffset.ClosestPoint(follow.offset);


		if(playerUnderwater.isUnderwater.current){
			particleSyst.emission.enabled = true;
			var rate : ParticleSystem.MinMaxCurve = particleSyst.emission.rate;
			rate.constantMax = particles_rateByRBVel.Evaluate(Vector3.Distance(transform.position, player.transform.position));
			particleSyst.emission.rate = rate;
		}
		else{
			particleSyst.emission.enabled = false;
		}


		if(particles == null || particles.Length < particleSyst.maxParticles){
			particles = new ParticleSystem.Particle[particleSyst.maxParticles];
		}

		var aliveParticles : int = particleSyst.GetParticles(particles);
		for(var i = 0; i < particles.Length; i++){
			if(!playerUnderwater.CheckPointForWater(particles[i].position)){
				particles[i].remainingLifetime = 0.0;
			}

			particles[i].remainingLifetime -= Time.deltaTime * playerRB.velocity.magnitude * particles_ReduceLifetimeByRBVel;
		}
		particleSyst.SetParticles(particles, aliveParticles);
	}
}

/*function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.DrawWireCube(maxOffset.center + transform.position, maxOffset.size);
	#endif
}*/