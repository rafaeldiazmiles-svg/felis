#pragma strict

var colorGroup : VertexColorGroups;
//var mesh : Mesh;

var alphaFrameGroups : AlphaFrameGroup[];

class AlphaFrameGroup{
	var frameID : int[];
	var currentFrame : int;
	var previousFrame : int;
	
	var frameChange : boolean;
	
	function Update(cGroup : VertexColorGroups, mesh : Mesh){
		if(currentFrame != previousFrame){
			if(currentFrame >= frameID.Length) return;
			frameChange = true;
			
			var mColors : Color[] = mesh.colors;
			
			if(currentFrame >= 0){
				if(previousFrame >= 0){
					for(var i = 0; i < cGroup.scrollGroups[frameID[previousFrame]].vertices.Length; i++){
						mColors[cGroup.scrollGroups[frameID[previousFrame]].vertices[i]].a = 0.0;
					}
				}
							
				
				for(i = 0; i < cGroup.scrollGroups[frameID[currentFrame]].vertices.Length; i++){
					mColors[cGroup.scrollGroups[frameID[currentFrame]].vertices[i]].a = 1.0;
				}
			}
			else{
				//Hide
				for(var n = 0; n < cGroup.scrollGroups[frameID[previousFrame]].vertices.Length; n++){
					mColors[cGroup.scrollGroups[frameID[previousFrame]].vertices[n]].a = 0.0;
				}	
			}			
			
			mesh.colors = mColors;
			previousFrame = currentFrame;
		}
		else{
			frameChange = false;
		}
	}
	
	function Start(cGroup : VertexColorGroups, mesh : Mesh){
		if(currentFrame >= frameID.Length) return;
		
		var mColors : Color[] = mesh.colors;
		
		for(var n = 0; n < frameID.Length; n++){
			for(var i = 0; i < cGroup.scrollGroups[frameID[n]].vertices.Length; i++){
				var thisAlpha : float;
				if(n == currentFrame){
					thisAlpha = 1.0;
				}
				else{
					thisAlpha = 0.0;
				}
				mColors[cGroup.scrollGroups[frameID[n]].vertices[i]].a = thisAlpha;
			}
		}
		
		mesh.colors = mColors;
		
		previousFrame = currentFrame;
	}
}

function Start () {
	colorGroup = GetComponent.<VertexColorGroups>();

	var mesh : Mesh = colorGroup.GetMesh();
	
	for(var i = 0; i < alphaFrameGroups.Length; i++){
		alphaFrameGroups[i].Start(colorGroup, mesh);
	}	
}

function Update () {
	var mesh : Mesh= colorGroup.GetMesh();
	for(var i = 0; i < alphaFrameGroups.Length; i++){
			alphaFrameGroups[i].Update(colorGroup, mesh);
	}
}