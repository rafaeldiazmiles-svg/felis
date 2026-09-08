#pragma strict

var shrinkTime : float;

var destroyOnShrink : boolean = true;

private var startTime : float;
private var startScale : Vector3;

function Start () {
	startScale = transform.localScale;
	startTime = Time.time;
}

function Update () {
	if(destroyOnShrink && Time.time > startTime + shrinkTime){
		//gameObject.SetActive(false);
		Destroy(gameObject);
	}
	
	transform.localScale = Vector3.Lerp(startScale, Vector3.zero, (Time.time - startTime) / shrinkTime);

}