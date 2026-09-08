#pragma strict

@Header("---------------Comps-----------------")
var scrollMat : ScrollMaterial;
var rend : Renderer;

@Header("----------------Input-------------------")
var speedCurve : AnimationCurve;
var alphaCurve : AnimationCurve;
var explode : ToggleBoolean;
var useOneTimeAndDestroy : boolean;
@Space(30)
var alternate : boolean;

@Header("------------------Values--------------")
var duration : float;

function Start () {
	scrollMat = GetComponent.<ScrollMaterial>();
	rend = GetComponent.<Renderer>();

	var speedDuration : float = speedCurve.keys[speedCurve.length-1].time;
	var alphaDuration : float = alphaCurve.keys[alphaCurve.length-1].time;
	duration = Mathf.Max(speedDuration, alphaDuration);
}

function Update () {
	explode.Update();

	if(explode.current){
		if(Time.time < explode.toggledTrueTime + duration){
			rend.enabled = true;

			var curveT : float = Time.time - explode.toggledTrueTime;

			scrollMat.speed.x = speedCurve.Evaluate(curveT);
			if(alternate) {
				scrollMat.speed.x *= -1;
			}
			rend.material.color.a = alphaCurve.Evaluate(curveT);
		}
		else{
			explode.current = false;
		}
	}
	else{
		rend.enabled = false;
	}

	if(useOneTimeAndDestroy && explode.toggledFalse){
		Destroy(gameObject);
	}
}

function AlternateSide(){
	alternate = true;
	transform.localPosition.x *= -1;
}