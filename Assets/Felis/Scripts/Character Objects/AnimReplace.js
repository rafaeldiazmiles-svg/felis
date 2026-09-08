#pragma strict

var searchTag : String;
var radius : float;
@Space(30)
var getTimer : Timer;
@Space(30)
var newIdleAnimationClip : AnimationClip;
@Space(15)
var newRunAnimationClip : AnimationClip;
@Space(15)
var newJumpUpAnimationClip : AnimationClip;
var newFallDownAnimationClip : AnimationClip;
var newLandAnimationClip : AnimationClip;
@Space(15)
var newAttackAnim : AnimationClip;
var changeApplyForceTime : boolean;
var newApplyForceTime : float;
@Space(15)
var newHurtAnim : AnimationClip;
var hurtReplaceSounds : AudioClip[];

function Start () {
	getTimer.every = .05;
	getTimer.next = Time.time + .01;
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		getTimer.every = Mathf.MoveTowards(getTimer.every, 5.0, .5);
		SearchAndApply();
	}
}

function SearchAndApply(){
	var allTagObjs : GameObject[] = GameObject.FindGameObjectsWithTag(searchTag);
	var foundTag : boolean;
	for(var i = 0; i < allTagObjs.Length; i++){
		var dist : float = Vector3.Distance(transform.position, allTagObjs[i].transform.position);
		if(dist < radius){
			foundTag = true;
			var anim : Animation = allTagObjs[i].GetComponent.<Animation>();
			if(anim != null){
				var idleAnimComp : IdleAnimation = allTagObjs[i].GetComponentInChildren.<IdleAnimation>();
				if(newIdleAnimationClip != null && idleAnimComp != null){
					anim.AddClip(newIdleAnimationClip, newIdleAnimationClip.name);
					anim[idleAnimComp.idleAnimation.name].weight =  0.0;				
					anim[idleAnimComp.idleAnimation.name].enabled = false;//Disable former idle animation.
					idleAnimComp.idleAnimation = newIdleAnimationClip;
				}

				var sideMovementAnimationComp : SideMovementAnimation = allTagObjs[i].GetComponentInChildren.<SideMovementAnimation>();
				if(sideMovementAnimationComp != null && newRunAnimationClip != null){
					anim.AddClip(newRunAnimationClip, newRunAnimationClip.name);	
					anim[sideMovementAnimationComp.runAnimation.name].weight = 0.0;
					anim[sideMovementAnimationComp.runAnimation.name].enabled = false;
					sideMovementAnimationComp.runAnimation = newRunAnimationClip;
				}

				var jumpSwimAnimationComp : JumpSwimAnimation = allTagObjs[i].GetComponentInChildren.<JumpSwimAnimation>();
				if(jumpSwimAnimationComp != null){
					if(newJumpUpAnimationClip != null){
						anim.AddClip(newJumpUpAnimationClip, newJumpUpAnimationClip.name);
						anim[jumpSwimAnimationComp.jumpUpAnimation.name].weight = 0.0;
						anim[jumpSwimAnimationComp.jumpUpAnimation.name].enabled = false;
						jumpSwimAnimationComp.jumpUpAnimation = newJumpUpAnimationClip;
					}
					if(newFallDownAnimationClip != null){
						anim.AddClip(newFallDownAnimationClip, newFallDownAnimationClip.name);	
						anim[jumpSwimAnimationComp.fallDownAnimation.name].weight = 0.0;
						anim[jumpSwimAnimationComp.fallDownAnimation.name].enabled = false;
						jumpSwimAnimationComp.fallDownAnimation = newFallDownAnimationClip;						
					}
					if(newLandAnimationClip != null){
						anim.AddClip(newLandAnimationClip, newLandAnimationClip.name);	
						anim[jumpSwimAnimationComp.landAnimation.name].weight = 0.0;
						anim[jumpSwimAnimationComp.landAnimation.name].enabled = false;
						jumpSwimAnimationComp.landAnimation = newLandAnimationClip;
					}
				}


				var melee : MeleeAttackSimple = allTagObjs[i].GetComponentInChildren.<MeleeAttackSimple>();
				if(melee != null && newAttackAnim != null){
					anim.AddClip(newAttackAnim, newAttackAnim.name);
					anim[melee.attackAnimation.stillAnimation.name].weight = 0.0;
					anim[melee.attackAnimation.stillAnimation.name].enabled = false;
					melee.attackAnimation.stillAnimation = newAttackAnim;

					if(changeApplyForceTime){
						melee.applyForceTime = newApplyForceTime;
					}
				}

				var hurt : Hurt = allTagObjs[i].GetComponentInChildren.<Hurt>();
				if(hurt != null && newHurtAnim != null){
					anim.AddClip(newHurtAnim, newHurtAnim.name);
					anim[hurt.hurtClip.name].weight = 0.0;
					anim[hurt.hurtClip.name].enabled = false;
					hurt.hurtClip = newHurtAnim;

					if(hurtReplaceSounds != null && hurt.hurtSounds != null){
						var soundID : int;
						for(var n = 0; n < hurt.hurtSounds.Length; n++){
							hurt.hurtSounds[n].clip = hurtReplaceSounds[soundID];
							soundID ++;
							soundID = soundID % hurtReplaceSounds.Length;
						}
					}
				}

			}
			else{
				Debug.Log(gameObject.name + " can't replace anims for " + allTagObjs[i].name + " becasue it has no animation component.");
			}
		}
	}
	if(foundTag){
		Destroy(gameObject);
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, radius, Vector3.forward);
	#endif
}