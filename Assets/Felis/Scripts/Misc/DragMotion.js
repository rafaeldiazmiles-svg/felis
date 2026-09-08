#pragma strict

var rbs : Rigidbody[];
var pRB : PickableRigidbody[];
var dragDist : float = 2.0;
var getTimer : Timer;

var rb : Rigidbody;

var force : float = 1.0;

var ignoreTags : String[];

var maxRbs : int = 10;
var RBDist : float = 6;

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}
	
	rb = GetComponent.<Rigidbody>();
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetRBS();
	}
	
	
}

function GetRBS(){
	rbs = GameObject.FindObjectsOfType.<Rigidbody>();
	var rbsArray : Array = new Array();
	for(var n = 0; n < rbs.Length; n++){
		if(Vector3.Distance(rbs[n].transform.position, transform.position) < RBDist){
			//if(rbs[n].transform.parent != transform.parent){
				rbsArray.Push(rbs[n]);
			//}
		}
	}
	rbs = new Rigidbody[rbsArray.length];
	rbs = rbsArray.ToBuiltin(Rigidbody) as Rigidbody[];
	
	pRB = new PickableRigidbody[rbs.Length];
	for(var i = 0; i < rbs.Length; i++){
		pRB[i] = rbs[i].GetComponentInChildren.<PickableRigidbody>();
	}
}


function FixedUpdate(){
	var dist : float;
	
	for(var n = 0; n < Mathf.Min(maxRbs,rbs.Length); n++){
		
		if(rbs[n] == null){
			continue;
		}
		if(rbs[n] == rb){
			continue;
		}
		if(pRB[n] != null && pRB[n].beingPicked.current){
			continue;
		}
		
		var cont :boolean;
		for(var m = 0; m < ignoreTags.Length; m++){
			if(rbs[n].tag == ignoreTags[m]){
				cont = true;
				break;
			}
		}
		if(cont) continue;
		
		if(rbs[n].velocity.magnitude > 0.0){

			dist = Vector3.Distance(transform.position, rbs[n].transform.position);
			if(dist < dragDist){
				var mt : Matrix4x4 = new Matrix4x4();
				mt.SetTRS(rbs[n].transform.position, Quaternion.LookRotation(rbs[n].velocity, Vector3.forward), Vector3.one);
				var mChainPoint : Vector3 = mt.MultiplyPoint3x4(transform.position);
				if(mChainPoint.z < 0.0){
					rb.AddForce(rbs[n].velocity * force);
				}
			}
		}

	}
}