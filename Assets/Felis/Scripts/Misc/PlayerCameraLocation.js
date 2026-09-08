#pragma strict

var player : GameObject;
var playerTag : String = "Player";

var getTimer : Timer;


var location : Vector3;
var storePlayerLocation : Vector3;

var zoom : float;

var showLocation : ToggleBoolean;


var mDPos : MaxRigidbodyDeltaPos;
var sMesh : SkinnedMeshRenderer;
var rb : Rigidbody;
var pickupRB : PickUpRigidbody;
var underwater : UnderWater;
var stamina : Stamina;

@Space(30)

var fade : FadeByBounds;
var characterCamera : FollowCharacter;

@Space(30)
var fadeIn : boolean;
var fadeOut : float = 1.0;
var fadeCamera_Pause : Pause;

@Space(30)
var storeSta : float = 100.0;

@Space(30)
var SetInactiveAllButRoot : boolean = true;
var playerChildren : Transform[];

function GetPlayer(){
	player = GameObject.FindGameObjectWithTag(playerTag);
	if(player != null){
		mDPos = player.GetComponent.<MaxRigidbodyDeltaPos>();
		sMesh = player.GetComponentInChildren.<SkinnedMeshRenderer>();
		rb = player.GetComponent.<Rigidbody>();
		pickupRB = player.GetComponentInChildren.<PickUpRigidbody>();
		underwater = player.GetComponentInChildren.<UnderWater>();
		stamina = player.GetComponentInChildren.<Stamina>();
	}
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 3.0;
	}

	fade = GameObject.FindObjectOfType.<FadeByBounds>();

	characterCamera = GameObject.FindObjectOfType.<FollowCharacter>();

	fadeCamera_Pause = GameObject.FindObjectOfType.<Pause>();
}

function Update () {
	getTimer.Update();

	if(getTimer.current){
		if(player == null){
			GetPlayer();
		}
	}

	showLocation.Update();

	if(fadeIn && Time.time > showLocation.toggledTime + fadeOut){
		fadeIn = false;
		fadeCamera_Pause.overlayLerp.target = 0.0;
	}


	if(player != null){
		if(showLocation.toggledTrue){
			fadeCamera_Pause.overlayLerp.target = 1.0;
			fadeIn = true;

			mDPos.disable = true;
			storePlayerLocation = player.transform.position;
			player.transform.position = location + transform.position;
			sMesh.enabled = false;//gameObject.SetActive(false);
			rb.isKinematic = true;

			if(pickupRB.pickedObject != null){
				pickupRB.pickedObject.character.gameObject.SetActive(false);
			}

			if(underwater != null){
				underwater.HideProps();
			}

			if(stamina != null){
				storeSta = stamina.stamina;
			}

			characterCamera.cameraLocationZoom = zoom;

			if(SetInactiveAllButRoot){
				playerChildren = player.transform.GetComponentsInChildren.<Transform>();
				for(var child : Transform in playerChildren){
					if(child != player.transform){
						child.gameObject.SetActive(false);
					}
				}
			}
		}

		if(showLocation.current){
			if(stamina != null){
				stamina.stamina = storeSta;
			}		
		}

		if(showLocation.toggledFalse){
			fadeCamera_Pause.overlayLerp.target = 1.0;
			fadeIn = true;

			mDPos.disable = false;
			player.transform.position = storePlayerLocation;
			sMesh.enabled = true;//gameObject.SetActive(true);
			rb.isKinematic = false;

			if(pickupRB.pickedObject != null){
				pickupRB.pickedObject.character.gameObject.SetActive(true);
			}

			if(underwater != null){
				underwater.UnhideProps();
				}

			if(stamina != null){
				stamina.stamina = storeSta;
			}

			characterCamera.cameraLocationZoom = 0;

			if(SetInactiveAllButRoot){
				for(var child : Transform in playerChildren){
					if(child != player.transform){
						child.gameObject.SetActive(true);
					}
				}
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawPoint(location + transform.position, .6, Color.cyan);
	Handles.Label(location + transform.position, "Player Camera Location - " + transform.name);
	#endif
}