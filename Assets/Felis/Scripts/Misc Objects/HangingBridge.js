#pragma strict

var boards : Transform[];
var useChildren : boolean;
var defaultBoardsPosition : Vector3[];
var boardsDefaultRotation : Quaternion[];
var maxXPosition : float;
var minXPosition : float;
var bridgeLength : float;

@Header("---------------------Bridge Force---------------")
@Space(30)

var bridgeForce : float;
var bridgeTransferForce : float;
var bridgePreserveShapeCurve : AnimationCurve;
var bridgePreserveShapeExponent : float;
var offsetY : float;

@Header("---------------------Swing end of bridge---------------")
@Space(30)


var endSwingMultiplier : float = 1.0;
var swingTime : float = .1;
var bridgeStartSwing : FloatSmoothDamp;
var bridgeEndSwing : FloatSmoothDamp;
var bridgeStart : Transform;
var bridgeEnd : Transform;

var bridgeStartDefaultPosition : Vector3;
var bridgeEndDefaultPosition : Vector3;
var bridgeStartDefaultRotation : Quaternion;
var bridgeEndDefaultRotation : Quaternion;

@Header("---------------------Disable and enable functions--------------")
@Space(30)
var boardAngle : boolean;
var vForce : boolean;
var endsSwing : boolean;

@Header("---------------Break--------------------")

var boardAlpha : VColorGroupAlpha;
var breakBoards : BreakBoard[];

class BreakBoard{
	var color : Color;
	var setAlphaGroup : ControlCGroupAlpha;
	var hasAlphaGroup : boolean;
	var fall : MakeFall;
	var broken : boolean;
	var wasBroken : boolean;
	var settedFirstFrame : boolean;
	var sound : AudioSource;
	var boardPrefab : GameObject;
	var boardVelocity : Vector3;
	var boardVelocityRnd : Vector3;
	var boardAngularVel : Vector3;
	var boardAngularVelRnd : Vector3;
	
	function Update(boardAlpha : VColorGroupAlpha){
		if(fall.toggledTrue){
			broken = true;
		}
		
		if(!settedFirstFrame || wasBroken != broken){
			settedFirstFrame = true;
			wasBroken = broken;
			
			if(!hasAlphaGroup){
				for(var n = 0; n < boardAlpha.setAlphaGroups.Length; n++){
					if(color == boardAlpha.setAlphaGroups[n].color){
						setAlphaGroup = boardAlpha.setAlphaGroups[n];
						hasAlphaGroup = true;
						break;
					}
				}
			}
			
			if(hasAlphaGroup){
				if(broken){
					setAlphaGroup.alpha = 0.0;
					//fall.disable = false;
					if(sound != null){
						sound.Play();
					}
					if(boardPrefab != null){
						var brokebBoards : GameObject = GameObject.Instantiate(boardPrefab);
						brokebBoards.transform.position = fall.transform.position;
						var rbs : Rigidbody[] = brokebBoards.transform.GetComponentsInChildren.<Rigidbody>();
						for(var w = 0; w < rbs.Length; w++){
							rbs[w].velocity = boardVelocity;
							rbs[w].velocity += Vector3.Scale(Random.insideUnitSphere, boardVelocityRnd);
							//rbs[w].AddTorque = boardAngularVel;
							rbs[w].AddTorque(Vector3.Scale(Random.insideUnitSphere, boardAngularVelRnd));
						}
					}
				}
				else{
					setAlphaGroup.alpha = 1.0;
					//fall.disable = true;
				}
			}
		}
	}
}

function Start () {
	boardAlpha = transform.parent.GetComponentInChildren.<VColorGroupAlpha>();
	
	if(useChildren){
		//var boardsWithParent : Transform[]= GetComponentsInChildren.<Transform>();
		//boards = new Transform[boardsWithParent.Length - 1];
		boards = new Transform[transform.childCount];
		//var n : int = 0;
		for(var i = 0; i < transform.childCount; i++){
			//if(boardsWithParent[i] == transform) continue;
			boards[i] = transform.GetChild(i);
			//n++;
		}
	}
	SortByXPosition(boards);
	defaultBoardsPosition = new Vector3[boards.Length];
	boardsDefaultRotation = new Quaternion[boards.Length];
	maxXPosition = boards[boards.Length - 1].position.x;
	minXPosition = boards[0].position.x;
	bridgeLength = 	maxXPosition - minXPosition;
	for(i = 0; i < boards.Length; i++){
		defaultBoardsPosition[i] = boards[i].position;
		boardsDefaultRotation[i] = boards[i].rotation; 
	}
	
	bridgeStartDefaultPosition = bridgeStart.position;
	bridgeEndDefaultPosition = bridgeEnd.position;
	
	bridgeStartDefaultRotation = bridgeStart.rotation;
	bridgeEndDefaultRotation = bridgeEnd.rotation;
	
	bridgeStartSwing = new FloatSmoothDamp();
	bridgeEndSwing = new FloatSmoothDamp();
}

function FixedUpdate () {
	//Vertical force.
	if(vForce){
		for(var i = 0; i < boards.Length; i++){
			var boardNormalizedX : float = Mathf.Lerp(0.0, 1.0, (boards[i].position.x - minXPosition) / bridgeLength);
			var bridgePreserveShape : float = bridgePreserveShapeCurve.Evaluate(boardNormalizedX) * bridgeForce;
			PhysicsUtility.ApplyForceForPosition(boards[i].GetComponent.<Rigidbody>(), defaultBoardsPosition[i] + Vector3.up * offsetY, bridgePreserveShape, bridgePreserveShapeExponent);
			
			if(i < boards.Length - 1){
				boards[i].GetComponent.<Rigidbody>().AddForce( Vector3.up * (boards[i+1].position.y - boards[i].position.y) * bridgeTransferForce);
			}
			
			if(i > 0){
				boards[i].GetComponent.<Rigidbody>().AddForce( Vector3.up * (boards[i-1].position.y - boards[i].position.y) * bridgeTransferForce);
			}
		}
	}
}

function MaintainXPos(){
	for(var i = 0; i < boards.Length; i++){
		boards[i].position.x = defaultBoardsPosition[i].x;
	}
}

function Update(){
	//Break Boards.
	for(var l = 0; l < breakBoards.Length; l++){
		breakBoards[l].Update(boardAlpha);
	}
	
	//Maintain X pos.
	MaintainXPos();
	
	//Board angle.
	if(boardAngle){
		for(var i = 0; i < boards.Length; i++){
			var leftBoardAngle : float;
			var rightBoardAngle : float;
			
			if(i > 0) leftBoardAngle = Mathf.Atan2(boards[i-1].position.y - boards[i].position.y, boards[i-1].position.x - boards[i].position.x) * Mathf.Rad2Deg;
			
			if(i < boards.Length -1) rightBoardAngle = Mathf.Atan2(boards[i].position.y - boards[i+1].position.y, boards[i].position.x - boards[i+1].position.x) * Mathf.Rad2Deg;
			
			var angle : float = (rightBoardAngle + leftBoardAngle) * .5;
			
			boards[i].rotation = boardsDefaultRotation[i];
			boards[i].RotateAround(boards[i].position, Vector3.forward, angle);
		}
	}
	
	//Bridge ends swing.
	if(endsSwing){
		bridgeStartSwing.time = swingTime;
		bridgeEndSwing.time = swingTime;
				
		bridgeStartSwing.target = (boards[0].position.y - defaultBoardsPosition[0].y) * endSwingMultiplier;
		bridgeEndSwing.target = (boards[boards.Length-1].position.y - defaultBoardsPosition[boards.Length-1].y) * endSwingMultiplier;
		
		bridgeStartSwing.SmoothDamp();
		bridgeEndSwing.SmoothDamp();
		
		bridgeStart.position = bridgeStartDefaultPosition;
		bridgeEnd.position = bridgeEndDefaultPosition;
		bridgeStart.rotation = bridgeStartDefaultRotation;
		bridgeEnd.rotation = bridgeEndDefaultRotation;
		
		bridgeStart.RotateAround(bridgeStart.position, -Vector3.forward, bridgeStartSwing.current);
		bridgeEnd.RotateAround(bridgeEnd.position, Vector3.forward, bridgeEndSwing.current);
	}
}

function SortByXPosition(transformArray : Transform[]){
	var doAgain : boolean = false;
	for(var i = 0; i < transformArray.Length -1; i++){
		if(transformArray[i+1].position.x > transformArray[i].position.x){
			var hold : Transform = transformArray[i];
			transformArray[i] = transformArray[i+1];
			transformArray[i+1] = hold;
			doAgain = true;
		}
	}
	if(doAgain) SortByXPosition(transformArray);
}
