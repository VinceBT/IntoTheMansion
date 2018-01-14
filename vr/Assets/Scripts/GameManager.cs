using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour {
    public static GameManager instance;

    public string deviceId;

    public Transform player;
	// Use this for initialization
	void Start () {
        instance = this;


        deviceId = SystemInfo.deviceUniqueIdentifier;
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
