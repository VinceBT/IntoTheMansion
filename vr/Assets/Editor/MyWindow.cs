//C# Example

using UnityEngine;
using UnityEditor;
using System.Collections;
using System;
public class MyWindow : EditorWindow

{
   
    [MenuItem("Window/My Window")]

    public static void ShowWindow()
    {
        EditorWindow.GetWindow(typeof(MyWindow));
    }

    void OnGUI()
    {
        // The actual window code goes here
        if(GUILayout.Button("Build Scene"))
        {
            BuildScene();
        }
    }

    private static void BuildScene()
    {
        Debug.Log("Bulding scene...");

        Texture2D t = Resources.Load("Textures/BuildersTorch_diffSpec") as Texture2D;
        GameObject scene = GameObject.Find("Scene");

        GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cube.transform.position = new Vector3(1f, 3f, 1f);
        cube.transform.parent = scene.transform;

        Renderer r = cube.GetComponent<Renderer>();

        r.material.mainTexture = t;

    }


}