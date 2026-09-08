#pragma strict

var lockPosition : LockTransformGroup;
var lockRotation : LockTransformGroup;
var lockScale: LockTransformGroup;

class LockTransformValue{
	var enableLock : boolean;
	var defaut : float;
	var space : Space;
}

class LockTransformGroup{
	var xLock : LockTransformValue;
	var yLock : LockTransformValue;
	var zLock : LockTransformValue;
}

var update : boolean;
var lateUpdate : boolean;
var fixedUpdate : boolean;

function Start () {
	//Position.

	if(lockPosition.xLock.space == Space.Self)
		lockPosition.xLock.defaut = transform.localPosition.x;
	if(lockPosition.xLock.space == Space.World)
		lockPosition.xLock.defaut = transform.position.x;
		
	if(lockPosition.yLock.space == Space.Self)
		lockPosition.yLock.defaut = transform.localPosition.y;
	if(lockPosition.yLock.space == Space.World)
		lockPosition.yLock.defaut = transform.position.y;
		
	if(lockPosition.zLock.space == Space.Self)
		lockPosition.zLock.defaut = transform.localPosition.z;
	if(lockPosition.zLock.space == Space.World)
		lockPosition.zLock.defaut = transform.position.z;
	
	// Rotation.
	
	if(lockRotation.xLock.space == Space.Self)
		lockRotation.xLock.defaut = transform.localEulerAngles.x;
	if(lockRotation.xLock.space == Space.World)
		lockRotation.xLock.defaut = transform.eulerAngles.x;
		
	if(lockRotation.yLock.space == Space.Self)
		lockRotation.yLock.defaut = transform.localEulerAngles.y;
	if(lockRotation.yLock.space == Space.World)
		lockRotation.yLock.defaut = transform.eulerAngles.y;
		
	if(lockRotation.zLock.space == Space.Self)
		lockRotation.zLock.defaut = transform.localEulerAngles.z;
	if(lockRotation.zLock.space == Space.World)
		lockRotation.zLock.defaut = transform.eulerAngles.z;
		
	//Scale.

		lockScale.xLock.defaut = transform.localScale.x;
		
		lockScale.yLock.defaut = transform.localScale.y;

		lockScale.zLock.defaut = transform.localScale.z;
}

function Update () {
	if(update) ApplyLock();
}

function LateUpdate(){
	if(lateUpdate) ApplyLock();
}

function FixedUpdate(){
	if(fixedUpdate) ApplyLock();
}

function ApplyLock(){
	//Position.

	if(lockPosition.xLock.enableLock){
		if(lockPosition.xLock.space == Space.Self) transform.localPosition.x = lockPosition.xLock.defaut;
		if(lockPosition.xLock.space == Space.World) transform.position.x = lockPosition.xLock.defaut;
	}
	if(lockPosition.yLock.enableLock){
		if(lockPosition.yLock.space == Space.Self) transform.localPosition.y = lockPosition.yLock.defaut;
		if(lockPosition.yLock.space == Space.World) transform.position.y = lockPosition.yLock.defaut;
	}
	if(lockPosition.zLock.enableLock){
		if(lockPosition.zLock.space == Space.Self) transform.localPosition.z = lockPosition.zLock.defaut;
		if(lockPosition.zLock.space == Space.World) transform.position.z = lockPosition.zLock.defaut;
	}
	
	//Rotation.

	if(lockRotation.xLock.enableLock){
		if(lockRotation.xLock.space == Space.Self) transform.localEulerAngles.x = lockRotation.xLock.defaut;
		if(lockRotation.xLock.space == Space.World) transform.eulerAngles.x = lockRotation.xLock.defaut;
	}
	if(lockRotation.yLock.enableLock){
		if(lockRotation.yLock.space == Space.Self) transform.localEulerAngles.y = lockRotation.yLock.defaut;
		if(lockRotation.yLock.space == Space.World) transform.eulerAngles.y = lockRotation.yLock.defaut;
	}
	if(lockRotation.zLock.enableLock){
		if(lockRotation.zLock.space == Space.Self) transform.localEulerAngles.z = lockRotation.zLock.defaut;
		if(lockRotation.zLock.space == Space.World) transform.eulerAngles.z = lockRotation.zLock.defaut;
	}
	
	//Scale.

	if(lockScale.xLock.enableLock) transform.localScale.x = lockRotation.xLock.defaut;

	if(lockScale.yLock.enableLock) transform.localScale.y = lockRotation.yLock.defaut;
	
	if(lockScale.zLock.enableLock) transform.localScale.z = lockRotation.zLock.defaut;	
}