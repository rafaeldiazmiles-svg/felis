#pragma strict

var screenPosition : Vector2;
var cameraDistance : float = 1.5;
@Space(30)
var point3D : Transform;
var useX : boolean;
var useY : boolean;
@Space(30)
var lateUpdate : boolean;
@Space(30)
var mousePosition : boolean;

function Start () {

}

function SetPos(){
	var useSP : Vector2 = screenPosition;

	if(!mousePosition){
		if(point3D != null){
			if(useX){
				useSP.x = Camera.main.WorldToScreenPoint(point3D.position).x / Screen.width;
			}
			if(useY){
				useSP.y = Camera.main.WorldToScreenPoint(point3D.position).y / Screen.height;
			}
		}

		useSP.x *= Screen.width;
		useSP.y *= Screen.height;
	}
	else{
		useSP = Input.mousePosition;
	}

	transform.position = Camera.main.ScreenToWorldPoint(Vector3(useSP.x, useSP.y,cameraDistance));	
}

function Update () {
	if(!lateUpdate){
		SetPos();
	}
}

function LateUpdate(){
	if(lateUpdate){
		SetPos();
	}
}