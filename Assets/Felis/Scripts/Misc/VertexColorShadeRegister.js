#pragma strict

var addThis : boolean;
var allChildrenMesh : boolean;

var excludeList : MeshFilter[];
var exludeString : String[];

var meshFilters : MeshFilter[];

var done : boolean;

function Start () {

}

function Update () {
	if(!done){
		done = true;
		var vCSHade : VertexColorShade = GameObject.FindObjectOfType.<VertexColorShade>();
		
		if(addThis){
			var thisMeshF : MeshFilter = GetComponent.<MeshFilter>();
			if(thisMeshF != null){
				vCSHade.ApplyColsToMesh(thisMeshF);
			}
		}
		
		if(allChildrenMesh){
			var meshF : MeshFilter[] = GetComponentsInChildren.<MeshFilter>();
			for(var i = 0; i < meshF.Length; i++){

				if(IsExcluded(meshF[i])) continue;
				
				vCSHade.ApplyColsToMesh(meshF[i]);
			}
		}
		for(i = 0; i < meshFilters.Length; i++){
			if(IsExcluded(meshFilters[i])) continue;
			vCSHade.ApplyColsToMesh(meshFilters[i]);
		}
	}
}

function IsExcluded(test : MeshFilter) : boolean{
	var cont : boolean;
	for(var n = 0; n < excludeList.Length; n++){
		if(excludeList[n] == test){
			cont = true;
		}
	}

	if(exludeString != null){
		for(var i  = 0; i < exludeString.Length; i++){
			if(test.transform.name.Contains(exludeString[i])){
				cont = true;
			}
		}
	}

	return cont;
}