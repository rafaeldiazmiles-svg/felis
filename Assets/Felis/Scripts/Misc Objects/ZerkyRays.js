#pragma strict

var zerkyEnterArea : Bounds;

var zerkies : ZerkyBoundsDetect[];

var rayFadeSpeed : float = 5.0;
var rays : ZerkyRayControl[];

var oppositeFade : boolean;

var zerkiesInRange : int;

var numbers : GameObject[];
var numberRends : Renderer[];
var numberOffset : Vector3;

var getTimer : Timer;

var maxRaySoundVol: float = .8;

var debug : boolean;

class ZerkyBoundsDetect{
	var zerky : Transform;
	var rayLoopingSound : AudioSource;
	var inside : ToggleBoolean;
	
	var assignedRay : ZerkyRayControl;
	
	function Update(bounds : Bounds, rays : ZerkyRayControl[], maxRaySoundVol : float){
		if(zerky != null){
			
			if(bounds.Contains(zerky.position)){
				inside.current = true;
			}
			else{
				inside.current = false;
			}

			inside.Update();

			if(inside.toggledTrue){
				for(var i = 0; i < rays.Length; i ++){
					if(rays[i].rayMesh.end == null){
						assignedRay = rays[i];
						
						var zerkyChildren : Transform[] = zerky.GetComponentsInChildren.<Transform>();
						for(var n = 0; n < zerkyChildren.Length; n++){
							if(zerkyChildren[n].name.ToLower().Contains("head")){
								assignedRay.rayMesh.end = zerkyChildren[n];
							}
						}
						if(assignedRay.rayMesh.end == null){
							assignedRay.rayMesh.end = zerky;
						}
						assignedRay.fadeControl.target = 1.0;
						
						break;
					}
				}
			}
			
			if(inside.toggledFalse){
				assignedRay.rayMesh.end = null;
				
				assignedRay.fadeControl.target = 0.0;
				assignedRay = null;
			}

			if(rayLoopingSound != null){
				if(inside.current){
					rayLoopingSound.volume = Mathf.Lerp(rayLoopingSound.volume, (1.0 - rays[i].fadeOppositeControl.current) * maxRaySoundVol, Time.deltaTime * 5.0);
				}
				else{
					rayLoopingSound.volume = Mathf.Lerp(rayLoopingSound.volume, 0.0, Time.deltaTime * 5.0);
				}
			}
		}
	}
}

class ZerkyRayControl{
	var rayMesh : ElectricRayMesh;
	var fadeControl : FloatLerp;
	var fadeOppositeControl : FloatLerp;
	
	function Update(){
		fadeControl.Lerp();
		fadeOppositeControl.Lerp();
		
		rayMesh.fade = fadeControl.current;
		rayMesh.fadeOpposite = fadeOppositeControl.current;
	}
}

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 5.0;
	}
	GetCats();

	for(var n = 0; n < rays.Length; n++){
		rays[n].fadeControl.target = 0.0;
		rays[n].fadeControl.speed = rayFadeSpeed;
		rays[n].fadeOppositeControl.speed = rayFadeSpeed;
	}

	numberRends = new Renderer[numbers.Length];
	for(var i = 0; i < numbers.Length; i++){
		numberRends[i] = numbers[i].GetComponent.<Renderer>();
	}
}

function GetCats(){
	var allZerkies : GameObject[] = GameObject.FindGameObjectsWithTag("Cat");
	zerkies = new ZerkyBoundsDetect[allZerkies.Length];
	
	for(var i = 0; i < allZerkies.Length; i++){
		zerkies[i] = new ZerkyBoundsDetect();
		zerkies[i].zerky = allZerkies[i].transform;
		zerkies[i].inside = new ToggleBoolean();
		
		var audioSources : AudioSource[] = zerkies[i].zerky.gameObject.GetComponentsInChildren.<AudioSource>() as AudioSource[];
		for(var a = 0; a < audioSources.Length; a++){
			if(audioSources[a].name.Contains("Ray")){
				zerkies[i].rayLoopingSound = audioSources[a];
				break;
			}
		}
	}
	
	/////////////////Reset Rays//////////////////////
	
	for(i = 0; i < rays.Length; i ++){
		rays[i].rayMesh.end = null;
		rays[i].fadeControl.target = 0.0;
	}	
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		GetCats();
	}

	zerkyEnterArea.center = transform.position;
	
	zerkiesInRange = 0;
	for(var i = 0; i < zerkies.Length; i++){
		zerkies[i].Update(zerkyEnterArea, rays, maxRaySoundVol);
		if(zerkies[i].inside.current) zerkiesInRange ++;
	}
	
	var currentZerkyInRange : int;

	for(var m = 0; m < zerkiesInRange; m++){
		//numbers[m].GetComponent.<Renderer>().enabled = true;
		numberRends[m].enabled = true;

		currentZerkyInRange = 0;
		for(var mm = 0; mm < zerkies.Length; mm ++){
			if(zerkies[mm] != null && zerkies[mm].inside.current){
				if(currentZerkyInRange == m){
					if(zerkies[mm].zerky != null){
						numbers[m].transform.position = zerkies[mm].zerky.position + numberOffset;
						break;
					}
				}
									
			 	currentZerkyInRange++;
			}	
		}
	}
	
	for(m = zerkiesInRange; m < numbers.Length; m++){
		//numbers[m].GetComponent.<Renderer>().enabled = false;
		numberRends[m].enabled = false;
	}
	ArrangeNumbers();
	

	
	for(var n = 0; n < rays.Length; n++){
		rays[n].Update();
		
		if(oppositeFade)rays[n].fadeOppositeControl.target = 1.0;
	}
}

function ArrangeNumbers(){
	for(var i = 0; i < zerkiesInRange; i++){
		if(numbers[i].transform.position.x < numbers[i+1].transform.position.x){
			var numberPos : Vector3 = numbers[i].transform.position;
			numbers[i].transform.position = numbers[i+1].transform.position;
			numbers[i+1].transform.position = numberPos;
		}
	}
	var done : boolean = true;
	for(i = 0; i < zerkiesInRange; i++){
		if(numbers[i].transform.position.x < numbers[i+1].transform.position.x){
			done = false;
			break;
		}
	}
	if(!done) ArrangeNumbers();
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		Gizmos.color = Color.yellow;
		zerkyEnterArea.center = transform.position;
		Gizmos.DrawWireCube(zerkyEnterArea.center, zerkyEnterArea.size);
	}
	#endif
}