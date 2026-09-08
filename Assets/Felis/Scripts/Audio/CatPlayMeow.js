#pragma strict

var meowList : AudioSource[];

function PlayMeow(){
	meowList[Random.value * meowList.Length].Play();
}