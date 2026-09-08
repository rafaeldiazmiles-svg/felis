#pragma strict

var level : String;

function Start () {
    //Application.LoadLevelAdditive(level);
    UnityEngine.SceneManagement.SceneManager.LoadScene(level, UnityEngine.SceneManagement.LoadSceneMode.Additive);
}

function Update () {

}