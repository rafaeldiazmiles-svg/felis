#pragma strict

var soundList : AudioSource[];
var allInChildren : boolean;
@Space(20)
var playOnStart : boolean = true;
var delay : float;
@Space(20)
var playTimer : Timer;
@Space(20)
var randomPitchRange : Vector2 = Vector2(1.0, 1.0);
@Space(20)
var playOnBounds : boolean;
var disableBoundsAfterPlay : boolean;
var boundsDisabled : boolean;
var bounds : Bounds;
var enableBounds : Bounds;
var triggerObjs : Transform[];
var searchTags : String[];
var getTimer : Timer;
var playSound : ToggleBoolean;

function GetTriggerObjs(){
	if(searchTags != null){
		var triggerObjsArray : Array = new Array();

		for(var i = 0; i < searchTags.Length; i++){
			var thisTagObjs : GameObject[]= GameObject.FindGameObjectsWithTag(searchTags[i]);
			for(var n = 0; n < thisTagObjs.Length; n++){
				triggerObjsArray.Add(thisTagObjs[n].transform);
			}
		}
		triggerObjs = triggerObjsArray.ToBuiltin(Transform);
	}
}

function Start () {
	if(allInChildren){
		soundList = GetComponentsInChildren.<AudioSource>();
	}

	Reset();

	if(playSound == null){
		playSound = new ToggleBoolean();
	}
	if(getTimer == null){
		getTimer = new Timer();
	}
	if(playTimer == null){
		playTimer = new Timer();
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetTriggerObjs();
	}

	if(playTimer.every != 0.0){
		playTimer.Update();
		if(playTimer.current){
			PlaySound();
		}
	}

	if(playOnBounds){
		playSound.current = false;
		if(getTimer != null && bounds != null){
			for(var i = 0; i < triggerObjs.Length; i++){
				if(triggerObjs[i] == null){
					continue;
				}
				if(!boundsDisabled && bounds.Contains(triggerObjs[i].position - transform.position)){
					playSound.current = true;

					if(disableBoundsAfterPlay){
						boundsDisabled = true;
					}
				}

				if(enableBounds.Contains(triggerObjs[i].position - transform.position)){
					boundsDisabled = false;
				}
			}
		}
	}


	playSound.Update();
	if(playSound.toggledTrue){
		 Play();
	}
}

function PlaySound(volume : float){
	var id : int = Random.value * soundList.Length;
		if(soundList[id] != null){
		soundList[id].volume = volume;
		soundList[id].pitch = Random.Range(randomPitchRange.x, randomPitchRange.y);
		if(soundList[id].enabled){
			soundList[id].Play();
		}
	}
}

function Reset(){
	if(playOnStart){
		Invoke("PlaySound", delay);
	}	
}

function PlaySound(){
	var id : int = Random.value * soundList.Length;
	soundList[id].pitch = Random.Range(randomPitchRange.x, randomPitchRange.y);
	if(soundList[id].enabled){
		soundList[id].Play();
	}
}

function Play(){
	Invoke("PlaySound", delay);
	/*var id : int = Random.value * soundList.Length;
	soundList[id].pitch = Random.Range(randomPitchRange.x, randomPitchRange.y);
	soundList[id].Play();*/
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.green;
	Gizmos.DrawWireCube(bounds.center + transform.position, bounds.size);
	Gizmos.color = Color.red;
	Gizmos.DrawWireCube(enableBounds.center + transform.position, enableBounds.size);
	#endif
}