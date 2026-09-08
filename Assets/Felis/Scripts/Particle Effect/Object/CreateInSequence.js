#pragma strict

var prefabList : PrefabTimedCreation[];

var startTime : float;

var createNow : ToggleBoolean;

class PrefabTimedCreation{
	var prefab : Transform;
	var createTimePosition : PrefabCreationTimePosition[];
	var randomizePosition : float;
}

class PrefabCreationTimePosition{
	var created : boolean;
	var createInLocalPosition : Vector3;
	var timeTrigger : float;
	var rotation : Vector3;
	var scale : Vector3;
}

function Start () {

}

function Update () {
	createNow.Update();

	if(createNow.toggledTrue){
		startTime = Time.time;	
	}

	for(var i = 0; i < prefabList.Length; i++){
		for(var n = 0; n < prefabList[i].createTimePosition.Length; n++){
			if(createNow.toggledFalse){
				prefabList[i].createTimePosition[n].created = false;
			}

			if(createNow.current){
				if(!prefabList[i].createTimePosition[n].created){
					if(Time.time > startTime + prefabList[i].createTimePosition[n].timeTrigger){	
						//Instantiate in position.
						var newPrefab : Transform = Instantiate(prefabList[i].prefab, 
						transform.TransformPoint(prefabList[i].createTimePosition[n].createInLocalPosition) 
						+ Random.insideUnitSphere * prefabList[i].randomizePosition, Quaternion.Euler(prefabList[i].createTimePosition[n].rotation));

						newPrefab.localScale = Vector3.Scale(newPrefab.localScale, prefabList[i].createTimePosition[n].scale);

						//Set as created so it won't create it again.
						prefabList[i].createTimePosition[n].created = true;
					}
			}
			}
		}
	}
	

}


function OnDrawGizmosSelected(){
	#if UNITY_EDITOR

	if(prefabList != null){
		for(var i = 0; i < prefabList.Length; i++){
			for(var n = 0; n < prefabList[i].createTimePosition.Length; n++){
				if(prefabList[i].createTimePosition[n] != null){
					var pos : Vector3 = transform.TransformPoint(prefabList[i].createTimePosition[n].createInLocalPosition);
					DebugUtility.DrawPoint(pos, .4);
					if(prefabList[i].randomizePosition > 0){
						DebugUtility.DrawCircle(pos, prefabList[i].randomizePosition, Vector3.forward, Color.white, 16);
					}

					Handles.Label(pos, prefabList[i].createTimePosition[n].timeTrigger.ToString());
				}				
			}
		}
	}

	#endif
}