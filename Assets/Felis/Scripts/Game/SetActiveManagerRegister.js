#pragma strict
var allChildrenAsEnv : boolean;

var objList : ActiveMng_RegisterEnv[];

var movingObjList : GameObject[];

var disableOnDist : float; //if left on 0 it uses default value.

class ActiveMng_RegisterEnv{
	var obj : GameObject;
	var center : Transform;
	var disableOnDist : float;
}

function Start () {
	RegisterArray();
}

function RegisterArray(){
	yield WaitForEndOfFrame();

	if(allChildrenAsEnv){
		var allChildrenObjs : Transform[] = GetComponentsInChildren.<Transform>();
		objList = new ActiveMng_RegisterEnv[allChildrenObjs.Length];
		for(var n = 0; n < allChildrenObjs.Length; n++){
			objList[n] = new ActiveMng_RegisterEnv();
			objList[n].obj = allChildrenObjs[n].gameObject;
			objList[n].center = transform;
			objList[n].disableOnDist = disableOnDist;
		}
	}

	var actManager : SetActiveManager = GameObject.FindObjectOfType.<SetActiveManager>(); 
	if(actManager != null){
		for(var i = 0; i < objList.Length; i++){
			actManager.RegisterObj(objList[i].obj, objList[i].center, false, objList[i].disableOnDist);
		}

		for(i = 0; i < movingObjList.Length; i++){
			actManager.RegisterObj(movingObjList[i]);
		}
	}	
}

function Update () {

}