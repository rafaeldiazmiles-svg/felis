#pragma strict

var frameGroups : UVFrameGroups;
var timeLeft : float;
var maxTime : float = 3.0;
@Space(30)
var currentDigit1 : int;
var currentDigit2 : int;
var currentDigit3 : int;
@Space(30)
var target : Transform;
var targetHealth : Health;
var currentTargetScreenPos : Vector3;
var currentScreenPos : Vector3;
var startingZCameraDistance : float;
var posMargin : Vector2 = Vector2(.1,.15);
var screenOffset : Vector3;
@Header("-----------------Direction------------------")
var directionBone : Transform;
var directionBoneDanger : Transform;
var currentAngle : float;
var defaultDBoneRot : Quaternion;
var defaultDBoneDangerRot : Quaternion;
var directionBoneScaleControl : Vector3Lerp;
var directionBoneDangerScaleControl : Vector3Lerp;
@Space(30)
var targetIsOutOfScreen : ToggleBoolean;
var criticalTime : ToggleBoolean;
var criticalTimeMark : float = 1.5;
@Header("-----------------Exclamation------------------")
var exclamationBone : Transform;
var exclamationBoneScaleControl : Vector3Lerp;
var exclamationBoneShowScale : Vector3 = Vector3.one;
var exclamationBoneHideScale : Vector3 = Vector3.zero;
var exclamationHideScale : ToggleBoolean;
@Header("----------------Cross------------------")
var crossBone : Transform;
var crossBoneScaleControl : Vector3Lerp;
var catIsGone : ToggleBoolean;
var crossBoneShowScale : Vector3 = Vector3.one;
var crossBoneHideScale : Vector3 = Vector3.zero;
var crossHideScale : ToggleBoolean;
@Space(30)
var currentAlpha : FloatLerp;
var meshRendererDirection : SkinnedMeshRenderer;
var meshRendererItems : SkinnedMeshRenderer;
var meshRendererFace : Renderer;
var itemsAlpha : FloatLerp;

var colorPropertyName : String = "_Color";
@Space(30)
var enableDestroy : ToggleBoolean;
var destroyDelay : float = 1.0;
var beginDestroy : boolean = true;
@Space(30)
var pickableRb : PickableRigidbody;
@Space(30)
var gCats : Cats;
var catsIconID : int;

function Start () {
	//frameGroups = GetComponentInChildren(UVFrameGroups);
	//meshRendererDirection = GetComponentInChildren(SkinnedMeshRenderer);

	gCats = transform.parent.GetComponentInChildren.<Cats>();

	startingZCameraDistance = Vector3.Distance(transform.position, Camera.main.transform.position);
	
	if(target != null){
		pickableRb = target.GetComponentInChildren(PickableRigidbody);
		if(pickableRb != null) pickableRb.losingCat = this;
	}

	defaultDBoneRot = directionBone.localRotation;
	defaultDBoneDangerRot = directionBoneDanger.localRotation;
}



function LateUpdate () {
	
	if(target != null){
		if(targetHealth == null){
			targetHealth = target.GetComponentInChildren.<Health>();
		}

		//Digital counter.
		currentDigit1 = Mathf.FloorToInt(timeLeft);
		currentDigit2 = Mathf.FloorToInt((timeLeft*10)%10);
		currentDigit3 = Mathf.FloorToInt((timeLeft*100)%10);

		if(frameGroups != null){
			frameGroups.SetFrame(0,currentDigit1);
			frameGroups.SetFrame(1,currentDigit2);
			frameGroups.SetFrame(2,currentDigit3);
		}

		//Position.
		currentTargetScreenPos = Camera.main.WorldToViewportPoint(target.position);
		
		currentScreenPos = currentTargetScreenPos;
		
		currentScreenPos += screenOffset;
		
		currentScreenPos.x = Mathf.Clamp(currentScreenPos.x,posMargin.x,1 - posMargin.x);
		currentScreenPos.y = Mathf.Clamp(currentScreenPos.y,posMargin.y, 1 - posMargin.y);
		
		transform.position = Camera.main.ViewportToWorldPoint(Vector3(currentScreenPos.x,currentScreenPos.y,startingZCameraDistance));
		
		//Angle
		currentAngle = Mathf.Rad2Deg * Mathf.Atan2(currentScreenPos.y - .5, currentScreenPos.x - .5);
		directionBone.localRotation = defaultDBoneRot;
		directionBone.RotateAround(directionBone.position, Vector3.forward, -currentAngle);

		directionBoneDanger.localRotation = defaultDBoneDangerRot;
		directionBoneDanger.RotateAround(directionBoneDanger.position, Vector3.forward, -currentAngle);

		if(enableDestroy.current){
			directionBoneScaleControl.target = Vector3.zero;
			directionBoneDangerScaleControl.target = Vector3.one;
			itemsAlpha.target = 1.0 * currentAlpha.current;
		}
		else{
			directionBoneScaleControl.target = Vector3.one;
			directionBoneDangerScaleControl.target = Vector3.zero;
			itemsAlpha.target = 0.0;
		}

		directionBoneScaleControl.Lerp();
		directionBoneDangerScaleControl.Lerp();
		directionBone.localScale = directionBoneScaleControl.current;
		directionBoneDanger.localScale = directionBoneDangerScaleControl.current;

		//Timer
		if(currentTargetScreenPos.x < 0 || currentTargetScreenPos.x > 1 || currentTargetScreenPos.y < 0 || currentTargetScreenPos.y > 1){
			targetIsOutOfScreen.current = true;
		}
		else{ 
			targetIsOutOfScreen.current = false;
		}
			
		targetIsOutOfScreen.Update();
		
		if(enableDestroy.current && targetIsOutOfScreen.current){
			timeLeft = Mathf.MoveTowards(timeLeft, 0, Time.deltaTime);
		}
		else{
			timeLeft = maxTime;
		}
		
		//Exclamation.
		if(timeLeft < criticalTimeMark){
			criticalTime.current = true;
		}
		else{
			criticalTime.current = false;
		}

		criticalTime.Update();
		
		if(criticalTime.toggledTrue){
			exclamationBoneScaleControl.target = exclamationBoneShowScale;
		}
			
		if(criticalTime.toggledFalse || catIsGone.toggledTrue){
			exclamationBoneScaleControl.target = exclamationBoneHideScale;
		}
		
		exclamationBoneScaleControl.Lerp();
		exclamationBone.localScale = exclamationBoneScaleControl.current;
		
		if(exclamationBone.localScale.magnitude < .1){
			exclamationHideScale.current = true;
		}
		else{
			exclamationHideScale.current = false;
		}
		exclamationHideScale.Update();
		
		//Cross.
		if(timeLeft == 0){
			catIsGone.current = true;
		}
		else{
			catIsGone.current = false;
		}
		catIsGone.Update();
		
		if(catIsGone.toggledTrue){
			crossBoneScaleControl.target = crossBoneShowScale;
		}
			
		if(catIsGone.toggledFalse){
			crossBoneScaleControl.target = crossBoneHideScale;
		}
		
		crossBoneScaleControl.Lerp();
		crossBone.localScale = crossBoneScaleControl.current;
		
		if(crossBone.localScale.magnitude < .1){
			crossHideScale.current = true;
		}
		else{
			crossHideScale.current = false;
		}
		crossHideScale.Update();

	}	
	
	//GUI Alpha.
	if(targetIsOutOfScreen.current && gCats.catIcons[catsIconID].rescued.current){// || (enableDestroy.toggledTrue && targetIsOutOfScreen.current)){
		currentAlpha.target = 1.0;
	}

	if(!targetIsOutOfScreen.current || beginDestroy || target == null || !gCats.catIcons[catsIconID].rescued.current || targetHealth != null && targetHealth.health <= 0.0){ //|| !enableDestroy.current){
		currentAlpha.target = 0.0;
	}

		
	currentAlpha.Lerp();
	itemsAlpha.Lerp();
	//meshRendererDirection.material.SetColor(colorPropertyName, Color(1,1,1,currentAlpha.current));
	meshRendererDirection.material.color = Color(1,1,1,currentAlpha.current);
	meshRendererItems.material.color = Color(1,1,1,itemsAlpha.current);
	meshRendererFace.material.color = Color(1,1,1,currentAlpha.current);

	meshRendererDirection.enabled = (currentAlpha.current > .1);
	meshRendererItems.enabled = (itemsAlpha.current > .1);
	meshRendererFace.enabled = (currentAlpha.current > .1);

	
	//Destroy
	enableDestroy.Update();
	
	if(enableDestroy.current && beginDestroy == false && target!= null){
		if(timeLeft == 0 && targetIsOutOfScreen.current && Time.time > catIsGone.toggledTrueTime + destroyDelay){
			beginDestroy = true;
		}
	}
	
	if(target != null && timeLeft > 0){
		beginDestroy = false;
	}
	
	if(beginDestroy && currentAlpha.current < .1 && timeLeft == 0){
		Debug.Log("Cat destroyed @ " + Time.time + "name: " + target.name);
		Destroy(gameObject);
		if(pickableRb != null && pickableRb.pickingObject != null && pickableRb.pickingObject.character != null){
			Destroy(pickableRb.pickingObject.character.gameObject);
		}
		Destroy(target.gameObject);
	}
		
}