#pragma strict

var thisRB : Rigidbody;
@Space(20)
var rbs : Rigidbody[];
var tagFilter : String[];
var getTimer : Timer;
@Space(20)
var targetBone : boolean;
var boneName : String;
var rbs_Bone : Transform[];
@Space(20)
var range : float = 5.0;
var forceCurve : AnimationCurve;
var force : float = 20.0;
@Space(20)
var rangeTrigger : float = .5;
var inRange : ToggleBoolean;
var trigger_ImplodeEffect : ImplodeEffect;


function GetRBs(){
	var allRBs : Rigidbody[] = GameObject.FindObjectsOfType.<Rigidbody>();
	if(tagFilter == null || tagFilter.Length == 0){
		rbs = allRBs;
	}
	else{
		var rbsArray : Array = new Array();
		for(var i = 0; i < allRBs.Length; i++){
			for(var n = 0; n < tagFilter.Length; n++){
				if(allRBs[i].gameObject.tag == tagFilter[n]){
					rbsArray.Add(allRBs[i]);
					break;
				}
			}
		}
		rbs = rbsArray.ToBuiltin(Rigidbody);
	}

	if(targetBone){
		rbs_Bone = new Transform[rbs.Length];
		for(i = 0; i < rbs.Length; i++){
			var allChildren : Transform[] = rbs[i].GetComponentsInChildren.<Transform>();
			for(n = 0; n < allChildren.Length; n++){
				if(allChildren[n].name.ToLower().Contains(boneName.ToLower())){
					rbs_Bone[i] = allChildren[n];
					break;
				}
			}
		}
	}
}

function Start () {
	thisRB = GetComponent.<Rigidbody>();
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetRBs();
	}
}

function FixedUpdate(){
	inRange.current = false;
	if(rbs != null && thisRB != null){
		for(var i = 0; i < rbs.Length; i++){
			if(rbs[i] == thisRB){
				continue;
			}

			var dist : float;
			var rangeVal : float;
			if(!targetBone){
				dist = Vector3.Distance(transform.position, rbs[i].transform.position);
				rangeVal = Mathf.Max(0, range - dist) / range;
				if(rangeVal > 0){
					thisRB.AddForce( (rbs[i].transform.position - transform.position).normalized * forceCurve.Evaluate(1-rangeVal) * force);
				}
			}
			else{
				if(rbs_Bone[i] != null){
					dist = Vector3.Distance(transform.position, rbs_Bone[i].transform.position);
					rangeVal = Mathf.Max(0, range - Vector3.Distance(transform.position, rbs_Bone[i].transform.position)) / range;
					if(rangeVal > 0){
						thisRB.AddForce( (rbs_Bone[i].transform.position - transform.position).normalized * forceCurve.Evaluate(1-rangeVal) * force);
					}
				}
			}

			if(!inRange.current && dist < rangeTrigger){
				inRange.current = true;
			}
		}
	}

	inRange.Update();

	if(trigger_ImplodeEffect != null){
		trigger_ImplodeEffect.imploding = inRange.current;
	}
}