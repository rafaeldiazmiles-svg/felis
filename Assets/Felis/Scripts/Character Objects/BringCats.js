#pragma strict

var catA : Transform;
var catB : Transform;
var catC : Transform;

var cats : Cats;

var bringKey : KeyCode;

var allowGameInput : boolean;

var input : ControllerInput;



function Start () {
	input = GetComponentInChildren(ControllerInput);
	
	cats = Camera.main.transform.GetComponentInChildren.<Cats>();
}

function Update () {
	#if UNITY_EDITOR
	if(cats != null && cats.catIcons != null && cats.catIcons.Length > 0){
		if(catA == null && cats.catIcons[0].cat != null){
			catA = cats.catIcons[0].cat;
		}

		if(catB == null && cats.catIcons[1].cat != null){
			catB = cats.catIcons[1].cat;
		}

		if(catC == null && cats.catIcons[2].cat != null){
			catC = cats.catIcons[2].cat;
		}
	}
	
	if(Input.GetKeyDown(bringKey)){ // || allowGameInput && input.inputAxis.current.y < -.5 && input.inputButtonA.down){
		if(catA != null && input.inputAxis.current.x < -.5 || catA != null && input.inputAxis.current.magnitude < .1){
			catA.gameObject.SetActive(true);
			DelayedCatRestore(catA.gameObject, transform.position + Vector3(-1,2,catA.position.z));
		}

		if(catB != null && input.inputAxis.current.y < -.5 || catB != null && input.inputAxis.current.magnitude < .1){
			catB.gameObject.SetActive(true);
			DelayedCatRestore(catB.gameObject, transform.position + Vector3(0,2,catB.position.z));
		}

		if(catC != null && input.inputAxis.current.x > .5 || catC != null && input.inputAxis.current.magnitude < .1){
			catC.gameObject.SetActive(true);
			DelayedCatRestore(catC.gameObject, transform.position + Vector3(1,2,catC.position.z));
		}
	}

	#endif
}

function DelayedCatRestore(cat : GameObject, newCatPos : Vector3){
	yield;

	var pickableRB: PickableRigidbody = cat.GetComponentInChildren(PickableRigidbody);

	pickableRB.enabled = true;
	pickableRB.SetColliders(true);
	pickableRB.SetDisableComponents(true);
	pickableRB.pickable = true;
	pickableRB.rb.useGravity = true;
	pickableRB.rb.velocity = Vector3.zero;
	pickableRB.beingPicked.current = false;
	if(pickableRB.pickingObject != null){
		pickableRB.pickingObject.enabled = true;
		pickableRB.pickingObject.Drop();
	}

	var tied : CatTied = cat.GetComponentInChildren.<CatTied>();
	if(tied != null){
		tied.tied.current = false;
	}

	var tomb : JumpOutTomb = cat.GetComponentInChildren.<JumpOutTomb>();
	if(tomb != null){
		tomb.zpos.zPosition = tomb.setZ;
		tomb.open.current = true;
		tomb.SetNormalValues();
		tomb.open.current = true;
	}

	cat.transform.position = newCatPos;
	var maxRBDelta : MaxRigidbodyDeltaPos = cat.GetComponentInChildren(MaxRigidbodyDeltaPos);
	maxRBDelta.previousPosition = cat.transform.position;

	cat.GetComponentInChildren.<Caged>().isCaged = false;
}