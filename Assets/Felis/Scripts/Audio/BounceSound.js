#pragma strict

var isGrounded : IsGrounded;

var wasGrounded : boolean;

var soundList : AudioSource[];
var pitchVary : float = .1;

var defaultPitch  :float[];

var useTransform : boolean;
var prevPos : Vector3;

var rb : Rigidbody;
var minSpeed : float;
var minSpeedBig : float = 2.0;

var sideBounce : boolean;
var sideDetection : SideDetection;

var leftTouch : ToggleBoolean;
var rightTouch : ToggleBoolean;

var quake : boolean;
var cameraShakiness : Shakiness;

var soundListBig : AudioSource[];

function Start () {
	isGrounded = FindUtility.ReverseFindIsGrounded(transform);
	sideDetection =  FindUtility.ReverseFindSideDetection(transform);

	rb = GetComponentInChildren.<Rigidbody>();
	
	if(soundList != null){
		defaultPitch = new float[soundList.Length];
		for(var i = 0; i < soundList.Length; i++){
			//An empty slot on the prefab used to abort Start here and leave the rest of the pitches at zero.
			if(soundList[i] != null){
				defaultPitch[i] = soundList[i].pitch;
			}
		}
	}
	else{
		defaultPitch = new float[0];
	}
	
	if(Camera.main != null && Camera.main.transform.parent != null){
		cameraShakiness = Camera.main.transform.parent.GetComponent(Shakiness);
	}	
	 
}

function Update () {
	var velMag : float;
	if(rb != null){
		velMag = rb.velocity.magnitude;
	}
	else{
		velMag = (transform.position - prevPos).magnitude;
		velMag /= Mathf.Max(0.00001, Time.deltaTime);
		prevPos = transform.position;
		
	}	

	//Side Bounce
	if(sideBounce && sideDetection != null){
		rightTouch.current = sideDetection.IsRightSideBlocked();
		leftTouch.current = sideDetection.IsLeftSideBlocked();
		
		leftTouch.Update();
		rightTouch.Update();
	
		if(leftTouch.toggledTrue || rightTouch.toggledTrue){
			
			if(soundListBig != null && soundListBig.Length > 0 && velMag > minSpeedBig){
				HardBounce();
			}
			
			if(velMag > minSpeed && velMag < minSpeedBig){
				NormalBounce();
			}
		}
	}
	
	
	if(isGrounded == null) return;

	var big : boolean;

	if(isGrounded.isGrounded && !wasGrounded){
		if(velMag > minSpeedBig){
			HardBounce();
			big = true;
		}		
	}
	if(!big){
		if(isGrounded.isGrounded && !wasGrounded && soundList != null && soundList.Length > 0){
			
			if(velMag > minSpeed){
				//DebugUtility.DrawPoint(transform.position, .5, Color.red, 2.0);
				NormalBounce();
			}
		}
	}
	
	wasGrounded = isGrounded.isGrounded;
}

function PlayBounceSound(list : AudioSource[], varyPitch : boolean){

	if(list == null || list.Length < 1) return;

	var id : int = Random.value * list.Length;
	if(id >= list.Length) id = list.Length - 1; //Random.value can come back as exactly 1.

	var source : AudioSource = list[id];
	if(source == null) return;

	if(varyPitch){
		var basePitch : float = source.pitch;
		if(defaultPitch != null && id < defaultPitch.Length) basePitch = defaultPitch[id];

		var pitch : float = basePitch + Random.Range(-pitchVary, pitchVary);
		if(pitch < 0.1) pitch = 0.1; //A voice at zero pitch never reaches its end and stacks up on every bounce.
		source.pitch = pitch;
	}

	source.Play();
}

function NormalBounce(){

	PlayBounceSound(soundList, true);

	if(quake){
		if(cameraShakiness != null){
			cameraShakiness.lowQuake = true;
		}		
	}
}

function HardBounce(){

	if(soundListBig != null && soundListBig.Length > 0){
		PlayBounceSound(soundListBig, false);
	}
	else{
		PlayBounceSound(soundList, true);
	}

	if(quake){
		if(cameraShakiness != null){
			cameraShakiness.highQuake = true;
		}		
	}
}
