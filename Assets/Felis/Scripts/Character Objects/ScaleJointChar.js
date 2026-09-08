#pragma strict

var scaleRange : float;
var prevScaleRange : float;
@Space(40)
var scaleBig : Vector3;
var scaleSmall : Vector3;
@Space(40)
var confJoints_ConnectedAnchor_Big : Vector3[];
var confJoints_ConnectedAnchor_Small : Vector3[];
@Space(40)
var hJoints_ConnectedAnchor_Big : Vector3[];
var hJoints_ConnectedAnchor_Small : Vector3[];
@Space(40)
var autoGetAllConfJoints : boolean = true;
var confJoints : ConfigurableJoint[];
var hJoints : HingeJoint[];
@Space(40)
var saveOnBig : boolean;
var saveOnSmall : boolean;
@Space(40)
var scaleUpEffect : ToggleBoolean;
var scaleEffectCurve : AnimationCurve;
var scaleEffectCurve_Mul : float = 1.0;


function SetScalePivot(pivotPos : Vector3){
	var allChildren : Transform [] = GetComponentsInChildren.<Transform>();
	var pos : Vector3[] = new Vector3[allChildren.Length];
	for(var i = 0; i < pos.Length; i++){
		pos[i] = allChildren[i].position;
	}

	transform.position = pivotPos;

	for(i = 0; i < allChildren.Length; i++){
		if(allChildren[i] != transform){
			allChildren[i].position = pos[i];
		}
	}
}

function Start () {
	if(autoGetAllConfJoints){
		confJoints = GetComponentsInChildren.<ConfigurableJoint>();
		hJoints = GetComponentsInChildren.<HingeJoint>();
	}

	if(scaleUpEffect.current){
		transform.localScale = Vector3.Lerp(scaleSmall, scaleBig, 0.0);
	}
}

function ApplySpawnEffect(){
	transform.localScale = Vector3.Lerp(scaleSmall, scaleBig, 0.0);
	scaleUpEffect.current = true;
}

function Update () {


	scaleUpEffect.Update();

	if(scaleUpEffect.toggledTrue){
		transform.localScale = Vector3.Lerp(scaleSmall, scaleBig, 0.0);
	}

	if(scaleUpEffect.current && Time.time <  scaleUpEffect.toggledTrueTime + scaleEffectCurve.keys[scaleEffectCurve.keys.Length-1].time){
		scaleRange = scaleEffectCurve.Evaluate(Time.time - scaleUpEffect.toggledTrueTime) * scaleEffectCurve_Mul;
	}

	if(scaleRange != prevScaleRange){
		prevScaleRange = scaleRange;

		transform.localScale = Vector3.Lerp(scaleSmall, scaleBig, scaleRange);

		for(var i = 0; i < confJoints.Length; i++){
			confJoints[i].connectedAnchor = Vector3.Lerp(confJoints_ConnectedAnchor_Small[i], confJoints_ConnectedAnchor_Big[i], scaleRange);
		}

		for(i = 0; i < hJoints.Length; i++){
			hJoints[i].connectedAnchor = Vector3.Lerp(hJoints_ConnectedAnchor_Small[i], hJoints_ConnectedAnchor_Big[i], scaleRange);
		}

	}


	if(saveOnBig){
		saveOnBig = false;

		scaleBig = transform.localScale;

		confJoints_ConnectedAnchor_Big = new Vector3[confJoints.Length];
		for(i = 0; i < confJoints.Length; i++){
			//confJoints[i].autoConfigureConnectedAnchor = false;
			confJoints_ConnectedAnchor_Big[i] = confJoints[i].connectedAnchor;
		}
		hJoints_ConnectedAnchor_Big = new Vector3[hJoints.Length];
		for(i = 0; i < hJoints.Length; i++){
			//hJoints[i].autoConfigureConnectedAnchor = false;
			hJoints_ConnectedAnchor_Big[i] = hJoints[i].connectedAnchor;
		}
	}

	if(saveOnSmall){
		saveOnSmall = false;

		scaleSmall = transform.localScale;

		confJoints_ConnectedAnchor_Small = new Vector3[confJoints.Length];
		for(i = 0; i < confJoints.Length; i++){
			confJoints[i].autoConfigureConnectedAnchor = false;
			confJoints_ConnectedAnchor_Small[i] = confJoints[i].connectedAnchor;
		}
		hJoints_ConnectedAnchor_Small = new Vector3[hJoints.Length];
		for(i = 0; i < hJoints.Length; i++){
			hJoints[i].autoConfigureConnectedAnchor = false;
			hJoints_ConnectedAnchor_Small[i] = hJoints[i].connectedAnchor;
		}
	}
}