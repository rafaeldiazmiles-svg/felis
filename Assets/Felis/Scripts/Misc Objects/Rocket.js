#pragma strict

var rocketProjectile : Projectile;
var fireShakiness : Shakiness;
var defaultScale : Vector3;
var defaultMaxScaleShake : Vector3;
var defaultMinScaleShake : Vector3;
var scaleFireOverTime : AnimationCurve;
var multiplyScaleCurve : float = 1.0;

var shootSpeedRandomize : boolean;
var shootSpeedRandomizeValue : Vector2;

var readyToShoot : boolean;

var shootTriggerTimeRange : Vector2;
var shootTriggerTime : float;
var shotRocket : boolean;

var explodeAfterShootTriggerTimeRange : Vector2;
var explodeAfterShootTriggerTime : float;
var explode : ToggleBoolean;

var rocketRenderer : Renderer;

var randomizeXStartSpeed : float;

var reset : boolean;

var pieces : GameObject;
var explosionSmoke : GameObject;
var sparksExplosion : GameObject;
var flash : GameObject;

var sparksColorList : Color[];

var avoidPoint : Transform;
var avoidPointDeltaPos : Vector3;
var avoidPointCurrentDistance : float;
var avoidRange : float;
var avoidRangeCurve : float;
var avoidPower : float;
var currentAvoirPower : float;

var launchSound : AudioSource;
var launchSoundPitchRange : Vector2 = Vector2(.7,1.0);

function Start () {
	defaultScale = transform.localScale;
	defaultMaxScaleShake = fireShakiness.maxScale;
	defaultMinScaleShake = 	fireShakiness.minScale;
	
	shootTriggerTime = Random.Range(shootTriggerTimeRange.x, shootTriggerTimeRange.y);
	
	explodeAfterShootTriggerTime = Random.Range(explodeAfterShootTriggerTimeRange.x, explodeAfterShootTriggerTimeRange.y);
	
	if(shootSpeedRandomize){
		rocketProjectile.shootSpeed.y = Random.Range(shootSpeedRandomizeValue.x, shootSpeedRandomizeValue.y);
	}
}

function Update () {
	var scaleCurveValue : float = scaleFireOverTime.Evaluate((Time.time - rocketProjectile.shootTime) * multiplyScaleCurve);
	fireShakiness.defaultLocalScale = defaultScale * scaleCurveValue;
	fireShakiness.maxScale = defaultMaxScaleShake * scaleCurveValue;
	fireShakiness.minScale = defaultMinScaleShake * scaleCurveValue;
	
	if(shotRocket && Time.time > rocketProjectile.shootTime + explodeAfterShootTriggerTime){
		rocketProjectile.enabled = false;
		explode.current = true;
		rocketRenderer.enabled = false;
	}	
	
	if(readyToShoot && !shotRocket && Time.time > shootTriggerTime){
		rocketProjectile.shoot = true;
		rocketProjectile.shootSpeed.x += Random.Range(-randomizeXStartSpeed, randomizeXStartSpeed);
		explodeAfterShootTriggerTime = Random.Range(explodeAfterShootTriggerTimeRange.x, explodeAfterShootTriggerTimeRange.y);
		shotRocket = true;
		
		launchSound.pitch = Random.Range(launchSoundPitchRange.x, launchSoundPitchRange.y);
		launchSound.Play();
	}
	
	if(reset){
		rocketRenderer.enabled = true;
		shotRocket = false;
		explode.current = false;
		rocketProjectile.enabled = true;
		shootTriggerTime = Time.time + Random.Range(shootTriggerTimeRange.x, shootTriggerTimeRange.y);
		rocketProjectile.reset = true;
		reset = false;
	}
	
	explode.Update();
	
	if(explode.toggledTrue){
		
		var newPieces : GameObject = Instantiate(pieces, transform.position, transform.rotation);
		newPieces.GetComponent(PiecesExplosion).parentInertia = rocketProjectile.speed;
		
		var newExplosionSmoke : GameObject = Instantiate(explosionSmoke, transform.position, Quaternion.identity);
		
		var newSparksExplosion : GameObject = Instantiate(sparksExplosion, transform.position, Quaternion.identity);
		newSparksExplosion.GetComponent(FWSparks).endColor = sparksColorList[Mathf.RoundToInt(Random.value * (sparksColorList.Length-1))];
		
		var newFlash : GameObject = Instantiate(flash);
		newFlash.transform.position = transform.position;
		
	}
	
	//Avoid getting behind machine.
	if(shotRocket){
		avoidPointDeltaPos = transform.position - avoidPoint.position;
		if(Mathf.Sign(rocketProjectile.speed.x) != Mathf.Sign(avoidPointDeltaPos.x)){
			avoidPointCurrentDistance = avoidPointDeltaPos.magnitude;
			
			currentAvoirPower = Mathf.Sign(avoidPointDeltaPos.x) * Mathf.Pow((Mathf.Max(0, avoidRange - avoidPointCurrentDistance) / avoidRange), avoidRangeCurve) * avoidPower * Time.deltaTime;
			
			rocketProjectile.speed.x += currentAvoirPower;
		}
	}
}