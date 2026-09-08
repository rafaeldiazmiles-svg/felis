#pragma strict

var enterLevelFirstTimeHint : SizeShowHide;
var willEnterLevelFirstTime : ToggleBoolean;
var enterFirstTimeHintWaitDuration : float = 2.0;

var saveLoad : SaveLoad;
var startScreen : StartScreen;

function Start () {
    saveLoad = GameObject.FindObjectOfType.<SaveLoad>();
    startScreen = GameObject.FindObjectOfType.<StartScreen>();
}

function Update () {
    if(startScreen.currentLevel == 1 && !startScreen.IsLevelAvailable(2) && saveLoad.GetCatsSaved() == 0 
        && !startScreen.question_EnterThisLevel){
        willEnterLevelFirstTime.current = true;
    }
    else{
        willEnterLevelFirstTime.current = false;
    }

    willEnterLevelFirstTime.Update();

    if(willEnterLevelFirstTime.current == true && Time.time > willEnterLevelFirstTime.toggledTrueTime + enterFirstTimeHintWaitDuration){
        enterLevelFirstTimeHint.show.current = true;
    }
    else{
        enterLevelFirstTimeHint.show.current = false;
    }
}