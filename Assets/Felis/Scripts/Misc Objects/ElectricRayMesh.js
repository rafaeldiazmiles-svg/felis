#pragma strict

var rayColor : Color;

var start : Transform;
var end : Transform;
var endPosition : Vector3;
var endPositionOffset : Vector3;
var distance : float;

var meshFilter : MeshFilter;
var meshRenderer : MeshRenderer; 

var points : Vector3[];
var pointsPerUnitDistance : float;
var pointsAmountBase : int;
var pointAmount : int;

var sphereCenter : Vector3;
var centerOffset : float;
var centerOffsetMultiplier : float;
var minCenterOffset : float;

var sphereExpandCurve : AnimationCurve;

var waveLength : float;
var waveSpeed : float;
var waveAmplitude : float;
var waveOffset : float;

var rayPoints : RayPoint[];
var rayWidth : float;

class RayPoint{
	var vertexA : int;
	var vertexB : int;

	var vertexAPosition : Vector3;
	var vertexBPosition : Vector3;
}

var uvXwidth : float;
var uvYmin : float;
var uvYmax : float;

var circlePoints : int;
var circleRadius : float;
var circleCenter : Vector3;

var circleWaveSpeed : float;
var circleWaveLength : float;
var circleWaveAmplitude : float;

var circleRotationOffset : float;

var fade : float;
var previousFade : float;

var fadeOpposite : float;
var previousFadeOpposite : float;

var debug : boolean;




function Start () {
	meshFilter.GetComponent.<MeshFilter>();
	meshFilter.mesh = new Mesh();
	meshFilter.mesh.name = "Electric Ray";
}

function Update () {
	if(end != null) endPosition = end.position + endPositionOffset;
	
	if(fade < .01) fade = 0.0;
	if(fade > .99) fade = 1.0;
	
	if(fadeOpposite < .01) fadeOpposite = 0.0;
	if(fadeOpposite > .99) fadeOpposite = 1.0;
	
	if(fade > .01){
		distance = Vector3.Distance(start.position, endPosition);
		pointAmount = pointsAmountBase + (distance * pointsPerUnitDistance) + circlePoints;
		var rebuildMesh : boolean;
		if(points.Length != pointAmount){
			points = new Vector3[pointAmount];
			rayPoints = new RayPoint[pointAmount];
			rebuildMesh = true;
		}

		//Sphere Center.
		sphereCenter = (start.position + endPosition) * .5;
		var direction : Matrix4x4;
		direction.SetTRS(sphereCenter, Quaternion.LookRotation(start.position - endPosition, Vector3.forward), Vector3.one);
		sphereCenter = direction.MultiplyPoint3x4(Vector3(centerOffset,0,0));
		
		centerOffset = (endPosition.x - start.position.x) * centerOffsetMultiplier + Mathf.Sign(endPosition.x - start.position.x) * minCenterOffset;
		
		//Points Position.
		for(var i = 0; i < points.Length - circlePoints; i++){
			var lerpValue : float = i*1.0 / (points.Length - circlePoints - 1);
			points[i] = Vector3.Lerp(start.position, endPosition, lerpValue);
			
			points[i] += (points[i] - sphereCenter).normalized 
			* sphereExpandCurve.Evaluate(lerpValue) 
			* (Mathf.Sin(Time.time * waveSpeed + lerpValue * waveLength) * waveAmplitude + waveOffset);
		}

		circleCenter = points[points.Length - circlePoints - 1] + Vector3(0,-circleRadius,0);
		
		var circlePoint : float = 0.0;
			
		for(i = points.Length - circlePoints; i < points.Length; i++){
			var circlePhase  : float = circlePoint / circlePoints;
			var angle : float = circlePhase * 360 * Mathf.Deg2Rad + circleRotationOffset;
			
			
			var useCirlceRadius : float = circleRadius;
			
			useCirlceRadius += Mathf.Sin(Time.time * circleWaveSpeed + circlePhase * circleWaveLength) * circleWaveAmplitude;
			
			points[i] = circleCenter + Vector3(Mathf.Cos(angle) * useCirlceRadius, Mathf.Sin(angle) * useCirlceRadius, 0);
			circlePoint++;
		}
		
		var endPointRelax : Vector3 = (points[points.Length - circlePoints -2] + points[points.Length - circlePoints ]) * .5;
		points[points.Length - circlePoints -1] = (endPointRelax + points[points.Length - circlePoints -1]) * .5;
		points[points.Length - circlePoints] = (points[points.Length - circlePoints -1] + points[points.Length - circlePoints + 1 ]) * .5;
		
		
		//Ray points.
		var vertexID : int = 0;
		for(var n = 0; n < rayPoints.Length; n++){
			if(rayPoints[n]== null)rayPoints[n] = new RayPoint();
			
			var preMatrix : Matrix4x4;
			var postMatrix : Matrix4x4;
			
			var vertexAPrePosition : Vector3;
			var vertexBPrePosition : Vector3;
			
			var vertexBPostPosition : Vector3;		
			var vertexAPostPosition : Vector3;	
			
			if(n != rayPoints.Length - 1){
				postMatrix.SetTRS(points[n], Quaternion.LookRotation(points[n+1] - points[n], Vector3.forward), Vector3.one);
				
				vertexAPostPosition = postMatrix.MultiplyPoint3x4(Vector3(rayWidth*.5,0,0));
				vertexBPostPosition = postMatrix.MultiplyPoint3x4(Vector3(-rayWidth*.5,0,0));
			}
			if(n != 0){
				preMatrix.SetTRS(points[n], Quaternion.LookRotation(points[n]- points[n-1], Vector3.forward), Vector3.one);
				
				vertexAPrePosition = preMatrix.MultiplyPoint3x4(Vector3(rayWidth*.5,0,0));
				vertexBPrePosition = preMatrix.MultiplyPoint3x4(Vector3(-rayWidth*.5,0,0));
			}
			
			if(n != 0 && n != rayPoints.Length - 1){
				rayPoints[n].vertexAPosition = (vertexAPrePosition + vertexAPostPosition) * .5;
				rayPoints[n].vertexBPosition = (vertexBPrePosition + vertexBPostPosition) * .5;
			}
			if(n == 0){
				rayPoints[n].vertexAPosition = vertexAPostPosition;
				rayPoints[n].vertexBPosition = vertexBPostPosition;
			}
			if(n == rayPoints.Length - 1){
				rayPoints[n].vertexAPosition = vertexAPrePosition;
				rayPoints[n].vertexBPosition = vertexBPrePosition;
			}
			
			rayPoints[n].vertexA = vertexID;
			vertexID++;
			rayPoints[n].vertexB = vertexID;
			vertexID++;
		}
		
		//Position Mesh.
		if(rebuildMesh) ReBuildMesh();
		else{
			var vertices : Vector3[] = meshFilter.mesh.vertices;
			for(var m = 0; m < rayPoints.Length; m++){
				vertices[rayPoints[m].vertexA] = transform.worldToLocalMatrix.MultiplyPoint3x4(rayPoints[m].vertexAPosition);
				vertices[rayPoints[m].vertexB] = transform.worldToLocalMatrix.MultiplyPoint3x4(rayPoints[m].vertexBPosition);
			}
			meshFilter.mesh.vertices = vertices;
			meshFilter.mesh.RecalculateBounds();
		}
	}
	
	//Vertex Color.
	if(fade != previousFade || fadeOpposite != previousFadeOpposite){
		var newVertexColors : Color[] = new Color[meshFilter.mesh.colors.Length];
		for(var c = 0; c < newVertexColors.Length; c++){
			if(fade == 0.0){
				newVertexColors[c] = Color(0,0,0,0);
			}
			else{
				if(c == 0 || c == newVertexColors.Length-1) newVertexColors[c] = Color(0,0,0,0);
				else{
					if(c*1.0 / (newVertexColors.Length-1) > fade) newVertexColors[c] = Color(0,0,0,0);
					else newVertexColors[c] = Color(rayColor.r,rayColor.g,rayColor.b,1);
				}
			}
			
			if(c*1.0 / (newVertexColors.Length-1) < fadeOpposite) newVertexColors[c] = Color(0,0,0,0);
			
		}
		meshFilter.mesh.colors = newVertexColors;
	}
	previousFade = fade;
	previousFadeOpposite = fadeOpposite;
}

function OnDrawGizmos(){
	#if UNITY_EDITOR
	if(debug){
		var guiStyle : GUIStyle = new GUIStyle();
		guiStyle.normal.textColor = Color.white;
		for(var i = 0; i < points.Length; i++){
			Gizmos.color = Color.blue;
			if(i > 0) Gizmos.DrawLine(points[i-1], points[i]);

			Handles.Label(points[i], i.ToString(),guiStyle);
		}
		if(Application.isPlaying){
			Handles.Label(sphereCenter, "Sphere Center",guiStyle); 
			Gizmos.DrawSphere(sphereCenter,.1);
		}
		
		Gizmos.color = Color.white;
		Gizmos.DrawSphere(circleCenter,.05);
		Handles.Label(circleCenter, "Circle Center",guiStyle);
		
		
		for(var n = 0; n < rayPoints.Length; n++){
			Gizmos.color = Color.green;
			Gizmos.DrawSphere(rayPoints[n].vertexAPosition, .05);
			Gizmos.color = Color.blue;
			Gizmos.DrawSphere(rayPoints[n].vertexBPosition, .05);
			
			guiStyle.normal.textColor = Color.green;
			Handles.Label(rayPoints[n].vertexAPosition, rayPoints[n].vertexA.ToString() ,guiStyle);
			guiStyle.normal.textColor = Color.blue;
			Handles.Label(rayPoints[n].vertexBPosition, rayPoints[n].vertexB.ToString() ,guiStyle);
		}
	}	
	#endif
}

function ReBuildMesh(){
	if(meshFilter.mesh == null) meshFilter.mesh = new Mesh();
	else meshFilter.mesh.Clear();
	
	var newVertices : Vector3[] = new Vector3[pointAmount * 2];

	
	for(var i = 0; i < rayPoints.Length; i++){
		newVertices[rayPoints[i].vertexA] = transform.worldToLocalMatrix.MultiplyPoint3x4(rayPoints[i].vertexAPosition);
		newVertices[rayPoints[i].vertexB] = transform.worldToLocalMatrix.MultiplyPoint3x4(rayPoints[i].vertexBPosition);
	}
	
	var newVertexColors : Color[] = new Color[newVertices.Length];
	for(var c = 0; c < newVertexColors.Length; c++){
		if(fade == 0.0){
			newVertexColors[c] = Color(0,0,0,0);
		}
		else{
			if(c == 0 || c == newVertexColors.Length-1) newVertexColors[c] = Color(0,0,0,0);
			else{
				if(c*1.0 / (newVertexColors.Length-1) > fade) newVertexColors[c] = Color(0,0,0,0);
				else newVertexColors[c] = Color(rayColor.r,rayColor.g,rayColor.b,1);
			}
		}
		
		if(c*1.0 / (newVertexColors.Length-1) < fadeOpposite) newVertexColors[c] = Color(0,0,0,0);
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
	
	for(var m = 0; m < newUV.Length; m++){
		if(m%2==0) newUV[m].y = uvYmin;
		else  newUV[m].y = uvYmax;
		
		newUV[m].x = (m - (m%2)) * uvXwidth;
	}
	
	meshFilter.mesh.vertices = newVertices;
	meshFilter.mesh.uv = newUV;
	meshFilter.mesh.colors = newVertexColors;
	meshFilter.mesh.triangles = triangleArray.ToBuiltin(int) as int[];
	meshFilter.mesh.RecalculateBounds();
	meshFilter.mesh.RecalculateNormals();
}


