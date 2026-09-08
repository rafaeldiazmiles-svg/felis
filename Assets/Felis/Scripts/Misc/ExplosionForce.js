#pragma strict

var pieces : Rigidbody[];

var parentOfRBs : Transform;
var useChildRBs : boolean;

var explode : boolean;

var explosionForce : float;
var useDuration : boolean;
var forceDuration : float;
var exploding : boolean;
var explodeStartTime : float;
var explosionRadius  :float;
var upwardsModifier : float;

var setKinematicFalse : boolean;
var setUseGravity : boolean;

var playAudio : AudioSource;

function Explode(){
	explode = true;
}

function Start () {
	if(useChildRBs){
		if(parentOfRBs != null){
			pieces = parentOfRBs.GetComponentsInChildren.<Rigidbody>();
		}
		else{
			pieces = GetComponentsInChildren.<Rigidbody>();
		}

	}
}

function FixedUpdate(){
	if(useDuration && explode){
		explode = false;
		if(playAudio != null){
			playAudio.Play();
		}
		exploding = true;
		explodeStartTime = Time.time;

		for(var i = 0; i < pieces.Length; i++){
			if(setKinematicFalse){
				pieces[i].isKinematic = false;
			}
			if(setUseGravity){
				pieces[i].useGravity = true;
			}
		}	
	}

	if(exploding){
		if(Time.time < explodeStartTime + forceDuration){
			for(i = 0; i < pieces.Length; i++){

				pieces[i].AddExplosionForce(explosionForce, transform.position, explosionRadius, upwardsModifier);
			}			
		}
		else{
			exploding = false;
		}
	}

}

function Update () {
	if(explode && !useDuration){
		explode = false;

		if(playAudio != null){
			playAudio.Play();
		}

		for(var i = 0; i < pieces.Length; i++){
			if(setKinematicFalse){
				pieces[i].isKinematic = false;
			}
			if(setUseGravity){
				pieces[i].useGravity = true;
			}
			pieces[i].AddExplosionForce(explosionForce, transform.position, explosionRadius, upwardsModifier);
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR

	DebugUtility.DrawCircle(transform.position, explosionRadius,  Vector3.forward);

	#endif
}