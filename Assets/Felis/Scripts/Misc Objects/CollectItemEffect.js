#pragma strict

var rigidbodyIsParent : boolean = true;
var itemRigidbody : Rigidbody;

var collectibleTransformIsParent : boolean = true;
var collectibleTransform : Transform;

var meshRendererGetComponent : boolean = true;
var meshRenderer : Renderer;
var shinyMaterial : Material;
var colorPropertyName : String;
var fadeDuration : float;
var multiplyScale : float;
var startScale : Vector3;

var fadeNow : boolean;
var fadeTimeStart : float;
var fadeInProgress : boolean;

var disableColliderOnFade : boolean = true;
var colliderGetComponent : boolean = true;;
var itemCollider : Collider;

var destroyAfterFade : boolean = true;;

var checkProximityGetComponent : boolean = true;
var checkProximity : CheckProximity;

var afterPickPrefab : GameObject;

var playerAsProximityCheck : boolean = true;
var playerTag : String = "Player";

var provideHealth : boolean = true;
var addHealthAmount : float = 25;

var holdFadePosition : boolean = true;
var fadePosition : Vector3;

var effectSound : AudioSource[];

var autoFade : boolean = true;;
var autoFadeNow : boolean; //Fade if not picked for too long.
var showDuration : float = 4.0;
var startTime : float;

function Start () {
	startTime = Time.time;

	if(rigidbodyIsParent) itemRigidbody = transform.parent.GetComponent.<Rigidbody>();
	
	if(collectibleTransformIsParent) collectibleTransform = transform.parent;
	
	if(checkProximityGetComponent) checkProximity = GetComponent(CheckProximity);
	
	if(meshRendererGetComponent) meshRenderer = collectibleTransform.GetComponentInChildren(Renderer);
	
	if(colliderGetComponent) itemCollider = collectibleTransform.GetComponent(Collider);
	
	if(playerAsProximityCheck){
		GetPlayer();
		/*var playerArray : GameObject[] = GameObject.FindGameObjectsWithTag(playerTag);
		checkProximity.checkObjects = new Transform[1];
		checkProximity.checkObjects[0] = playerArray[0].transform;*/
	}
	
	effectSound = GetComponentsInChildren.<AudioSource>() as AudioSource[];
}

function GetPlayer(){
	var playerArray : GameObject[] = GameObject.FindGameObjectsWithTag(playerTag);
	if(playerArray != null && playerArray.Length > 0){
		checkProximity.checkObjects = new Transform[1];
		checkProximity.checkObjects[0] = playerArray[0].transform;
	}
}

function LateUpdate () {
	if(autoFade && Time.time > startTime + showDuration && !autoFadeNow){
		autoFadeNow = true;
		Fade();
		multiplyScale = 1.0;
	}

	if(playerAsProximityCheck){
		if(checkProximity.checkObjects == null || checkProximity.checkObjects[0] == null){
			GetPlayer();
		}
	}
	
	if(checkProximity != null && checkProximityGetComponent && checkProximity.inRange.toggledTrue && !fadeInProgress){	
		fadeNow = true;
	}

	if(fadeNow){
		fadeNow = false;

		Fade();

		Instantiate(afterPickPrefab, transform.position, Quaternion.identity);
		
		if(provideHealth && checkProximity.checkObjects != null){
			for(var i = 0; i < checkProximity.checkObjects.Length; i++){
				if(checkProximity.checkObjects[i] == null) continue;
				var health : Health = checkProximity.checkObjects[i].GetComponentInChildren(Health);
				if(health != null){
					health.health += addHealthAmount;
				}
			}
		}

		if(effectSound != null && effectSound.Length > 0){
			effectSound[Random.value * effectSound.Length].Play();
		}
	}
	
	if(fadeInProgress){
		var fadeProgress : float = Mathf.Clamp01( (Time.time - fadeTimeStart) / fadeDuration );
		
		var fadeValue : float = 1 - fadeProgress;
		
		meshRenderer.material.SetColor(colorPropertyName, Color(1,1,1,fadeValue));
		
		collectibleTransform.localScale = Vector3.Lerp(startScale, startScale * multiplyScale, fadeProgress);
		
		if(Time.time > fadeTimeStart + fadeDuration && destroyAfterFade){
			
			Destroy(collectibleTransform.gameObject);
			//collectibleTransform.gameObject.SetActive(false);
		}
		
		if(holdFadePosition){
			if(transform.parent != null){
				transform.parent.position = fadePosition;
			}
			if(transform.parent!= null && transform.parent.GetComponent.<Rigidbody>() != null)
				transform.parent.GetComponent.<Rigidbody>().velocity = Vector3.zero;
		}
	}
	
	
}

function Fade(){
	fadeInProgress = true;
	fadeTimeStart = Time.time;
	itemRigidbody.useGravity = false;
	itemRigidbody.velocity = Vector3.zero;
	meshRenderer.material = shinyMaterial;
	startScale = collectibleTransform.localScale;

	if(disableColliderOnFade){
		itemCollider.enabled = false;
	}

	if(transform.parent != null){
		fadePosition = transform.parent.position;
	}
}