#pragma strict

var meshFilter : MeshFilter;
//var mesh : Mesh;
var findVerticesByColor : boolean = true;
var vertexColor : Color;
var ignoreAlpha : boolean = true;

var vertices : BoneVertex[];

var startingPos : Vector3;
var previousPos : Vector3;

var startingRot : Quaternion;
var previousRot : Quaternion;

//var vOffset : Vector3;

class BoneVertex{
	var id : int;
	var defaultGlobalPos : Vector3;
}

function Start () {
	startingPos = transform.position;
	startingRot = transform.rotation;
	
	//mesh = meshFilter.mesh;
	
	//Gather all vertices.
	
	if(findVerticesByColor){
		var verticesArray = new Array();
		for(var i = 0; i < meshFilter.mesh.vertices.Length; i++){
			if(meshFilter.mesh.colors[i].r == vertexColor.r
			&& meshFilter.mesh.colors[i].g == vertexColor.g
			&& meshFilter.mesh.colors[i].b == vertexColor.b){
				if(meshFilter.mesh.colors[i].a == vertexColor.a || ignoreAlpha){
					var newVertex : BoneVertex = new BoneVertex();
					newVertex.id =  i;
					newVertex.defaultGlobalPos = meshFilter.transform.localToWorldMatrix.MultiplyPoint(meshFilter.sharedMesh.vertices[i]);
					verticesArray.Push(newVertex);
				}
			}
		}
		vertices = verticesArray.ToBuiltin(BoneVertex) as BoneVertex[];
	}
}

function SetVertexArray(vArray : int[]){
	vertices = new BoneVertex[vArray.Length];
	var mVerts : Vector3[] = meshFilter.sharedMesh.vertices;
	for(var i = 0; i < vertices.Length; i++){
		vertices[i] = new BoneVertex();
		vertices[i].id = vArray[i];
		vertices[i].defaultGlobalPos = meshFilter.transform.localToWorldMatrix.MultiplyPoint(mVerts[vArray[i]]);
	}
}

function Update () {
	if(meshFilter == null) return;
	
	if(previousPos != transform.position || previousRot != transform.rotation){
		previousPos = transform.position;
		previousRot = transform.rotation;

		
		var relativePos : Vector3 = transform.position - startingPos;
		var relativeRot : Quaternion = transform.rotation * Quaternion.Inverse(startingRot);
		
		var meshVertices : Vector3[] = meshFilter.mesh.vertices;
		
		for(var i = 0; i < vertices.Length; i++){
			var globalPos : Vector3 = vertices[i].defaultGlobalPos + relativePos;
			//globalPos = RotatePointAroundPivot(globalPos, transform.position, relativeRot.eulerAngles);
			globalPos =  Quaternion.Euler(relativeRot.eulerAngles) * (globalPos - transform.position) + transform.position;
			meshVertices[vertices[i].id] = meshFilter.transform.worldToLocalMatrix.MultiplyPoint(globalPos);
			
		}
		
		meshFilter.mesh.vertices = meshVertices;
	}
}

/* function RotatePointAroundPivot(point: Vector3, pivot: Vector3, rotation: Vector3): Vector3 {
   point = Quaternion.Euler(rotation) * (point - pivot) + pivot;
   return point; // return it
 }*/
 
 