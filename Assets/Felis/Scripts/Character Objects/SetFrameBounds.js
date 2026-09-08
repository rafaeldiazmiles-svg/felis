#pragma strict
var frameZones : FrameZone[];

class FrameZone{
	@Header("-------------------------------Values------------------------")
	var frameGroups : UVFrameGroups[];
	var getTimer : Timer;
	
	
	
	@Header("--------------------------------Input-------------------------")
	var tags : String[];
	var bounds : Bounds [];
	var debugColor : Color;
	var inBound : ToggleBoolean[];
	var frames : UVFrame[];
	
	var forceSweat : boolean;
	var sweat : SweatDropsParticles[];
	
	function SearchTags(){
		var frameGroupsArray : Array = new Array();
		for(var i = 0; i < tags.Length; i++){
			var tagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(tags[i]);
			for(var n = 0; n < tagObjs.Length; n++){
				var thisFrameGroup : UVFrameGroups = tagObjs[n].GetComponentInChildren.<UVFrameGroups>();
				frameGroupsArray.Push(thisFrameGroup);
			}
		}
		frameGroups = frameGroupsArray.ToBuiltin(UVFrameGroups) as UVFrameGroups[];
		
		sweat = new SweatDropsParticles[frameGroups.Length];
		for(var m = 0; m < frameGroups.Length; m++){
			if(frameGroups[m] == null || frameGroups[m].transform.parent == null){
				continue;
			}
			sweat[m] = frameGroups[m].transform.parent.GetComponentInChildren.<SweatDropsParticles>();
		}
		
		inBound = new ToggleBoolean[frameGroups.Length];
		for(var q = 0; q < inBound.Length; q++){
			inBound[q] = new ToggleBoolean();
		}
	}
	
	function Update(t : Transform){
		getTimer.Update();
		if(getTimer.current){
			if(getTimer.every == 0.0){
				getTimer.every = 2.0;
			}
			SearchTags();
		}
		
		for(var i = 0; i < frameGroups.Length; i++){
			if(frameGroups[i] == null){
				continue;
			}
			inBound[i].current = false;
			for(var n = 0; n < bounds.Length; n++){
				var bCenter : Vector3 = bounds[n].center;
				bounds[n].center += t.position;
				if(bounds[n].Contains(frameGroups[i].transform.position)){
					inBound[i].current = true;
				}
				bounds[n].center = bCenter;
				if(inBound[i].current){
					break;
				}
			}
			
			inBound[i].Update();
			
			if(inBound[i].toggledTrue){
				for(var m = 0; m < frames.Length; m++){
					frameGroups[i].SetFrame(frames[m]);
					if(forceSweat && sweat != null){
						sweat[i].forceSweatDropUntil = Time.time + 3.0;
					}
				}		
			}
		}					
	}
	
}

function Start () {

}

function Update () {
	for(var i = 0; i < frameZones.Length; i++){
		frameZones[i].Update(transform);
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	for(var i = 0; i < frameZones.Length; i++){
		for(var n = 0; n < frameZones[i].bounds.Length; n++){
			Handles.Label(frameZones[i].bounds[n].center + transform.position, "FrameZone: " + i.ToString());
			if(frameZones[i].debugColor.a != Color(0,0,0,0)){
				Gizmos.color = frameZones[i].debugColor;
			}
			Gizmos.DrawWireCube(frameZones[i].bounds[n].center + transform.position, frameZones[i].bounds[n].size);
		}
	}
	#endif
}