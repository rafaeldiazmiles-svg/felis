#pragma strict

var player : GameObject;
var playerAttack : MeleeAttack;
var playerPickRB : PickUpRigidbody;
var playerInput : ControllerInput;
var playerOpenChestAnim : PlayStillAnimation;
var openChestAnimName : String = "Open Chest";
var playerTag : String = "Player";
var getTimer : Timer;
var playerFacingChest : boolean;
var chestFacingPlayer : boolean;
var openDist : float = 1.0;

@Space(30)
var chestOpenAnim : TriggerAnimation;
var dropItem : ToggleBoolean;
var dropItemDelay : float;
var itemDropped : boolean;

var topColDisable : Collider;

var dropPotion : boolean;
var dropKey : boolean;
var dropJarLid : boolean;
var dropFood : boolean;
var potionType : PotionType;
var potionPrefab : GameObject;
var spawnRelativePos : Vector3;

var keyPrefab : GameObject;
var jarLidPrefab : GameObject;
var specialItemPrefab : GameObject;
var foodPrefab : GameObject;

var shootContentSpeed : Vector3;

var baloonExcl : GameObject;

@Space(30)
var send_ItemObj_Msg : String; //Sends message to object with item dropped as parameter
var msg_Tgt : GameObject; //message target

function Start () {
	chestOpenAnim = GetComponentInChildren.<TriggerAnimation>();

	baloonExcl = Resources.Load("Prefabs/GUI/Baloons/For Player/Exclamation Mark Baloon", GameObject);
}

function GetPlayer(){
	player = GameObject.FindWithTag(playerTag);
	if(player != null){
		playerInput = player.GetComponentInChildren.<ControllerInput>();
		playerOpenChestAnim = player.transform.Find(openChestAnimName).GetComponent.<PlayStillAnimation>();
		playerAttack = player.GetComponentInChildren.<MeleeAttack>();
		playerPickRB = player.GetComponentInChildren.<PickUpRigidbody>();
	}
}

function GiveFireballPotion(){
	potionType = PotionType.Fireball;
	dropPotion = true;
}

function GiveWingsPotion(){
	potionType = PotionType.Wings;
	dropPotion = true;
}

function GiveHealthPotion(){
	potionType = PotionType.HealthPotion;
	dropPotion = true;
}


function GiveKey(){
	dropPotion = false;
	dropKey = true;
}

function GiveJarLid(){
	dropPotion = false;
	dropJarLid = true;
}

function GiveFood(){
	dropPotion = false;
	dropFood = true;
}

function DropItem(){
	topColDisable.enabled = false;

	var rb : Rigidbody;

	if(dropPotion){
		var newPotion : GameObject = GameObject.Instantiate(potionPrefab);
		newPotion.transform.position = transform.position + spawnRelativePos;
		
		rb = newPotion.GetComponentInChildren.<Rigidbody>();
		rb.velocity = shootContentSpeed;
		rb.velocity.x *= transform.localScale.x;
		
		var potionScript : Potion = newPotion.GetComponent.<Potion>();
		//potionScript.SetType(potionType);
		potionScript.potionType = potionType;	

		SendMsg(newPotion);
	}
	if(dropKey){
		var newKey : GameObject = GameObject.Instantiate(keyPrefab);
		newKey.transform.position = transform.position + spawnRelativePos;	

		rb = newKey.GetComponentInChildren.<Rigidbody>();
		rb.velocity = shootContentSpeed;
		rb.velocity.x *= transform.localScale.x;

		var newBaloon : GameObject = GameObject.Instantiate(baloonExcl);
		newBaloon.transform.position = transform.position;

		SendMsg(newKey);
	}
	if(dropFood){
		var newFood : GameObject = GameObject.Instantiate(foodPrefab);
		newFood.transform.position = transform.position + spawnRelativePos;	

		rb = newFood.GetComponentInChildren.<Rigidbody>();
		rb.velocity = shootContentSpeed;
		rb.velocity.x *= transform.localScale.x;

		SendMsg(newFood);
	}
	if(dropJarLid){
		var jarLid : GameObject = GameObject.Instantiate(jarLidPrefab);
		jarLid.transform.position = transform.position + spawnRelativePos;	

		rb = jarLid.GetComponentInChildren.<Rigidbody>();
		rb.velocity = shootContentSpeed;
		rb.velocity.x *= transform.localScale.x;

		var specialItem : GameObject = GameObject.Instantiate(specialItemPrefab);
		specialItem.transform.position = transform.position + spawnRelativePos;

		newBaloon = GameObject.Instantiate(baloonExcl);
		newBaloon.transform.position = transform.position;

		SendMsg(jarLid);
	}
}

function SendMsg(droppedItem : GameObject){
	if(msg_Tgt != null){
		msg_Tgt.SendMessage(send_ItemObj_Msg, droppedItem);
	}
}

function Update () {
	dropItem.Update();
	if(!itemDropped){
		if(dropItem.current && Time.time > dropItem.toggledTrueTime + dropItemDelay){
			//DropItem();
			chestOpenAnim.Play();
			itemDropped = true;
		}
	}

	getTimer.Update();
	if(getTimer.current){
		if(player == null){
			GetPlayer();
		}
	}


}

function FixedUpdate(){
	if(player != null && playerInput != null && playerInput.inputButtonA.down && !dropItem.current){
		playerAttack.FindNearestEnemyInFront();

		if(!playerAttack.importantEnemy){
			var picking : boolean;
			picking = playerPickRB.PickUpCheck();
			if(playerPickRB.isPickingUp){
				picking = true;
			}

			if(!picking){
				playerFacingChest = Mathf.Sign(player.transform.localScale.x) == Mathf.Sign(player.transform.position.x - transform.position.x);
				chestFacingPlayer = Mathf.Sign(transform.localScale.x) == Mathf.Sign(player.transform.position.x - transform.position.x); //Chest side is inverted (faces left when x scale is positive & vice versa)

				var dist : float = Vector3.Distance(player.transform.position, transform.position);

				if(playerFacingChest && chestFacingPlayer && dist < openDist){
					playerOpenChestAnim.animationPlay.current = true;
					dropItem.current = true;
				}
			}
		}
	}	
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(dropPotion){
		var potionColor : Color;
		if(potionType == PotionType.Wings){
			potionColor = Color.blue;
		}
		if(potionType == PotionType.Fireball){
			potionColor = Color.red;
		}
		
		var potionPos : Vector3 = transform.position + spawnRelativePos;
		DebugUtility.DrawPoint(potionPos, .3, potionColor);
		Handles.Label(potionPos, "Potion Spawn Position");
	}
	if(dropKey){
		var keyPos : Vector3 = transform.position + spawnRelativePos;
		DebugUtility.DrawPoint(keyPos, .3, potionColor);
		Handles.Label(keyPos, "Key Spawn Position");		
	}
	if(dropFood){
		var foodPos : Vector3 = transform.position + spawnRelativePos;
		DebugUtility.DrawPoint(foodPos, .3, potionColor);
		Handles.Label(foodPos, "Food Spawn Position");		
	}
	#endif
}