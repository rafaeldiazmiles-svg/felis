#pragma strict

var player : GameObject;
var playerTag : String = "Player";
@Space(10)
var cats : GameObject[];
var catsTag : String = "Cat";
@Space(10)
var griffin : GameObject;
var griffinTag : String = "Griffin";
@Space(10)
var player_LoadPos : Transform;
var cats_LoadPos : Transform[];
var griffin_LoadPos : Transform;
@Space(30)
var saved : boolean = false;

@Space(30)

var buttonObj : GameObject;
var buttonStartPos : Vector3;
var buttonPressRange : float = 0.12;
var mainBodyObj : GameObject;
var buttonPress : ToggleBoolean;
var buttonAudio : AudioSource;

@Space(30)
var spinDelay : float = .2;
var spinAudio : AudioSource;
var spinSaveSound : AudioSource;
@Space(10)
var spinObj : GameObject;
var spinAngle : FloatSpring;
var spinDefRotation : Quaternion;
@Space(10)
var spinSavedAngle : float = 180;
var spinUnsavedAngle : float = 0;
@Space(30)
var ID : int;
@Space(30)
var loading : boolean;

@Space(30)
var catSaveRadius : float = 6.0;

function ResetOthers(){
	var gVals : HoldGlobalValues = GameObject.FindObjectOfType.<HoldGlobalValues>();
	if(gVals != null){

		var checkpoints : CheckpointMachine[] = GameObject.FindObjectsOfType.<CheckpointMachine>();
		for(var i = 0; i < checkpoints.Length; i++){
			if(checkpoints[i] == this){
				continue;
			}

			var saveString : String = "Game " + gVals.currentGame.ToString() + " - Level " + gameObject.scene.name + " - ID " + checkpoints[i].ID.ToString();
			PlayerPrefs.SetInt(saveString, 0);
			Debug.Log("Reseted by having pressed other checkpoint's button: " + saveString);

			//Reset cats
			var cats_Script : Cats = GameObject.FindObjectOfType.<Cats>();
			if(cats_Script != null){
				for(var n = 0; n < cats_Script.catIcons.Length; n++){
					saveString = "Game " + gVals.currentGame.ToString() + " - Level " + gameObject.scene.name + " - ID " + checkpoints[i].ID.ToString() + " - Cat " + n.ToString();
					PlayerPrefs.SetInt(saveString, 0);
					Debug.Log("Reseted by having pressed other checkpoint's button: " + saveString);
				}
			}

			//spin back the spin obj
			checkpoints[i].spinAngle.target = checkpoints[i].spinUnsavedAngle;
		}

	}
}


function GenerateID(){
	var allCheckpoints : CheckpointMachine[] = GameObject.FindObjectsOfType.<CheckpointMachine>();
	ID = 0;
	for(var i = 0; i < allCheckpoints.Length; i++){
		if(allCheckpoints == this){
			continue;
		}
		if(transform.position.x < allCheckpoints[i].transform.position.x){
			ID ++;
		}
	}
}

function DelayedCatRestore(cat : GameObject, newCatPos : Vector3){
	yield;

	var pickableRB: PickableRigidbody = cat.GetComponentInChildren(PickableRigidbody);

	pickableRB.enabled = true;
	pickableRB.SetColliders(true);
	pickableRB.SetDisableComponents(true);
	pickableRB.pickable = true;
	pickableRB.rb.useGravity = true;
	pickableRB.rb.velocity = Vector3.zero;
	pickableRB.beingPicked.current = false;
	if(pickableRB.pickingObject != null){
		pickableRB.pickingObject.enabled = true;
		pickableRB.pickingObject.Drop();
	}

	var tied : CatTied = cat.GetComponentInChildren.<CatTied>();
	if(tied != null){
		tied.tied.current = false;
	}

	var tomb : JumpOutTomb = cat.GetComponentInChildren.<JumpOutTomb>();
	if(tomb != null){
		tomb.zpos.zPosition = tomb.setZ;
		tomb.open.current = true;
		tomb.SetNormalValues();
		tomb.open.current = true;
	}

	cat.transform.position = newCatPos;
	var maxRBDelta : MaxRigidbodyDeltaPos = cat.GetComponentInChildren(MaxRigidbodyDeltaPos);
	maxRBDelta.previousPosition = cat.transform.position;

	cat.GetComponentInChildren.<Caged>().isCaged = false;
}

function Load(){
	yield;

	player = GameObject.FindWithTag(playerTag);
	cats = GameObject.FindGameObjectsWithTag(catsTag);
	griffin = GameObject.FindGameObjectWithTag(griffinTag);

	var enableRideGauge : EnableRideGauge = GameObject.FindObjectOfType.<EnableRideGauge>();

	if(player != null && (cats != null && cats.Length > 0 || enableRideGauge != null)){
		var gVals : HoldGlobalValues = GameObject.FindObjectOfType.<HoldGlobalValues>();
		if(gVals != null){
			
			var loadValue : int;
			var loadString : String = "Game " + gVals.currentGame.ToString() + " - Level " + gameObject.scene.name + " - ID " + ID.ToString();
	
			loadValue = PlayerPrefs.GetInt(loadString);
			Debug.Log("Loaded int: " + loadValue + "- From: " + loadString);

			if(loadValue == 1){
				spinAngle.target = spinSavedAngle;

				//Load Player
				player.transform.position = player_LoadPos.position;
				var maxRBDelta : MaxRigidbodyDeltaPos = player.GetComponentInChildren(MaxRigidbodyDeltaPos);
				maxRBDelta.previousPosition = transform.position;

				var enterLevel : ProsperoEnterLevel = player.GetComponentInChildren(ProsperoEnterLevel);
				if(enterLevel != null){
					enterLevel.CancelEnterLevel();
				}

				var wakeUp : ProsperoWakeUp = player.GetComponentInChildren(ProsperoWakeUp);
				if(wakeUp != null){
					Debug.Log("ProsperoWakeUp.js found");
					wakeUp.InstantWakeUp();
				}

				player.BroadcastMessage("CancelEnterLevel");

				//PlayerPrefs.SetInt(loadString, 0);
				//Debug.Log("Reseted int to 0 after loading on : " + loadString);

				//Load Griffin
				if(enableRideGauge != null){
					if(griffin != null){
						var ride : Ride;
						ride = player.GetComponentInChildren.<Ride>();
						if(ride.ride.current && ride.rideMng != null){
							ride.rideMng.maxRBDelta.previousPosition = griffin_LoadPos.position;
						}
					}
				}

				//Load Cats.
				if(enableRideGauge == null){
					var cats_Script : Cats = GameObject.FindObjectOfType.<Cats>();

					for(var i = 0; i < cats_Script.catIcons.Length; i++){
						var loadValue_cat : int;
						loadString = "Game " + gVals.currentGame.ToString() + " - Level " + gameObject.scene.name + " - ID " + ID.ToString() + " - Cat " + i.ToString();

						loadValue_cat = PlayerPrefs.GetInt(loadString);
						Debug.Log("Loaded int: " + loadValue_cat + "- From: " + loadString);

						if(loadValue_cat == 1 && cats_Script.catIcons[i].cat != null){
							DelayedCatRestore(cats_Script.catIcons[i].cat.gameObject, cats_LoadPos[i].position);

							cats_Script.catIcons[i].catSavedMsg.current = true;
							cats_Script.catIcons[i].catSavedMsg.previous = true;
						}
					}
				}
			}
		}
		loading = false;
	}
}

function Start () {
	buttonStartPos = mainBodyObj.transform.InverseTransformPoint(buttonObj.transform.position);

	GenerateID();

	loading = true;

	spinDefRotation = spinObj.transform.localRotation;

}

function Update () {
	if(loading){
		Load();
	}

	ButtonCheck();

	if(buttonPress.toggledTrue){
		buttonAudio.Play();

		Invoke("Spin", spinDelay);
	}

	//Spin Object
	spinAngle.Spring();

	SetSpinAngle();
}

function Spin(){
	saved = !saved;
	if(saved){
		spinAngle.target = spinSavedAngle;
		spinSaveSound.Play();

	}
	else{
		spinAngle.target = spinUnsavedAngle;
	}

	spinAudio.Play();

	Save();
	ResetOthers();
}

function SetSpinAngle(){
	spinObj.transform.localRotation = spinDefRotation;
	spinObj.transform.RotateAround(spinObj.transform.position, Vector3.forward, spinAngle.current);
}


function ButtonCheck(){
	if(Time.timeSinceLevelLoad > 4.0);

	var currentButtionPos : Vector3 = mainBodyObj.transform.InverseTransformPoint(buttonObj.transform.position);
	buttonPress.current = currentButtionPos.y > buttonStartPos.y + buttonPressRange;

	buttonPress.Update();

}

function Save(){
	var gVals : HoldGlobalValues = GameObject.FindObjectOfType.<HoldGlobalValues>();
	if(gVals != null){
		var saveValue : int;
		if(saved){
			saveValue = 1;
		}
		else{
			saveValue = 0;
		}
		var saveString : String = "Game " + gVals.currentGame.ToString() + " - Level " + gameObject.scene.name + " - ID " + ID.ToString();
		PlayerPrefs.SetInt(saveString, saveValue);

		Debug.Log("Saved int: " + saveValue + "- On: " + saveString);


		//Save Cats
		var cats_Script : Cats = GameObject.FindObjectOfType.<Cats>();

		if(cats_Script != null){
			for(var i = 0; i < cats_Script.catIcons.Length; i++){
				var saveValue_cat : int = 0;

				if(saveValue == 1){
					if(cats_Script.catIcons[i].cat != null){
						var dist : float = Vector3.Distance(transform.position, cats_Script.catIcons[i].cat.position);
						if(dist < catSaveRadius){
							saveValue_cat = 1;
						}
					}
				}

				saveString = "Game " + gVals.currentGame.ToString() + " - Level " + gameObject.scene.name + " - ID " + ID.ToString() + " - Cat " + i.ToString();
				PlayerPrefs.SetInt(saveString, saveValue_cat);
				Debug.Log("Saved int: " + saveValue_cat + "- On: " + saveString);
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR

	DebugUtility.DrawCircle(transform.position, catSaveRadius, Vector3.forward);

	#endif
}