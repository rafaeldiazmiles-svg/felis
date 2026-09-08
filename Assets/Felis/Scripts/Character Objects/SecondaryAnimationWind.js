#pragma strict

var range : float;

var secAnims : SecondaryAnimationBone[];

var getTimer : Timer;

function Start () {
	if(getTimer.every == 0.0){
		getTimer.every = 4.0;
	}
}

function Update () {
	getTimer.Update();
	if(getTimer.current){
		secAnims = GameObject.FindObjectsOfType.<SecondaryAnimationBone>();
	}
	
	if(secAnims != null){
		for(var i = 0; i < secAnims.Length; i++){
			if(secAnims[i] == null){
				continue;
			}
			var dist : float = Vector3.Distance(transform.position, secAnims[i].transform.position);
			var newWindVal : float = Mathf.Max(0, range - dist) /range;
			secAnims[i].wind = Mathf.Max(newWindVal, secAnims[i].wind);
		}
	}
}

function OnDrawGizmosSelected(){
	#if UNITY_EDITOR
	DebugUtility.DrawCircle(transform.position, range, Vector3.forward, Color.white, 16);
	#endif
}