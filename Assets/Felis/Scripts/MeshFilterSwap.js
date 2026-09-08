#pragma strict

var meshes : Mesh[];

var meshFilter : MeshFilter;

function MeshSwap(ID : int){
	if(meshFilter == null){
		meshFilter = GetComponentInChildren.<MeshFilter>();
	}

	if(meshFilter != null && meshes != null){
		if(ID >= 0 && ID < meshes.Length - 1){
			meshFilter.mesh = meshes[ID];
		}
	}
}

function Start () {
	if(meshFilter == null){
		meshFilter = GetComponentInChildren.<MeshFilter>();
	}
}

function Update () {

}