#pragma strict

var shoot : ToggleBoolean;

var ammoPrefab : GameObject;
var shootBone : Transform;

var shootForce : float = 10;

var fireBurstPrefab : GameObject;
var fireBurstScale : float = 1.7;

var shootSound : AudioSource;

var fuse : Fuse;

@Space(30)

var feed : FeedCannonBall;

function Start () {

}

function Update () {
	

	if(fuse != null){
		if(fuse.fuseOn.toggledFalse){
			shoot.current = true;
		}
	}

	shoot.Update();

	if(shoot.toggledTrue){
		shoot.current = false;
		if(feed == null || feed != null && feed.cannonBallFed.current){
			if(feed != null){
				feed.cannonBallFed.current = false;
			}
			if(shootSound != null){
				shootSound.Play();
			}


			if(ammoPrefab != null){
				var firedBullet : GameObject = Instantiate(ammoPrefab);
				if(shootBone != null){
					firedBullet.transform.position = shootBone.position;
				}
				else{
					firedBullet.transform.position = transform.position;
				}
				var firedBulletRB : Rigidbody = firedBullet.GetComponentInChildren.<Rigidbody>();
				firedBulletRB.AddForce(transform.forward * shootForce);
				
				if(fireBurstPrefab != null && shootBone != null){
					var newFireBurst : GameObject = Instantiate(fireBurstPrefab);
					newFireBurst.transform.position = shootBone.position;
					newFireBurst.transform.parent = shootBone;
					newFireBurst.transform.localScale = Vector3.one * fireBurstScale;
				}
			}
		}
	}
}