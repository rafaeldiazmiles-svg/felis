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
	}
	for(var i = 0; i < defaultPitch.Length; i++){
		defaultPitch[i] = soundList[i].pitch;
	}
	
	if(Camera.main.transform.parent != null){
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
			
			if(soundListBig.Length > 0 && velMag > minSpeedBig){
				HardBounce();
			}
			
			if(velMag > minSpeed && velMag < minSpeedBig){
				NormalBounce();
			}
		}
	}
	
	
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

function NormalBounce(){

	if(soundList != null && soundList.Length > 0){
		var id : int =Random.value * soundList.Length;
		soundList[id].pitch =  defaultPitch[id] + Random.Range(-pitchVary, pitchVary);
		soundList[id].Play();
	}

	if(quake){
		if(cameraShakiness != null){
			cameraShakiness.lowQuake = true;
		}		
	}
}

function HardBounce(){

	if( soundListBig != null && soundListBig.Length > 0){
		var id : int =Random.value * soundListBig.Length;
		soundListBig[id].Play();
	}
	else{
		if(soundList != null && soundList.Length > 0){
			id = Random.value * soundList.Length;
			soundList[id].pitch =  defaultPitch[id] + Random.Range(-pitchVary, pitchVary);
			soundList[id].Play();
		}	
	}

	if(quake){
		if(cameraShakiness != null){
			cameraShakiness.highQuake = true;
		}		
	}
}