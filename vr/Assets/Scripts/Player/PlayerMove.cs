using SocketIO;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerMove : MonoBehaviour {
    SocketIOComponent socket;
    private CharacterController charControl;

    public float walkSpeed;

    bool hasMoved = false;

    private void Awake()
    {
        GameObject go = GameObject.Find("SocketIO");
        socket = go.GetComponent<SocketIOComponent>();

        charControl = GetComponent<CharacterController>();

        JSONObject a = new JSONObject();
        a.AddField("type", "VR");


        socket.On("connect", (data) =>
        {
            Debug.Log("connected");
            socket.Emit("REGISTER", a);

        });

        socket.On("ok position", (content) =>
        {
            Debug.Log(content.data);
        });
    }

    private void Update()
    {
      

        if (hasMoved)
        {
            //  Debug.Log(transform.position);
            /* SocketIOClient.instance.SendPlayerPosition(
                  transform.position.x,
                  transform.position.y,
                  transform.position.z,
                  GameManager.instance.deviceId);*/
            JSONObject o = new JSONObject();
            o["x"] = new JSONObject(transform.position.x);
            o["y"] = new JSONObject(transform.position.y);
            o["z"] = new JSONObject(transform.position.z);
            o.AddField("deviceID", "Test DEvice");
            socket.Emit("PLAYER_POSITION_UPDATE", o);
        }

        hasMoved = false;
        MovePlayer();
       
    }


    void MovePlayer()
    {
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");

        v = 1f;

        hasMoved = (h!=0 || v!=0);


        Vector3 MoveDirSide = Camera.main.transform.rotation*transform.right * h * walkSpeed;
        Vector3 MoveDirFor = Camera.main.transform.rotation * Vector3.forward * v * walkSpeed;

        charControl.SimpleMove(MoveDirSide);
        charControl.SimpleMove(MoveDirFor);
    }
}
