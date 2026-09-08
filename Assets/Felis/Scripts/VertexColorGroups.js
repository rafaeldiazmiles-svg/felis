var meshFilter : MeshFilter;
var skinnedMesh : SkinnedMeshRenderer;

//var mesh : Mesh;
var ignoreAlpha : boolean = true;
var scrollGroups : ScrollGroup[];

var autoDetectColorGroups : boolean;
var includeWhite : boolean;

private var defaultUV : Vector2[];

class ScrollGroup{
	var color : Color;
	var vertices : int[];
}

function Start () {
	GetColorGroups();
}

function GetColorGroups(){
	skinnedMesh = GetComponent.<SkinnedMeshRenderer>();
	meshFilter = GetComponent.<MeshFilter>();
	var mesh : Mesh;
	if(skinnedMesh !=  null){
		skinnedMesh.sharedMesh = Instantiate(skinnedMesh.sharedMesh);
		defaultUV = skinnedMesh.sharedMesh.uv;
		mesh = skinnedMesh.sharedMesh;
	}
	
	if(meshFilter != null){
		meshFilter.sharedMesh = Instantiate(meshFilter.sharedMesh);
		defaultUV = meshFilter.sharedMesh.uv;
		mesh = meshFilter.sharedMesh;
	}
	
	var vertices : Vector3[]  = mesh.vertices;	
	var scrollGroupArray = new Array();
				
	if(autoDetectColorGroups){
		for(var m = 0; m < vertices.Length; m++){
			if(!includeWhite && mesh.colors[m] == Color.white) continue;
			var isNew : boolean = true;
			for(var w = 0; w < scrollGroupArray.length; w++){
				var thisColor : Color = scrollGroupArray[w];
				if(thisColor == mesh.colors[m]){
					isNew = false;
					break;
				}
			}
			if(isNew) scrollGroupArray.Push(mesh.colors[m]);
		}	
		
		scrollGroups = new ScrollGroup[scrollGroupArray.length];
		for(w = 0; w < scrollGroupArray.length; w++){
			scrollGroups[w] = new ScrollGroup();
			scrollGroups[w].color = scrollGroupArray[w];
		} 
	}

	for(var i = 0; i < scrollGroups.Length; i++){
		var count : int = 0;
		
		for(var n = 0; n < vertices.Length; n++){
			if(n >= mesh.colors.Length){
				break;
			}
			if(ignoreAlpha){
				if(mesh.colors[n].r == scrollGroups[i].color.r
				&& mesh.colors[n].g == scrollGroups[i].color.g
				&& mesh.colors[n].b == scrollGroups[i].color.b){
					count ++;		
				}
			}
			else{
				if(mesh.colors[n] == scrollGroups[i].color)	count ++;
			}
		}
			
			
		scrollGroups[i].vertices = new int[count];
		count = 0;
		for(n = 0; n < vertices.Length; n++){
			if(n >= mesh.colors.Length){
				break;
			}

			if(ignoreAlpha){
				if(mesh.colors[n].r == scrollGroups[i].color.r
				&& mesh.colors[n].g == scrollGroups[i].color.g
				&& mesh.colors[n].b == scrollGroups[i].color.b){
					scrollGroups[i].vertices[count] = n;
					count ++;		
				}
			}
			else{
				if(mesh.colors[n] == scrollGroups[i].color){
					scrollGroups[i].vertices[count] = n;
					count ++;
				}
			}
			
		}	
	}
}

function GetMesh() : Mesh{
	if(skinnedMesh !=  null){
		return skinnedMesh.sharedMesh;
	}
	
	if(meshFilter != null){
		return meshFilter.sharedMesh;
	}
	
	return null;
}

function SetMesh(newMesh : Mesh){
	if(skinnedMesh !=  null){
		skinnedMesh.sharedMesh = newMesh;
	}
	
	if(meshFilter != null){
		meshFilter.sharedMesh = newMesh;
	}	
}

function OffsetUVGroup(group : int, offset : Vector2){
	//var mesh : Mesh = skinnedMesh.sharedMesh;
	var uv : Vector2[];
	if(skinnedMesh !=  null){
		uv = skinnedMesh.sharedMesh.uv;
	}
	if(meshFilter != null){
		uv = meshFilter.sharedMesh.uv;
	}	
	
	//var uvs : Vector2[] = mesh.uv;
	
	for(var i = 0; i < scrollGroups[group].vertices.Length; i++){
		uv[scrollGroups[group].vertices[i]] = defaultUV[scrollGroups[group].vertices[i]] + offset;
	}	
	
	if(skinnedMesh !=  null){
		skinnedMesh.sharedMesh.uv = uv;
	}
	if(meshFilter != null){
		meshFilter.sharedMesh.uv = uv;
	}	
	
	//mesh.uv = uvs;
}