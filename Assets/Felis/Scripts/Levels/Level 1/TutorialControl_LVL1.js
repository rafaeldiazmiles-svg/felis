#pragma strict

var player : GameObject;
var playerTag : String = "Player";
var getTimer : Timer;
var startTime : float;
@Space(30)
var pause : Pause;


@Space(30)
//Wake up
var wakeUp : ProsperoWakeUp;
var baloon_WakeUp_Prefab : GameObject;
var baloon_WakeUp : GameObject;
var wakeUpHintDelay : float = 3.0;
var baloon_wakeUp_Created : boolean;
var baloon_wakeUp_Pos : Transform;

@Space(30)
//Chest open
var chestObj : GameObject;
var chest : Chest;	
var chestHintDelay : float = 1.5;
var chest_RequiredPlayerArea : Collider;
var baloon_OpenChest_Prefab : GameObject;
var baloon_OpenChest: GameObject;
var baloon_OpenChest_Pos : Transform;

@Space(30)
//drink and pick up
var baloon_Drink_Prefab : GameObject;
var baloon_Drink:  GameObject;
var potionObj : GameObject;
var potionPickableRB : PickableRigidbody;
var drinkBaloonDelay  : float = 1.0;

@Space(15)
var baloon_PickUp_Prefab : GameObject;
var baloon_PickUp:  GameObject;

@Space(30)
//Attack
var baloon_Attack_Prefab : GameObject;
var baloon_Attack :  GameObject;
var fatBat : GameObject;
var maxPlayerFromBatDist : float = 5.0;

@Space(30)
var catWaitArea : Collider;
var baloon_CatWaitPrefab : GameObject;
@Space(10)
var beforeBridgeCatsArea : Collider;
var catA_BeforeBridge : boolean;
var catB_BeforeBridge : boolean;
var catC_BeforeBridge : boolean;
@Space(10)
var baloon_CatWait_A : GameObject;
var catA : GameObject;
var baloon_CatPickableRB_A : PickableRigidbody;
@Space(10)
var baloon_CatWait_B : GameObject;
var catB : GameObject;
var baloon_CatPickableRB_B : PickableRigidbody;
@Space(10)
var baloon_CatWait_C : GameObject;
var catC : GameObject;
var baloon_CatPickableRB_C : PickableRigidbody;

@Space(30)
var chestPostion : GameObject;
var gotChestPotion : boolean;
var baloon_Inventory_Prefab : GameObject;
var baloon_Inventory : GameObject;

@Space(30)
var saveArea : Collider;
var checkPoint : CheckpointMachine;
@Space(10)
var baloon_Save_Prefab : GameObject;
var baloon_Save:  GameObject;
var baloon_Save_Pos : Transform;

@Space(30)
//Wait For Cats
var waitForCatsPos : Transform;
var waitForCatsArea : Collider;
var waitForCatsBaloonPrefab : GameObject;
var waitForCatsBaloon : GameObject;

function Start () {
	getTimer.next = Time.timeSinceLevelLoad + .05;
	startTime = Time.time;

	pause = GameObject.FindObjectOfType.<Pause>();
}

function Update () {
	var tAnim : TriggerAnimation;
	var parent : Parent;

	getTimer.Update();
	if(getTimer.current){
		if(player == null) {
			GetPlayer();
		}
		if(potionObj == null){
			var potion : Potion = GameObject.FindObjectOfType.<Potion>();
			if(potion != null){
				GetPotion(potion.gameObject);
			}	
		}
	}
	//All cats must be close by
	if(!pause.stop && waitForCatsBaloon == null && player != null && waitForCatsArea.bounds.Contains(player.transform.position)){
		waitForCatsBaloon = GameObject.Instantiate(waitForCatsBaloonPrefab);
		waitForCatsBaloon.transform.position = waitForCatsPos.position;
	}
	if(waitForCatsBaloon != null && (player == null || !waitForCatsArea.bounds.Contains(player.transform.position))){
		tAnim = waitForCatsBaloon.GetComponentInChildren.<TriggerAnimation>();
		tAnim.timer_NextPlayDeletesObject = waitForCatsBaloon;	
	}

	//Save
	if(!pause.stop && baloon_Save == null && !checkPoint.saved){
		if(player != null && saveArea.bounds.Contains(player.transform.position)){
			baloon_Save = GameObject.Instantiate(baloon_Save_Prefab);
			baloon_Save.transform.position = baloon_Save_Pos.position;
		}
	}

	if(player != null &&  baloon_Save != null && (!saveArea.bounds.Contains(player.transform.position) || checkPoint.saved)){
		tAnim  = baloon_Save.GetComponentInChildren.<TriggerAnimation>();
		tAnim.timer_NextPlayDeletesObject = baloon_Save;			
	}

	//Inventory
	if(!pause.stop && chestPostion != null && baloon_Inventory == null && potionPickableRB.beingPicked.current){
		baloon_Inventory = GameObject.Instantiate(baloon_Inventory_Prefab);
	}

	if((chestPostion == null || !potionPickableRB.beingPicked.current) && baloon_Inventory != null){
		tAnim  = baloon_Inventory.GetComponentInChildren.<TriggerAnimation>();
		tAnim.timer_NextPlayDeletesObject = baloon_Inventory;			
	}


	//Tip Cat Wait
	catA_BeforeBridge = catA != null && beforeBridgeCatsArea.bounds.Contains(catA.transform.position);
	catB_BeforeBridge = catB != null && beforeBridgeCatsArea.bounds.Contains(catB.transform.position);
	catC_BeforeBridge = catC != null && beforeBridgeCatsArea.bounds.Contains(catC.transform.position);

	//Cat A
	if(!pause.stop && catA != null && baloon_CatWait_A == null && baloon_CatPickableRB_A.beingPicked.current && catWaitArea.bounds.Contains(catA.transform.position)
	&& (catB_BeforeBridge || catC_BeforeBridge)){
		baloon_CatWait_A = GameObject.Instantiate(baloon_CatWaitPrefab);
		parent = baloon_CatWait_A.GetComponent.<Parent>();
		parent.target = catA.transform;	
	}

	if(baloon_CatWait_A != null){
		if(catA == null || !baloon_CatPickableRB_A.beingPicked.current || !catWaitArea.bounds.Contains(catA.transform.position) || (!catB_BeforeBridge && !catC_BeforeBridge) ){
			tAnim  = baloon_CatWait_A.GetComponentInChildren.<TriggerAnimation>();
			tAnim.timer_NextPlayDeletesObject = baloon_CatWait_A;			
		}
	}

	//Cat B
	if(!pause.stop && catB != null && baloon_CatWait_B == null && baloon_CatPickableRB_B.beingPicked.current && catWaitArea.bounds.Contains(catB.transform.position)
	&& (catA_BeforeBridge || catC_BeforeBridge)){
		baloon_CatWait_B = GameObject.Instantiate(baloon_CatWaitPrefab);
		parent = baloon_CatWait_B.GetComponent.<Parent>();
		parent.target = catB.transform;	
	}

	if(baloon_CatWait_B != null){
		if(catB == null || !baloon_CatPickableRB_B.beingPicked.current || !catWaitArea.bounds.Contains(catB.transform.position) || (!catA_BeforeBridge && !catC_BeforeBridge) ){
			tAnim  = baloon_CatWait_B.GetComponentInChildren.<TriggerAnimation>();
			tAnim.timer_NextPlayDeletesObject = baloon_CatWait_B;			
		}
	}

	//Cat C
	if(!pause.stop && catC != null && baloon_CatWait_C == null && baloon_CatPickableRB_C.beingPicked.current && catWaitArea.bounds.Contains(catC.transform.position)
	&& (catB_BeforeBridge || catA_BeforeBridge)){
		baloon_CatWait_C = GameObject.Instantiate(baloon_CatWaitPrefab);
		parent = baloon_CatWait_C.GetComponent.<Parent>();
		parent.target = catC.transform;	
	}

	if(baloon_CatWait_C != null){
		if(catC == null || !baloon_CatPickableRB_C.beingPicked.current || !catWaitArea.bounds.Contains(catC.transform.position) || (!catB_BeforeBridge && !catA_BeforeBridge) ){
			tAnim  = baloon_CatWait_C.GetComponentInChildren.<TriggerAnimation>();
			tAnim.timer_NextPlayDeletesObject = baloon_CatWait_C;			
		}
	}


	//Tip Attack
	var playerFromBatdist : float = Mathf.Infinity;
	if(player != null && fatBat != null){
		playerFromBatdist = Vector3.Distance(player.transform.position, fatBat.transform.position);
	}

	if(!pause.stop && fatBat != null && baloon_Attack == null && playerFromBatdist < maxPlayerFromBatDist){
		baloon_Attack = GameObject.Instantiate(baloon_Attack_Prefab);
		parent = baloon_Attack.GetComponent.<Parent>();
		parent.target = fatBat.transform;			
	}

	if( (fatBat == null || playerFromBatdist > maxPlayerFromBatDist) && baloon_Attack != null) {
		tAnim  = baloon_Attack.GetComponentInChildren.<TriggerAnimation>();
		tAnim.timer_NextPlayDeletesObject = baloon_Attack;
	}


	//Tip Wake up
	if(!pause.stop && wakeUp != null && !wakeUp.wokenUp && Time.time > startTime + wakeUpHintDelay){
		if(!baloon_wakeUp_Created){
			baloon_wakeUp_Created = true;
			baloon_WakeUp = GameObject.Instantiate(baloon_WakeUp_Prefab);
			baloon_WakeUp.transform.position = baloon_wakeUp_Pos.transform.position;
		}
	}
	if(baloon_WakeUp != null){
		if(wakeUp != null && wakeUp.wokenUp){
			tAnim = baloon_WakeUp.GetComponentInChildren.<TriggerAnimation>();
			tAnim.timer_NextPlayDeletesObject = baloon_WakeUp;
		}
	}

	//Tip Open Chest
	if(!pause.stop && wakeUp != null && wakeUp.wokenUp && baloon_OpenChest == null){ //Player woken
		if(chest != null){ //Chest found
			if(!chest.itemDropped){ //Chest open
				if(chest_RequiredPlayerArea.bounds.Contains(player.transform.position)){ //Player in house's first floor
					if(Time.time > wakeUp.wakeUpTime + chestHintDelay){
						baloon_OpenChest = GameObject.Instantiate(baloon_OpenChest_Prefab);
						baloon_OpenChest.transform.position = baloon_OpenChest_Pos.transform.position;
					}
				}
			}
		}
	}

	if(baloon_OpenChest != null){
		if(!chest_RequiredPlayerArea.bounds.Contains(player.transform.position) || chest == null || chest.itemDropped){
			tAnim = baloon_OpenChest.GetComponentInChildren.<TriggerAnimation>();
			tAnim.timer_NextPlayDeletesObject = baloon_OpenChest;
		}
	}

	//Tip Drink & Pick up
	if(!pause.stop && potionObj != null){
		//if potion is out of chest
		if(potionPickableRB.beingPicked.current){
			//if picking potion
			if(baloon_Drink == null){
				if(Time.time > potionPickableRB.beingPicked.toggledTrueTime + drinkBaloonDelay){
					baloon_Drink = GameObject.Instantiate(baloon_Drink_Prefab);
					parent = baloon_Drink.GetComponent.<Parent>();
					parent.target = potionObj.transform;
				}
			}
		}
		else{
			//if not picking potion
			if(baloon_PickUp == null){
				if(Time.time > potionPickableRB.beingPicked.toggledFalseTime + drinkBaloonDelay){
					baloon_PickUp = GameObject.Instantiate(baloon_PickUp_Prefab);
					parent = baloon_PickUp.GetComponent.<Parent>();
					parent.target = potionObj.transform;
				}
			}
		}
	}

	if(baloon_Drink != null){
		if(potionObj == null || !potionPickableRB.beingPicked.current){
			tAnim = baloon_Drink.GetComponentInChildren.<TriggerAnimation>();
			tAnim.timer_NextPlayDeletesObject = baloon_Drink;
		}
	}

	if(baloon_PickUp != null){
		if(potionObj == null || potionPickableRB.beingPicked.current){
			tAnim = baloon_PickUp.GetComponentInChildren.<TriggerAnimation>();
			tAnim.timer_NextPlayDeletesObject = baloon_PickUp;
		}		
	}

	if(pause.stop){
		if(baloon_PickUp != null){
			Destroy(baloon_PickUp);
		}

		if(baloon_Drink != null){
			Destroy(baloon_Drink);
		}

		if(baloon_OpenChest != null){
			Destroy(baloon_OpenChest);
		}

		if(baloon_WakeUp != null){
			Destroy(baloon_WakeUp);
		}

		if(baloon_Attack != null){
			Destroy(baloon_Attack);
		}

		if(baloon_CatWait_A != null){
			Destroy(baloon_CatWait_A);
		}

		if(baloon_CatWait_B != null){
			Destroy(baloon_CatWait_B);
		}

		if(baloon_CatWait_C != null){
			Destroy(baloon_CatWait_C);
		}

		if(baloon_Inventory != null){
			Destroy(baloon_Inventory);
		}

		if(baloon_Save != null){
			Destroy(baloon_Save);
		}
	}
}

function GetPlayer(){
	player = GameObject.FindWithTag(playerTag);
	if(player != null){
		wakeUp = player.GetComponentInChildren.<ProsperoWakeUp>();
	}
}

function GetChest(newChest : GameObject){
	chestObj = newChest;
	chest = newChest.GetComponent.<Chest>();
	chest.send_ItemObj_Msg = "GetPotion";
	chest.msg_Tgt = gameObject;
}

function GetPotion(newPotion : GameObject){
	potionObj = newPotion;
	potionPickableRB = potionObj.GetComponentInChildren.<PickableRigidbody>();
	if(potionPickableRB != null){
		potionPickableRB.beingPicked.current = false;
		potionPickableRB.beingPicked.toggledFalseTime = Time.time;

		if(!gotChestPotion){
			chestPostion = newPotion;
			gotChestPotion = true;
		}

	}
	else{
		potionObj = null; //if it doesn't have pickable rb, it's a inventory's GUI potion icon.
	}


}

function GetFatBat(newBat : GameObject){
	fatBat = newBat;
}

function GetCatA(newCat : GameObject){
	catA = newCat;
	baloon_CatPickableRB_A = catA.GetComponentInChildren.<PickableRigidbody>();
}

function GetCatB(newCat : GameObject){
	catB = newCat;
	baloon_CatPickableRB_B = catB.GetComponentInChildren.<PickableRigidbody>();
}

function GetCatC(newCat : GameObject){
	catC = newCat;
	baloon_CatPickableRB_C = catC.GetComponentInChildren.<PickableRigidbody>();
}