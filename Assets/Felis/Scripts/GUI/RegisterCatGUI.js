#pragma strict

var losingCatName : String = "Losing Cat A";
var catsName : String = "Gameplay GUI/GUI Cats";
var catsIconID : int = 0;

var setHeadMesh : Mesh;

var iconTextureName : String = "_BlendTex";

var noReg : boolean;

function NoReg(){
	noReg = true;
}

function SetRegVal(catVal : int){
	switch (catVal){
		case 0:
			losingCatName = "Losing Cat A";
			catsIconID = 0;
		break;
		
		case 1:
			losingCatName  = "Losing Cat B";
			catsIconID = 1;
		break;
	
		case 2:
			losingCatName  = "Losing Cat C";
			catsIconID = 2;
		break;
	}
}



function Start () {
	if(!noReg){
		//Cat Compass
		var losingCatObj : Transform = Camera.main.transform.Find(losingCatName);
		if(losingCatObj != null){
			var losingCat : LosingCat = losingCatObj.GetComponent.<LosingCat>();
			if(losingCat != null){
				if(losingCat.target != null){
					Debug.Log("Cat Losing Cat marker being used for this cat: " + transform.parent.name);
				}
				else{
					losingCat.target = transform.parent;

					if(transform.parent.GetComponentInChildren.<Renderer>().material.HasProperty(iconTextureName)){
						losingCat.meshRendererFace.material.mainTexture = transform.parent.GetComponentInChildren.<Renderer>().material.GetTexture(iconTextureName);
					}
					else{
						losingCat.meshRendererFace.material.mainTexture = transform.parent.GetComponentInChildren.<Renderer>().material.mainTexture;
					}

					if(setHeadMesh != null){
						losingCat.meshRendererFace.gameObject.GetComponent.<MeshFilter>().mesh = setHeadMesh;
					}

					losingCat.catsIconID = catsIconID;
				}
			}
		}

		//Cat head icons
		var catsObj : Transform = Camera.main.transform.Find(catsName);
		if(catsObj != null){
			var cats : Cats = catsObj.GetComponent.<Cats>();
			if(cats != null){
				if(cats.catIcons[catsIconID].cat != null){
					Debug.Log("Cat Icon being used for this cat: " + transform.parent.name);
				}
				else{
					cats.catIcons[catsIconID].cat = transform.parent;
					cats.catIcons[catsIconID].catHealth = transform.parent.GetComponentInChildren.<Health>();
					cats.catIcons[catsIconID].caged = transform.parent.GetComponentInChildren.<Caged>();
					cats.catIcons[catsIconID].tied = transform.parent.GetComponentInChildren.<CatTied>();

					if(transform.parent.GetComponentInChildren.<Renderer>().material.HasProperty(iconTextureName)){
						cats.catIcons[catsIconID].bone.GetComponentInChildren.<Renderer>().material.mainTexture = transform.parent.GetComponentInChildren.<Renderer>().material.GetTexture(iconTextureName);
					}
					else{
						cats.catIcons[catsIconID].bone.GetComponentInChildren.<Renderer>().material.mainTexture = transform.parent.GetComponentInChildren.<Renderer>().material.mainTexture;
					}

					if(setHeadMesh != null){
						cats.catIcons[catsIconID].bone.GetComponentInChildren.<MeshFilter>().mesh = setHeadMesh;
						cats.catIcons[catsIconID].changedMesh = true;
					}

				}
			}
		}
		
		var pickableRB : PickableRigidbody = transform.parent.GetComponentInChildren.<PickableRigidbody>();
		if(pickableRB != null && losingCat != null){
			pickableRB.losingCat = losingCat;
			losingCat.pickableRb = pickableRB;
		}
		
		Destroy(gameObject);
	}
}
