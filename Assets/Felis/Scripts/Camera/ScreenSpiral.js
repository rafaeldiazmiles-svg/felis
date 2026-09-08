#pragma strict

var offsetMaterial : OffsetMaterial;

var open : boolean;

var openOffset : float;
var closeOffset : float;

var targetOffset : float;

var openSpeed : float;

var openOnStartUp : boolean;
var openedOnStartUp : boolean;
var openDelay : float;

var startTimeIsCreateTime : boolean = true;
var startTime : float;

function Start () {
	if(open) offsetMaterial.offset.x = openOffset;
	else offsetMaterial.offset.x = closeOffset;
	
	if(startTimeIsCreateTime)
		startTime = Time.time;
}

function Update () {
	if(!openedOnStartUp && openOnStartUp && Time.time - startTime > openDelay){
		open = true;
		openedOnStartUp = true;
	}
	
	if(open) targetOffset = openOffset;
	else targetOffset = closeOffset;
	
	offsetMaterial.offset.x = Mathf.MoveTowards(offsetMaterial.offset.x, targetOffset, Time.deltaTime * openSpeed);
	
	if(open && offsetMaterial.offset.x == openOffset) GetComponent.<Renderer>().enabled = false;
	else GetComponent.<Renderer>().enabled = true;
}

function Set(offset : float){
	offsetMaterial.offset.x = offset;
}

function IsClosed() : boolean{
	if(Mathf.Abs(offsetMaterial.offset.x - closeOffset) < .05){
		return true;
	}
	else{
		return false;
	}
}