#pragma strict

var stairCharacters : StairCharacter[];

var invert : boolean;

var bounds : Bounds;

var tagList : String[];
var getCharsTimer : Timer;

var defaultVals : StairCharacter;

class StairCharacter{
	var character : Transform;
	var characterHealth : Health;
	var isGrounded : IsGrounded;
	var rb : Rigidbody;
	var sideMovement : SideMovement;
	var groundAndle : GroundAngle;
	
	var tag : String;
	var name : String;
	
	var maxDeltaPos : MaxRigidbodyDeltaPos;
	var sideMovementAnimation : SideMovementAnimation; //To disable almost fall.
	
	var minHeight : float;
	//var targetHeight : float;
	var heightSpeed : float;
	var useGlobalBounds : boolean;
	var bounds : Bounds;
	
	var from : Direction;
	var going : Direction;
	var secondHalf : boolean;
	
	var debug : boolean;
	
	var relativePos : Vector3;
	
	var switchAt : float;
	
	var previousCharacterSide : int;
	
	var halfStairBias : float;
	
	var hasCharacter : boolean;
}
 
function GetStairCharacters(){
	var stairCharactersArray : Array = new Array();
	for(var m = 0; m < stairCharacters.Length; m++){
		if(stairCharacters[m].character != null){
			stairCharactersArray.Push(stairCharacters[m]);
		}
	}
	
	for(var i = 0; i < tagList.Length; i++){
		var tagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(tagList[i]);
		for(var n = 0; n < tagObjs.Length; n++){
			if(!StairHasObj(tagObjs[n])){
				stairCharactersArray.Push(MakeNewStairChar(tagObjs[n]));
			}
		}
	}
	
	stairCharacters = stairCharactersArray.ToBuiltin(StairCharacter) as StairCharacter[];
}

function MakeNewStairChar(obj : GameObject) : StairCharacter{
	var newStairChar : StairCharacter = new StairCharacter();
	newStairChar.character = obj.transform;
	newStairChar.characterHealth = obj.GetComponentInChildren.<Health>();
	newStairChar.maxDeltaPos = obj.GetComponentInChildren.<MaxRigidbodyDeltaPos>();
	newStairChar.sideMovementAnimation = obj.GetComponentInChildren.<SideMovementAnimation>();
	newStairChar.isGrounded = obj.GetComponentInChildren.<IsGrounded>();
	newStairChar.rb = obj.GetComponentInChildren.<Rigidbody>();
	newStairChar.sideMovement = obj.GetComponentInChildren.<SideMovement>();
	newStairChar.groundAndle = obj.GetComponentInChildren.<GroundAngle>();
	
	newStairChar.minHeight   			  = defaultVals.minHeight;
	//newStairChar.targetHeight 			  = defaultVals.targetHeight;
	newStairChar.heightSpeed  		      = defaultVals.heightSpeed;
	newStairChar.useGlobalBounds		  = defaultVals.useGlobalBounds;
	newStairChar.bounds        			  = defaultVals.bounds;
	newStairChar.from        			  = defaultVals.from;
	newStairChar.going      			  = defaultVals.going;
	newStairChar.secondHalf   			  = defaultVals.secondHalf;
	newStairChar.debug                    = defaultVals.debug;
	newStairChar.relativePos              = defaultVals.relativePos;
	newStairChar.switchAt                 = defaultVals.switchAt;
	newStairChar.previousCharacterSide    = defaultVals.previousCharacterSide;
	newStairChar.halfStairBias            = defaultVals.halfStairBias;
	
	newStairChar.tag = obj.tag;
	newStairChar.name = obj.name;

	var movAI : MovementAI = obj.GetComponentInChildren.<MovementAI>();
	if(movAI != null){
		movAI.GetStairs();
	}
	else{
		Debug.Log(obj.name + " does not have MovementAI.js to gather stairs.");
	}

	return newStairChar;
}

function StairHasObj(obj : GameObject) : boolean{
	for(var m = 0; m < stairCharacters.Length; m++){
		if(stairCharacters[m].character == obj.transform){
			return true;
		}
	}
	return false;
}

function Start () {
	if(getCharsTimer.every == 0.0){
		getCharsTimer.every = 4.0;
	}
	
	GetStairCharacters();
}

function Update () {
	getCharsTimer.Update();
	if(getCharsTimer.current){
		GetStairCharacters();
	}

	for(var i = 0; i < stairCharacters.Length; i++){
		if(stairCharacters[i].character == null){
			continue;
		}
		
		if(stairCharacters[i].hasCharacter){
			if(stairCharacters[i].sideMovementAnimation != null){
				stairCharacters[i].sideMovementAnimation.stairsCancelAlmostFalling = true;
			}
			if(stairCharacters[i].groundAndle != null){
				stairCharacters[i].groundAndle.setZeroUntil = Time.time + .5;
			}
		}		
		
		var character : Transform = stairCharacters[i].character;
		
	
		var useBounds : Bounds;
		if(stairCharacters[i].useGlobalBounds) useBounds = bounds;
		else useBounds = stairCharacters[i].bounds;
								
		stairCharacters[i].minHeight = Mathf.Clamp(stairCharacters[i].minHeight,
		useBounds.min.y,useBounds.max.y);
		
		stairCharacters[i].relativePos  = character.position - useBounds.center;
		stairCharacters[i].relativePos.x /= useBounds.size.x;
		stairCharacters[i].relativePos.y /= useBounds.size.y;
		stairCharacters[i].relativePos.z /= useBounds.size.z;
		
		stairCharacters[i].relativePos.x += .5;
		
		if(stairCharacters[i].going == Direction.Up) stairCharacters[i].relativePos.y += .5;		
		
		stairCharacters[i].relativePos.x = Mathf.Clamp01(stairCharacters[i].relativePos.x );
		stairCharacters[i].relativePos.y = Mathf.Clamp01(stairCharacters[i].relativePos.y );
		
		if(invert) stairCharacters[i].relativePos.x = 1.0-stairCharacters[i].relativePos.x;
		
		var useCurrentSide : int;
		if(stairCharacters[i].sideMovement != null){
			if(invert) useCurrentSide = -stairCharacters[i].sideMovement.currentSide;
			else useCurrentSide =  stairCharacters[i].sideMovement.currentSide;
		}
		
		var changedSide : boolean;
		if(stairCharacters[i].previousCharacterSide != useCurrentSide) changedSide = true;
		stairCharacters[i].previousCharacterSide = useCurrentSide;
		

		
		if(stairCharacters[i].secondHalf){
			if(changedSide && useCurrentSide == -1){
				stairCharacters[i].secondHalf = false;
				if(stairCharacters[i].going == Direction.Up) stairCharacters[i].going = Direction.Down;
				else if(stairCharacters[i].going == Direction.Down) stairCharacters[i].going = Direction.Up;
			}
		}
		 
		if(stairCharacters[i].going == Direction.Down){
			if(stairCharacters[i].relativePos.x > stairCharacters[i].switchAt && useCurrentSide == 1)
				stairCharacters[i].secondHalf = true;
			
			if(!stairCharacters[i].secondHalf){
				if(stairCharacters[i].from == Direction.Right){
					stairCharacters[i].minHeight = Mathf.Lerp(useBounds.max.y, useBounds.center.y,
					stairCharacters[i].relativePos.x * stairCharacters[i].halfStairBias);
				}
			}
			else{
				if(stairCharacters[i].from == Direction.Right){
					stairCharacters[i].minHeight = Mathf.Lerp(useBounds.min.y, useBounds.center.y,
					stairCharacters[i].relativePos.x* stairCharacters[i].halfStairBias);
				}		
			}
		}
		if(stairCharacters[i].going == Direction.Up){
			if(stairCharacters[i].relativePos.x > stairCharacters[i].switchAt && useCurrentSide == 1) 
				stairCharacters[i].secondHalf = true;
			if(!stairCharacters[i].secondHalf){
				if(stairCharacters[i].from == Direction.Right){
					stairCharacters[i].minHeight = Mathf.Lerp(useBounds.min.y, useBounds.center.y,
					stairCharacters[i].relativePos.x * stairCharacters[i].halfStairBias);
				}
			}
			else{
				if(stairCharacters[i].from == Direction.Right){
					stairCharacters[i].minHeight = Mathf.Lerp(useBounds.max.y, useBounds.center.y,
					stairCharacters[i].relativePos.x * stairCharacters[i].halfStairBias);
				}		
			}
		}
		
		var dead : boolean;
		if(stairCharacters[i].characterHealth != null && stairCharacters[i].characterHealth.health <= 0){
			dead = true;
		}
		
		if(!dead){
			if(useBounds.Contains(character.position)){
				stairCharacters[i].hasCharacter = true;
				if(character.position.y < stairCharacters[i].minHeight){
					stairCharacters[i].rb.velocity.y = 0;
					stairCharacters[i].rb.useGravity = false;
					stairCharacters[i].isGrounded.forceGroundUntil = Time.time + .4;
				}
				else{
					stairCharacters[i].rb.useGravity = true;
				}
				
				//stairCharacters[i].targetHeight = Mathf.Max(stairCharacters[i].minHeight, character.position.y);
				var targetHeight : float = Mathf.Max(stairCharacters[i].minHeight, character.position.y);
				character.position.y = Mathf.Lerp(character.position.y, targetHeight, Time.deltaTime * stairCharacters[i].heightSpeed);
				
				if(stairCharacters[i].maxDeltaPos != null){
					stairCharacters[i].maxDeltaPos.disableUntil = Time.time + .5;
				}
			}
			else{
				stairCharacters[i].hasCharacter = false;
				if(stairCharacters[i].rb != null){
					stairCharacters[i].rb.useGravity = true;
				}
				stairCharacters[i].secondHalf = false;
				if(character.position.y < useBounds.center.y) stairCharacters[i].going = Direction.Up;
				else stairCharacters[i].going = Direction.Down;
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	Gizmos.color = Color.yellow;
	Gizmos.DrawWireCube(bounds.center, bounds.size);
	
	for(var i = 0; i < stairCharacters.Length; i++){
		if(stairCharacters[i].debug){
			Gizmos.color = Color.cyan;
			Gizmos.DrawWireCube(stairCharacters[i].bounds.center, stairCharacters[i].bounds.size);
			Gizmos.color = Color.red;
			if(stairCharacters[i].useGlobalBounds){
				Gizmos.DrawLine(
				Vector3(bounds.min.x, stairCharacters[i].minHeight,0),
				Vector3(bounds.max.x, stairCharacters[i].minHeight,0));			
			}
			else{
				Gizmos.DrawLine(
				Vector3(stairCharacters[i].bounds.min.x, stairCharacters[i].minHeight,0),
				Vector3(stairCharacters[i].bounds.max.x, stairCharacters[i].minHeight,0));
			}
		}
	}
	#endif
}