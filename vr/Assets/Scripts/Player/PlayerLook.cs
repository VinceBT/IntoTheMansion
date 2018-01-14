using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerLook : MonoBehaviour {

    float xAxisClamp = 0;

    public Transform playerBody;
    public float mouseSensitivity;
    // Use this for initialization

    private void Awake()
    {
      //  Cursor.lockState = CursorLockMode.Locked;
       // OVRPlugin.rotation = true;
    }

    void Start () {
    }
	
	// Update is called once per frame
	void Update () {
        rotateVR();
	}

    private void LateUpdate()
    {
        
    }

    void rotateVR()
    {
        float mouseX = Input.GetAxis("Mouse X");
        float mouseY = Input.GetAxis("Mouse Y");

        float rotAmountX = mouseX * mouseSensitivity;
        float rotAmountY = mouseY * mouseSensitivity;

        xAxisClamp -= rotAmountY;

        Vector3 targetRotCam = transform.rotation.eulerAngles;

        targetRotCam.y += rotAmountX;
        targetRotCam.x -= rotAmountY;
        targetRotCam.z = 0f;

        if (xAxisClamp > 90)
        {
            xAxisClamp = targetRotCam.x = 90;
        }

        else if (xAxisClamp < -90)
        {
            xAxisClamp = -90;
            targetRotCam.x = 270;
        }

        transform.rotation = Quaternion.Euler(targetRotCam);
    }
    void RotateCamera()
    {
        float mouseX = Input.GetAxis("Mouse X");
        float mouseY = Input.GetAxis("Mouse Y");

        float rotAmountX = mouseX * mouseSensitivity;
        float rotAmountY = mouseY * mouseSensitivity;

        xAxisClamp -= rotAmountY;

        Vector3 targetRotCam = transform.rotation.eulerAngles;
        Vector3 targetRotBody = playerBody.rotation.eulerAngles;

        targetRotBody.y += rotAmountX;
        targetRotCam.x -= rotAmountY;
        targetRotCam.z = 0f;

        if(xAxisClamp > 90)
        {
            xAxisClamp = targetRotCam.x = 90;
        }

        else if(xAxisClamp < -90)
        {
            xAxisClamp = -90;
            targetRotCam.x = 270;
        }

        transform.rotation = Quaternion.Euler(targetRotCam);
        playerBody.rotation = Quaternion.Euler(targetRotBody);
    }
}
