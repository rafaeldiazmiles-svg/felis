#pragma strict

var prevXPos : float;

var invert: boolean;

var deadZone : float;

function Start () {

}

function Update () {
	var deltaPos : float = transform.position.x - prevXPos;
	prevXPos = transform.position.x;

	if(Time.deltaTime != 0.0 && Mathf.Abs(deltaPos) / Time.deltaTime > deadZone){
		transform.localScale.x = Mathf.Abs(transform.localScale.x) * -Mathf.Sign(deltaPos);

		if(invert){
			transform.localScale.x = -transform.localScale.x;
		}
	}
}