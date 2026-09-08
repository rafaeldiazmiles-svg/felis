#pragma strict

var pBounds : PrefabBounds;

function Start () {
}


function LateUpdate () {
	//var spawnManager : LoadPrefabByBounds = GameObject.FindObjectOfType.<LoadPrefabByBounds>();
	var spawnManager : LoadPrefabByBounds = transform.parent.GetComponent.<LoadPrefabByBounds>();
	if(spawnManager != null){
		var pBoundsList : Array = new Array();
		for(var i = 0; i < spawnManager.prefabBoundsList.Length; i++){
			pBoundsList.Push(spawnManager.prefabBoundsList[i]);
		}
		if(pBounds.useThisAsTransformPos){
			pBounds.useTransformPosition = transform;
		}
		pBoundsList.Push(pBounds);
		spawnManager.prefabBoundsList = pBoundsList.ToBuiltin(PrefabBounds) as PrefabBounds[];
	}
	Destroy(this);	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(pBounds != null && pBounds.debug){
		if(pBounds.useThisAsTransformPos){
			pBounds.useTransformPosition = transform;
		}
				
		var center : Vector3;
		if(pBounds.loadBounds != null){
			for(var n = 0; n < pBounds.loadBounds.Length; n++){
				center = pBounds.loadBounds[n].center;
				if(pBounds.useTransformAsBoundsCenter && pBounds.useTransformPosition != null){
					pBounds.loadBounds[n].center += pBounds.useTransformPosition.position;
				}
				Gizmos.color = Color.green;
				Gizmos.DrawWireCube(pBounds.loadBounds[n].center, pBounds.loadBounds[n].size);
				pBounds.loadBounds[n].center = center;
			}
		}
		
		if(pBounds.destroyIfOutside != null){
			for(n = 0; n < pBounds.destroyIfOutside.Length; n++){
				center = pBounds.destroyIfOutside[n].center;
				if(pBounds.useTransformAsBoundsCenter && pBounds.useTransformPosition != null){
					pBounds.destroyIfOutside[n].center += pBounds.useTransformPosition.position;
				}
				Gizmos.color = Color.red;
				Gizmos.DrawWireCube(pBounds.destroyIfOutside[n].center, pBounds.destroyIfOutside[n].size);
				pBounds.destroyIfOutside[n].center = center;
			}
		}
	}
	#endif
}