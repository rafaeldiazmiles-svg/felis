#pragma strict

var groupName : String;
var groupNameIsParent : boolean;

var element : InDoorFogElement;

var FadeByBoundsTag : String = "Fade By Bounds";

var exterior : String = "Ext";
var interior : String = "Int";
var instant : String = "Inst";
var hide : String = " Hide";

function Start () {
	//Debug.Log(transform.name + " " + Time.time);
	var fadeByBounds : FadeByBounds;
	var fadeByBoundsObj : GameObject = GameObject.FindGameObjectWithTag(FadeByBoundsTag);
	if(fadeByBoundsObj != null){
		fadeByBounds = fadeByBoundsObj.GetComponent.<FadeByBounds>();
	}

	if(fadeByBounds != null){
		if(fadeByBounds.inDoorFogs != null){
			var inDoorFog : InDoorFog = null;
			
			if(groupNameIsParent && transform.parent != null){
				groupName = transform.parent.name;
			}
			
			for(var n = 0; n < fadeByBounds.inDoorFogs.Length; n++){
				if(fadeByBounds.inDoorFogs[n].groupName == groupName){
					inDoorFog = fadeByBounds.inDoorFogs[n];
					break;
				}
			}

			
			if(inDoorFog != null){
				//Debug.Log("|||||| Time: " + Time.time + " - " + transform.name + " ------will register new element: " 
				//+ element.elementName +" on " + groupName + " which has " + inDoorFog.elements.Length + " elements registered. ||||||");
				
				var hasElement : boolean = false;
				var currentElements : Array = new Array();	
				currentElements.Clear();
				
				if(inDoorFog.elements != null){
					for(var m = 0; m < inDoorFog.elements.Length; m++){
						//Debug.Log("name check on index: " + m + " - " +inDoorFog.groupName + " - new element name: " + element.elementName + " - comparing to exing: " + inDoorFog.elements[m].elementName);

						if(inDoorFog.elements[m].elementName == element.elementName){
							hasElement = true;
							//Debug.Log("Element found: " + element.elementName + " - on: " + inDoorFog.groupName + " - wont create.");
						}
						else{
							currentElements.Push(inDoorFog.elements[m]);
						}

					}
					if(inDoorFog.elements.Length == 0){
						//Debug.Log("This group has no elements. (Array length is zero)");
					}
				}
				else{
					//Debug.Log("This group has no elements. (Null array)");
				}
				
				if(!hasElement){
					//Debug.Log("Element not found. Creating a new element on group: " + inDoorFog.groupName + " - element name: " + element.elementName);
					element.createdBy = transform.name;
					element.createdByT = transform;
					
					if(element.useTransformName){
						element.elementName = transform.name;	
					}
					if(element.useTransformChildren){
						element.multipleRenderers = transform.GetComponentsInChildren.<Renderer>();
					}

					if(element.useFadeTag){
						var taggedRenderersArray : Array = new Array();

						var tagGroups : FadeByBoundsRegister_Tag[] = GameObject.FindObjectsOfType.<FadeByBoundsRegister_Tag>();

						for(var w : int; w < tagGroups.Length; w++){
							if( tagGroups[w].groupName == groupName){
								var foundTag : boolean;

								if(tagGroups[w].hide){
									if(" " + element.elementName == hide + tagGroups[w].suffix){
										foundTag = true;
									}
								}
								else{
									var instAddString : String = "";

									if(tagGroups[w].inst){
										instAddString = instant;
									}

									if(tagGroups[w].inv){
										if(element.elementName == interior + instAddString + tagGroups[w].suffix){
											foundTag = true;
										}
									}
									else{
										if(element.elementName == exterior + instAddString + tagGroups[w].suffix){
											foundTag = true;
										}	
									}
								}

								if(foundTag){
									var taggedRend : Renderer = tagGroups[w].GetComponent.<Renderer>();
									if(taggedRend != null){
										taggedRenderersArray.Push(taggedRend);
									}
									if(tagGroups[w].alsoChildren){
										var taggedRendChildren : Renderer[] = tagGroups[w].GetComponentsInChildren.<Renderer>();
										for(var p = 0; p < taggedRendChildren.Length; p++){
											taggedRenderersArray.Push(taggedRendChildren[p]);
										}
									}

									var copyTag : FBB_CopyTag = tagGroups[w].GetComponent.<FBB_CopyTag>();
									if(copyTag != null){
										for(var c = 0; c < copyTag.rends.Length; c++){
											taggedRenderersArray.Push(copyTag.rends[c]);
										}
										for(var v = 0; v < copyTag.rendParents.Length; v++){
											var thisParentRenderers : Renderer[] = copyTag.rendParents[v].GetComponentsInChildren.<Renderer>();
											for(var h = 0; h < thisParentRenderers.Length; h++){
												taggedRenderersArray.Push(thisParentRenderers[h]);
											} 
										}
									}
								}
							}

						}


						//Looped through all fade tags. Adding stored renderers to the element
						element.multipleRenderers = taggedRenderersArray.ToBuiltin(Renderer) as Renderer[];

					}

					if(element.propertyName == ""){
						element.propertyName = "_Color";
					}
						
					currentElements.Push(element);
					inDoorFog.elements = new InDoorFogElement[currentElements.length];
					inDoorFog.elements = currentElements.ToBuiltin(InDoorFogElement) as InDoorFogElement[];
				}
				else{
					//Debug.Log("Finshed checking. Element found, wont create " + element.elementName);
				}
			}
			else{
				//Debug.Log("The fade group wasn't found: " + groupName);
			}			
		}
	}
	else{
		//Debug.Log("FadeByBounds script not found by " + transform.name + ".");
	}
}

