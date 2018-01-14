using UnityEngine;
using System.IO;
using System.Text;

#if UNITY_EDITOR
using UnityEditor;

[CustomEditor(typeof(SceneBuilder))]
[CanEditMultipleObjects]
public class SceneBuilderEditor : Editor
{
    private void Awake()
    {
    }
    public override void OnInspectorGUI()
    {

       

        DrawDefaultInspector();

        if (GUILayout.Button("Build Scene"))
            BuildScene();
    }

    private void BuildScene()
    {

        string path = "Assets/Levels/Apartment.json";
        StreamReader reader = new StreamReader(path, Encoding.UTF8);

        string content = reader.ReadToEnd();

        SceneBuilder builder = target as SceneBuilder;
        builder.LoadResources();
        builder.BuildScene(content);
    }

}
#endif