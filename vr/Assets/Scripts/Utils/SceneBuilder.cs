using System.Collections;
using System.Collections.Generic;

#if UNITY_EDITOR
using UnityEditor;
#endif

using UnityEngine;
using System.Linq;

[ExecuteInEditMode]
public class SceneBuilder : MonoBehaviour {
    public GameObject floorDefault;
    public GameObject wallDefault;
    public GameObject doorWallDefault;

    private GameObject def;
    GameObject scene;

    private int width;
    private int height;
    private int floors;

    private JSONObject map;

   
    public void LoadResources()
    {
#if UNITY_EDITOR

        floorDefault = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Models/Construct/Floor/FloorDefault.prefab");
        wallDefault = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Models/Construct/Wall/WallDefault.prefab");
        doorWallDefault = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Models/Construct/Floor/FloorDefault.prefab");

#endif

    }

    public void BuildScene(string content)
    {
        GetData(content);
        scene = GameObject.Find("Scene");

       // ClearScene();
        Debug.Log("Building scene...");

        BuildMap();
    }

    private void ClearScene()
    {
        Debug.Log(scene.transform.childCount);
        while (scene.transform.childCount != 0)
            DestroyImmediate(scene.transform.GetChild(0).gameObject);
    }
    private void BuildMap()
    {
       for(int i = 0; i < floors; i++)
        {
            BuildFloor(map[i], i);
        }
    }

    private void BuildFloor(JSONObject floor, int level)
    {
        Debug.Log(floor.Count);

        for (int i = 0; i < floor.Count; i++)
        {
            float x = i / width;
            float y = i % width;

            BuildTile(floor[i].ToString().Split('"')[1], x, y, level);

          //  Debug.Log("[" + x + " , " + y + "]");
        }
    }

    private void BuildTile(string type, float x, float y, int level)
    {
          Debug.Log(type);
        GameObject o;
        switch (type)
        {
            case "F":
                o = Instantiate(floorDefault);
                o.transform.position = new Vector3(x, level, y);

                break;

            case "W":
                o = Instantiate(wallDefault);
                o.transform.position = new Vector3(x, level+2.5f, y);
                break;

            case "D":
                o = Instantiate(doorWallDefault);
                GameObject o2 = Instantiate(floorDefault);

                o.transform.position = new Vector3(x, level +4, y);
                o2.transform.position = new Vector3(x, level, y);
                o2.transform.parent = scene.transform;
                break;

            default:
                o = GameObject.CreatePrimitive(PrimitiveType.Cube);
                o.transform.position = new Vector3(x, level, y);
                break;
        }


        o.transform.parent = scene.transform;


    }
    private void GetData(string content)
    {
        JSONObject test = JSONObject.Create(content);
        GetDims(test["terrain"]);
        GetMap(test["terrain"]);
       /* JObject test = JObject.Parse(content);
        Debug.Log(test);
        GetDims(test["terrain"]);
        GetMap(test["terrain"]);
       // Debug.Log(height);
       // Debug.Log(test["terrain"]["map"][0][0]);*/
    }

    private void GetDims(JSONObject o)
    {
        
        width =   int.Parse(o["width"].ToString());
        height =  int.Parse(o["height"].ToString());
        floors =  int.Parse(o["floors"].ToString());
    }

    private void GetMap(JSONObject o)
    {
        map = o["map"];
       // map =o["map"].ToObject<string[][]>();
    }
}
