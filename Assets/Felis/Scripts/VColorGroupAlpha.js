#pragma strict

var colorGroups : VertexColorGroups;



var setAlphaGroups : ControlCGroupAlpha[];

class ControlCGroupAlpha{
	var color : Color;
	var hasScrollGroup : boolean;
	var scrollGroup : ScrollGroup;
	var alpha : float;
	var prevAlpha : float;
	var settedFirstFrame : boolean;

	var mesh : Mesh;

	function Update(colorGroups : VertexColorGroups){
		if(alpha != prevAlpha || !settedFirstFrame){
			settedFirstFrame = true;
			if(!hasScrollGroup){
				for(var n = 0; n < colorGroups.scrollGroups.Length; n++){
					if(color == colorGroups.scrollGroups[n].color){
						scrollGroup = colorGroups.scrollGroups[n];
						hasScrollGroup = true;
						break;
					}
				}
			}
			
			if(hasScrollGroup){
				mesh = colorGroups.GetMesh();
				var vertexColors : Color[] = mesh.colors;
				for(var i = 0; i < scrollGroup.vertices.Length; i++){
					vertexColors[scrollGroup.vertices[i]].a = alpha;
				}
				mesh.colors = vertexColors;
				colorGroups.SetMesh(mesh);
			}
			
			
			prevAlpha = alpha;
		}
	}
}

function Start () {
	colorGroups = GetComponent.<VertexColorGroups>();
}

function Update () {
	for(var i = 0; i < setAlphaGroups.Length; i++){
		setAlphaGroups[i].Update(colorGroups);
	}
}