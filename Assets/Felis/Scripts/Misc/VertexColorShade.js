#pragma strict

/*var meshes : Array;
var useChildrenOf : Transform[];*/

var baseColor : Color;
var baseColorBlend : float;

var zColorLayer : VCShade_ZColorLayer[];

var horizontalLayers : VCShade_HorizontalRange[]; //Reminder: Not really horizontal layer, but z layers in horizontal range.

var zColorLayerBounds : VCShade_LayersBounds[];

var blendColorSpecificGLOBAL : VCShade_BlendSpecific[]; //In case I want an object to be less affected by color

var dynamicObjs : Array;

var dynamicObjs_NextObjEvery : Timer;
var dynamicObjs_NextObjEvery_Every : float = 0.5;
var dynamicObjs_CurrentID : int;


class VCShade_ZColorLayer{
	var zPos : float;
	var range : float;
	var color : Color;
	var blend : float;
}

class VCShade_LayersBounds{
	var disable : boolean;
	var zColorLayer : VCShade_ZColorLayer[];
	var bounds : Bounds[];
	@Space(10)
	var areaMesh : AreaMesh;
	var areaMeshes : AreaMesh[];
	var useWaterAreaMesh : boolean;
	@Space(10)
	var range : float;
	var debugColor : Color;
	var areaBlendsMaterial : float;
	var areaBlendsMaterialSpecific : VCShade_BlendSpecific[];
	
	var blendColorSpecific : VCShade_BlendSpecific[]; //Overrides global
}

class VCShade_BlendSpecific{
	var areaBlendsMaterial : float;
	var tag : String[];
	
	function CheckTag(objTag : String) : boolean{
		for(var c = 0; c < tag.Length; c++){
			if(objTag == tag[c]){
				return true;
			}
		}
		return false;	
	}
}

class VCShade_HorizontalRange{
	var blend : float;
	var range : float;
	var xStart : float;
	var xEnd : float;
	var zColorLayer : VCShade_ZColorLayer[];
	@Space(30)
	var areaBlendsMaterial : float;
	var areaBlendsMaterialSpecific : VCShade_BlendSpecific[];
	@Space(30)
	var rangeCurve : AnimationCurve;
	
	var blendColorSpecific : VCShade_BlendSpecific[]; //Overrides global
}

function Start () {
	for(var n = 0; n < zColorLayerBounds.Length; n++){
		if(zColorLayerBounds[n].useWaterAreaMesh){
			var wArea : WaterArea = GameObject.FindObjectOfType.<WaterArea>();
			if(wArea != null){
				zColorLayerBounds[n].areaMesh = wArea.gameObject.GetComponentInChildren.<AreaMesh>();
			}
		}
	}

	for(var i = 0; i < horizontalLayers.Length; i++){
		var xStart : float = horizontalLayers[i].xStart;
		var xEnd : float = horizontalLayers[i].xEnd;
		var range : float = horizontalLayers[i].range;
	
		horizontalLayers[i].rangeCurve = new AnimationCurve(
		Keyframe(xStart - range, 0.0),
		Keyframe(xStart, 1.0),
		Keyframe(xEnd, 1.0),
		Keyframe(xEnd + range, 0.0));

	}

	dynamicObjs_NextObjEvery.every = dynamicObjs_NextObjEvery_Every;
}

class VertexColorShade_Dynamic{
	var meshF : MeshFilter;
	var skinnedMesh : SkinnedMeshRenderer;
}


function AddDynamic(meshF : MeshFilter){
	if(dynamicObjs == null){
		dynamicObjs = new Array();
	}
	var thisDynamicObj : VertexColorShade_Dynamic = new VertexColorShade_Dynamic();
	thisDynamicObj.meshF = meshF;
	dynamicObjs.Add(thisDynamicObj);
}

function AddDynamic(skinnedMesh : SkinnedMeshRenderer){
	if(dynamicObjs == null){
		dynamicObjs = new Array();
	}
	var thisDynamicObj : VertexColorShade_Dynamic = new VertexColorShade_Dynamic();
	thisDynamicObj.skinnedMesh = skinnedMesh;
	dynamicObjs.Add(thisDynamicObj);
}

function Update () {
	dynamicObjs_NextObjEvery.Update();
	if(dynamicObjs_NextObjEvery.current){
		if(dynamicObjs != null && dynamicObjs.length > 0){
			var thisDynamicObj : VertexColorShade_Dynamic = dynamicObjs[dynamicObjs_CurrentID];

			if(thisDynamicObj.meshF != null){
				ApplyColsToMesh(thisDynamicObj.meshF);
			}

			if(thisDynamicObj.skinnedMesh != null){
				ApplyColsToMesh(thisDynamicObj.skinnedMesh);
			}

			dynamicObjs_CurrentID ++;
			dynamicObjs_CurrentID = dynamicObjs_CurrentID % dynamicObjs.length;
		}
	}

}

function GetMatLerpValue(pos : Vector3, objTag : String) : float{
	//var pos : Vector3 = obj.transform.position;
	var lerp : float = 1.0;
	
	var blendVal : float;
	
	//horizontal layers
	for(var j = 0; j < horizontalLayers.Length; j++){
		
		blendVal = horizontalLayers[j].areaBlendsMaterial;
		for(var i = 0; i < horizontalLayers[j].areaBlendsMaterialSpecific.Length; i++){
			if(horizontalLayers[j].areaBlendsMaterialSpecific[i].CheckTag(objTag)){
				blendVal = horizontalLayers[j].areaBlendsMaterialSpecific[i].areaBlendsMaterial;
				break;
			}
		}
		
		lerp = Mathf.Lerp(lerp, blendVal,  horizontalLayers[j].rangeCurve.Evaluate(pos.x) * horizontalLayers[j].blend);
		
	}
	
	
	//bounds layers
	for(var w = 0; w < zColorLayerBounds.Length; w++){
		if(zColorLayerBounds[w].disable) continue;
		blendVal = zColorLayerBounds[w].areaBlendsMaterial;
		
		for(i = 0; i < zColorLayerBounds[w].areaBlendsMaterialSpecific.Length; i++){
			if(zColorLayerBounds[w].areaBlendsMaterialSpecific[i].CheckTag(objTag)){
				blendVal = zColorLayerBounds[w].areaBlendsMaterialSpecific[i].areaBlendsMaterial;
				break;
			}
		}
		
		var influence : float = 0.0;
		for(var q = 0; q < zColorLayerBounds[w].bounds.Length; q++){
			var distanceToBound : float = Vector3.Distance(pos, zColorLayerBounds[w].bounds[q].ClosestPoint(pos));
			var range : float = Mathf.Max(0.00001,zColorLayerBounds[w].range);
			influence += Mathf.Max(0, (range -  distanceToBound)) / range;
		}
		influence = Mathf.Clamp01(influence);
		influence *= influence;
		lerp = Mathf.Lerp(lerp, blendVal, influence);
	}
	return lerp;
}

function ApplyColsToMesh(meshF : MeshFilter){
	var mesh : Mesh = meshF.mesh;
	var colors : Color[] = mesh.colors;
	for(var n = 0; n < colors.Length; n++){
		//Vertex Z Pos
		var vPos : Vector3 = meshF.transform.TransformPoint(mesh.vertices[n]);
		colors[n] = GetColorOnPos(vPos, colors[n]);
	}

	mesh.colors = colors;
}

function ApplyColsToMesh(skinnedMesh : SkinnedMeshRenderer){
	
	var mesh : Mesh = Instantiate(skinnedMesh.sharedMesh);
	var colors : Color[] = mesh.colors;
	for(var n = 0; n < colors.Length; n++){
		//Vertex Z Pos
		var vPos : Vector3 = skinnedMesh.transform.TransformPoint(mesh.vertices[n]);
		colors[n] = GetColorOnPos(vPos, colors[n]);
	}

	mesh.colors = colors;
	skinnedMesh.sharedMesh = mesh;
}

function GetColorOnPos(pos : Vector3, currentCol : Color, objTag : String) : Color{
	//Base Color.
	var result : Color = Color.Lerp(currentCol, baseColor, baseColorBlend);
	//Base Z Layer Colors
	
	//Get specific Blend
	var colBlendGlobal : float = 1.0;
	if(objTag != ""){
		for(var i = 0; i < blendColorSpecificGLOBAL.Length; i++) {
			if(blendColorSpecificGLOBAL[i].CheckTag(objTag)){
				colBlendGlobal = blendColorSpecificGLOBAL[i].areaBlendsMaterial;
			}
		}
	}
	
	for(var m = 0; m < zColorLayer.Length; m++){
		result = Color.Lerp(result, ApplyColorLayer(pos.z, result, zColorLayer[m]), colBlendGlobal);
	}
	

	//Bounds Z Layer Cols /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var specificColorBlend : float = colBlendGlobal;

	for(var w = 0; w < zColorLayerBounds.Length; w++){
		if(zColorLayerBounds[w].disable) continue;

		var lerp : float;

		//Add areamesh to lerp (currently only works in absolutes)
		var maxedOut : boolean;
		if(zColorLayerBounds[w].areaMesh != null){
			if(zColorLayerBounds[w].areaMesh.TestPoint(Vector3(pos.x, pos.y,0))){
				lerp += 1.0;
			}
		}


		if(lerp < 1.0 && zColorLayerBounds[w].areaMeshes != null){
			for(i = 0; i < zColorLayerBounds[w].areaMeshes.Length; i++){
				if(zColorLayerBounds[w].areaMeshes[i] != null){
					if(zColorLayerBounds[w].areaMeshes[i].TestPoint(Vector3(pos.x, pos.y,0) )){
						lerp += 1.0;
						break;
					}
				}
			}
		}

		//Add bounds lerp by proximity range (using Bounds's ClosestPoint function).
		if(lerp < 1.0){
			for(var q = 0; q < zColorLayerBounds[w].bounds.Length; q++){
				var distanceToBound : float = Vector3.Distance(pos, zColorLayerBounds[w].bounds[q].ClosestPoint(pos));
				lerp += Mathf.Max(0, (zColorLayerBounds[w].range -  distanceToBound)) / Mathf.Max(0.00001,zColorLayerBounds[w].range);
				if(lerp >= 1.0){
					break;
				}
			}
		}

		//Max Lerp is 1.0
		lerp = Mathf.Min(lerp, 1.0);
		
		//Get specific Blend
		specificColorBlend = colBlendGlobal;
		if(objTag != ""){
			for(i = 0; i < zColorLayerBounds[w].blendColorSpecific.Length; i++) {
				if(zColorLayerBounds[w].blendColorSpecific[i].CheckTag(objTag)){
					specificColorBlend = zColorLayerBounds[w].blendColorSpecific[i].areaBlendsMaterial;
				}
			}
		}		
		
		for(var h = 0; h < zColorLayerBounds[w].zColorLayer.length; h++){
			var layerCol : Color = ApplyColorLayer(pos.z, result, zColorLayerBounds[w].zColorLayer[h]);
			result = Color.Lerp(result, layerCol, lerp * specificColorBlend); 
		}
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//Horizontal Layer Cols
	for(var j = 0; j < horizontalLayers.Length; j++){
		var hLayerResult : Color = result;
		for(m = 0; m < horizontalLayers[j].zColorLayer.Length; m++){
			hLayerResult = ApplyColorLayer(pos.z, hLayerResult, horizontalLayers[j].zColorLayer[m]);
		}
		
		//Get specific Blend

		if(objTag != ""){
			for(i = 0; i < horizontalLayers[j].blendColorSpecific.Length; i++) {
				if(horizontalLayers[j].blendColorSpecific[i].CheckTag(objTag)){
					specificColorBlend = horizontalLayers[j].blendColorSpecific[i].areaBlendsMaterial;
				}
			}
		}
		
		result = Color.Lerp(result, hLayerResult, horizontalLayers[j].rangeCurve.Evaluate(pos.x) * horizontalLayers[j].blend * specificColorBlend);
		//result = hLayerResult;
	}
	
	return result;
}

function GetColorOnPos(pos : Vector3, currentCol : Color) : Color{
	return GetColorOnPos(pos, currentCol, "");
}

function ApplyColorLayer(zPos : float, current : Color, cLayer : VCShade_ZColorLayer) : Color{
	var deltaZ : float = zPos - cLayer.zPos;
	var lerp : float = 1 - (Mathf.Abs(deltaZ) / cLayer.range);
	lerp *= cLayer.blend;
	return Color.Lerp(current, cLayer.color, lerp);	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	for(var i = 0; i < zColorLayerBounds.Length; i++){
		Gizmos.color = zColorLayerBounds[i].debugColor;
		for(var n = 0; n < zColorLayerBounds[i].bounds.Length; n++){
			
			Gizmos.DrawWireCube(zColorLayerBounds[i].bounds[n].center, zColorLayerBounds[i].bounds[n].size);
		}
	}
	for(i = 0; i < horizontalLayers.Length; i++){
		Debug.DrawLine(Vector3(horizontalLayers[i].xStart, - 50, 0), Vector3(horizontalLayers[i].xStart, 50, 0), Color.green);
		Debug.DrawLine(Vector3(horizontalLayers[i].xEnd, - 50, 0), Vector3(horizontalLayers[i].xEnd, 50, 0), Color.red);
		
		for(var m = -50; m < 50; m+= 2.0){
			Debug.DrawLine(Vector3(horizontalLayers[i].xStart - horizontalLayers[i].range, m, 0), 
			Vector3(horizontalLayers[i].xStart - horizontalLayers[i].range, m+1, 0), Color.green);
			
			Debug.DrawLine(Vector3(horizontalLayers[i].xEnd + horizontalLayers[i].range, m, 0), 
			Vector3(horizontalLayers[i].xEnd + horizontalLayers[i].range, m+1, 0), Color.red);
		}	
	}
	#endif
}