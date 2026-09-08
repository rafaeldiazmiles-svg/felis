#pragma strict

var autoFindComponents : boolean = true;
var deathAnimation : PlayStillAnimation;
var frameGroups : UVFrameGroups;
var faceAnim : FaceAnim;
var health : Health;
var controller : ControllerInput;

var dead : ToggleBoolean;
var endLevel : ToggleBoolean;

var disableOnDeath : MonoBehaviour[];

var closeMouthTriggerTime : float = .6;

var backToIslandDelay : float = 3.5;
var islandLevelName : String = "Island";

var screenSpiralName : String = "Screen Spiral";
var screenSpiral : ScreenSpiral;
var optionsDelayAfterDeath : float = 1.5;

var globalValues : HoldGlobalValues;
var globalValuesName : String = "Hold Global Values";

var colliderDir : int = 1;
var colliderCenter : Vector3 = Vector3(.3,0,0);
var colliderRadius : float = .3;

var defColliderDir : int = 1;
var defColliderCenter : Vector3 = Vector3(.3,0,0);
var defColliderRadius : float = .3;

var deathEndsLevel : boolean = true;

var setDisableComponentList : MonoBehaviour[];

var disableAllColliders : boolean;
var disableRB : boolean;

var makeCatsCry : boolean;
var catTag : String = "Cat";

var removeTagWhenDead : String[];

@Space(30)
var pause : Pause;
var popupQuestionPrefab : GameObject;
var popupQuestion : GameObject;
var popupQuestion_InputQ : InputQuestion;
@Space(30)
var question_Restart : boolean;
var exitingScene : boolean;

@Space(30)
var deathAudio : AudioSource;


function MakePopupQuestion(){
	if(popupQuestionPrefab == null){
		popupQuestionPrefab = Resources.Load("Prefabs/GUI/Popup Question", GameObject);
	}

	popupQuestion = GameObject.Instantiate(popupQuestionPrefab);
	popupQuestion_InputQ = popupQuestion.GetComponent.<InputQuestion>();

	controller.GetTouchPoints();
}

function GetScreenSpiral(){
	var screenSpiralObj : Transform = Camera.main.transform.Find(screenSpiralName);
	if(screenSpiralObj != null){
		screenSpiral = screenSpiralObj.GetComponent.<ScreenSpiral>();
	}
}

function Start () {
	deathAudio = GetComponent.<AudioSource>();

	pause = GameObject.FindObjectOfType.<Pause>();



	GetScreenSpiral();
	
	var capsCol : CapsuleCollider = transform.parent.GetComponent(CapsuleCollider);
	if(capsCol != null){
		defColliderDir = capsCol.direction;
		defColliderCenter = capsCol.center;
		defColliderRadius = capsCol.radius;
	}	
	
	if(autoFindComponents){
		deathAnimation = GetComponent(PlayStillAnimation);
		frameGroups = transform.parent.GetComponentInChildren(UVFrameGroups);
		faceAnim = transform.parent.GetComponentInChildren(FaceAnim);
		health = transform.parent.GetComponentInChildren(Health);
		controller = transform.parent.GetComponentInChildren(ControllerInput);
		
		var gVals : GameObject = GameObject.Find(globalValuesName);
		if(gVals != null) globalValues = gVals .GetComponent(HoldGlobalValues);
	}
	
	var allScriptsArray = new Array();
	if(transform.parent != null){
		allScriptsArray = transform.parent.GetComponentsInChildren.<MonoBehaviour>() as MonoBehaviour[];
		for(var i = allScriptsArray.length - 1; i >= 0; i--){
			var thisScript : MonoBehaviour = allScriptsArray[i];
			if(thisScript.transform.parent != null){
				if(thisScript.transform.parent.name == "Head"){
					allScriptsArray.RemoveAt(i);	
					continue;
				}
				if(thisScript.transform.parent.name == "Root"){
					allScriptsArray.RemoveAt(i);
					continue;
				}
			}
			if(thisScript.transform == transform)				{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof StopFrictionDrag)			{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof ForceFriction)				{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof SquashPhysics)				{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof Squash)					{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof Health)					{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof IsGrounded)				{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof CartoonGravity)			{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof UVFrameGroups)				{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof RigidbodyAccelerationInfo) {allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof Shadow)					{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof FaceCameraFix)				{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof DefaultTransformUpdate)	{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof Lock2D)					{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof ColorControl)				{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof EnemyKeepDistance)			{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof ControllerInput)			{allScriptsArray.RemoveAt(i); continue;}
			if(thisScript instanceof PlayStillAnimation)		{allScriptsArray.RemoveAt(i); continue;}
		}
		disableOnDeath = allScriptsArray.ToBuiltin(MonoBehaviour) as MonoBehaviour[];
	}
}

function GoToIsland(){
	if(globalValues != null){
		globalValues.GetInventoryVals();
		globalValues.saveChanges = true;
		globalValues.setPlayerIslandPos = true;
	}

	UnityEngine.SceneManagement.SceneManager.LoadScene(islandLevelName);
}

function Restart(){
	UnityEngine.SceneManagement.SceneManager.LoadScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene().name);
}

function Update () {
	dead.Update();
	endLevel.Update();

	if(endLevel.current){
		if(Time.time > endLevel.toggledTrueTime + optionsDelayAfterDeath && !exitingScene){
			if(popupQuestion == null && !(globalValues != null && globalValues.quit)){
				MakePopupQuestion();
				popupQuestion_InputQ.showingSign.current = true;
				popupQuestion_InputQ.SetTextLine("restart?");
				question_Restart = true;
			}		
		}

		if(question_Restart){
			if(popupQuestion_InputQ != null && popupQuestion_InputQ.ready){
				if(globalValues != null){
					if(Input.GetKeyDown(globalValues.quitKey)){
						question_Restart = false;
						popupQuestion_InputQ.showingSign.current = false;
					}
				}

				if(controller.inputButtonA.down){
					popupQuestion_InputQ.showingSign.current = false;
					question_Restart = false;
					exitingScene = true;
					screenSpiral.enabled = true;
					screenSpiral.offsetMaterial.enabled = true;
					screenSpiral.open = false;

					Invoke("Restart", backToIslandDelay);				
				}
				if(controller.inputButtonB.down || controller.selectButton.down){
					popupQuestion_InputQ.showingSign.current = false;
					question_Restart = false;
					exitingScene = true;
					screenSpiral.enabled = true;
					screenSpiral.offsetMaterial.enabled = true;
					screenSpiral.open = false;

					Invoke("GoToIsland", backToIslandDelay);
				}		
			}
		}
	}

	if(!question_Restart){
		if(popupQuestion_InputQ != null && popupQuestion_InputQ.hidden){
			Destroy(popupQuestion);
		}
	}
	
	if(dead.toggledTrue){
		if(deathEndsLevel){
			endLevel.current = true;	
			if(deathAudio != null){
				deathAudio.Play();
			}
		}

		if(makeCatsCry){
			var allCats : GameObject[] = GameObject.FindGameObjectsWithTag(catTag);
			for(var catID : int = 0; catID < allCats.Length; catID ++){
				var thisCat : GameObject = allCats[catID];

				var frameGroups : UVFrameGroups = thisCat.GetComponentInChildren.<UVFrameGroups>();
				if(frameGroups != null){
					frameGroups.SetFrame("Eyes", "Closed");
					frameGroups.SetFrame("Mouth", "Open");
				}
				var sweat : SweatDropsParticles = thisCat.GetComponentInChildren.<SweatDropsParticles>();
				if(sweat != null){
					sweat.forceSweatDropUntil = Time.time + 3.0;
				}

			}
		}

		if(deathAnimation != null){
			deathAnimation.animationPlay.current = true;
		}

		if(removeTagWhenDead != null && removeTagWhenDead.Length > 0){
			var allChildren : Transform[] = transform.parent.GetComponentsInChildren.<Transform>();
			for(var i = 0; i < allChildren.Length; i++){
				for(var n = 0; n < removeTagWhenDead.Length; n++){
					if(allChildren[i].gameObject.tag == removeTagWhenDead[n]){
						Destroy(allChildren[i].gameObject);
					}
				}
			}
		}
		
		var pickUpRB : PickUpRigidbody = transform.parent.GetComponentInChildren(PickUpRigidbody);
		if(pickUpRB != null){
			pickUpRB.Drop();
		}
		
		SetDisableComponents(false);
		
		/*if(controller != null){
			controller.enabled = false;
			controller.inputAxis.current = Vector2.zero;
			controller.inputAxis.target = Vector2.zero;
			controller.inputButtonA.pressed = false;
			controller.inputButtonB.pressed = false;
		}*/
		
		if(frameGroups != null){
			if(faceAnim != null){
				faceAnim.disableUntil = Time.time + 1.0;
			}
			frameGroups.SetFrame("Eyes", "Sleep");
			frameGroups.SetFrame("Mouth", "Worried");
			frameGroups.SetFrame("Right Leg", "Side");
		}
		
		var capsCol : CapsuleCollider = transform.parent.GetComponent(CapsuleCollider);
		if(capsCol != null){
			capsCol.direction = colliderDir;
			capsCol.center = colliderCenter;
			capsCol.radius = colliderRadius;
		}
		
		if(setDisableComponentList != null){
			for(i = 0; i < setDisableComponentList.Length; i++){
				if(setDisableComponentList[i] != null){
					setDisableComponentList[i].enabled = false;
				}
			}
		}
		
		if(disableAllColliders){
			var allCols : Collider[];
			if(transform.parent != null){
				allCols = transform.parent.GetComponentsInChildren.<Collider>() as Collider[];
			} 
			for(n = 0; n < allCols.Length; n++){
				allCols[n].enabled = false;
			}
		}
		
		if(disableRB){
			if(transform.parent != null){
				var rb : Rigidbody = transform.parent.GetComponentInChildren.<Rigidbody>();
				if(rb != null){
					rb.useGravity = false;
					rb.isKinematic = true;
				}
			}
		}
	}
	
	if(dead.toggledFalse){
		SetDisableComponents(true);
		
		if(deathAnimation != null){
			deathAnimation.animationPlay.current = false;
			deathAnimation.animationComponent[deathAnimation.stillAnimation.name].enabled = false;
		}
		
		/*if(controller != null){
			controller.enabled = true;
			controller.inputAxis.current = Vector2.zero;
			controller.inputAxis.target = Vector2.zero;
			controller.inputButtonA.pressed = false;
			controller.inputButtonB.pressed = false;
		}*/
		
		if(frameGroups != null){
			frameGroups.SetFrame("Eyes", "Open");
			frameGroups.SetFrame("Mouth", "Closed");
			frameGroups.SetFrame("Right Leg", "Front");
		}
		
		capsCol = transform.parent.GetComponent(CapsuleCollider);
		if(capsCol != null){
			capsCol.direction = defColliderDir;
			capsCol.center = defColliderCenter;
			capsCol.radius = defColliderRadius;
		}	
		
		for(i = 0; i < setDisableComponentList.Length; i++){
			setDisableComponentList[i].enabled = true;
		}
		
		if(disableAllColliders){
			if(transform.parent != null){
				allCols = transform.parent.GetComponentsInChildren.<Collider>() as Collider[];
			} 
			for(n = 0; n < allCols.Length; n++){
				allCols[n].enabled = true;
			}
		}
		
		if(disableRB){
			if(transform.parent != null){
				rb = transform.parent.GetComponentInChildren.<Rigidbody>();
				if(rb != null){
					rb.useGravity = true;
					rb.isKinematic = false;
				}
			}
		}
		
		if( health.health <= 0) health.health = 1.0;
	}
	
	if(health.health <= 0 && !dead.current){
		dead.current = true;
	}
	
	if(frameGroups != null && dead.current && Time.time > dead.toggledTrueTime + closeMouthTriggerTime) frameGroups.SetFrame("Mouth", "Closed");
}

function SetDisableComponents(enabled : boolean){
	for(var i = 0; i < disableOnDeath.Length; i++){
		if(disableOnDeath[i] != null) disableOnDeath[i].enabled = enabled;
	}
}