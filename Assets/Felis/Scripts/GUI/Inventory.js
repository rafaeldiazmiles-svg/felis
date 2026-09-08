#pragma strict

var playerPickUp : PickUpRigidbody;
var input : ControllerInput;
var playerTag : String = "Player";
var getTimer : Timer;

@Space(30)
var showAnim : TriggerAnimation;
var hideAnim : TriggerAnimation;

var show : ToggleBoolean;
var disableDuration : float = 1.0;

var pause : Pause;

var switchInv : boolean;
@Space(30)
var currentSlot : int; //0 left, 1 center, 2 right
@Space(20)
var inventoryFrame : UVFrameGroups;
@Space(20)
var hand : Transform;
var slots : Transform[];

var hand_XPos : FloatSmoothDamp;
var slotXOffset : float = .7;
var blurSpeed : float;

var lockInputAxis : boolean;
var lockInputAxis_FixedUpdate : boolean;

var handSounds : PlayRandomSound;

var handSquash : Squash;
var handSquashSpring : FloatSpring;
var squashMultiplier : float = 1.0;

@Space(20)
var handItem : Inv_ItemType;
var slotItem : Inv_ItemType[];
var hasInvItem : boolean;

@Space(20)
var insideInventory_AddRenderQueue : int = 5;
@Space(10)
var invPrefab_HealthPotion : GameObject;
var invPrefab_Poison : GameObject;
var invPrefab_Fireball_Potion : GameObject;
var invPrefab_MothWings_Potion : GameObject;
var invPrefab_Apple : GameObject;
var invPrefab_Key : GameObject;
var invPrefab_Griffin_Key : GameObject;
var invPrefab_EvilJarLid : GameObject;
var invPrefab_Sword : GameObject;
var invPrefab_Bow : GameObject;
var invPrefab_Bomb : GameObject;
@Space(20)
//var gamePlay_HealthPotion : GameObject;
//var gamePlay_Poison : GameObject;
var gamePlay_Potion : GameObject;
//var gamePlay_MothWings_Potion : GameObject;
var gamePlay_Apple : GameObject;
var gamePlay_Key : GameObject;
var gamePlay_Griffin_Key : GameObject;
var gamePlay_EvilJarLid : GameObject;
var gamePlay_Sword : GameObject;
var gamePlay_Bow : GameObject;
var gamePlay_Bomb : GameObject;
@Space(20)
var handItemInstance : Inventory_ItemInstance;
var slotItemInstance : Inventory_ItemInstance[];
var clearItemInstances : ToggleBoolean;
var clearItemInstancesDelay : float = .5;
@Space(20)
var swapAudio : AudioSource;
@Space(20)
var angleTilt_Damp : float = 30.0;
var angleTilt_Spring : float = 20.0;
var angleTilt_Mul : float = 1.0;
@Space(20)
var swapNow : boolean;
var touchEnableDelay : float = 0.6;
@Space(30)
var disableObjs : GameObject[];
var disableDelay : float = 2.0;
var disableByPlatform : DisableByPlatform;
@Space(30)
var gameplayInv : Transform;
var gpSlot_LocalPos : Vector3[];
var gpSlot_ItemInstance : GameObject[];
var gpItem_ScaleMultiply : float = .25;


function SetObjsActive(setActive : boolean){
	//yield WaitForEndOfFrame();
	yield;

	for(var i = 0; i < disableObjs.Length; i++){
		if(setActive && disableByPlatform != null){
			if(disableByPlatform.IsObjectDisabled(disableObjs[i])){
				continue;
			}
		}

		disableObjs[i].SetActive(setActive);
	}
}


class Inventory_ItemInstance{
	var obj : GameObject;
	var pos : Vector3SmoothDamp;
	var tgt : Transform;

	@Space(30)

	var defRot : Quaternion;;
	var angleTilt : FloatSpring;

	function Update(){
		if(tgt != null){
			pos.target = tgt.position;
		}

		if(pos.time == 0.0){
			pos.time = .05;
		}
		pos.SmoothDamp();

		if(obj != null){
			obj.transform.position = pos.current;
		}
	}
}

function SetGPItemInstance(){
	for(var i = 0; i < gpSlot_ItemInstance.Length; i++){
		if(gpSlot_ItemInstance[i] != null){
			Destroy(gpSlot_ItemInstance[i]);
		}
		var gpItem : GameObject;
		switch (slotItem[i]){
			case Inv_ItemType.Health_Potion:
				if(invPrefab_HealthPotion != null){
					gpItem = GameObject.Instantiate(invPrefab_HealthPotion);

				}
				break;
			case Inv_ItemType.Poison:
				if(invPrefab_Poison != null){
					gpItem = GameObject.Instantiate(invPrefab_Poison);

				}
				break;
			case Inv_ItemType.Fireball_Potion:
				if(invPrefab_Fireball_Potion != null){
					gpItem = GameObject.Instantiate(invPrefab_Fireball_Potion);

				}
				break;
			case Inv_ItemType.MothWings_Potion:
				if(invPrefab_MothWings_Potion != null){
					gpItem = GameObject.Instantiate(invPrefab_MothWings_Potion);

				}
				break;
			case Inv_ItemType.Apple:
				if(invPrefab_Apple != null){
					gpItem = GameObject.Instantiate(invPrefab_Apple);

				}
				break;
			case Inv_ItemType.Key:
				if(invPrefab_Key != null){
					gpItem = GameObject.Instantiate(invPrefab_Key);

				}
				break;
			case Inv_ItemType.Griffin_Key:
				if(invPrefab_Griffin_Key != null){
					gpItem = GameObject.Instantiate(invPrefab_Griffin_Key);

				}
				break;
			case Inv_ItemType.EvilJarLid:
				if(invPrefab_EvilJarLid != null){
					gpItem = GameObject.Instantiate(invPrefab_EvilJarLid);

				}
				break;
			case Inv_ItemType.Sword:
				if(invPrefab_Sword != null){
					gpItem = GameObject.Instantiate(invPrefab_Sword);

				}
				break;
			case Inv_ItemType.Bow:
				if(invPrefab_Bow != null){
					gpItem = GameObject.Instantiate(invPrefab_Bow);

				}
				break;
			case Inv_ItemType.Bomb:
				if(invPrefab_Bomb != null){
					gpItem = GameObject.Instantiate(invPrefab_Bomb);

				}
				break;
		}

		if(gpItem != null){
			gpItem.transform.parent = gameplayInv;
			gpItem.transform.localPosition = gpSlot_LocalPos[i];
			gpItem.transform.localScale *= gpItem_ScaleMultiply;
		}

		gpSlot_ItemInstance[i] = gpItem;

	}
}


enum Inv_ItemType {Empty = 0, Health_Potion = 1, Poison = 2, Fireball_Potion = 3, MothWings_Potion = 4, Apple = 5, Key = 6, Griffin_Key = 7, EvilJarLid = 8, Sword = 9, Bow = 10, Bomb = 11}

function SetHandItemOnPlayer(){
	var obj_GamePlay : GameObject;

	if(handItem != Inv_ItemType.Empty && !hasInvItem && playerPickUp.isPickingUp){
		//When taking from inventory, if player was already picking up a non inventory item, drop it before putting inventory item on player player.
		playerPickUp.pickedObject.Slip();
	}

	if(hasInvItem){
		//Hand has nothing on exiting inventory. If player had an inventory item, it's inside inventory now, so remove it from player character.
		playerPickUp.pickedObject.character.gameObject.SetActive(false); 
		Destroy(playerPickUp.pickedObject.character.gameObject);
		playerPickUp.Drop();
	}

	var gamePlay_Item : GameObject;
	switch(handItem){
		case Inv_ItemType.Empty:

			break;
		case Inv_ItemType.Health_Potion:
			if(gamePlay_Potion != null){
				gamePlay_Item = GameObject.Instantiate(gamePlay_Potion);
				gamePlay_Item.transform.position = playerPickUp.character.position;
				gamePlay_Item.GetComponent.<Potion>().potionType = PotionType.HealthPotion;
				playerPickUp.Pick(gamePlay_Item.GetComponentInChildren.<PickableRigidbody>());
				hasInvItem = true;
			}
			break;
		case Inv_ItemType.Poison:

			break;
		case Inv_ItemType.Fireball_Potion:
			if(gamePlay_Potion != null){
				gamePlay_Item = GameObject.Instantiate(gamePlay_Potion);
				gamePlay_Item.transform.position = playerPickUp.character.position;
				gamePlay_Item.GetComponent.<Potion>().potionType = PotionType.Fireball;
				playerPickUp.Pick(gamePlay_Item.GetComponentInChildren.<PickableRigidbody>());
				hasInvItem = true;
			}
			break;
		case Inv_ItemType.MothWings_Potion:
			if(gamePlay_Potion != null){
				gamePlay_Item = GameObject.Instantiate(gamePlay_Potion);
				gamePlay_Item.transform.position = playerPickUp.character.position;
				gamePlay_Item.GetComponent.<Potion>().potionType = PotionType.Wings;
				playerPickUp.Pick(gamePlay_Item.GetComponentInChildren.<PickableRigidbody>());
				hasInvItem = true;
			}
			break;
		case Inv_ItemType.Apple:

			break;
		case Inv_ItemType.Key:
			if(gamePlay_Key != null){
				gamePlay_Item = GameObject.Instantiate(gamePlay_Key);
				var keyAudio : AudioSource[] = gamePlay_Item.GetComponentsInChildren.<AudioSource>();
				for(var i = 0; i < keyAudio.Length; i++){
					keyAudio[i].playOnAwake = false;
					keyAudio[i].Stop();
				}
				gamePlay_Item.transform.position = playerPickUp.character.position;
				playerPickUp.Pick(gamePlay_Item.GetComponentInChildren.<PickableRigidbody>());
				hasInvItem = true;
			}
			break;
		case Inv_ItemType.Griffin_Key:
			if(gamePlay_Griffin_Key != null){
				gamePlay_Item = GameObject.Instantiate(gamePlay_Griffin_Key);
				gamePlay_Item.transform.position = playerPickUp.character.position;
				playerPickUp.Pick(gamePlay_Item.GetComponentInChildren.<PickableRigidbody>());
				hasInvItem = true;
			}

			break;
		case Inv_ItemType.EvilJarLid:
			if(gamePlay_EvilJarLid != null){
				gamePlay_Item = GameObject.Instantiate(gamePlay_EvilJarLid);
				gamePlay_Item.transform.position = playerPickUp.character.position;
				playerPickUp.Pick(gamePlay_Item.GetComponentInChildren.<PickableRigidbody>());
				hasInvItem = true;
			}

			break;
		case Inv_ItemType.Sword:

			break;
		case Inv_ItemType.Bow:

			break;
		case Inv_ItemType.Bomb:
			if(gamePlay_Bomb != null){
				gamePlay_Item = GameObject.Instantiate(gamePlay_Bomb);
				gamePlay_Item.transform.position = playerPickUp.character.position;
				playerPickUp.Pick(gamePlay_Item.GetComponentInChildren.<PickableRigidbody>());
				hasInvItem = true;
			}
			break;
	}


}


function GetInput(){
	var playerObj : GameObject = GameObject.FindWithTag(playerTag);
	if(playerObj != null){
		input = playerObj.GetComponentInChildren.<ControllerInput>();
		playerPickUp = playerObj.GetComponentInChildren.<PickUpRigidbody>();
	}
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = .5;
	}

	pause = GameObject.FindObjectOfType.<Pause>();

	SetObjsActive(false);
	//slotItem = new Inv_ItemType[3];

}

function GetItemPrefab(itemType : Inv_ItemType) : GameObject{
	switch (itemType){
		case Inv_ItemType.Health_Potion:
			return invPrefab_HealthPotion;
		break;
		case Inv_ItemType.Poison:
			return invPrefab_Poison;
		break;
		case Inv_ItemType.Fireball_Potion:
			return invPrefab_Fireball_Potion;
			break;
		case Inv_ItemType.MothWings_Potion:
			return invPrefab_MothWings_Potion;
			break;
		case Inv_ItemType.Apple:
			return invPrefab_Apple;
		break;
		case Inv_ItemType.Key:
			return invPrefab_Key;
			break;
		case Inv_ItemType.Griffin_Key:
			return invPrefab_Griffin_Key;
			break;
		case Inv_ItemType.EvilJarLid:
			return invPrefab_EvilJarLid;
			break;
		case Inv_ItemType.Sword:
			return invPrefab_Sword;
			break;
		case Inv_ItemType.Bow:
			return invPrefab_Bow;
			break;
		case Inv_ItemType.Bomb:
			return invPrefab_Bomb;
			break;
	}	
	return null;
}

function FixedUpdate(){
	if(show.current){
		//Swap
		if(input.inputButtonA.down || input.inputButtonB.down 
		|| !lockInputAxis_FixedUpdate && (input.inputAxis.current.y > .5 || input.inputAxis.current.y < -.5) 
		|| swapNow){

			lockInputAxis_FixedUpdate = true;
			var handItem_Swap : Inv_ItemType = handItem;
			handItem = slotItem[currentSlot];
			slotItem[currentSlot] = handItem_Swap;

			var handItemObj_Swap : GameObject = handItemInstance.obj;
			var handItemPos_Swap: Vector3 = handItemInstance.pos.current;
			var handItemAngleTiltCurrent_Swap : float = handItemInstance.angleTilt.current;
			var handItemAngleTiltTarget_Swap : float = handItemInstance.angleTilt.target;

			handItemInstance.obj = slotItemInstance[currentSlot].obj;
			handItemInstance.pos.current = slotItemInstance[currentSlot].pos.current;
			handItemInstance.angleTilt.current = slotItemInstance[currentSlot].angleTilt.current;
			handItemInstance.angleTilt.target = slotItemInstance[currentSlot].angleTilt.target;

			slotItemInstance[currentSlot].obj = handItemObj_Swap;
			slotItemInstance[currentSlot].pos.current = handItemPos_Swap;
			slotItemInstance[currentSlot].angleTilt.current = handItemAngleTiltCurrent_Swap;
			slotItemInstance[currentSlot].angleTilt.target = handItemAngleTiltTarget_Swap;

			if(!(handItem == Inv_ItemType.Empty && slotItem[currentSlot] == Inv_ItemType.Empty)){
				swapAudio.Play();
			}

			swapNow = false;
		}		
	}

	if(input != null && Mathf.Abs(input.inputAxis.current.y) < .1){
		lockInputAxis_FixedUpdate = false;
	}

	if(input != null && Time.time > show.toggledTime + disableDuration && input.selectButton.down){
		if(pause != null){
			if(!pause.stop){
				switchInv = true;
			}
			else{
				if(show.current){
					switchInv = true;
				}
			}
		}

	}


}



function LateUpdate(){
	hand_XPos.target = -currentSlot * slotXOffset + slotXOffset;
	hand_XPos.SmoothDamp();
	if(hand != null){
		hand.localPosition.x = hand_XPos.current;
	}
}

function Update () {
	if(switchInv){
		switchInv = false;

		if(!show.current){
			showAnim.play = true;
			show.current = true;

			pause.StopGame();

			show.toggledTrueTime = Time.time;
		}
		else{
			hideAnim.play = true;
			show.current = false;

			pause.UnStopGame();

			show.toggledFalseTime = Time.time;
		}
		show.toggledTime = Time.time;
	}
	show.Update();

	if(!show.current && Time.time > show.toggledFalseTime + disableDelay){
		SetObjsActive(false);
	}

	var invItem : InventoryItem;

	if(playerPickUp != null){
		if(playerPickUp.pickedObject == null){
			hasInvItem = false;
		}
		else{
			if(playerPickUp.justPickedUp && playerPickUp.pickedObject.transform.parent != null){
				invItem =  playerPickUp.pickedObject.transform.parent.GetComponent.<InventoryItem>();
				if(invItem != null){
					hasInvItem = true;
				}
			}
		}
	}


	getTimer.Update();
	if(getTimer.current){
		GetInput();
	}

	handItemInstance.Update();
	handItemInstance.angleTilt.damp = angleTilt_Damp;
	handItemInstance.angleTilt.springForce = angleTilt_Spring;
	handItemInstance.angleTilt.target = handItemInstance.pos.velocity.x;
	handItemInstance.angleTilt.Spring();
	if(handItemInstance.obj != null){
		handItemInstance.obj.transform.rotation = handItemInstance.defRot;
		handItemInstance.obj.transform.RotateAround(handItemInstance.obj.transform.position, Vector3.forward,  handItemInstance.angleTilt.current * angleTilt_Mul);
	}

	for(var i = 0; i < slotItemInstance.Length; i++){
		slotItemInstance[i].Update();
		slotItemInstance[i].angleTilt.damp = angleTilt_Damp;
		slotItemInstance[i].angleTilt.springForce = angleTilt_Spring;
		slotItemInstance[i].angleTilt.target = slotItemInstance[i].pos.velocity.x;
		slotItemInstance[i].angleTilt.Spring();
		if(slotItemInstance[i].obj != null){
			slotItemInstance[i].obj.transform.rotation = slotItemInstance[i].defRot;
			slotItemInstance[i].obj.transform.RotateAround(slotItemInstance[i].obj.transform.position, Vector3.forward,  slotItemInstance[i].angleTilt.current * angleTilt_Mul);
		} 
	}

	clearItemInstances.current = false;




	//Hand
	if(show.toggledTrue){
		SetObjsActive(true);

		if(playerPickUp != null){
			if(playerPickUp.pickedObject != null){
				if(playerPickUp.pickedObject.transform.parent != null){
					invItem =  playerPickUp.pickedObject.transform.parent.GetComponent.<InventoryItem>();
					if(invItem == null){
						handItem = Inv_ItemType.Empty;
						hasInvItem = false;
					}
					else{
						hasInvItem = true;
						handItem = invItem.itemType;
					}
				}
			}
			else{
				hasInvItem = false;
				handItem = Inv_ItemType.Empty;
			}
		}

		var renderQueue : RenderQueue[];
		var handPrefab : GameObject = GetItemPrefab(handItem);
		if(handPrefab != null){
			handItemInstance.obj = GameObject.Instantiate(handPrefab);
			handItemInstance.obj.transform.position = hand.position;

			renderQueue = handItemInstance.obj.GetComponentsInChildren.<RenderQueue>();
			for(var n = 0; n < renderQueue.Length; n++){
				renderQueue[n].queue += insideInventory_AddRenderQueue;
			}
		}
		handItemInstance.pos.current = hand.position;
		handItemInstance.pos.target = hand.position;
		handItemInstance.tgt = hand;



		for(i = 0; i < slotItemInstance.Length; i++){
			var slotItemPrefab : GameObject = GetItemPrefab(slotItem[i]);
			if(slotItemPrefab != null){
				slotItemInstance[i].obj = GameObject.Instantiate(slotItemPrefab);
				slotItemInstance[i].obj.transform.position = slots[i].position;

				renderQueue = slotItemInstance[i].obj.GetComponentsInChildren.<RenderQueue>();
				for(n = 0; n < renderQueue.Length; n++){
					renderQueue[n].queue += insideInventory_AddRenderQueue;
				}
			}
			slotItemInstance[i].pos.current = slots[i].position;
			slotItemInstance[i].pos.target = slots[i].position;
			slotItemInstance[i].tgt = slots[i];
		}
	}

	if(show.current){

		if(Mathf.Abs(hand_XPos.velocity) > blurSpeed){
			inventoryFrame.SetFrame(0,1);
		}
		else{
			inventoryFrame.SetFrame(0,0);
		}
		
		if(input != null && !lockInputAxis){
			if(input.inputAxis.current.x < -.5){
				if(currentSlot > 0){
					currentSlot --;
					handSounds.Play();
				}
				lockInputAxis = true;
			}

			if(input.inputAxis.current.x > .5){
				if(currentSlot < 2){
					currentSlot ++;
					handSounds.Play();
				}
				lockInputAxis = true;
			}
		}
		else{
			if(Mathf.Abs(input.inputAxis.current.x) < .1){
				lockInputAxis = false;
			}
		}


		handSquashSpring.target = Mathf.Abs(hand_XPos.velocity);
		handSquashSpring.Spring();
		handSquash.squashAmount = handSquashSpring.current * squashMultiplier;
	
	}

	if(show.toggledFalse){
		SetHandItemOnPlayer();
		SetGPItemInstance();
	}

	if(!show.current && Time.time > show.toggledFalseTime + clearItemInstancesDelay){
		clearItemInstances.current = true;
	}
	

	clearItemInstances.Update();

	if(clearItemInstances.toggledTrue){
		if(handItemInstance.obj != null){
			Destroy(handItemInstance.obj);
		}
		for(i = 0; i < slotItemInstance.Length; i++){
			if(slotItemInstance[i].obj != null){
				Destroy(slotItemInstance[i].obj);
			}
		}			
	}

}

//Touch

function TouchLeft(){
	if(show.current && Time.time > show.toggledTrueTime + touchEnableDelay){
		if(currentSlot == 0){
			swapNow = true;
		}
		else{
			handSounds.Play();
			currentSlot = 0;
		}
	}
}

function TouchCenter(){
	if(show.current && Time.time > show.toggledTrueTime + touchEnableDelay){
		if(currentSlot == 1){
			swapNow = true;
		}
		else{
			currentSlot = 1;
			handSounds.Play();
		}
	}
}

function TouchRight(){
	if(show.current && Time.time > show.toggledTrueTime + touchEnableDelay){	
		if(currentSlot == 2){
			swapNow = true;
		}
		else{
			currentSlot = 2;
			handSounds.Play();
		}
	}
}