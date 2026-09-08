#pragma strict

var masterObj : GameObject;
var slaveObj : GameObject;

var masterSearchTag : String = "Player";
var slaveSearchTag : String;

var useTgtPos : boolean;
var targetPosObj : GameObject;
var tgtPosSearchTag : String;

var tgtPos_OnlyGrounded : boolean;
var tgtPosIsGrounded : IsGrounded;

var tgtPosOffset : Vector3;

var slaveSearchByName : boolean = true;

var getTimer : Timer;

var bounds : Bounds;

var debugColor : Color = Color.white;



function GetMasterObj(){
	masterObj = GameObject.FindGameObjectWithTag(masterSearchTag);
}

function GetSlaveObj(){
	if(slaveSearchByName){
		slaveObj = GameObject.Find(slaveSearchTag);
	}
	else{
		slaveObj = GameObject.FindGameObjectWithTag(slaveSearchTag);
	}

}

function GetTgtPos(){
	targetPosObj = GameObject.FindGameObjectWithTag(tgtPosSearchTag);
	if(targetPosObj != null){
		tgtPosIsGrounded = targetPosObj.GetComponentInChildren.<IsGrounded>();
	}
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 5.0;
	}
}

function Update () {
	getTimer.Update();

	if(getTimer.current){
		if(masterObj == null){
			GetMasterObj();
		}

		if(slaveObj == null){
			GetSlaveObj();
		}

		if(useTgtPos){
			if(targetPosObj == null){
				GetTgtPos();
			}
		}
	}

	if(slaveObj != null && masterObj != null){
		if(bounds.Contains(masterObj.transform.position - transform.position)){
			if(targetPosObj == null){
				slaveObj.transform.position = transform.position + tgtPosOffset;
			}
			else{
				var tgtPosGrounded : boolean;
				if(tgtPos_OnlyGrounded && tgtPosIsGrounded != null){
					tgtPosGrounded = tgtPosIsGrounded.isGrounded;
				}
				if(!tgtPos_OnlyGrounded || tgtPos_OnlyGrounded && tgtPosGrounded){
					slaveObj.transform.position = targetPosObj.transform.position + tgtPosOffset;
				}
			}
		}	
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
		Gizmos.color = debugColor;
		Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);
	#endif
}