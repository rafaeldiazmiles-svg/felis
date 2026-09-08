#pragma strict

var rocket : Transform;

var points = new Array();
var emit : boolean = true;
var pointEveryDistanceUnit : float;
var lastSmokePointCreatePosition : Vector3;

var debug : boolean;

var smokeGravity : Vector3;
var smokeChaos : float;
var smokeDrag : float;
var smokeDuration : float;

var smokeContinuity : float;
var smokeContinutiyRange : float;
var smokeContinuityPointRange : float;

var defualtSmokeWidth : float;
var smokeWidthExpandSpeed : float;

var meshFilter : MeshFilter;

var smokeUVStart : float;
var smokeUVEnd : float;
var smokeUVPhaseStep : float;
var currentSmokeUVPhase : float;

var startVColorAlpha : float = 1.0;
var smokeFadeSpeed : float;

var unParent : boolean;

var autoDestroy : boolean = true;

class SmokePoint{
	var position : Vector3;
	var velocity : Vector3;
	var createTime : float;
	
	function SmokePoint(newPosition : Vector3){
		position = newPosition;
	}
	
	//Mesh points.
	var vertexA : int;
	var vertexB : int;
	var vertexAPosition : Vector3;
	var vertexBPosition : Vector3;
	
	var width : float;
	var uvPhase : float;
	
	var vColorAlpha : float;
}

function Start () {
	if(unParent){
		transform.parent = null;
		transform.position = Vector3.zero;
		transform.rotation = Quaternion.identity;
		transform.localScale = Vector3.one;	
	}
	
	AddPointNow();
	
	meshFilter.mesh = new Mesh();
	meshFilter.mesh.name = transform.name + " Smoke Trail";
}

function Update () {
	if(rocket != null && Vector3.Distance(rocket.position, lastSmokePointCreatePosition) > pointEveryDistanceUnit){
		if(emit){
			AddPointNow();
		}
	}
	
	var i : int =  0;
	
	
	var vertexID : int = 0;
	
	for(var point : SmokePoint in points){
		point.position += point.velocity * Time.deltaTime;
		point.velocity += smokeGravity * Time.deltaTime;
		
		for(var n = i-smokeContinuityPointRange; n <= i+smokeContinuityPointRange; n++){
			if(n == i || n < 0 || n >= points.length - 1) continue;
			var otherPoint : SmokePoint = points[n] as SmokePoint;
			var incidence : float = Mathf.Max(0,smokeContinutiyRange - Vector3.Distance(point.position, otherPoint.position)) / smokeContinutiyRange;
			point.velocity = Vector3.Lerp(point.velocity, otherPoint.velocity, incidence * smokeContinuity * Time.deltaTime);
		}
		
		point.velocity = Vector3.Lerp(point.velocity, Vector3.zero, Time.deltaTime * smokeDrag);
		
		//Mesh points.
		point.width += smokeWidthExpandSpeed * Time.deltaTime;
		
		var preMatrix : Matrix4x4;
		var postMatrix : Matrix4x4;
		
		var vertexAPrePosition : Vector3;
		var vertexBPrePosition : Vector3;
		
		var vertexBPostPosition : Vector3;		
		var vertexAPostPosition : Vector3;
		
		if(i != points.length - 1){
			var nextPoint : SmokePoint = points[i+1] as SmokePoint;
			
			postMatrix.SetTRS(point.position, Quaternion.LookRotation(nextPoint.position - point.position, Vector3.forward), Vector3.one);
			
			vertexAPostPosition = postMatrix.MultiplyPoint3x4(Vector3(point.width*.5,0,0));
			vertexBPostPosition = postMatrix.MultiplyPoint3x4(Vector3(-point.width*.5,0,0));
		}
		if(i != 0){
			var previousPoint : SmokePoint = points[i-1] as SmokePoint;
			preMatrix.SetTRS(point.position, Quaternion.LookRotation(point.position - previousPoint.position, Vector3.forward), Vector3.one);
			
			vertexAPrePosition = preMatrix.MultiplyPoint3x4(Vector3(point.width*.5,0,0));
			vertexBPrePosition = preMatrix.MultiplyPoint3x4(Vector3(-point.width*.5,0,0));
		}
		
		if(i != 0 && i != points.length - 1){
			point.vertexAPosition = (vertexAPrePosition + vertexAPostPosition) * .5;
			point.vertexBPosition = (vertexBPrePosition + vertexBPostPosition) * .5;
		}
		if(i == 0){
			point.vertexAPosition = vertexAPostPosition;
			point.vertexBPosition = vertexBPostPosition;
		}
		if(i == points.length - 1){
			point.vertexAPosition = vertexAPrePosition;
			point.vertexBPosition = vertexBPrePosition;
		}
		
		point.vertexA = vertexID;
		vertexID++;
		point.vertexB = vertexID;
		vertexID++;
		
		point.vColorAlpha = Mathf.Lerp(point.vColorAlpha,0, Time.deltaTime * smokeFadeSpeed);
		
		i++;
	}
	
	i = 0;

	if(meshFilter.mesh.vertices.Length != points.length * 2){
		ReBuildMesh();
	}
	else{
		PositionMesh();
	}
	
	SetMeshVColors();
	

	
	for(var point : SmokePoint in points){
		if(Time.time > point.createTime + smokeDuration)
			points.RemoveAt(i);
		i++;
	}
	
	if(points.length == 0 && autoDestroy){
		Destroy(gameObject);
		//gameObject.SetActive(fflse);
	}
}

function AddPointNow(){
	lastSmokePointCreatePosition = rocket.position;
	var newSmokePoint : SmokePoint = new SmokePoint(rocket.position);
	newSmokePoint.velocity = Random.insideUnitSphere * smokeChaos;
	newSmokePoint.velocity.z = 0.0;
	newSmokePoint.createTime = Time.time;
	newSmokePoint.width = defualtSmokeWidth;
	newSmokePoint.uvPhase = currentSmokeUVPhase;
	newSmokePoint.vColorAlpha = startVColorAlpha;
	currentSmokeUVPhase += smokeUVPhaseStep;
	points.Push(newSmokePoint);	
}

function SetMeshVColors(){
	//Vertex Color.
	var newVertexColors : Color[] = new Color[meshFilter.mesh.colors.Length];
	for(var c = 0; c < newVertexColors.Length; c++){
		var point : SmokePoint = points[c/2] as SmokePoint;
		if(c == 0 || c == newVertexColors.Length-1) newVertexColors[c] = Color(0,0,0,0);
		else newVertexColors[c] = Color(1,1,1,point.vColorAlpha);

	}
	meshFilter.mesh.colors = newVertexColors;

}

function PositionMesh(){
	var vertices : Vector3[] = meshFilter.mesh.vertices;
	for(var m = 0; m < points.length; m++){
		var point : SmokePoint = points[m] as SmokePoint;
		vertices[point.vertexA] = transform.worldToLocalMatrix.MultiplyPoint3x4(point.vertexAPosition);
		vertices[point.vertexB] = transform.worldToLocalMatrix.MultiplyPoint3x4(point.vertexBPosition);
	}
	meshFilter.mesh.vertices = vertices;
	meshFilter.mesh.RecalculateBounds();	
}

function ReBuildMesh(){
	if(meshFilter.mesh == null) meshFilter.mesh = new Mesh();
	else meshFilter.mesh.Clear();
	
	var newVertices : Vector3[] = new Vector3[points.length * 2];

	for(var i = 0; i < points.length; i++){
		var point : SmokePoint = points[i] as SmokePoint;
		newVertices[point.vertexA] = transform.worldToLocalMatrix.MultiplyPoint3x4(point.vertexAPosition);
		newVertices[point.vertexB] = transform.worldToLocalMatrix.MultiplyPoint3x4(point.vertexBPosition);
	}

	var newVertexColors : Color[] = new Color[newVertices.Length];
	
	for(var c = 0; c < newVertexColors.Length; c++){
		if(c == 0 || c == newVertexColors.Length-1) newVertexColors[c] = Color(0,0,0,0);
		else{
			newVertexColors[c] = Color(1,1,1,1);
		}
	}
	
	var triangleArray = new Array();
	for(var n = 0; n < newVertices.Length-3; n+= 2){
		triangleArray.Push(n);
		triangleArray.Push(n+1);
		triangleArray.Push(n+2);
		
		triangleArray.Push(n+1);
		triangleArray.Push(n+3);
		triangleArray.Push(n+2);
	}
	
	var newUV : Vector2[] = new Vector2[newVertices.Length];
	
	for(i = 0; i < points.length; i++){
		point = points[i] as SmokePoint;
		newUV[point.vertexA].x = smokeUVStart;
		newUV[point.vertexB].x = smokeUVEnd;
		
		newUV[point.vertexA].y = point.uvPhase;
		newUV[point.vertexB].y = point.uvPhase;
	}	
	
	
	meshFilter.mesh.vertices = newVertices;
	meshFilter.mesh.uv = newUV;
	meshFilter.mesh.colors = newVertexColors;
	meshFilter.mesh.triangles = triangleArray.ToBuiltin(int) as int[];
	meshFilter.mesh.RecalculateBounds();
	meshFilter.mesh.RecalculateNormals();
}

function OnDrawGizmos(){
	#if UNITY_EDITOR
	if(debug && Application.isPlaying){
		var guiStyle : GUIStyle = new GUIStyle();
		guiStyle.normal.textColor = Color.white;
		var i : int =  0;
		for(var point : SmokePoint in points){
			Gizmos.color = Color.blue;
			
			if(i > 0){
				var previousPoint : SmokePoint = points[i-1] as SmokePoint;
				Gizmos.DrawLine(previousPoint.position, point.position);
			}
			
			Handles.Label(point.position, i.ToString(),guiStyle);
			
			Gizmos.color = Color.green;
			Gizmos.DrawSphere(point.vertexAPosition, .05);
			Gizmos.color = Color.blue;
			Gizmos.DrawSphere(point.vertexBPosition, .05);
			
			guiStyle.normal.textColor = Color.green;
			Handles.Label(point.vertexAPosition, point.vertexA.ToString() ,guiStyle);
			guiStyle.normal.textColor = Color.blue;
			Handles.Label(point.vertexBPosition, point.vertexB.ToString() ,guiStyle);			
			
			i++;
		}


	}	
	#endif
}

function Reset(){
	points.Clear();
	ReBuildMesh();
}