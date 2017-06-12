using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SocketIO;

public class MovePlayer : MonoBehaviour {

	public float playerSpeed;
	public static SocketIOComponent socket;

	// Use this for initialization

	void Start () {

		GameObject go = GameObject.Find("SocketIO");
		socket = go.GetComponent<SocketIOComponent>();
		
		Debug.Log("Hi, start");

		socket.On("setX", SetXfunc);
		
		StartCoroutine("BeepBoop");	
	}

	private IEnumerator BeepBoop()
	{
		while(true){

			yield return new WaitForSeconds(0.3f);
			socket.Emit("beep");
		}
	}

	public void SetXfunc(SocketIOEvent e) {
		Debug.Log("I'm at setX");
		Debug.Log("[SocketIO] SetX received: " + e.name + " " + e.data);
		playerSpeed = float.Parse(e.data["X"].str) / 20;
	}
	
	// Update is called once per frame
	void Update () {
		transform.position = transform.position + Camera.main.transform.forward * playerSpeed * Time.deltaTime;
	}
}
