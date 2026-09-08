#pragma strict

var property : String = "_Lerp";
var blendTexture : boolean = true;
var lerpVal : FloatLerp;
@Space(20)
var objTag : String;
@Space(20)
var lvlMatBlend : LevelMatBlend;
var ignoreMatBlend : boolean;
var character : Transform;
@Space(20)
var useRenderer : Renderer;
@Space(20)
var playerTag : String = "Player";
@Space(20)
var useVCShade : boolean;
var vcShadeForceFullAplha : boolean;
@Space(20)
var useVCShadeLerpVal : boolean;
var vCSHade : VertexColorShade;
@Space(10)
var lerpAsColor : boolean;
var lightCol : Color = Color.white;
var shadowCol : Color = Color(.6,.65,.7);

@Space(20)
var startColor : Color;
//var vCSHadeLerp : float = .8;

@Space(20)
var underwater : UnderWater;
var underWaterColor : boolean;
var health : Health;
var sickColor : boolean;
@Space(20)
var getTimer : Timer;

var zScale : float = 1.0;

@Space(20)
var flash : boolean;
var flashSpeed : int = 3;
var flashColor : boolean;

function GetPlayer(){
	if(transform.parent != null){
		var rb : Rigidbody = transform.parent.GetComponentInChildren.<Rigidbody>();
		if(rb != null){
			character = rb.transform;
			objTag = character.tag;
		}
		underwater = transform.parent.GetComponentInChildren.<UnderWater>();
		health = transform.parent.GetComponentInChildren.<Health>();
	}
	
	if(character == null){
		var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
		if(playerObj != null){
			character = playerObj.transform;
			objTag = gameObject.tag;
		}
	}
	
}

function Start () {
	if(lerpVal == null){
		lerpVal = new FloatLerp();
	}
	if(lerpVal.speed == 0.0){
		lerpVal.speed = 5.0;
	}

	if(getTimer == null){
		getTimer = new Timer();
	}

	if(getTimer.every == 0.0){
		getTimer.every = 0.2;
	}
	
	if(useRenderer == null){
		if(transform.parent != null){
			useRenderer = transform.parent.GetComponentInChildren.<Renderer>();
		}
		else{
			useRenderer = GetComponentInChildren.<Renderer>();
		}
	}
	
	if(useRenderer != null){
		if(useRenderer.material.HasProperty("_Color")){
			startColor = useRenderer.material.color;
		}
		else{
			Debug.Log(transform.name + " does not have property of name _Color, for the BlendColor.js script");
		}
	}
	vCSHade = GameObject.FindObjectOfType.<VertexColorShade>();	


	lvlMatBlend = GameObject.FindObjectOfType.<LevelMatBlend>();

	GetPlayer();

	if(useRenderer != null){
		if(useRenderer.material.HasProperty(property)){
			blendTexture = true;
		}
		else{
			blendTexture = false;
		}
	}
}	

function Update () {
	lerpVal.Lerp();
	
	if(character == null){
		getTimer.Update();
		if(getTimer.current){
			GetPlayer();
		}
		
	}
	

	
	if(character != null && useRenderer != null){
		if(underwater != null && underwater.changeColor && underwater.isUnderwater.current){
			underWaterColor = true;
		}
		else{
			underWaterColor = false;
		}

		if(health != null && health.sick.current){
			sickColor = true;
		}

		if(health == null || !health.sick.current){
			sickColor = false;
		}

		if(!ignoreMatBlend && lvlMatBlend != null){
			lerpVal.target = lvlMatBlend.globalCurve.Evaluate(character.position.x);
		}

		if(vCSHade != null){
			if(useVCShade ){
				if(!underWaterColor && !sickColor && Time.frameCount % 3 == 0){
					var col : Color = vCSHade.GetColorOnPos(character.position, useRenderer.material.color, objTag);
					if(vcShadeForceFullAplha){
						col.a = 1.0;
					}
					useRenderer.material.color = col;
				}
				
			}
			else{
				if(!underWaterColor && !sickColor && !flashColor){
					useRenderer.material.color = startColor;
				}
				
			}
			
			if(useVCShadeLerpVal){
				if(lerpAsColor){
					if(!underWaterColor && !sickColor){
						useRenderer.material.color = Color.Lerp(shadowCol, lightCol, vCSHade.GetMatLerpValue(character.position, objTag));
					}
				}
				else{
					lerpVal.target = vCSHade.GetMatLerpValue(character.position, objTag);
				}
			}
		}
		else{
			if(!underWaterColor && !sickColor && !flashColor){
				useRenderer.material.color = startColor;
			}
		}

		if(blendTexture && Time.frameCount % 3 == 0){
			useRenderer.material.SetFloat(property, lerpVal.current); //Material blend value.
		}

		if(health != null && health.health <= 0){
			flash = false;
		}

		if(flash){
			if(Time.frameCount % flashSpeed == 0){
				flashColor = !flashColor;
				if(flashColor){
					useRenderer.material.color = Color(.9,.95,1.0,.5);
				}
				else{
					if(!underWaterColor && !sickColor){
						useRenderer.material.color = startColor;
					}
					else{
						useRenderer.material.color = underwater.waterColor;
					}
				}
			}
		}
		else{
			flashColor = false;
		}
	}
	

}

function SetColor(newColor : Color){
	useRenderer.material.color = newColor;
}