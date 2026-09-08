#pragma strict

var fish : Fish[];

var shoalCenter : Vector3;
var shoalCenterTarget : Vector3;
private var shoalDir : int = 1;
var shoalSpeed : float;

var shoalMaxX : float;
var shoalMinX : float;
var top : float;
var bottom : float;

var waterLevel : float;

var shoalSeparationMin : Vector2 = Vector2(.8,.3);
var shoalSeparationMax : Vector2 = Vector2(1.5,.8);
private var shoalSeparation : Vector2;

var shoalWaveSize : float = 0.2;
var shoalWaveAmplitude : Vector2 = Vector2(1.0,1.0);

private var shoalReachTarget : boolean;
private var nextShoalThreatCheck : float;
var shoalThreatCheckEverySeconds : float = .5;
var threatRadius : float = 2.0;

var swimForceDuration : float = .2;
var swimEverySeconds : float = .8;
var swimEverySecondsFast : float = .2;
var swimRandomize : float = .4;
var swimForce : float = 1.0;

var fishDrag : float = .5;
var fishAngleDrag : float = 2.0;

var fishIdleAnimation : AnimationClip;
var fishSwimAnimation : AnimationClip;

var fishAngleSpeed : float = 1.0;

var spineBend : float = 3.0;

var fishLittleJumpSpeed : float = 5.0;

var rigidbodyList : Rigidbody[];

var getAwayRadius : float = 1.0;

var useYOffset : float = 1.0;

var fishAirGravity : float = 10.0;
var fishWaterGravity : float = .1;

var maxAngleSpeed : float = 3.0;

var fishCollisionRadius : float = .5;

var splashPrefab : GameObject;

var waterWavesScript : WaterWaves;
//var waterObjects : Transform[];
var splashSize : float = .1;
var minSplashSize : float = .3;

var shoalCenterDistCheck : float = .3;

static var waterLevelOffset : float = -.3;

class Fish{
	var transform : Transform;
	var animation : Animation;
	var targetPos : Vector3;
	
	var velocity : Vector2;
	var lastSwimTime : float;
	var nextSwimTime : float;
	
	var angleTarget : float;
	var angleSpeed : float;
	var angle : float;
	
	var swimmingAway : boolean;
	var wasSwimmingAway : boolean;
	
	var underwater : boolean;
	var wasUnderwater : boolean;
	
	var body : Transform;
}

function Start () {
	NewShoalTarget();
	shoalCenter = shoalCenterTarget;
	shoalReachTarget = true;
	
	GatherFish();
	
	if(transform.parent != null){
		waterWavesScript = transform.parent.gameObject.GetComponent(WaterWaves);
	}
	
	GetRigidbodyList();
	
	/*var affectWaterTags : GameObject[] = GameObject.FindGameObjectsWithTag("Affect Water");
	rigidbodyList = new Rigidbody[affectWaterTags.Length];
	for(i = 0; i < rigidbodyList.Length; i++)
		rigidbodyList[i] = affectWaterTags[i].transform.parent.GetComponent(Rigidbody);*/
}

function LateUpdate () {
	if(waterWavesScript == null && transform.parent != null)waterWavesScript = transform.parent.gameObject.GetComponent(WaterWaves); 
	if(waterWavesScript != null && rigidbodyList == null) rigidbodyList = waterWavesScript.rigidbodyList;
	if(fish == null) GatherFish();
	if(fish == null) return;
	
	if(shoalReachTarget) NewShoalTarget();
	
	shoalCenter = Vector3.MoveTowards(shoalCenter, shoalCenterTarget, Time.deltaTime * shoalSpeed);
	
	if((shoalCenter - shoalCenterTarget).magnitude < shoalCenterDistCheck) shoalReachTarget = true;
	else shoalReachTarget = false;
	
	if(Time.time > nextShoalThreatCheck){
		nextShoalThreatCheck = Time.time + shoalThreatCheckEverySeconds;
		for(var m = 0; m < rigidbodyList.Length; m++){
			if(rigidbodyList[m] == null) GetRigidbodyList();
			else{
				if(Vector3.Distance(rigidbodyList[m].position, shoalCenterTarget) < threatRadius){
					NewShoalTarget();
				}
			}
		}
	}
	
	if(waterWavesScript != null){
		waterLevel = waterWavesScript.waterLevel;
		splashPrefab = waterWavesScript.splashPrefab;
	}
	
	for(var i = 0; i < fish.Length; i++){
		fish[i].targetPos = shoalCenter;
		var gridSize : int = Mathf.Round(Mathf.Sqrt(fish.Length));
		var column : int = i % gridSize;
		var row : int = Mathf.Floor(i / gridSize);
		shoalSeparation = Vector2.Lerp(shoalSeparationMin, shoalSeparationMax, (Mathf.Sin(Time.time) + 1) * .5);
		fish[i].targetPos.x += column * shoalSeparation.x;
		fish[i].targetPos.y += row * shoalSeparation.y;
		
		fish[i].targetPos.y += 
		Mathf.Sin(fish[i].targetPos.x * shoalWaveAmplitude.x  + fish[i].targetPos.y * shoalWaveAmplitude.y) * shoalWaveSize;
		
		fish[i].wasSwimmingAway = fish[i].swimmingAway;
		fish[i].swimmingAway = false;
		//Swim away from rigidbodies.
		for(var n = 0; n < rigidbodyList.Length; n++){
			if(rigidbodyList[n] != null && fish[i] != null){
				var distance : float = Vector2.Distance(Vector2(rigidbodyList[n].position.x,  rigidbodyList[n].position.y + useYOffset),
				Vector2(fish[i].transform.position.x, fish[i].transform.position.y) );
													    
				if(distance < getAwayRadius){
					var newTargetPos : Vector3 = rigidbodyList[n].position + (fish[i].transform.position - rigidbodyList[n].position ).normalized * getAwayRadius * 1.5;
					Debug.DrawLine(fish[i].transform.position, newTargetPos, Color.blue);
					newTargetPos.z = fish[i].targetPos.z;//Don't change Z.
					
					//if(newTargetPos.y > top) newTargetPos.y = top;
					
					fish[i].targetPos =  newTargetPos;
					fish[i].swimmingAway = true;
					
					if(!fish[i].wasSwimmingAway) fish[i].nextSwimTime = Time.time;
					
					Debug.DrawLine(fish[i].transform.position, newTargetPos, Color.blue);
				}
			}									    
		}
		
		//Set swim time.
		if(Time.time >  fish[i].nextSwimTime){ 
			fish[i].lastSwimTime = Time.time;
			
			if(fish[i].swimmingAway) fish[i].nextSwimTime = Time.time + swimEverySecondsFast;
			else fish[i].nextSwimTime = Time.time + swimEverySeconds + Random.Range(-swimRandomize*.5, swimRandomize);

				
			fish[i].angleTarget = Mathf.Atan2((fish[i].targetPos.y - fish[i].transform.position.y) * .3, fish[i].targetPos.x - fish[i].transform.position.x) * Mathf.Rad2Deg;
		}
		//Apply swim velocity.
		if(Time.time >= fish[i].lastSwimTime && Time.time < fish[i].lastSwimTime + swimForceDuration){
			//fish[i].animation[fishSwimAnimation.name].normalizedTime = 0.0;
			
			fish[i].velocity += Vector3(Mathf.Cos(fish[i].angle * Mathf.Deg2Rad),Mathf.Sin(fish[i].angle * Mathf.Deg2Rad),0)
			*swimForce * Time.deltaTime;
			
			fish[i].angleSpeed += Mathf.DeltaAngle(fish[i].angle, fish[i].angleTarget) * fishAngleSpeed * Time.deltaTime;
			//fish[i].angleSpeed = 20;
		}
		//Drag velocity.
		if(fish[i].underwater)
			fish[i].velocity = Vector3.Lerp(fish[i].velocity, Vector3.zero, Time.deltaTime * fishDrag);
		
		//Underwater
		fish[i].wasUnderwater = fish[i].underwater;
		if(fish[i].transform.position.y < waterLevel + waterLevelOffset){
			fish[i].velocity.y -= fishWaterGravity * Time.deltaTime;//Gravity.
			fish[i].underwater = true;
		}
		else{
			fish[i].velocity.y -= fishAirGravity * Time.deltaTime;//Gravity.
			fish[i].underwater = false;
		}
		//Make little jump.
		if(!fish[i].underwater && fish[i].wasUnderwater){
			fish[i].velocity.y = Random.Range(fishLittleJumpSpeed*.5, fishLittleJumpSpeed);
			
			//Splash.
			MakeSplash(i);
		}
		
		//Got back in water.
		if(fish[i].underwater && !fish[i].wasUnderwater){
			MakeSplash(i);
		}
		
		fish[i].transform.position += fish[i].velocity * Time.deltaTime;
		
		//Look at the correct side.
		//Scale
		//if(fish[i].velocity.x < 0)fish[i].transform.localScale.y = -Mathf.Abs(fish[i].transform.localScale.y);
		//else fish[i].transform.localScale.y = Mathf.Abs(fish[i].transform.localScale.y);
		if(Mathf.Cos(fish[i].angle * Mathf.Deg2Rad) < 0)fish[i].transform.localScale.y = -Mathf.Abs(fish[i].transform.localScale.y);
		else fish[i].transform.localScale.y = Mathf.Abs(fish[i].transform.localScale.y);
		
		fish[i].transform.rotation = Quaternion.identity;

		
		fish[i].angleSpeed = Mathf.Clamp(fish[i].angleSpeed, - maxAngleSpeed, maxAngleSpeed);
		
		fish[i].angleSpeed = Mathf.Lerp(fish[i].angleSpeed, 0, Time.deltaTime * fishAngleDrag); //Angle drag.
		
		fish[i].angle += fish[i].angleSpeed;
		
		fish[i].transform.RotateAround(fish[i].transform.position, Vector3.forward, fish[i].angle);
		
		//Animation.
		fish[i].animation[fishSwimAnimation.name].weight = Mathf.Lerp(fish[i].animation[fishSwimAnimation.name].weight,
		Mathf.Clamp01(fish[i].animation[fishSwimAnimation.name].length - (Time.time - fish[i].lastSwimTime)),
		Time.deltaTime * 5.0);
		fish[i].animation[fishIdleAnimation.name].weight = 1 - fish[i].animation[fishSwimAnimation.name].weight;
		
		//fish[i].animation[fishSwimAnimation.name].time = Time.time;
		//fish[i].animation[fishIdleAnimation.name].time = Time.time;
		
		//Head rotation.
		fish[i].body.localEulerAngles.y = -fish[i].angleSpeed * spineBend;
		//fish[i].body.RotateAround(fish[i].body.position, Vector3.forward, Mathf.DeltaAngle(fish[i].angle, fish[i].angleTarget));
		
		//Collision.
		var ray : Ray = Ray(fish[i].transform.position, fish[i].velocity);
		var hit : RaycastHit;
		if(Physics.Raycast(ray, hit, fishCollisionRadius, 10.0)){
			//fish[i].transform.position = hit.point - fish[i].velocity.normalized * fishCollisionRadius;
			fish[i].velocity = (fish[i].transform.position - hit.point).normalized;
			
			var extraForce : float = 1.0;
			var waterSide : float = Mathf.Sign(((shoalMinX + shoalMaxX)*.5) - fish[i].transform.position.x);
			if(!fish[i].underwater) extraForce = Random.Range(1.0,3.0);
			
			fish[i].velocity.y += extraForce;
			fish[i].velocity.x += extraForce * waterSide * .3;

		}
		
		//Debug.
		DebugUtility.DrawPoint(fish[i].targetPos, .2, Color.white);
		Debug.DrawLine(fish[i].transform.position, fish[i].targetPos, Color.gray);
	}
}

function NewShoalTarget(){
	 //shoalCenterTarget = Vector3(Random.Range(shoalMinX, shoalMaxX), Random.Range(bottom, top), transform.position.z);
	 /*if(shoalCenterTarget.x - shoalMinX < shoalMaxX - shoalCenterTarget.x)shoalCenterTarget.x = shoalMinX - Random.value *.5;
	 else shoalCenterTarget.x = shoalMaxX + Random.value * .5;
	 shoalCenterTarget.y = Random.Range(bottom,top);*/
	 
	 if(shoalCenterTarget.x != shoalMinX && shoalCenterTarget.x != shoalMaxX){
	 	if(shoalDir > 0){
	 		shoalCenterTarget.x = shoalMaxX;
	 		shoalCenterTarget.y  = (top + bottom) * .5;
	 	}
	 	if(shoalDir < 0){
	 		shoalCenterTarget.x = shoalMinX;
	 		shoalCenterTarget.y  = (top + bottom) * .5;
	 	}
	 }
	 else{
		 if(shoalCenterTarget.x == shoalMinX){
		 	shoalCenterTarget.x = (shoalMinX + shoalMaxX) * .5;
		 	shoalCenterTarget.y = top;
		 	shoalDir = 1;
		 }
		 if(shoalCenterTarget.x == shoalMaxX){
		 	shoalCenterTarget.x = (shoalMinX + shoalMaxX) * .5;
		 	shoalCenterTarget.y = bottom;
		 	shoalDir = -1;
		 }
	}
	 
}

function MakeSplash(fishIndex : int){
	if(splashPrefab != null){
		var newSplashSprite : GameObject = Instantiate(splashPrefab,
		Vector3(fish[fishIndex].transform.position.x, waterLevel, fish[fishIndex].transform.position.z + .1), Quaternion.identity);
		
		if(	waterWavesScript != null){	
			newSplashSprite.GetComponent(StayOnWater).SetLeftRightWaterObjects(waterWavesScript.waterWaves);
		}
		
		newSplashSprite.transform.localScale = Vector3.one * minSplashSize + Vector3(0.5,1,0.5) * Mathf.Abs(fish[fishIndex].velocity.y) * splashSize;
		newSplashSprite.GetComponent.<Animation>()["Splash"].speed = 1.5; 
	}
}

function GatherFish(){
	//fish = new Fish[transform.childCount];
	var fishArray = new Array();
	for(var i = 0; i < transform.childCount; i++){
		if(!transform.GetChild(i).name.StartsWith("Fish"))continue;
		if(transform.GetChild(i).GetComponent.<Animation>() == null) continue;
		var newFish : Fish = new Fish();
		newFish.transform = transform.GetChild(i);
		newFish.animation = transform.GetChild(i).gameObject.GetComponent.<Animation>();
		newFish.animation[fishSwimAnimation.name].enabled = true;
		newFish.animation[fishIdleAnimation.name].enabled = true;
		
		newFish.animation[fishSwimAnimation.name].normalizedTime = Random.value;
		
		var allFishChildren : Transform[] = newFish.transform.gameObject.GetComponentsInChildren.<Transform>() as Transform[];
		for(var n = 0; n < allFishChildren.Length; n++)if(allFishChildren[n].name.StartsWith("Body")){newFish.body = allFishChildren[n];break;}
		
		fishArray.push(newFish);
	}
	fish = fishArray.ToBuiltin(Fish) as Fish[];
}

function OnDrawGizmosSelected(){
	Gizmos.color = Color.red;
	Gizmos.DrawLine(Vector3(shoalMinX, top, 0), Vector3(shoalMinX, bottom, 0));
	Gizmos.color = Color.blue;
	Gizmos.DrawLine(Vector3(shoalMaxX, top, 0), Vector3(shoalMaxX, bottom, 0));
	Gizmos.color = Color.green;
	Gizmos.DrawLine(Vector3(shoalMinX,bottom,0), Vector3(shoalMaxX, bottom,0));
	Gizmos.color = Color.cyan;
	Gizmos.DrawLine(Vector3(shoalMinX,top,0), Vector3(shoalMaxX, top,0));
	
	Gizmos.color = Color.yellow;
	Gizmos.DrawLine(Vector3(shoalMinX + .5,waterLevel,0), Vector3(shoalMaxX - .5, waterLevel,0));	
	
	Gizmos.color = Color.red;
	Gizmos.DrawSphere(shoalCenter, .1);
	Gizmos.color = Color.yellow;
	Gizmos.DrawSphere(shoalCenterTarget, .05);
}

function GetRigidbodyList(){
	rigidbodyList  = GameObject.FindObjectsOfType.<Rigidbody>();
}
