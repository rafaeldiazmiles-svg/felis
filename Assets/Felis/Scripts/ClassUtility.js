#pragma strict



//////////////////

class FloatSmoothDamp{
	var current : float;
	var velocity : float; 
	var target : float;
	var time : float;

	function SmoothDamp(){
		this.current = Mathf.SmoothDamp(this.current, this.target, this.velocity, this.time);
	}

}

class Vector2SmoothDamp{
	var current : Vector2;
	var velocity : Vector2; 
	var target : Vector2;
	var time : float;

	function SmoothDamp(){
		this.current.x = Mathf.SmoothDamp(this.current.x, this.target.x, this.velocity.x, this.time);
		this.current.y = Mathf.SmoothDamp(this.current.y, this.target.y, this.velocity.y, this.time);
	}

}

class Vector3SmoothDamp{
	var current : Vector3;
	var velocity : Vector3; 
	var target : Vector3;
	var time : float;

	function SmoothDamp(){
		this.current = Vector3.SmoothDamp(this.current, this.target, this.velocity, this.time);
	}

}

class FloatSpring{
	var damp : float;
	var springForce : float;
	var gravity : float;
	var target : float;
	 var current : float;
	 var velocity : float;

	function Spring(){
		this.velocity += (this.target - this.current) * Time.deltaTime * this.springForce * 15;
		this.velocity += gravity * Time.deltaTime;
		this.velocity = Mathf.Lerp(this.velocity, 0, Time.deltaTime * this.damp * .4);
		this.current += this.velocity * Time.deltaTime;
	}

}

class Vector2Spring{
	var damp : float;
	var springForce : float;
	var gravity : Vector2;
	var target : Vector2;
	var current : Vector2;
	var velocity : Vector2;

	function Spring(){
		this.velocity.x += (this.target.x - this.current.x) * Time.deltaTime * this.springForce * 15 ;
		this.velocity.x += gravity.x * Time.deltaTime;
		this.velocity.x = Mathf.Lerp(this.velocity.x, 0, Time.deltaTime * this.damp * .4);
		this.current.x += this.velocity.x * Time.deltaTime;;
		
		this.velocity.y += (this.target.y - this.current.y) * Time.deltaTime * this.springForce * 15;
		this.velocity.y += gravity.y * Time.deltaTime;
		this.velocity.y = Mathf.Lerp(this.velocity.y, 0, Time.deltaTime * this.damp * .4);
		this.current.y += this.velocity.y * Time.deltaTime;;
	}

}

class Vector3Spring{
	var damp : float;
	var springForce : float;
	var gravity : Vector3;
	var target : Vector3;
	var current : Vector3;
	var velocity : Vector3;

	function Spring(){
		this.velocity += (this.target - this.current) * Time.deltaTime * this.springForce * 15; 
		this.velocity += gravity * Time.deltaTime;
		this.velocity = Vector3.Lerp(this.velocity, Vector3.zero, Time.deltaTime * this.damp * .4);
		this.current += this.velocity * Time.deltaTime;
	}

}

class Vector3SpringAdvanced{
	var damp : float;
	var springForce : float;
	var target : Vector3;
	var gravity : Vector3;
	var springCurve : float;
	var current : Vector3;
	var velocity : Vector3;

	function Spring(){
		this.velocity += (this.target - this.current) * Time.deltaTime * this.springForce * 15;
		this.velocity = Vector3.Lerp(this.velocity, Vector3.zero, Time.deltaTime * this.damp * .4);
		this.current += this.velocity * Time.deltaTime;
	}

}

class FloatLerp{
	var current : float;
	var previous : float;
	var changed : boolean;
	var target : float;
	var speed : float;
	var magnet : float;

	function Lerp(){
		this.current = Mathf.Lerp(this.current, this.target, Time.deltaTime * this.speed);
		if(previous != current){
			previous = current;
			changed = true;
		}
		else{
			changed = false;
		}

		if(magnet > 0){
			if(Mathf.Abs(current - target) < magnet){
				current = target;
			}
		}
	}
}

class FloatMoveTowards{
	var current : float;
	var target : float;
	var speed : float;
	
	function MoveTowards(){
		this.current = Mathf.MoveTowards(current, target, speed * Time.deltaTime);
	}
}

class Vector2Lerp{
	var current : Vector2;
	var target : Vector2;
	var speed : float;
	var gravity : float;
	var groundTarget : Vector2;
	
	function Lerp(){
		this.current = Vector2.Lerp(this.current, this.target, Time.deltaTime * this.speed);
	}
	function LerpHeavy(){
		this.current = Vector2.Lerp(this.current, this.target, Time.deltaTime * this.speed);
		this.current = Vector2.Lerp(this.current, this.groundTarget, Time.deltaTime * this.gravity);
	}

}

class Vector3Lerp{
	var current : Vector3;
	var target : Vector3;
	var speed : float;
	var gravity : float;
	var groundTarget : Vector3;
	
	function Lerp(){
		this.current = Vector3.Lerp(this.current, this.target, Time.deltaTime * this.speed);
	}
	function LerpHeavy(){
		this.current = Vector3.Lerp(this.current, this.target, Time.deltaTime * this.speed);
		this.current = Vector3.Lerp(this.current, this.groundTarget, Time.deltaTime * this.gravity);
	}
	

}

class QuaternionLerp{
	var current : Quaternion;
	var target : Quaternion;
	var speed : float;

	
	function Lerp(){
		current = Quaternion.Lerp(current, target, Time.deltaTime * speed);
	}
	
} 

class TimedEvent{
	var duration : float;
	var triggerWait : float;
	
	var lastTriggerTime : float;
	var lockTrigger : boolean = false;
	var firstTrigger : boolean = false;
	var timeToTrigger : float;	
	
	function Trigger(){
		this.lastTriggerTime = Time.time;
		this.firstTrigger = true;
	}
	
	function TimedTrigger(){
		if(timeToTrigger > triggerWait){
			this.lastTriggerTime = Time.time;
			this.timeToTrigger = 0.0;
			this.firstTrigger = true;			
		}
		else{
			this.timeToTrigger += Time.deltaTime;
		}
	}
	
	
	function TriggerOnce(){
		if(Time.time > this.lastTriggerTime + this.duration) this.lockTrigger = false;
		if(!this.lockTrigger){
			this.lastTriggerTime = Time.time;
			this.lockTrigger = true;
			this.firstTrigger = true;
		}
	}

	function TimedTriggerOnce(){
		if(timeToTrigger > triggerWait){
			if(Time.time > this.lastTriggerTime + this.duration) this.lockTrigger = false;
			if(!this.lockTrigger){
				this.lastTriggerTime = Time.time;
				this.lockTrigger = true;
				this.timeToTrigger = 0.0;
				this.firstTrigger = true;
			}
		}
		else{
			this.timeToTrigger += Time.deltaTime;
		}
	}
	
	function IsActive() : boolean{
		if(Time.time < this.lastTriggerTime + this.duration && this.firstTrigger) return true;
		else return false;	
	}
	
	function TimeLeft(){
		if(this.firstTrigger == true)
			return Mathf.Max(0,this.lastTriggerTime + this.duration - Time.time);
		else
			return 0;
	}
	
	function TimeLeftNormalized(){
		if(this.firstTrigger == true)
			return Mathf.Clamp01((this.lastTriggerTime + this.duration - Time.time) / duration);
		else
			return 0;
	}
	
	function EventTime(){
		if(this.firstTrigger == true)
			return Mathf.Clamp(Time.time - this.lastTriggerTime,0,duration);
		else
			return 0;
	}
	
	function EventTimeNormalized(){
		if(this.firstTrigger == true)
			return Mathf.Clamp01((Time.time - this.lastTriggerTime) / duration);
		else
			return 0;
	}
	
	function ResetTimeToTrigger(){
		this.timeToTrigger = 0.0;
	}
}

class FloatPhysics{
	var current : float;
	var speed : float;
	var drag : float;
	
	function Update(){
		speed = Mathf.Lerp(speed, 0, Time.deltaTime * drag);
		current += speed * Time.deltaTime;
	}
}

///////////////////

class ToggleBoolean{
	var current : boolean;
	var previous : boolean;
	var justToggled : boolean;
	var toggledTrue : boolean;
	var toggledFalse : boolean;

	var toggledTime : float;
	var toggledTrueTime : float;
	var toggledFalseTime : float;
	
	function Update(){
		if(current != previous) justToggled = true; else justToggled = false;
		if(current == true && previous == false) toggledTrue = true; else toggledTrue = false;
		if(current == false && previous == true) toggledFalse = true; else toggledFalse = false;
		previous = current;
		
		if(toggledTrue){
			toggledTrueTime = Time.time;
			toggledTime = Time.time;
		}
		if(toggledFalse){
			toggledFalseTime = Time.time;
			toggledTime = Time.time;
		}
		previous = current;
	}
	function Update(newCurrent : boolean){
		current = newCurrent;
		if(current != previous) justToggled = true; else justToggled = false;
		if(current == true && previous == false) toggledTrue = true; else toggledTrue = false;
		if(current == false && previous == true) toggledFalse = true; else toggledFalse = false;
		
		if(toggledTrue){
			toggledTrueTime = Time.time;
			toggledTime = Time.time;
		}
		if(toggledFalse){
			toggledFalseTime = Time.time;
			toggledTime = Time.time;
		}
		
		previous = current;
	}

	function GetValues(other : ToggleBoolean){
		current = other.current;
		previous = other.previous;
		justToggled = other.justToggled;
		toggledTrue = other.toggledTrue;
		toggledFalse = other.toggledFalse;
		toggledTrueTime = other.toggledTrueTime;
		toggledFalseTime = other.toggledFalseTime;
	}
}


class MeasureVector3{
	var current : Vector3;
	var previous : Vector3;
	var velocity : Vector3;
	var previousVelocity : Vector3;
	var acceleration : Vector3;

	function Update(){
		velocity = (current - previous) / Time.deltaTime;
		previous = current;
		acceleration = (velocity - previousVelocity) / Time.deltaTime;
		previousVelocity = velocity;
	}
}

class Timer{
	var current : boolean;
	var every : float;
	var randomize : float;
	var next : float;
	var last : float;
	function Update(){
		if(Time.time > next){
			next = Time.time + every + Random.value * randomize;
			current = true;
			last = Time.time;
		}
		else{
			current = false;
		}

		if(every == 0.0){
			every = 5.0;
		}
	}
}



class TimerToggle{
	var A : ToggleBoolean;
	var B : ToggleBoolean;
	var ADuration : Vector2;
	var BDuration : Vector2;
	
	var nextToggleTime : float;
	function Update(){
		if(Time.time > nextToggleTime){
			if(A.current || (!A.current && !B.current)){
				A.current = false;
				B.current = true;
				nextToggleTime = Time.time +  Random.Range(BDuration.x, BDuration.y);
			}
			else{
				if(B.current){
					B.current = false;
					A.current = true;
					nextToggleTime = Time.time +  Random.Range(ADuration.x, ADuration.y);
				}
			}
		}
		A.Update();
		B.Update();
	}

	function ToggleNow(){
		nextToggleTime = Time.time;
	}
}

///////////////////////////////////

class GetTag{
	var tag : String;
	var obj : GameObject;
	var getTimer : Timer;
	function Update(){
		if(getTimer.every == 0.0){
			getTimer.every = 3.0;
		}

		getTimer.Update();

		if(getTimer.current){
			if(obj == null){
				obj = GameObject.FindGameObjectWithTag(tag);
			}
		}
	}
}

class GetTags{
	var tags : String[];
	var objs: GameObject[];
	var getTimer : Timer;

	function Update(){
		if(getTimer.every == 0.0){
			getTimer.every = 3.0;
		}

		getTimer.Update();

		if(getTimer.current){
			GetObjs();
		}
	}

	function GetObjs(){
		if(tags != null && tags.Length == 1){
			objs = GameObject.FindGameObjectsWithTag(tags[0]);
		}
		else{
			var objsArray : Array = new Array();
			for(var i = 0; i < tags.Length; i++){
				var theseTagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(tags[i]);
				for(var n = 0; n < theseTagObjs.Length; n++){
					objsArray.Push(theseTagObjs[n]);
				}
			}
			objs = objsArray.ToBuiltin(GameObject);
		}
	}
}