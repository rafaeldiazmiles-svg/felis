#pragma strict

@Header("----------------------Input----------------------")
var bounds : Bounds[];
var areaMesh : AreaMesh;
var centerBounds : boolean;
@Space(30)
var setCharWaterColor : boolean;
var charWaterColor : Color;
@Space(30)
var setWaterDrag : boolean;
var waterDrag : float;

@Header("----------------------Values----------------------")
var getUnderWaterTimer : Timer;
var underWaters : UnderWater[];
var gotUWObjs : boolean;

function GetUnderWaterObjs(){
	yield WaitForEndOfFrame();
	if(!gotUWObjs){
		underWaters = GameObject.FindObjectsOfType.<UnderWater>();
	}
	gotUWObjs = true;
}

function Start () {
	areaMesh = GetComponentInChildren.<AreaMesh>();
	GetUnderWaterObjs();

	getUnderWaterTimer.next = Time.time + .1;
}

function Update () {
	gotUWObjs = false;
	getUnderWaterTimer.Update();
	if(getUnderWaterTimer.current){
		GetUnderWaterObjs();
	}

	if(underWaters != null){
		for(var i = 0; i < underWaters.Length; i++){
			if(underWaters[i] == null) continue;
			
			underWaters[i].isUnderwater.current = false;

			//Set underwater status if underwater.
			underWaters[i].isUnderwater.current = IsPointInWater(underWaters[i].transform.position);

			//if underwater, set drag and color if necessary.
			if(underWaters[i].isUnderwater.current){
				if(setCharWaterColor && !underWaters[i].dontChangeWaterColor){
					underWaters[i].waterColor = charWaterColor;
				}

				if(setWaterDrag){
					underWaters[i].waterDrag = waterDrag;
				}
			}
		}
	}
}

function IsPointInWater(point : Vector3) : boolean{
	if(areaMesh != null){
		if(areaMesh.TestPoint(point)){
			return true;
		}
	}

	var inWater : boolean;
	for(var n = 0; n < bounds.Length; n++){
		var center : Vector3 = bounds[n].center;
		if(centerBounds){
			bounds[n].center += transform.position;
		}
		if(bounds[n].Contains(point)){
			inWater = true;
		}
		bounds[n].center = center;
		if(inWater){
			return true;
		}

	}
	
	return false;
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(bounds != null){
		for(var n = 0; n < bounds.Length; n++){
			var center : Vector3 = bounds[n].center;
			if(centerBounds){
				bounds[n].center += transform.position;;
			}
			
			Gizmos.color = Color.white;
			Gizmos.DrawWireCube(bounds[n].center, bounds[n].size);
			
			bounds[n].center = center;
		}
	}
	
	if(underWaters != null){
		for(var i = 0; i < underWaters.Length; i++){
			if(underWaters[i] == null) continue;
			DebugUtility.DrawPoint(underWaters[i].transform.position, .5, Color.red);
		}
	}
	
	#endif
}