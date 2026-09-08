#pragma strict

var trailPoints : Transform[];

var trailLength : float;

var hasTrailPoints : boolean;



function Start () {
	GetTrailPoints();
}

function Update () {
}

function GetTrailPoints(){
	var trailPointsArray = new Array();
	for(var i = 0; i < transform.childCount; i++){
		trailPointsArray.Add(transform.GetChild(i));
	}
	trailPoints = trailPointsArray.ToBuiltin(Transform);

	hasTrailPoints = true;
}

function GetTrailLength() : float{
	if(!hasTrailPoints){
		GetTrailPoints();
	}

	var length : float;

	for(var i = 0; i < trailPoints.Length-1; i++){
		length += Vector3.Distance(trailPoints[i].position, trailPoints[i+1].position);

	}

	return length;	
}

function GetCurvePos(phase : float){
	if(!hasTrailPoints){
		GetTrailPoints();
	}

	phase = Mathf.Clamp(phase,0.0,0.9999);
	var length : float = GetTrailLength();

	var pointPos : float[] = new float[trailPoints.Length];
	pointPos[0] = 0.0;
	var pos : float;
	var p0 : int;
	var p1 : int;
	var p2 : int;
	var p3 : int;
	var foundP1 : boolean;
	for(var i = 1; i < trailPoints.Length; i++){
		pos += Vector3.Distance(trailPoints[i].position, trailPoints[i-1].position);
		pointPos[i] = pos / length;
		if(pointPos[i] >= phase && !foundP1){
			p1 = i-1;
			foundP1 = true;
		}
	}

	p0 = p1-1;
	p0 = Mathf.Max(p0,0);
	p2 = p1+1;
	p2 = Mathf.Min(p2,trailPoints.Length-1);
	p3 = p2+1;
	p3 = Mathf.Min(p3,trailPoints.Length-1);

	var localPhase : float = (phase - pointPos[p1]) / (pointPos[p2] - pointPos[p1]);

	return ReturnCatmullRom(localPhase, trailPoints[p0].position, trailPoints[p1].position, trailPoints[p2].position, trailPoints[p3].position);

}

function ReturnCatmullRom(t : float, p0 : Vector3, p1 : Vector3, p2 : Vector3, p3 : Vector3) : Vector3{
	var a : Vector3 = p1;
	var b : Vector3 = (p2 - p0) * .5;
	var c : Vector3 = (p0*2 - p1*5 + p2*4 - p3) *.5;
	var d : Vector3 = (-p0 + p1*3 - p2*3 + p3) *.5;

	return a + (b * t) + (c * t * t) + (d * t * t * t);
}