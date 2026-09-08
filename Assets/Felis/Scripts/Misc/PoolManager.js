#pragma strict

var poolObjs : PoolObj[];

function Start () {
	for(var i = 0; i < poolObjs.Length; i++){
		if(!poolObjs[i].skipPreLoad){
			poolObjs[i].Load();
		}

	}
}

function Update () {

}

class PoolObj{
	@Header("---------------------Input-------------------")
	var type : ObjType;
	var skipPreLoad : boolean;
	var amount : int;
	var prefab : GameObject;
	@Header("---------------------Values-------------------")
	var instances : GameObject[];
	var currentID : int;
	var loaded : boolean;
	
	function Load(){
		var instancesArray : Array = new Array();
		for(var n = 0; n < amount; n++){
			var newInstance : GameObject = GameObject.Instantiate(prefab);
			newInstance.SetActive(false);
			instancesArray.Push(newInstance);
		}
		instances = instancesArray.ToBuiltin(GameObject) as GameObject[];		
	
		loaded = true;
	}
}

enum ObjType{Smoke, PunchEffect, SweatDrop, GreenBubble, 
PuffDestroy, ExplostionSmoke, Fireburst, FW_Flash, FW_Pieces, 
FW_Sparks, HoneySlash, Impact, ImpactDouble, PuffPurple, PuffBlack, WaterSplash
,PhysicsObj, PhysicsObj_Heavy}

function Create(type : ObjType) : GameObject{
	for(var i = 0; i < poolObjs.Length; i++){
		if(type == poolObjs[i].type){
			if(!poolObjs[i].loaded){
				poolObjs[i].Load();
				Debug.Log(type.ToString() + " loaded in runtime.");
			}
			
			poolObjs[i].instances[poolObjs[i].currentID].SetActive(true);
			poolObjs[i].instances[poolObjs[i].currentID].BroadcastMessage("Reset");
			var returnID : int = poolObjs[i].currentID;
			poolObjs[i].currentID ++;
			if(poolObjs[i].currentID >= poolObjs[i].instances.Length){ 
				poolObjs[i].currentID = 0;
			}
			return poolObjs[i].instances[returnID];
		}
	}
	return null;
}

function Create(type : ObjType, pos : Vector3, rot : Quaternion) : GameObject{
	var obj : GameObject = Create(type);
	obj.transform.position = pos;
	obj.transform.rotation = rot;
	return obj;
}