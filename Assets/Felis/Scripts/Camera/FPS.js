#pragma strict
var updateInterval = 0.5;
var nextInterval : float;

var fps : int;
var show : boolean = true;
var lastFPSCount : int;

var lowFPS : int = 28;
var highFPS : int = 52;

var badPerformace : boolean;

function Start () {
}

function Update () {
    
    if(Time.time > nextInterval)
    {
    	nextInterval = Time.time + updateInterval;
    	
    	fps = (Time.frameCount - lastFPSCount) * (1.0 / updateInterval);
		
		lastFPSCount = Time.frameCount;
    }
    
    if(fps < lowFPS){
    	badPerformace = true;
    }
    if(fps > highFPS){
    	badPerformace = false;
    }
}

function OnGUI(){
	if(show){
		GUILayout.Label(fps.ToString());
		if(badPerformace){
			GUILayout.Label("Bad perf.");
		}
	}
}