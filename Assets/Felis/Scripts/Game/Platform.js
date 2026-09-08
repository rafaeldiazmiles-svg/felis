#pragma strict

enum PlatformType {Windows, Mac, iOS, AppleTV, Android}

var platform : PlatformType;
var detectPlatform : boolean;
var adaptToPlatform : boolean;
@Space(30)
var userController : ControllerInput;
var controllerFadeOut : FadeOut;

function FindUserController(){
	var controllers : ControllerInput[] = GameObject.FindObjectsOfType.<ControllerInput>();
	for(var controller in controllers){
		if(controller.controllerType == ControllerType.User){
			userController = controller;
			break;
		}
	}

	var fadeOuts : FadeOut[] = GameObject.FindObjectsOfType.<FadeOut>();
	for(var fadeOut in fadeOuts){
		if(fadeOut.transform.name.Contains("Controller")){
			controllerFadeOut = fadeOut;
			break;
		}
	}
}

function DetectPlatform(){
	#if UNITY_EDITOR_WIN
	platform = PlatformType.Windows;
	return;
	#endif

	#if UNITY_STANDALONE_WIN
	platform = PlatformType.Windows;
	return;
	#endif

	#if UNITY_EDITOR_OSX
	platform = PlatformType.Mac;
	return;
	#endif

	#if UNITY_STANDALONE_OSX
	platform = PlatformType.Mac;
	return;
	#endif

	#if UNITY_IOS
	platform = PlatformType.iOS;
	return;
	#endif

	#if UNITY_ANDROID
	platform = PlatformType.Android;
	return;
	#endif

	#if UNITY_TVOS
	platform = PlatformType.AppleTV;
	return;
	#endif
}

function Start () {
	GameObject.DontDestroyOnLoad(gameObject);
}

function Update () {
	if(userController == null){
		FindUserController();
	}

	if(userController != null){
		if(detectPlatform){
			detectPlatform = false;
			DetectPlatform();
		}

		if(adaptToPlatform){
			adaptToPlatform = false;

			AdaptToPlatform();
		}
	}
}

function AdaptToPlatform(){
	if(platform == PlatformType.Android || platform == PlatformType.iOS){
		userController.noMobileInput = false;
		userController.noMouseInput = true;
		controllerFadeOut.forceShow = true;
		controllerFadeOut.forceHide = false;
	}
	else{
		userController.noMouseInput = false;
		userController.noMobileInput = true;
		controllerFadeOut.forceShow = false;
		controllerFadeOut.forceHide = true;
	}

	var gVals : HoldGlobalValues = GameObject.FindObjectOfType.<HoldGlobalValues>();
	if(gVals != null){
		gVals.CreateCursor();
	}

	var disableByPlatforms : DisableByPlatform[] = GameObject.FindObjectsOfType.<DisableByPlatform>();
	for(var disableByPlatform in disableByPlatforms){
		disableByPlatform.Apply();
	}
}

function OnLevelWasLoaded(){
	adaptToPlatform = true;
} 