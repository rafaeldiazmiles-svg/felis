#pragma strict

var bones : Transform[];
var bonesPushedX : FloatSmoothDamp[];
var bonesDefaultX : float[];
var bonesDefaultLocalY : float[];
var bonesDefaultRotation : Quaternion[];
var bonesInertiaRotation : FloatSmoothDamp[];
var bonesPreviousX: float[];

var rigidbodyList : Rigidbody[];
var rigidbodyStrength : float = 1.0;

var restoreShape : float  = .1;

var smoothTime : float = 2.0;

var maxPush : float = 5.0;

var waveSpeed : float = 1.0;
var waveSize : float = 1.0;
var waveLengthX : float = 1.0;
var waveLengthY : float = 1.0;

var rotationInertia = 1.0;
var rotationTime = .3;
function Start () {
	var bonesArray = new Array();
	bonesArray = GetComponentsInChildren.<Transform>() as Transform[];
	for(var i = 0; i < bonesArray.length; i++) if(bonesArray[i] == transform) bonesArray.RemoveAt(i);
	bones = bonesArray.ToBuiltin(Transform) as Transform[];
	SortByYPosition(bones);
	
	/*var affectGrassTags : GameObject[] = GameObject.FindGameObjectsWithTag("Affect Grass");
	rigidbodyList = new Rigidbody[affectGrassTags.Length];
	for(i = 0; i < rigidbodyList.Length; i++)
		rigidbodyList[i] = affectGrassTags[i].transform.parent.GetComponent(Rigidbody);*/
	GetRigidbodyList();
		

	bonesPushedX = new FloatSmoothDamp[bones.Length];
	bonesDefaultX = new float[bones.Length];
	bonesDefaultLocalY = new float[bones.Length];
	bonesDefaultRotation = new Quaternion[bones.Length];
	bonesInertiaRotation = new FloatSmoothDamp[bones.Length];
	bonesPreviousX = new float[bones.Length];
	
	for(i = 0; i < bones.Length; i++){
		bonesPushedX[i] = new FloatSmoothDamp();
		bonesPushedX[i].time = smoothTime;
		
		bonesDefaultX[i] = bones[i].position.x;
		if(i == 0) bonesDefaultLocalY[i] = bones[i].position.y;
		else bonesDefaultLocalY[i] = bones[i].position.y - bones[i-1].position.y;
		
		bonesPreviousX[i]=bones[i].position.x;
		bonesDefaultRotation[i] = bones[i].rotation;
		
		bonesInertiaRotation[i] = new FloatSmoothDamp();
		bonesInertiaRotation[i].time = rotationTime;
	}
}

function Update () {
	for(var n = 0; n < bones.Length; n++){
		for(var i = 0; i < rigidbodyList.Length; i++){
			if(rigidbodyList[i] == null) GetRigidbodyList();
			else{
				var distance : float = Vector3.Distance(rigidbodyList[i].position, bones[n].position);
				if(Mathf.Sign(bones[n].position.x - rigidbodyList[i].position.x) != Mathf.Sign(rigidbodyList[i].velocity.x)){
					var xForce : float = Mathf.Max(0,Mathf.Abs(rigidbodyList[i].velocity.x) - Mathf.Pow(distance,2) ) * Mathf.Sign(rigidbodyList[i].velocity.x);
					bonesPushedX[n].target += xForce * rigidbodyStrength *Time.deltaTime;
					bonesPushedX[n].target = Mathf.Clamp(bonesPushedX[n].target,-maxPush,maxPush);
					bonesPushedX[n].target = Mathf.Lerp(bonesPushedX[n].target, 0, restoreShape);
					DebugUtility.DrawArrow(bones[n].position, Vector3.right * bonesPushedX[n].target);
				}
				
			}
		}
		
		bonesPushedX[n].target = Mathf.Lerp(bonesPushedX[n].target, 0, Time.deltaTime * restoreShape);
		bonesPushedX[n].time = smoothTime ;
		bonesPushedX[n].SmoothDamp();
		
		bones[n].position.x = bonesDefaultX[n] + bonesPushedX[n].current; //Push.
		bones[n].position.x += Mathf.Sin(Time.time * waveSpeed + bones[n].position.x * waveLengthX + bones[n].position.y * waveLengthY)*waveSize;//Wave motion.
		
		if(n == 0) bones[n].position.y = bonesDefaultLocalY[n];
		else bones[n].position.y = bones[n-1].position.y + bonesDefaultLocalY[n] - Mathf.Pow(Mathf.Abs(bones[n].position.x - bones[n-1].position.x),2)*.7;
		
		//Rotation.
		var xVelocity : float = (bones[n].position.x - bonesPreviousX[n]) / Time.deltaTime;
		bonesPreviousX[n] = bones[n].position.x;
		
		bonesInertiaRotation[n].target = Mathf.Pow(Mathf.Abs(xVelocity),2) * Mathf.Sign(xVelocity) * rotationInertia;
		
		bonesInertiaRotation[n].SmoothDamp();
		
		bones[n].rotation = bonesDefaultRotation[n];
		bones[n].RotateAround(bones[n].position, Vector3.forward, bonesInertiaRotation[n].current);
	}
	
}

function GetRigidbodyList(){
	var affectGrassTags : GameObject[] = GameObject.FindGameObjectsWithTag("Affect Grass");
	rigidbodyList = new Rigidbody[affectGrassTags.Length];
	for(var i = 0; i < rigidbodyList.Length; i++)
		rigidbodyList[i] = affectGrassTags[i].transform.parent.GetComponent(Rigidbody);
}

function SortByYPosition(transformArray : Transform[]){
	var doAgain : boolean = false;
	for(var i = 0; i < transformArray.Length -1; i++){
		if(transformArray[i+1].position.y < transformArray[i].position.y){
			var hold : Transform = transformArray[i];
			transformArray[i] = transformArray[i+1];
			transformArray[i+1] = hold;
			doAgain = true;
		}
	}
	if(doAgain) SortByYPosition(transformArray);
}