#pragma strict

var dropPrefab : GameObject;
var prefabDropped : boolean;
@Space(30)
var startVel : Vector3 = Vector3(0,4,0);
@Space(30)
var potionPrefab : GameObject;
var applePrefab : GameObject;
var honeyPanelPrefab : GameObject;
var meatyBonePrefab : GameObject;
@Space(30)
var isPotion : boolean;
var potionType : PotionType;
@Space(30)
var onDestroy : boolean;


function Start(){
	
}


function GiveHealthPotion(){
	LoadResources();
	dropPrefab = potionPrefab;
	isPotion = true;
	potionType = PotionType.HealthPotion;
}

function GiveWingsPotion(){
	LoadResources();
	dropPrefab = potionPrefab;
	isPotion = true;
	potionType = PotionType.Wings;
}

function GiveFirePotion(){
	LoadResources();
	dropPrefab = potionPrefab;
	isPotion = true;
	potionType = PotionType.Fireball;
}

function Drop(){
	if(prefabDropped){
		return;
	}
	prefabDropped = true;
	if(dropPrefab != null){
		var newPrefab : GameObject = GameObject.Instantiate(dropPrefab);
		newPrefab.transform.position = transform.position + Vector3.one;

		var rb : Rigidbody = newPrefab.GetComponentInChildren.<Rigidbody>();
		if(rb != null){
			rb.velocity = startVel;
		}

		if(isPotion){
			newPrefab.GetComponent.<Potion>().potionType = potionType;
		}
	}
}

function LoadResources(){
	if(potionPrefab == null){
		potionPrefab = Resources.Load("Prefabs/Misc/Potion", GameObject);
	}
}

/*function OnDestroy(){
	if(Application.isPlaying && onDestroy){
		Drop();
	}
}*/

function CharacterDestroy(){
	Drop();
}