#pragma strict

@script RequireComponent(GrassFlow)

var applyMode : ApplyMode;

var grassFlowScript : GrassFlow;

var rigidbodyList : Rigidbody[];

var multiplier : float = .1;

var searchTag : String = "Affect Grass";

static var distanceCurve : float = 3.0;

var searchTimer : Timer;
static var timerArbitrayVal : float = 2.0;

function Start () {
	grassFlowScript = GetComponent(GrassFlow);
	GetRBs();
	
	if(searchTimer.every == 0){
		searchTimer.every = timerArbitrayVal;
	}
}

function GetRBs(){
	var affectGrassTags : GameObject[] = GameObject.FindGameObjectsWithTag(searchTag);
	rigidbodyList = new Rigidbody[affectGrassTags.Length];
	for(var i = 0; i < rigidbodyList.Length; i++){
		rigidbodyList[i] = affectGrassTags[i].transform.parent.GetComponent(Rigidbody);
	}
}

function Update(){
	searchTimer.Update();
	
	if(searchTimer.current){
		GetRBs();
	}
}

function FixedUpdate () {
	var finalValue : float;
	
	for(var thisRigidbody : Rigidbody in rigidbodyList){
		if(thisRigidbody == null) continue;
		if((thisRigidbody.velocity.x > 0 && thisRigidbody.transform.position.x > transform.position.x)
		|| (thisRigidbody.velocity.x < 0 && thisRigidbody.transform.position.x < transform.position.x)){
		
			var interactionValue : float =
			thisRigidbody.velocity.magnitude * Mathf.Sign(thisRigidbody.velocity.x) * thisRigidbody.mass * multiplier 
			/ Mathf.Max(0.1,Mathf.Pow(Vector3.Distance(transform.position, thisRigidbody.transform.position), distanceCurve));
			
			
			finalValue -= interactionValue;
		}
	}
	
	if(applyMode == ApplyMode.absolute) grassFlowScript.masterValue = finalValue;
	if(applyMode == ApplyMode.additive) grassFlowScript.masterValue += finalValue;	
}