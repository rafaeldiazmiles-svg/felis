#pragma strict

var frontWing : Transform;
var backWing : Transform;
var fWingDefLocalRot : Quaternion;
var bWingDefLocalRot : Quaternion;

var wingFlapAnim : AnimationCurve;

var rend : Renderer;

var flap : ToggleBoolean;
var wingOffset : float = .05;
var flapMultiplty : float = 35.0;
var prevFlap : float;

var putOn : boolean;

var player : GameObject;
var playerTag : String = "Player";

var controller : ControllerInput;
var rb : Rigidbody;
var flapForce : float = 50.0;
var isGrounded : IsGrounded;
var hurt : Hurt;

var loseFlapForceSpeed : float = 3.0;
var currentFlapForce : float;

var flapSounds : AudioSource[];
var flapPitch : AnimationCurve;

var putOnPuffPrefab : GameObject;
var puffSound : AudioSource;

var movement : SideMovement;

var antennas : Transform;
var frame : UVFrameGroups;

//var flapAgainDelay : float = .15;

var globalValues : HoldGlobalValues;
var globalValuesName : String = "Hold Global Values";

function Start () {
	fWingDefLocalRot = frontWing.localRotation;
	bWingDefLocalRot = backWing.localRotation;
	
	rend = GetComponentInChildren.<Renderer>();
	
	frame = GetComponentInChildren.<UVFrameGroups>();

	var gVals : GameObject = GameObject.Find(globalValuesName);
	if(gVals != null){
		globalValues = gVals .GetComponent(HoldGlobalValues);
	}
}

function AntennaHat(){
	frame.SetFrame(0,1);
}

function LateUpdate () {
	if(!putOn && transform.parent != null){
		rend.enabled = true;
		
		putOn = true;
		player = GameObject.FindGameObjectWithTag(playerTag);
		controller = player.GetComponentInChildren.<ControllerInput>();	
		rb = player.GetComponentInChildren.<Rigidbody>();
		isGrounded = player.GetComponentInChildren.<IsGrounded>();
		
		var puff : GameObject = GameObject.Instantiate(putOnPuffPrefab);
		puff.transform.position = frontWing.position;
		
		hurt = player.GetComponentInChildren.<Hurt>();
		
		movement = player.GetComponentInChildren.<SideMovement>();
		if(movement != null){
			movement.disableMovementUntil = Time.time + .5;
		}

		for(var i = 0; i < antennas.parent.childCount; i++){
			if(antennas.parent.GetChild(i).name.Contains("Hat")){
				AntennaHat();
				break;
			}
		}

		if(globalValues!= null){
			globalValues.hasWings = 1;
		}
	}
	
	frontWing.localRotation = fWingDefLocalRot;
	backWing.localRotation = bWingDefLocalRot;
	
	flap.Update();
	if(flap.toggledTrue){
		var random : int = Random.value * flapSounds.Length;
		flapSounds[random].pitch = flapPitch.Evaluate(currentFlapForce);
		flapSounds[random].Play();
	}
	
	if(flap.current){
		if(Time.time < flap.toggledTrueTime + wingFlapAnim.keys[wingFlapAnim.keys.Length - 1].time){
			frontWing.RotateAround(frontWing.position, Vector3.forward, wingFlapAnim.Evaluate(Time.time - flap.toggledTrueTime) * flapMultiplty);
			backWing.RotateAround(backWing.position, Vector3.forward, wingFlapAnim.Evaluate(Time.time - flap.toggledTrueTime + wingOffset) * flapMultiplty);
		}
		else{
			flap.current = false;
		}
	}
	
	/*if(controller != null && controller.inputButtonB.down && !flap.current){
		flap.current = true;
	}*/
	if(controller != null && controller.inputButtonB.pressed && !flap.current){
		flap.current = true;
	}
	
	if(isGrounded != null && !isGrounded.isGrounded){
		currentFlapForce = Mathf.MoveTowards(currentFlapForce, 0, Time.deltaTime * loseFlapForceSpeed);
	}
	else{
		currentFlapForce = flapForce;
	}
	
	if(hurt != null && hurt.hurt.toggledTrue){
		puff = GameObject.Instantiate(putOnPuffPrefab);
		puff.transform.position = frontWing.transform.position;
		puffSound.Play();
		var td : TimedDestroy = puffSound.gameObject.AddComponent.<TimedDestroy>();
		td.startTime = Time.time;
		td.destroyTriggerTime = 1.5;
		puffSound.transform.parent = null;

		if(globalValues != null){
			globalValues.hasWings = 0;
		}

		Destroy(gameObject);			
	}
	
}

function FixedUpdate(){
	if(flap.current){
		var currentFlap : float = wingFlapAnim.Evaluate(Time.time - flap.toggledTrueTime);
		var flapDelta : float = currentFlap - prevFlap;
		prevFlap = currentFlap;
		if(flapDelta < 0){
			rb.AddForce(Vector3.down * flapDelta * currentFlapForce); 
		}
	}
}