enum PotionType{Wings, Fireball, HealthPotion}

var init : boolean;
var potionType : PotionType;
var fireballPotionLiquid : Color;
var wingsPotionLiquid : Color;
var healthPotionLiquid : Color;
var wizardHatPrefab : GameObject;
var mothWingsPrefab : GameObject;
@Space(30)
var animateLiquid : boolean = true;
var frames : UVFrameGroups;
var frameCount : int = 4;
var currentFrame : int;
var holdFrame : int = 3;
@Space(30)
var liquidCustomBone : CustomBone;
var boneSet : boolean;
//var boneLocalPos : Vector3;
var boneGlobalRot : Vector3Spring;
var rb : Rigidbody;
var liquidShake : float = 1.0;
@Space(30)
var pickableRB : PickableRigidbody;
var absorbNow : boolean;
var autoAbsorb : boolean;
var absrobDelay : float = .7;
var canDrop : boolean;
var destroyPrefab : GameObject;
var destroyPrefabSize : float = 2.8;
var face : GameObject;
var puffSound : AudioSource;
var magicSound : AudioSource;
@Space(30)
var hatTopSpeed : Vector3;
@Space(30)
var pickerController : ControllerInput;
@Space(30)
var invItem : InventoryItem;
@Space(30)
var absorbEffectPrefab : GameObject;
var effectApplyBoneName : String;
@Space(30)
var potionInfoPrefab : GameObject;
var potionInfo : GameObject;
var firePotionName : String = "fire potion";
var wingsPotionName : String = "wings potion";
var healthPotionName : String = "health potion";


function PotionInfoUpdate(){
	if(pickableRB != null && pickableRB.beingPicked.toggledTrue && potionInfo == null){
		potionInfo = GameObject.Instantiate(potionInfoPrefab);
		var iconPotion : Potion = potionInfo.GetComponentInChildren.<Potion>();
		iconPotion.potionType = potionType;

		var textFMA : FontMeshArrange = potionInfo.GetComponentInChildren.<FontMeshArrange>();
		switch (potionType){
			case PotionType.Fireball:
				textFMA.text = new String[1];
				textFMA.text[0] = firePotionName;
			break;

			case PotionType.Wings:
				textFMA.text = new String[1];
				textFMA.text[0] = wingsPotionName;
			break;

			case PotionType.HealthPotion:
				textFMA.text = new String[1];
				textFMA.text[0] = healthPotionName;
			break;
		}
	}
}


function Start () {
	if(!init) Init();
	invItem = GetComponent.<InventoryItem>();
	SetType(potionType);


}

function Init(){
	init = true;
	
	pickableRB = GetComponentInChildren.<PickableRigidbody>();
	
	frames = GetComponentInChildren.<UVFrameGroups>();
	liquidCustomBone = GetComponentInChildren.<CustomBone>();
	
	if(liquidCustomBone != null){
		boneGlobalRot.target = liquidCustomBone.transform.eulerAngles;
		liquidCustomBone.SetVertexArray(frames.offsetUV.scrollGroups[0].vertices);
	}
	
	rb = GetComponent.<Rigidbody>();

}

function SetType(newPotionType){
	if(!init) Init();
	
	potionType = newPotionType;
	if(potionType == PotionType.Fireball){
		frames.SetFrame("Potion Type","Fireball");
		
		var mesh : Mesh = frames.offsetUV.GetMesh();
		var vColors : Color[] = mesh.colors;
		for(var i = 0; i < frames.offsetUV.scrollGroups[0].vertices.Length; i++){
			vColors[frames.offsetUV.scrollGroups[0].vertices[i]] = fireballPotionLiquid;
		}
		mesh.colors = vColors;
		frames.offsetUV.SetMesh(mesh);

		if(invItem != null){
			invItem.itemType = Inv_ItemType.Fireball_Potion;
		}
	}
	
	if(potionType == PotionType.Wings){
		frames.SetFrame("Potion Type","Wings");
		
		mesh = frames.offsetUV.GetMesh();
		vColors = mesh.colors;
		for(i = 0; i < frames.offsetUV.scrollGroups[0].vertices.Length; i++){
			vColors[frames.offsetUV.scrollGroups[0].vertices[i]] = wingsPotionLiquid;
		}
		mesh.colors = vColors;
		frames.offsetUV.SetMesh(mesh);

		if(invItem != null){
			invItem.itemType = Inv_ItemType.MothWings_Potion;
		}
	}

	if(potionType == PotionType.HealthPotion){
		frames.SetFrame("Potion Type","Simple");
		
		mesh = frames.offsetUV.GetMesh();
		vColors = mesh.colors;
		for(i = 0; i < frames.offsetUV.scrollGroups[0].vertices.Length; i++){
			vColors[frames.offsetUV.scrollGroups[0].vertices[i]] = healthPotionLiquid;
		}
		mesh.colors = vColors;
		frames.offsetUV.SetMesh(mesh);

		if(invItem != null){
			invItem.itemType = Inv_ItemType.Health_Potion;
		}
	}
}

function LateUpdate () {
	PotionInfoUpdate();

	if(animateLiquid){
		if(Time.frameCount % holdFrame == 0){
			currentFrame++;
			if(currentFrame >= 4){
				currentFrame = 0;
			}
			frames.SetFrame(0, currentFrame);
		}
	}

	if(liquidCustomBone != null){
		if(rb != null){
			boneGlobalRot.Spring();
			liquidCustomBone.transform.eulerAngles = boneGlobalRot.current;
			boneGlobalRot.velocity.z += rb.angularVelocity.z * liquidShake * Time.deltaTime;
			boneGlobalRot.velocity.z -= rb.velocity.x * liquidShake * Time.deltaTime;
			boneGlobalRot.velocity.z += rb.velocity.y * liquidShake * Time.deltaTime;
		}
	}

	if(pickableRB != null ){
		if(autoAbsorb && canDrop && pickableRB.beingPicked.current && Time.time > pickableRB.beingPicked.toggledTrueTime + absrobDelay || absorbNow){
			absorbNow = false;
			AbsorbPotion();
		}

		if(pickableRB.beingPicked.current){ //wait a frame
			canDrop = true;

			if(pickerController != null){
				if(pickerController.inputAxis.current.y < -.5){
					AbsorbPotion();
				}
			}
		}
		
		if(!pickableRB.beingPicked.current){
			canDrop = false;
		}

		if(pickableRB.beingPicked.current && pickerController == null && pickableRB.pickingObject != null){
			pickerController = pickableRB.pickingObject.character.GetComponentInChildren.<ControllerInput>();
		}
	}
}

function AbsorbPotion(){
	//var puff : GameObject;
	if(potionType == PotionType.Fireball){
		var newWHat : GameObject = GameObject.Instantiate(wizardHatPrefab);
		newWHat.transform.position = pickableRB.pickingObject.transform.position;
		var secAnim : SecondaryAnimation[] = newWHat.GetComponentsInChildren.<SecondaryAnimation>();
		secAnim[0].AddShakeVelocity(hatTopSpeed * .2);
		secAnim[1].AddShakeVelocity(hatTopSpeed);
	}

	if(potionType == PotionType.Wings){
		var mWings : GameObject = GameObject.Instantiate(mothWingsPrefab);
		mWings.transform.position = pickableRB.pickingObject.transform.position;
		secAnim = mWings.GetComponentsInChildren.<SecondaryAnimation>();
		secAnim[0].AddShakeVelocity(hatTopSpeed*-.3);
		secAnim[1].AddShakeVelocity(hatTopSpeed*-.3);
		secAnim[2].AddShakeVelocity(hatTopSpeed*-.3);
		secAnim[3].AddShakeVelocity(hatTopSpeed*-.3);
	}

	if(potionType == PotionType.HealthPotion){
		if(pickableRB.pickingObject != null){
			var charHealth : Health = pickableRB.pickingObject.character.GetComponentInChildren.<Health>();
			if(charHealth != null){
				charHealth.health = charHealth.maxHealth;
			}

			if(absorbEffectPrefab != null){
				var newAbsorbEffect : GameObject = GameObject.Instantiate(absorbEffectPrefab);
				newAbsorbEffect.transform.position = pickableRB.pickingObject.character.position;
				var charChildren : Transform[] = pickableRB.pickingObject.character.GetComponentsInChildren.<Transform>();
				for(var i = 0; i < charChildren.Length; i++){
					if(charChildren[i].name.ToLower().Contains(effectApplyBoneName.ToLower())){
						newAbsorbEffect.transform.position = charChildren[i].position;
						break;
					}
				}


			}
		}
	}
	
	pickableRB.pickingObject.Drop();
	
	var dPrefab : GameObject = GameObject.Instantiate(destroyPrefab);
	dPrefab.transform.position = transform.position;
	dPrefab.transform.localScale = Vector3.one * destroyPrefabSize;
	
	face.SetActive(true);
	face.GetComponent.<TimedDestroy>().startTime = Time.time;
	face.transform.parent = null;
	
	puffSound.transform.parent = null;
	puffSound.Play();

	var td : TimedDestroy = puffSound.gameObject.AddComponent.<TimedDestroy>();
	td.startTime = Time.time;
	td.destroyTriggerTime = 1.5;

	magicSound.Play();
	magicSound.transform.parent = puffSound.transform;
	
	Destroy(gameObject);	
}