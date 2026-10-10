#pragma strict

var jumpSound : AudioSource;

var getTimer : Timer;
var jumpChars : JumpSpringChar[];

var restoreSpeedAir : float = 2;
var restoreSpeedGround : float = 10.0;

var forceJump : boolean = true; //When coming from too high, it will bounce no matter what.

var col : Collider;

var verticalDuration : float;
private var actionHitMul : float = 1.5;

class JumpSpringChar{
	var jumpSwim : JumpSwim;
	var maxYPos : float; //Local to mushroom top position
	var isGrounded : IsGrounded;
}

function GetJumpChars(){
	var jumpCharsComp : JumpSwim[] = GameObject.FindObjectsOfType.<JumpSwim>();
	var jumpCharsArray : Array = new Array();
	for(var i = 0; i < jumpCharsComp.Length; i++){
		var newJChar : JumpSpringChar = new JumpSpringChar();
		newJChar.jumpSwim = jumpCharsComp[i];

		//Don't lose maxYPos info if updating jump chars.
		if(jumpChars != null){
			for(var n = 0; n < jumpChars.Length; n++){
				if(jumpCharsComp[i] == jumpChars[n].jumpSwim){
					newJChar.maxYPos = jumpChars[n].maxYPos;
					break;
				}
			}
		}

		newJChar.isGrounded = newJChar.jumpSwim.transform.parent.GetComponentInChildren.<IsGrounded>();

		jumpCharsArray.Push(newJChar);
	}

	jumpChars = jumpCharsArray.ToBuiltin(JumpSpringChar);
}

function GetSpringVal(jumpSwim : JumpSwim) : float{
	for(var i = 0; i < jumpChars.Length; i++){
		if(jumpChars[i] == null) continue;
		if(jumpChars[i].jumpSwim == null) continue;

		if(jumpChars[i].jumpSwim == jumpSwim){
			return (jumpChars[i].maxYPos - transform.position.y + 1.0);
		}
	}
	return 1.0;
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}

	if(col == null){
		col = GetComponent.<Collider>();
	}

	var spheres : SphereCollider[] = GetComponents.<SphereCollider>();
	for(var si : int = 0; si < spheres.Length; si++){
		spheres[si].radius *= actionHitMul;
	}
	var capsules : CapsuleCollider[] = GetComponents.<CapsuleCollider>();
	for(var ci : int = 0; ci < capsules.Length; ci++){
		capsules[ci].radius *= actionHitMul;
		capsules[ci].height *= actionHitMul;
	}
	var boxes : BoxCollider[] = GetComponents.<BoxCollider>();
	for(var bi : int = 0; bi < boxes.Length; bi++){
		boxes[bi].size *= actionHitMul;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetJumpChars();
	}

	for(var i = 0; i < jumpChars.Length; i++){
		if(jumpChars[i] == null) continue;
		if(jumpChars[i].jumpSwim == null) continue;

		jumpChars[i].maxYPos = Mathf.Max(jumpChars[i].maxYPos, jumpChars[i].jumpSwim.transform.position.y);
		jumpChars[i].maxYPos = Mathf.Max(jumpChars[i].maxYPos, transform.position.y);

		if(jumpChars[i].isGrounded.isGrounded){
			jumpChars[i].maxYPos = Mathf.MoveTowards(jumpChars[i].maxYPos, transform.position.y, Time.deltaTime * restoreSpeedGround);
		}	
		else{
			jumpChars[i].maxYPos = Mathf.MoveTowards(jumpChars[i].maxYPos, transform.position.y, Time.deltaTime * restoreSpeedAir);
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	for(var i = 0; i < jumpChars.Length; i++){
		if(jumpChars[i] == null) continue;
		if(jumpChars[i].jumpSwim == null) continue;
		Gizmos.color = Color.red;
		var p : Vector3 = Vector3(transform.position.x, jumpChars[i].maxYPos, 0);
		Gizmos.DrawSphere(p, .05);
		Handles.Label(p, jumpChars[i].jumpSwim.transform.parent.name);
	}


	#endif
}