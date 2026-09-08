#pragma strict

var key : KeyCode;

function Start () {

}

function Update () {
	if(Input.GetKeyDown(key)){
	    UnityEngine.SceneManagement.SceneManager.LoadScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene().name);//Application.LoadLevel(Application.loadedLevel);
	}
}