#pragma strict

var pause : Pause;
@Space(30)
var chestObj : GameObject;
var chest : Chest;
@Space(10)
var key : GameObject;
var keyRB : Rigidbody;
var keyPickableRB : PickableRigidbody;
@Space(30)
var baloon_Inventory_Prefab : GameObject;
var baloon_Inventory : GameObject;

function Start () {
	pause = GameObject.FindObjectOfType.<Pause>();
}

function Update () {

	//Inventory
	if(!pause.stop && baloon_Inventory == null && keyRB != null && keyPickableRB.beingPicked.current){
		baloon_Inventory = GameObject.Instantiate(baloon_Inventory_Prefab);
	}

	var tAnim : TriggerAnimation; 

	if((key == null || !keyPickableRB.beingPicked.current) && baloon_Inventory != null){
		tAnim  = baloon_Inventory.GetComponentInChildren.<TriggerAnimation>();
		tAnim.timer_NextPlayDeletesObject = baloon_Inventory;			
	}

}

function GetKey(newKey : GameObject){
	key = newKey;
	keyRB = key.GetComponent.<Rigidbody>();
	keyPickableRB = key.GetComponentInChildren.<PickableRigidbody>();
}

function GetChest(newChest : GameObject){
	chestObj = newChest;
	chest = newChest.GetComponent.<Chest>();
	chest.send_ItemObj_Msg = "GetKey";
	chest.msg_Tgt = gameObject;
}