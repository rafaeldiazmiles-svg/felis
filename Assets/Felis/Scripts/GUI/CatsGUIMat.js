#pragma strict

var catGUImat : Material;

function Start () {
	var catsGUI : Cats = GameObject.FindObjectOfType.<Cats>();
	if(catsGUI != null){
		var rend : Renderer = catsGUI.gameObject.GetComponentInChildren.<Renderer>();
		if(rend != null){
			rend.material = catGUImat;
		}
	}
	
	Destroy(gameObject);
}
