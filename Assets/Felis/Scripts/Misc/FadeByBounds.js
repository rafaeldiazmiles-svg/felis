#pragma strict

var player : Transform;
var playerTag : String = "Player";

var inDoorFogs : InDoorFog[];

var fadeSpeed : float = .4;

var debug : boolean;

var needsCleanUp : boolean;

var checkMatAlpha : Timer;
static var arbitraryTimerVal : float = 4.0;

class InDoorFog{
	var groupName : String;
	var elements : InDoorFogElement[];
	@Space(30)
	var useActiveArea : boolean;
	var activeArea : Bounds;
	var activeAreaMultiple : Bounds[];
	@Space(30)
	var bounds : Bounds[];
	var areaMesh : AreaMesh;
	@Space(30)
	var containsPlayer : ToggleBoolean;
	@Space(30)
	var targetAlpha : float;
	var currentAlpha : float;
	var previousAlpha : float;
	@Space(30)
	var hasPlayer : boolean;
	@Space(30)
	var disableOnFade : boolean;
	@Space(30)
	var disableThisGroup : boolean;
	@Space(30)
	var getDefaultColor : boolean;
	@Space(30)
	var firstFrame : boolean;
	@Space(30)
	var forceUpdate : boolean;
	@Space(30)
	var referenceAlphaMaterial : Material;
	var referenceAM_invert : boolean;
}

class InDoorFogElement{
	var useTransformName : boolean;
	var useTransformChildren : boolean;
	var useFadeTag : boolean;
	var elementName : String;
	var fadeRenderer : Renderer;
	var multipleRenderers : Renderer[];

	var propertyName : String;

	var alternateMaterials : boolean;
	var opaqueMaterial : Material;
	var alphaMaterial : Material;
	var invert : boolean;

	var onlyHide : boolean;

	var instant : boolean;
	
	var delete : boolean;
	
	var createdBy : String;
	var createdByT : Transform;
}

function GetPlayer(){
	var playerObj : GameObject = GameObject.FindGameObjectWithTag(playerTag);
	if(playerObj != null) player = playerObj.transform;
}

function Start () {
	if(checkMatAlpha.every == 0.0) checkMatAlpha.every = arbitraryTimerVal;
	
	GetPlayer();

	for(var i = 0; i < inDoorFogs.Length; i++){
	
		if(!inDoorFogs[i].useActiveArea){
			Debug.Log(inDoorFogs[i].groupName + " has use active area disabled and will update all the time");
		}	
	
		for(var n = 0; n < inDoorFogs[i].elements.Length; n++){
			if(inDoorFogs[i].disableThisGroup) continue;
			
	
			
			if(inDoorFogs[i].elements[n].alphaMaterial){
				inDoorFogs[i].elements[n].opaqueMaterial = Instantiate(inDoorFogs[i].elements[n].opaqueMaterial);
				inDoorFogs[i].elements[n].alphaMaterial = Instantiate(inDoorFogs[i].elements[n].alphaMaterial);
			}
			
			if(inDoorFogs[i].getDefaultColor){
				if(inDoorFogs[i].elements[n].fadeRenderer != null){
					inDoorFogs[i].elements[n].fadeRenderer.enabled = true;
				}
			}
			
			for(var m = 0; m < inDoorFogs[i].elements[n].multipleRenderers.Length; m++){
				if(inDoorFogs[i].elements[n].multipleRenderers[m] == null) continue;
				inDoorFogs[i].elements[n].multipleRenderers[m].enabled = true;
			}
		}
	}
}

function CleanFadeElements(){
	var cleanArray : Array = new Array();
	for(var i = 0; i < inDoorFogs.Length; i++){
		cleanArray.Clear();	
		//Debug.Log(inDoorFogs[i].groupName +  " - Cleaning array. Length: " + inDoorFogs[i].elements.Length + " -------------------START CLEANING");
		for(var m = 0; m < inDoorFogs[i].elements.Length; m++){
			if(!inDoorFogs[i].elements[m].delete){
				cleanArray.Push(inDoorFogs[i].elements[m]);
				//Debug.Log(inDoorFogs[i].elements[m].elementName + " - Keep.");
			}
			else{
				//Debug.Log(inDoorFogs[i].elements[m].elementName + " - Delete.");
			}
		}
		var newArray : InDoorFogElement[] = cleanArray.ToBuiltin(InDoorFogElement);
		inDoorFogs[i].elements = newArray;
		//Debug.Log(inDoorFogs[i].groupName +  " - Cleaned. Length: " + inDoorFogs[i].elements.Length+ " -------------------FINISHED CLEANING");
	}
}

function Update () {
	if(player == null) GetPlayer();

	checkMatAlpha.Update();
	
	if(needsCleanUp){
		CleanFadeElements();
		needsCleanUp = false;
	}
	
	for(var i = 0; i < inDoorFogs.Length; i++){
		if(inDoorFogs[i].disableThisGroup) continue;

		//Check if renderers are gone
		for(var m = 0; m < inDoorFogs[i].elements.Length; m++){
			var renderersGone : boolean = true;
			if(inDoorFogs[i].elements[m].multipleRenderers != null){
				for(var h = 0 ; h <inDoorFogs[i].elements[m].multipleRenderers.Length; h++){
					if(inDoorFogs[i].elements[m].multipleRenderers[h] != null){
						renderersGone = false;
						break;
					}
				}
			}
			if(inDoorFogs[i].elements[m].fadeRenderer != null){
				renderersGone = false;
			}
			
			if(renderersGone){
				inDoorFogs[i].elements[m].delete = true;
				needsCleanUp = true;
			}		
		} 		
		
		//CHECK IF PLAYER IS IN BOUNDS AND IN ACTIVE AREA
		if(inDoorFogs[i].containsPlayer == null){
			inDoorFogs[i].containsPlayer = new ToggleBoolean();
		}
		
		
		inDoorFogs[i].containsPlayer.current = false;
		if(player != null && inDoorFogs[i].useActiveArea){
			inDoorFogs[i].containsPlayer.current = inDoorFogs[i].activeArea.Contains(player.position);
			
			
			if(inDoorFogs[i].activeAreaMultiple != null){
				for(var z = 0; z < inDoorFogs[i].activeAreaMultiple.Length; z++){
					if(inDoorFogs[i].activeAreaMultiple[z].Contains(player.position)){
						inDoorFogs[i].containsPlayer.current = true;
						break;
					}
				}
			}


		}
		
		//Contains player update
		inDoorFogs[i].containsPlayer.Update();
		if(inDoorFogs[i].containsPlayer.justToggled){
			inDoorFogs[i].forceUpdate = true;

			if(inDoorFogs[i].referenceAlphaMaterial == null){
				if(inDoorFogs[i].elements != null && inDoorFogs[i].elements.Length > 0){
					for(var f = 0; f < inDoorFogs[i].elements.Length; f++) {
						if( inDoorFogs[i].elements[f].fadeRenderer != null){
							 inDoorFogs[i].referenceAlphaMaterial = inDoorFogs[i].elements[f].fadeRenderer.material;
						}
						else{
							if(inDoorFogs[i].elements[f].multipleRenderers != null){
								for(var ff = 0; ff < inDoorFogs[i].elements[f].multipleRenderers.Length; ff++){
									if(inDoorFogs[i].elements[f].multipleRenderers == null){
										continue;
									}
									if(inDoorFogs[i].elements[f].multipleRenderers[ff].material.HasProperty("_Color")){
										inDoorFogs[i].referenceAlphaMaterial = inDoorFogs[i].elements[f].multipleRenderers[ff].material;
										break;
									}
								}
							
							}
						}

						if( inDoorFogs[i].referenceAlphaMaterial != null){
							inDoorFogs[i].referenceAM_invert = inDoorFogs[i].elements[0].invert;
							break;
						}
					}

				}
			}

			if(inDoorFogs[i].referenceAlphaMaterial != null){
				if( inDoorFogs[i].referenceAlphaMaterial != null){
					inDoorFogs[i].currentAlpha = inDoorFogs[i].referenceAlphaMaterial.color.a;
					if(inDoorFogs[i].referenceAM_invert){
						inDoorFogs[i].currentAlpha = -inDoorFogs[i].currentAlpha + 1;
					}
				}
			}

		}		
		
		if(!inDoorFogs[i].useActiveArea){
			inDoorFogs[i].containsPlayer.current = true;
		}

		inDoorFogs[i].currentAlpha = Mathf.MoveTowards(inDoorFogs[i].currentAlpha, inDoorFogs[i].targetAlpha, Time.deltaTime * fadeSpeed);
		if(!inDoorFogs[i].containsPlayer.current) continue;

		//GET TARGET ALPHA
		var targetAlpha : float = 1.0;
		inDoorFogs[i].hasPlayer = false;

									
		if(player != null){
			if(inDoorFogs[i].areaMesh != null){
				if(inDoorFogs[i].areaMesh.TestPoint(player.position)){
					inDoorFogs[i].hasPlayer = true;
				}
			}

			for(var n = 0; n < inDoorFogs[i].bounds.Length; n ++){
				if(inDoorFogs[i].bounds[n].Contains(player.position)){
					inDoorFogs[i].hasPlayer = true;
					break;
				}
			}
		}

		if(inDoorFogs[i].hasPlayer){ //Set target alpha if has player.
			targetAlpha = 0.0;
		}

		inDoorFogs[i].targetAlpha = targetAlpha;
		//inDoorFogs[i].currentAlpha = Mathf.MoveTowards(inDoorFogs[i].currentAlpha, targetAlpha, Time.deltaTime * fadeSpeed);
		
		//CHECK IF NEEDS FORCED UPDATE
		if(checkMatAlpha.current){
			inDoorFogs[i].forceUpdate = true;
			var currentAlpha : float;
			
			for(m = 0; m < inDoorFogs[i].elements.Length; m++){
				if(inDoorFogs[i].elements[m].instant) continue;
				var prop : String = inDoorFogs[i].elements[m].propertyName;
				
				if(inDoorFogs[i].elements[m].fadeRenderer != null){
					if( inDoorFogs[i].elements[m].fadeRenderer.material.HasProperty(inDoorFogs[i].elements[m].propertyName)){
						currentAlpha = inDoorFogs[i].elements[m].fadeRenderer.material.GetColor(prop).a;
						if(currentAlpha != inDoorFogs[i].currentAlpha){
							inDoorFogs[i].forceUpdate = true;
						}
					}

				}
				
				if(inDoorFogs[i].elements[m].multipleRenderers != null){
					for(var y = 0; y < inDoorFogs[i].elements[m].multipleRenderers.Length; y++){
						if(inDoorFogs[i].elements[m].multipleRenderers[y] == null) continue;

						if(inDoorFogs[i].elements[m].multipleRenderers[y].material.HasProperty(inDoorFogs[i].elements[m].propertyName)){
							currentAlpha = inDoorFogs[i].elements[m].multipleRenderers[y].material.GetColor(prop).a;
						
							if(currentAlpha != inDoorFogs[i].currentAlpha){
								inDoorFogs[i].forceUpdate = true;
							}
						}
					}
				}
			}
		}		
		
		//IF ALPHA CHANGED, PROCESS ELEMENTS
		if(inDoorFogs[i].currentAlpha != inDoorFogs[i].previousAlpha || !inDoorFogs[i].firstFrame || inDoorFogs[i].forceUpdate){
			//if(inDoorFogs[i].forceUpdate) Debug.Log(Time.time);
			inDoorFogs[i].forceUpdate = false;
			inDoorFogs[i].previousAlpha = inDoorFogs[i].currentAlpha;
			inDoorFogs[i].firstFrame = true;
			
			///////////////////////////////////////////////////////////////////ELEMENTS////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////ELEMENTS////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////ELEMENTS////////////////////////////////////////////////////////////////
			
			for(m = 0; m < inDoorFogs[i].elements.Length; m++){
		
				//GET ALPHA
				var fadeAlpha : float;

				if(inDoorFogs[i].elements[m].onlyHide){
					fadeAlpha = 0.0;
				}
				else{
					if(inDoorFogs[i].elements[m].instant){
						fadeAlpha = targetAlpha;
					}
					else{
						fadeAlpha = inDoorFogs[i].currentAlpha;
					}

					if(inDoorFogs[i].elements[m].invert) fadeAlpha = 1 - fadeAlpha;
				}

				///ALTERNATE MATERIALS
				
				if(inDoorFogs[i].elements[m].alternateMaterials){
					if(fadeAlpha == 1.0){
						if(inDoorFogs[i].elements[m].fadeRenderer != null){
							if(inDoorFogs[i].elements[m].fadeRenderer.material != inDoorFogs[i].elements[m].opaqueMaterial){
								inDoorFogs[i].elements[m].fadeRenderer.material = inDoorFogs[i].elements[m].opaqueMaterial;
							}
						}
						else{
							for(var w = 0; w < inDoorFogs[i].elements[m].multipleRenderers.Length; w++){
								if(inDoorFogs[i].elements[m].multipleRenderers[w].material != inDoorFogs[i].elements[m].opaqueMaterial){
									if(inDoorFogs[i].elements[m].multipleRenderers[w] == null) continue;
									inDoorFogs[i].elements[m].multipleRenderers[w].material = inDoorFogs[i].elements[m].opaqueMaterial;
								}
							}
						}
					}
					else{
						if(inDoorFogs[i].elements[m].fadeRenderer != null){
							if(inDoorFogs[i].elements[m].fadeRenderer.material != inDoorFogs[i].elements[m].alphaMaterial){
								inDoorFogs[i].elements[m].fadeRenderer.material = inDoorFogs[i].elements[m].alphaMaterial;
							}
						}
						else{
							for(w = 0; w < inDoorFogs[i].elements[m].multipleRenderers.Length; w++){
								if(inDoorFogs[i].elements[m].multipleRenderers[w].material != inDoorFogs[i].elements[m].alphaMaterial){
									if(inDoorFogs[i].elements[m].multipleRenderers[w] == null) continue;
									inDoorFogs[i].elements[m].multipleRenderers[w].material = inDoorFogs[i].elements[m].alphaMaterial;
								}
							}
						}
					}
				}
				
				//CHANGE ALPHA 
				//Get color.
				var fadeColor : Color;
				var currentColor : Color;
				//Set the color
				if(!inDoorFogs[i].elements[m].instant){
					if(	inDoorFogs[i].elements[m].fadeRenderer != null){
						currentColor = inDoorFogs[i].elements[m].fadeRenderer.material.GetColor(inDoorFogs[i].elements[m].propertyName);
						fadeColor = currentColor * Color(1,1,1,0) + Color(0,0,0,fadeAlpha);
						inDoorFogs[i].elements[m].fadeRenderer.material.SetColor(inDoorFogs[i].elements[m].propertyName, fadeColor);
					}
					
					for(w = 0; w < inDoorFogs[i].elements[m].multipleRenderers.Length; w++){
						if(inDoorFogs[i].elements[m].multipleRenderers[w] == null) continue;

						if(inDoorFogs[i].elements[m].multipleRenderers[w].material.HasProperty(inDoorFogs[i].elements[m].propertyName)){
							currentColor = inDoorFogs[i].elements[m].multipleRenderers[w].material.GetColor(inDoorFogs[i].elements[m].propertyName);
							fadeColor = currentColor * Color(1,1,1,0) + Color(0,0,0,fadeAlpha);
							inDoorFogs[i].elements[m].multipleRenderers[w].material.SetColor(inDoorFogs[i].elements[m].propertyName, fadeColor);
						}
						else{
							if(targetAlpha < .5){
								inDoorFogs[i].elements[m].multipleRenderers[w].enabled = false;
							}
							else{
								inDoorFogs[i].elements[m].multipleRenderers[w].enabled = true;
							}
							//Debug.Log(inDoorFogs[i].elements[m].multipleRenderers[w].transform.name + " has a material without " + inDoorFogs[i].elements[m].propertyName + " property name");
						}
					}
				}
				
				//Enable renderer.
				if(fadeAlpha < .05){
					if(inDoorFogs[i].elements[m].fadeRenderer != null)
						inDoorFogs[i].elements[m].fadeRenderer.enabled = false;
					for(w = 0; w < inDoorFogs[i].elements[m].multipleRenderers.Length; w++){
						if(inDoorFogs[i].elements[m].multipleRenderers[w] == null) continue;
						inDoorFogs[i].elements[m].multipleRenderers[w].enabled = false;
					
					}
				}
				else{
					if(inDoorFogs[i].elements[m].fadeRenderer != null)
						inDoorFogs[i].elements[m].fadeRenderer.enabled = true;
					for(w = 0; w < inDoorFogs[i].elements[m].multipleRenderers.Length; w++){
						if(inDoorFogs[i].elements[m].multipleRenderers[w] == null) continue;
						inDoorFogs[i].elements[m].multipleRenderers[w].enabled = true;
					}
				}
				
			}
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	if(debug){
		for(var i = 0; i < inDoorFogs.Length; i++){
			Gizmos.color = Color.white;
			for(var n = 0; n < inDoorFogs[i].bounds.Length; n++){
				Gizmos.DrawWireCube(inDoorFogs[i].bounds[n].center, inDoorFogs[i].bounds[n].size);
			}
			Gizmos.color = Color.red;
			Gizmos.DrawWireCube(inDoorFogs[i].activeArea.center, inDoorFogs[i].activeArea.size);
			if(inDoorFogs[i].activeAreaMultiple != null){
				for(var m = 0; m < inDoorFogs[i].activeAreaMultiple.Length; m++){
					Gizmos.DrawWireCube(inDoorFogs[i].activeAreaMultiple[m].center, inDoorFogs[i].activeAreaMultiple[m].size);
				}
			}
		}
	}
	#endif
}