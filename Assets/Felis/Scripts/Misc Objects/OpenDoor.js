#pragma strict

var autoFindComponent : boolean = true;
var playerTag : String = "Player";
var playerController : ControllerInput;
var useCharOpenAnim : AnimationClip;
@Space(30)
var triggerAnimation : TriggerAnimation;
@Space(30)
var openDoor : boolean;
var opening : boolean;
var alreadyOpened : boolean;
var openTime : float;
@Space(30)
var doorCollider : Collider;
@Space(30)
var doorAnimationDelay : float;
var doorAnimationTime : float;
@Space(30)
var playPlayerAnim : boolean = true;
var playerAnimation : PlayStillAnimation;
@Space(30)
var player : Transform;
var pickRB : PickUpRigidbody;
var disableMeleeAttack : boolean = true;
var playerMeleeAttack : MeleeAttack;
var xPositionRelative : boolean = true;
var xPositionPlayer : float;
var setPositionSpeed : float;
var moveBackCurve : AnimationCurve;
var moveBackCurve_Multiply : float = 1.0;
@Space(30)
var openArea : Bounds;
@Space(30)
var debug : boolean;
@Space(30)
var requiresKey : boolean;
var keyNumber : int;
var key : GameObject;
var getKeyTimer : Timer;
var keyTag : String = "Key";
@Space(30)
var openCheckExternally : boolean;
@Space(30)
var loadResources : boolean;
var openTune : PlayRandomSound;
@Space(30)
var unlockButton : KeyCode;
var useDoorPos : Transform;
var facingDoor : boolean;

@Space(30)
var baloonCreatePrefab : GameObject;
var baloonCreate : GameObject;

var keyTexture : Texture;

@Space(30)
var keyUsed_CreatePrefab : GameObject;

@Space(30)
var rememberDoorState : boolean;
var saveString : String;

function LoadResources(){
	if(openTune == null){
		openTune = gameObject.AddComponent.<PlayRandomSound>();
		var audioS : AudioSource = gameObject.AddComponent.<AudioSource>();
		audioS.playOnAwake = false;
		openTune.soundList = new AudioSource[1];
		openTune.soundList[0] = audioS;
		openTune.playOnStart = false;
		openTune.delay = 1.0;
		audioS.clip = Resources.Load("Audio/Jingles/Open Door Tune", AudioClip);
	}


}

function Start () {
	if(keyUsed_CreatePrefab == null){
		keyUsed_CreatePrefab = Resources.Load("Prefabs/GUI/Baloons/For Cat/Baloon Thumbs Up Create_Cat", GameObject);
	}

	if(loadResources){
		LoadResources();
	}

	if(requiresKey && baloonCreate == null){
		if(baloonCreatePrefab == null){
			baloonCreatePrefab = Resources.Load("Prefabs/GUI/Baloons/For Player/Baloon Key Create", GameObject);
		}
		if(baloonCreatePrefab != null){
			baloonCreate  = GameObject.Instantiate(baloonCreatePrefab);
			baloonCreate.transform.position = transform.position;
		}
	}

	if(baloonCreate != null){
		switch (keyNumber){
			case 0:
				keyTexture = Resources.Load("Textures/Misc/Keys/Key Gold", Texture);
			break;

			case 71:
				keyTexture = Resources.Load("Textures/Misc/Keys/Griffin Key", Texture);
			break;
		}

		var pGen : PrefabGenerator = baloonCreate.GetComponent.<PrefabGenerator>();
		pGen.changeTexture = new PrefabGen_ChangeTexture[1];
		pGen.changeTexture[0] = new PrefabGen_ChangeTexture();
		pGen.changeTexture[0].newTexture = keyTexture;
		pGen.changeTexture[0].objName = "Key Icon Mesh";
	}

	if(autoFindComponent){
		GetPlayer();
		if(doorCollider == null){
			doorCollider = GetComponent.<Collider>();
		}
		if(triggerAnimation == null){
			triggerAnimation = GetComponent.<TriggerAnimation>();
		}
		if(openArea.size.magnitude == 0.0){
			openArea.center = transform.position;
			openArea.size = Vector3(4,5,3);
		}
	}
	
	if(getKeyTimer.every == 0.0){
		getKeyTimer.every = 3.0;
	}	

	if(rememberDoorState){
		var gVals : HoldGlobalValues = GameObject.FindObjectOfType.<HoldGlobalValues>();
		if(gVals != null){
			var isOpen : int = PlayerPrefs.GetInt("Game " + gVals.currentGame.ToString() + " - " + saveString);
			if(isOpen == 1){
				opening = true;
			}
		}
	}

}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) player = playerObj.transform;
	
	if(player != null){
		playerController = player.GetComponentInChildren(ControllerInput);
		pickRB = player.GetComponentInChildren(PickUpRigidbody);
		playerMeleeAttack = player.GetComponentInChildren(MeleeAttack);
		
		var allPlayerAnims : PlayStillAnimation[] = player.GetComponentsInChildren.<PlayStillAnimation>() as PlayStillAnimation[];
		for( var i = 0; i < allPlayerAnims.Length; i++){
			if(allPlayerAnims[i].gameObject.name.ToLower().Contains("open door")){
				playerAnimation = allPlayerAnims[i];
				break;
			}
		}
		
		if(useCharOpenAnim != null){
			playerAnimation.stillAnimation = useCharOpenAnim;
		}
	}
}

function GetKey(){
	var keys : Key[] = GameObject.FindObjectsOfType.<Key>();//GameObject.FindGameObjectsWithTag(keyTag);
	var closestKey : GameObject;
	var closestKeyDist : float;
	for(var i = 0; i < keys.Length; i++){
		if(keys[i].keyNumber != keyNumber){
			continue;
		}
		if(closestKey == null){
			closestKey = keys[i].gameObject;
			closestKeyDist = Vector3.Distance(transform.position, closestKey.transform.position);
		}
		else{
			var thisDist : float = Vector3.Distance(keys[i].transform.position, transform.position);
			if(thisDist < closestKeyDist){
				closestKey = keys[i].gameObject;
				closestKeyDist = thisDist;
			}
		}
	}
	key = closestKey;
}

function FixedUpdate () {
	if(Input.GetKeyDown(unlockButton) && openArea.Contains(player.position)){
		requiresKey = false;
		openDoor = true;
	}
	
	getKeyTimer.Update();
	if(getKeyTimer.current){
		GetKey();
	}

	if(player == null) GetPlayer();
	if(player == null) return;
	
	var doorPos : Vector3 = transform.position;
	if(useDoorPos != null){
		doorPos = useDoorPos.position;
	}
	facingDoor = (Mathf.Sign(player.localScale.x) == Mathf.Sign(player.position.x - doorPos.x));
	
	var hasKey : boolean;
	if(key != null){
		hasKey = (key != null && pickRB.pickedObject != null && pickRB.pickedObject.transform.parent != null && pickRB.pickedObject.transform.parent.gameObject == key);
	}
	
	if(playerController != null && playerController.inputButtonA.down){
		var picking : boolean;
		var attacking : boolean;

		if(playerMeleeAttack != null){
			playerMeleeAttack.FindNearestEnemyInFront();
			if(playerMeleeAttack.attackTargets != null && playerMeleeAttack.attackTargets.Length > 0){
				attacking = true;
			}
		}

		if(pickRB != null){
			picking = pickRB.PickUpCheck();

		}

		if(!picking && !attacking){
			if(openCheckExternally || player != null && facingDoor && openArea.Contains(player.position) && !alreadyOpened){
				if(pickRB.isPickingUp){
					pickRB.Drop(); 
				}

				openDoor = true;
				if(playerMeleeAttack != null){
					playerMeleeAttack.disableFireballUntil = Time.time + .5;
				}
			}
		}
	}
	openCheckExternally = false;
			
	if(openDoor){
		
		openDoor = false;
		
		var doorLocked : boolean = false;
		if(requiresKey){
			//if(key == null || pickRB.pickedObject == null || pickRB.pickedObject.transform.parent != null && pickRB.pickedObject.transform.parent.gameObject != key){
			if(key == null || !hasKey){
				doorLocked = true;
			}
			else{
				pickRB.Drop();
				key.GetComponentInChildren.<CollectItemEffect>().fadeNow = true;
				if(keyUsed_CreatePrefab != null){
					var newPrefabInstance : GameObject = GameObject.Instantiate(keyUsed_CreatePrefab);
					newPrefabInstance.transform.position = transform.position;
				}
				if(openTune != null){
					openTune.Play();
				}
				Debug.Log("Key Used.");
			}
		}
		
		if(!requiresKey || !doorLocked){
			if(player != null && openArea.Contains(player.position)){
				opening = true;
				
				if(doorCollider != null){
					doorCollider.enabled = false;
				}

				if(playPlayerAnim){
					playerAnimation.animationPlay.current = true;
				}
				doorAnimationTime = Time.time + doorAnimationDelay;
				
				alreadyOpened = false;
				
			}

			if(rememberDoorState){
				var gVals : HoldGlobalValues = GameObject.FindObjectOfType.<HoldGlobalValues>();
				if(gVals != null){
					PlayerPrefs.SetInt("Game " + gVals.currentGame.ToString() + " - " + saveString, 1);
				}
			}
		}
	}

	//Before playing animation, set player in front of door.
	if(player != null && opening && Time.time < doorAnimationTime){
		if(!xPositionRelative)
			player.position.x = Mathf.Lerp(player.position.x, xPositionPlayer, Time.deltaTime * setPositionSpeed);
		else
			player.position.x = Mathf.Lerp(player.position.x, transform.position.x + xPositionPlayer, Time.deltaTime * setPositionSpeed);
	}

	//Play player open anim. **WILL NEED TO FIX FOR 2 PLAYERS
	if(opening && Time.time > doorAnimationTime && !alreadyOpened){
		triggerAnimation.play = true;
		alreadyOpened = true;
		openTime = Time.time;

	}

	//Move while opening door.
	if(player != null && playerAnimation.animationPlay.current == true){
		var moveBackC_Val : float = moveBackCurve.Evaluate(Time.time - playerAnimation.animationStartTime) * Time.deltaTime;
		moveBackC_Val *= moveBackCurve_Multiply; 
		player.position.x += moveBackC_Val;
	}
}

function OpenCheck() : boolean{
	if(player != null && openArea.Contains(player.position) && !alreadyOpened && facingDoor){
		openCheckExternally = true;
		return true;
	}
	else
		return false;
}


function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.DrawWireCube(openArea.center, openArea.size); 
	}
	#endif
}