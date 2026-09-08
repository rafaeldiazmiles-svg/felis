#pragma strict

var player : GameObject;
var playerTag : String = "Player";
var moveBounds : Bounds;

var getTimer : Timer;

var boatTarget : IsWorldPosition;
var boatTargetY : float;
var minTideWaveHeight : float = .2; //The vertical wave motion.
var tideWaveFreq : float = 1.0; //The velocity at which the boat oscilattes in a wave motion.
var maxTideWaveHeight : float = 1.0; //The max vertical wave motion of the boat as it moves.
var maxTideWaveSpeed : float = 3.0; //The boat horizontal speed at which the max tide wave height is reached.
var sailSpeed : float;
var currentSailSpeed : FloatLerp;

var inBoatBounds : BoxCollider;
var rbs : Rigidbody[];

var rb : Rigidbody;

var prevPos : Vector3;
var moveWBoat : float = .7;

var waterArea : WaterArea;
var checkWaterOffset : Vector3;
var inWater : boolean;

var sail : ConstantForce;
var sailForce : Vector3;

var sailAudio : AudioSource[];
var sailing : ToggleBoolean;

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
}

function GetRBs(){
	rbs = GameObject.FindObjectsOfType.<Rigidbody>();
}

function Start () {
	sail = GetComponentInChildren.<ConstantForce>();

	waterArea = GameObject.FindObjectOfType.<WaterArea>();
	
	rb = GetComponentInChildren.<Rigidbody>();
	
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}
	GetPlayer();
	
	if(boatTarget == null){
		boatTarget = GetComponentInChildren.<IsWorldPosition>();
		if(boatTarget == null){
			GameObject.Find("Boat Target");
		}
	}
	
	if(boatTarget != null){
		boatTargetY = boatTarget.transform.position.y;
	}
	
	if(inBoatBounds == null){
			var obj : Transform = transform.Find("Inside Boat");
		if(obj != null){
			inBoatBounds = obj.GetComponent.<BoxCollider>();
		}
	}

	if(currentSailSpeed.speed == 0.0){
		currentSailSpeed.speed = 3.0;
	}
}

function Update () {
	inWater = false;
	if(waterArea != null){
		if(waterArea.IsPointInWater(transform.position + checkWaterOffset)){
			inWater = true;
		}
	}
	
	getTimer.Update();
	
	if(getTimer.current){
		if(player == null){
			GetPlayer();
		}
		GetRBs();
	}	
	
	
	if(inWater){
		if(boatTarget != null){
			var vel : float = Mathf.Abs(rb.velocity.x);
			var movWave : float = Mathf.Min(vel,maxTideWaveSpeed) / maxTideWaveSpeed;
			movWave *= maxTideWaveHeight;
			boatTarget.worldPosition.y = boatTargetY + Mathf.Sin(Time.time * tideWaveFreq) * (minTideWaveHeight + movWave);
		}

			var center : Vector3;
		currentSailSpeed.target = 0.0;
		sail.force = Vector3.zero;
		sailing.current = false;
		if(player != null){
			center = moveBounds.center;
			moveBounds.center += transform.position;
			if(moveBounds.Contains(player.transform.position)){
				//boatTarget.worldPosition.x += sailSpeed * Time.deltaTime;
				currentSailSpeed.target = sailSpeed;
				sail.force = sailForce;
				sailing.current = true;
			}
			moveBounds.center = center;
		}
		sailing.Update();
		if(sailing.toggledTrue){
			if(sailAudio != null && sailAudio.Length > 0){
				sailAudio[Random.value * sailAudio.Length].Play();
			}
		}
		
		currentSailSpeed.Lerp();
		
		boatTarget.worldPosition.x += currentSailSpeed.current * Time.deltaTime;
	}

}

function FixedUpdate(){
	var deltaPos : Vector3 = transform.position - prevPos;
	prevPos = transform.position;

	if(inBoatBounds != null){
		inBoatBounds.isTrigger = true;
		inBoatBounds.contactOffset = 0.001;
		for(var i = 0; i < rbs.Length; i++){
			if(rbs[i] == null) continue;
			if(rbs[i].tag == "Tornado") continue;
			if(inBoatBounds.bounds.Contains(rbs[i].transform.position)){
				//DebugUtility.DrawPoint(rbs[i].transform.position, 1.0);
				if(rbs[i] != rb){
					rbs[i].transform.position.x += deltaPos.x * moveWBoat;
				}
			}
		}
	}	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	var center : Vector3 = moveBounds.center;
	moveBounds.center += transform.position;
	Gizmos.DrawWireCube(moveBounds.center, moveBounds.size);
	moveBounds.center = center;	
	DebugUtility.DrawPoint(transform.position + checkWaterOffset, .5, Color.blue);

	#endif
}