#pragma strict

var colorGroups : VertexColorGroups;

var anims : GroupCurveAnim[];


class GroupCurveAnim{
	@Header ("--------------Input---------------")
	var color : Color;
	var curveAnim : AnimationCurve;
	@Header ("-------------Values---------------")
	var cGroupID : int;
	var foundGroup : boolean;
}

function Start () {
	colorGroups = GetComponent.<VertexColorGroups>();
	for(var i = 0; i < anims.Length; i++){
		for(var n = 0; n < colorGroups.scrollGroups.Length; n++){
			if(anims[i].color == colorGroups.scrollGroups[n].color){
				anims[i].cGroupID = n;
				anims[i].foundGroup = true;
				break;
			}
		}
	}
}

function Update () {
	for(var i = 0; i < anims.Length;i++){
		if(!anims[i].foundGroup) continue;
		
		var mesh : Mesh = colorGroups.GetMesh();
		
		var colors : Color[] = mesh.colors;
		var ID : int = anims[i].cGroupID;
		for(var n = 0; n < colorGroups.scrollGroups[ID].vertices.Length; n++){
			var vertexID : int = colorGroups.scrollGroups[ID].vertices[n];
			colors[vertexID].a = anims[i].curveAnim.Evaluate(Time.time);
		}
		mesh.colors = colors;
		
		colorGroups.SetMesh(mesh);
	}
}