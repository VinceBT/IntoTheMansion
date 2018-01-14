using System.Collections;
using System.Collections.Generic;
using UnityEngine;

#if UNITY_EDITOR 
using UnityEditor;

[CustomEditor (typeof(MeshCombiner))]
public class MeshCombinerEditor : Editor {

    private void OnSceneGUI()
    {

        MeshCombiner mc = target as MeshCombiner;

        if(Handles.Button(mc.transform.position + Vector3.up * 5, Quaternion.LookRotation(Vector3.up), 1,1, Handles.CylinderHandleCap))
        {
             mc.CombineMeshes();
            //mc.BasicMerge();
        }

       
    }

    public override void OnInspectorGUI()
    {
        MeshCombiner mc = target as MeshCombiner;

        DrawDefaultInspector();

        if (GUILayout.Button("Reduce vertices"))
        {
            mc.ReduceVertices();
        }

        if (GUILayout.Button("Reduce mesh vertices"))
            mc.ReduceMeshVertices();
    }
}
#endif