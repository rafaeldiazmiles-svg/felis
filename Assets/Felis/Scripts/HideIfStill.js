#pragma strict

var rend : Renderer;
@Space(30)
var useLocalPos : boolean;
var previousPos : Vector3;
@Space(30)
var hideDelay : float = 1.0;
var hideTimeLeft : float;
@Space(30)
var fadeOutSpeed : float = 2.0;
var fadeInSpeed : float = 8.0;
@Space(30)
var unHideOnClick : boolean;
@Space(30)
var deadZone : float = 0.01;

function Start () {
	if(rend == null){
		rend = GetComponent.<Renderer>();
	}
}

function Update () {
	var posChange : boolean;

	if(useLocalPos){
		if(Mathf.Abs((previousPos - transform.localPosition).magnitude) > deadZone){
			previousPos = transform.localPosition;
			posChange = true;
		}
		else{
			posChange = false;
		}
	}
	else{
		if(Mathf.Abs((previousPos - transform.position).magnitude) > deadZone){
			previousPos = transform.position;
			posChange = true;
		}
		else{
			posChange = false;
		}
	}

	if(unHideOnClick){
		if(Input.GetMouseButtonDown(0) || Input.GetMouseButtonDown(1)){
			posChange = true;
		}
	}

	if(posChange){
		hideTimeLeft = hideDelay;
	}
	else{
		hideTimeLeft = Mathf.MoveTowards(hideTimeLeft, 0, Time.deltaTime);
	}

	if(hideTimeLeft == 0.0){
		rend.material.color.a = Mathf.Lerp(rend.material.color.a, 0.0, fadeOutSpeed * Time.deltaTime);
	}
	else{
		rend.material.color.a = Mathf.Lerp(rend.material.color.a, 1.0, fadeInSpeed * Time.deltaTime);
	}
}