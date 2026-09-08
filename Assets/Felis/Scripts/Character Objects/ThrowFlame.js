#pragma strict

var anim : PlayStillAnimation;

var throwFlame : ToggleBoolean;

var flameDelay : float = .5;

var flameDuration : float = .5;

var flameOrigin : Transform;
var flameOriginFwd : Vector3 = Vector3(-1,0,0);

var flamePrefab : GameObject;

var flameTimer : Timer;

var flameSpeed : float = 5.0;

var headRB : Rigidbody;
var flameForceBack : float = 10.0;
var addVel : float;

var sound : PlayRandomSound;
var playedSound : boolean;

var screamChance : float = .2;

function Start () {

}

function Update () {
	throwFlame.Update();

	if(throwFlame.toggledTrue){
		if(Random.value < screamChance){
			anim.animationPlay.current = true;
			throwFlame.current = false;
		}
		else{
			anim.PlayNoSound();
			playedSound = false;
		}
	}

	flameTimer.Update();

	if(throwFlame.current){
		if(Time.time > throwFlame.toggledTrueTime + flameDelay){
			if(!playedSound){
				playedSound = true;
				sound.PlaySound();
			}

			if(flameTimer.current){
				var newFlame : GameObject = GameObject.Instantiate(flamePrefab);
				newFlame.transform.position = flameOrigin.position;
				newFlame.transform.position += headRB.GetPointVelocity(flameOrigin.position) * addVel;

				var newFlameC : Flame = newFlame.GetComponent.<Flame>();
				newFlameC.pSpeed.lockToSource = flameOrigin;
				newFlameC.pSpeed.startSpeed.x = flameSpeed * flameOrigin.TransformDirection(flameOriginFwd).x;
				newFlameC.pSpeed.startSpeed.y = flameSpeed * flameOrigin.TransformDirection(flameOriginFwd).y;



				newFlameC.pSpeed.Reset();
			}	
		}

		if(Time.time > throwFlame.toggledTrueTime + flameDelay + flameDuration){
			throwFlame.current = false;
		}
	}
}

function FixedUpdate(){
	if(throwFlame.current){
		if(Time.time > throwFlame.toggledTrueTime + flameDelay){
			headRB.AddForce(flameOrigin.TransformDirection(-flameOriginFwd) * flameForceBack) ;
		}
	}
}