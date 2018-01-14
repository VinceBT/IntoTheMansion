/*--------------------------------------------------------
  InnerMantisLODEditorOnline.cs

  Created by MINGFEN WANG on 13-12-26.
  Copyright (c) 2013 MINGFEN WANG. All rights reserved.
  http://www.mesh-online.net/
--------------------------------------------------------*/
using UnityEngine;
using UnityEditor;
using System;
using System.Collections;
using System.Runtime.InteropServices;
using System.Text;

namespace MantisLODEditor {
	[CustomEditor(typeof(MantisLODEditorOnline))]
	class InnerMantisLODEditorOnline: Editor {
		private int origin_face_number = 0;
		private int face_number = 0;
		private float quality = 100.0f;
		private float save_quality = 100.0f;
		private bool protect_boundary = true;
		private bool save_protect_boundary = true;
		private bool protect_detail = false;
		private bool save_protect_detail = false;
		private bool protect_symmetry = false;
		private bool save_protect_symmetry = false;
		private Mantis_Mesh[] Mantis_Meshes = null;
		private bool show_title = true;
		private bool show_help = true;
		private bool save_show_help = true;
		private string www_result = null;
		private int state = 0;
		private int tag_when_update = 0;
		private float start_time = 0.0f;
		private WWW www = null;
		private static string server_name = "www.mesh-online.net";

		public override void OnInspectorGUI() {
			DrawDefaultInspector();
			if(target) {
				if(Mantis_Meshes != null) {
					show_title = EditorGUILayout.Foldout(show_title, "Mantis LOD Editor - Online Edition V4.0");
					if(show_title) {
						// A decent style.  Light grey text inside a border.
						GUIStyle helpStyle = new GUIStyle(GUI.skin.box);
						helpStyle.wordWrap = true;
						helpStyle.alignment = TextAnchor.UpperLeft;
						show_help = EditorGUILayout.Foldout(show_help, show_help?"Hide Help":"Show Help");
						GUI.enabled = (state == 0);
						if(GUILayout.Button("Upload Mesh Data", GUILayout.ExpandWidth(true), GUILayout.ExpandWidth(true))) {
							// when idle
							if (state == 0) {
								// reset quality
								quality = 100.0f;
								start_update(101);
							}
						}
						GUI.enabled = true;
						if(show_help) {
							GUILayout.Label(
								"When Clicked, necessory mesh data will be uploaded to server, the server will cache your data for 24 hours, so you need not upload your data frequently. But if you have restarted Unity, your data might mismatch the cache on the server side, if this happens, you have to upload your data again."
								, helpStyle
								, GUILayout.ExpandWidth(true));
						}
						GUI.enabled = (state == 0);
						// save current mesh as a lod version of asset
						if(GUILayout.Button("Save Current Mesh", GUILayout.ExpandWidth(true), GUILayout.ExpandWidth(true))) {
							foreach (Mantis_Mesh child in Mantis_Meshes) {
								// clone the mesh
								Mesh new_mesh = (Mesh)Instantiate(child.mesh);
								// remove unused vertices
								if(new_mesh.blendShapeCount == 0) {
									shrink_mesh(new_mesh);
								}
								string filePath = EditorUtility.SaveFilePanelInProject (
									"Save Current Mesh",
									new_mesh.name + "_Quality_" + quality.ToString() + ".asset",
									"asset",
									"Choose a file location"
									);   
								if(filePath!="") {
									AssetDatabase.CreateAsset(new_mesh, filePath);
									AssetDatabase.SaveAssets();
									AssetDatabase.Refresh();
								}
							}
						}
						GUI.enabled = true;
						if(show_help) {
							GUILayout.Label(
								"When Clicked, save the meshes of current quality as LOD files."
								, helpStyle
								, GUILayout.ExpandWidth(true));
						}
						GUI.enabled = (state == 0);
						protect_boundary = EditorGUILayout.Toggle ("Protect Boundary", protect_boundary);
						GUI.enabled = true;
						if(show_help) {
							GUILayout.Label(
								"When checked, all open boundaries will be protected; Otherwise, some smooth parts of open boundaries will be smartly merged. Both way, uv boundaries and material boundaries will be protected."
								, helpStyle
								, GUILayout.ExpandWidth(true));
						}
						GUI.enabled = (state == 0);
						protect_detail = EditorGUILayout.Toggle ("More Details", protect_detail);
						GUI.enabled = true;
						if(show_help) {
							GUILayout.Label(
								"When checked, more details will be preserved, you should check it only if you are making the highest LOD; Otherwise, please leave it unchecked to get best results."
								, helpStyle
								, GUILayout.ExpandWidth(true));
						}
						GUI.enabled = (state == 0);
						protect_symmetry = EditorGUILayout.Toggle ("Protect Symmetry", protect_symmetry);
						GUI.enabled = true;
						if(show_help) {
							GUILayout.Label(
								"When checked, all symmetric uv mapping will be preserved, you should check it only if you are making the higher LODs; Otherwise, please leave it unchecked to get best results."
								, helpStyle
								, GUILayout.ExpandWidth(true));
						}
						EditorGUILayout.LabelField("Triangles", face_number.ToString() + "/" + origin_face_number.ToString());
						if(show_help) {
							GUILayout.Label(
								"Display current triangle number and total triangle number."
								, helpStyle
								, GUILayout.ExpandWidth(true));
						}
						GUI.enabled = (state == 0);
						quality = EditorGUILayout.Slider ("Quality", quality, 0.0f, 100.0f);
						GUI.enabled = true;
						if(show_help) {
							GUILayout.Label(
								"Drag to change the quality, the mesh will change just in time, be patient to wait for the completion of online operation."
								, helpStyle
								, GUILayout.ExpandWidth(true));
						}
						if(state != 0) {
							EditorGUILayout.LabelField("Time Elapse", (Time.realtimeSinceStartup - start_time).ToString("#0.0"));
						}
						if(www_result != null) {
							GUILayout.Label(
								www_result
								, helpStyle
								, GUILayout.ExpandWidth(true));
						}
						if (GUI.changed) {
							if(save_show_help != show_help) {
								string filename = "mantis_not_show_help";
								if(show_help) {
									if(System.IO.File.Exists(filename)) System.IO.File.Delete(filename);
								} else {
									if(!System.IO.File.Exists(filename)) System.IO.File.Create(filename);
								}
								save_show_help = show_help;
							}
							if(save_protect_boundary != protect_boundary) {
								quality = 100.0f;
								save_protect_boundary = protect_boundary;
							}
							if(save_protect_detail != protect_detail) {
								quality = 100.0f;
								save_protect_detail = protect_detail;
							}
							if(save_protect_symmetry != protect_symmetry) {
								quality = 100.0f;
								save_protect_symmetry = protect_symmetry;
							}
							if(save_quality != quality) {
								// when idle
								if (state == 0) {
									start_update(1);
								}
							}
						}
					}
				}
			}
		}
		private void start_update(int one_state) {
			state = one_state;
			tag_when_update = 0;
			start_time = Time.realtimeSinceStartup;
			EditorApplication.update += Update;
		}
		private void end_update() {
			state = 0;
			tag_when_update = 0;
			start_time = 0.0f;
			EditorApplication.update -= Update;
		}
		private void shrink_mesh(Mesh mesh) {
			// get all origin data
			Vector3[] origin_vertices = mesh.vertices;
			Vector3[] vertices = null;
			if(origin_vertices != null && origin_vertices.Length > 0) vertices = new Vector3[origin_vertices.Length];
			BoneWeight[] origin_boneWeights = mesh.boneWeights;
			BoneWeight[] boneWeights = null;
			if(origin_boneWeights != null && origin_boneWeights.Length > 0) boneWeights = new BoneWeight[origin_boneWeights.Length];
			Color[] origin_colors = mesh.colors;
			Color[] colors = null;
			if(origin_colors != null && origin_colors.Length > 0) colors = new Color[origin_colors.Length];
			Color32[] origin_colors32 = mesh.colors32;
			Color32[] colors32 = null;
			if(origin_colors32 != null && origin_colors32.Length > 0) colors32 = new Color32[origin_colors32.Length];
			Vector4[] origin_tangents = mesh.tangents;
			Vector4[] tangents = null;
			if(origin_tangents != null && origin_tangents.Length > 0) tangents = new Vector4[origin_tangents.Length];
			Vector2[] origin_uv = mesh.uv;
			Vector2[] uv = null;
			if(origin_uv != null && origin_uv.Length > 0) uv = new Vector2[origin_uv.Length];
			Vector2[] origin_uv2 = mesh.uv2;
			Vector2[] uv2 = null;
			if(origin_uv2 != null && origin_uv2.Length > 0) uv2 = new Vector2[origin_uv2.Length];
			int[][] origin_triangles = new int[mesh.subMeshCount][];
			for (int i=0; i<mesh.subMeshCount; i++) {
				origin_triangles[i] = mesh.GetTriangles(i);
			}
			// 	make permutation
			Hashtable imap = new Hashtable ();
			int vertex_count = 0;
			for (int i=0; i<mesh.subMeshCount; i++) {
				int[] triangles = mesh.GetTriangles(i);
				for(int j=0; j<triangles.Length; j += 3) {
					if(!imap.Contains(triangles[j])) {
						if(vertices != null) vertices[vertex_count] = origin_vertices[triangles[j]];
						if(boneWeights != null) boneWeights[vertex_count] = origin_boneWeights[triangles[j]];
						if(colors != null) colors[vertex_count] = origin_colors[triangles[j]];
						if(colors32 != null) colors32[vertex_count] = origin_colors32[triangles[j]];
						if(tangents != null) tangents[vertex_count] = origin_tangents[triangles[j]];
						if(uv != null) uv[vertex_count] = origin_uv[triangles[j]];
						if(uv2 != null) uv2[vertex_count] = origin_uv2[triangles[j]];
						imap.Add(triangles[j], vertex_count);
						vertex_count++;
					}
					if(!imap.Contains(triangles[j+1])) {
						if(vertices != null) vertices[vertex_count] = origin_vertices[triangles[j+1]];
						if(boneWeights != null) boneWeights[vertex_count] = origin_boneWeights[triangles[j+1]];
						if(colors != null) colors[vertex_count] = origin_colors[triangles[j+1]];
						if(colors32 != null) colors32[vertex_count] = origin_colors32[triangles[j+1]];
						if(tangents != null) tangents[vertex_count] = origin_tangents[triangles[j+1]];
						if(uv != null) uv[vertex_count] = origin_uv[triangles[j+1]];
						if(uv2 != null) uv2[vertex_count] = origin_uv2[triangles[j+1]];
						imap.Add(triangles[j+1], vertex_count);
						vertex_count++;
					}
					if(!imap.Contains(triangles[j+2])) {
						if(vertices != null) vertices[vertex_count] = origin_vertices[triangles[j+2]];
						if(boneWeights != null) boneWeights[vertex_count] = origin_boneWeights[triangles[j+2]];
						if(colors != null) colors[vertex_count] = origin_colors[triangles[j+2]];
						if(colors32 != null) colors32[vertex_count] = origin_colors32[triangles[j+2]];
						if(tangents != null) tangents[vertex_count] = origin_tangents[triangles[j+2]];
						if(uv != null) uv[vertex_count] = origin_uv[triangles[j+2]];
						if(uv2 != null) uv2[vertex_count] = origin_uv2[triangles[j+2]];
						imap.Add(triangles[j+2], vertex_count);
						vertex_count++;
					}
				}
			}
			// set data back to mesh
			mesh.Clear (false);
			if (vertices != null) {
				Vector3[] new_vertices = new Vector3[vertex_count];
				Array.Copy(vertices, new_vertices, vertex_count);
				mesh.vertices = new_vertices;
			}
			if (boneWeights != null) {
				BoneWeight[] new_boneWeights = new BoneWeight[vertex_count];
				Array.Copy(boneWeights, new_boneWeights, vertex_count);
				mesh.boneWeights = new_boneWeights;
			}
			if (colors != null) {
				Color[] new_colors = new Color[vertex_count];
				Array.Copy(colors, new_colors, vertex_count);
				mesh.colors = new_colors;
			}
			if (colors32 != null) {
				Color32[] new_colors32 = new Color32[vertex_count];
				Array.Copy(colors32, new_colors32, vertex_count);
				mesh.colors32 = new_colors32;
			}
			if (tangents != null) {
				Vector4[] new_tangents = new Vector4[vertex_count];
				Array.Copy(tangents, new_tangents, vertex_count);
				mesh.tangents = new_tangents;
			}
			if (uv != null) {
				Vector2[] new_uv = new Vector2[vertex_count];
				Array.Copy(uv, new_uv, vertex_count);
				mesh.uv = new_uv;
			}
			if (uv2 != null) {
				Vector2[] new_uv2 = new Vector2[vertex_count];
				Array.Copy(uv2, new_uv2, vertex_count);
				mesh.uv2 = new_uv2;
			}
			mesh.subMeshCount = origin_triangles.Length;
			for (int i=0; i<mesh.subMeshCount; i++) {
				int[] new_triangles = new int[origin_triangles[i].Length];
				for(int j=0; j<new_triangles.Length; j += 3) {
					new_triangles[j] = (int)imap[origin_triangles[i][j]];
					new_triangles[j+1] = (int)imap[origin_triangles[i][j+1]];
					new_triangles[j+2] = (int)imap[origin_triangles[i][j+2]];
				}
				mesh.SetTriangles(new_triangles, i);
			}
			// refresh normals and bounds
			mesh.RecalculateNormals();
			mesh.RecalculateBounds();
		}
		private void get_all_meshes() {
			Component[] allFilters = (Component[])((Component)target).gameObject.GetComponentsInChildren (typeof(MeshFilter));
			Component[] allRenderers = (Component[])((Component)target).gameObject.GetComponentsInChildren (typeof(SkinnedMeshRenderer));
			int mesh_count = allFilters.Length + allRenderers.Length;
			if (mesh_count > 0) {
				Mantis_Meshes = new Mantis_Mesh[mesh_count];
				int counter = 0;
				foreach (Component child in allFilters) {
					Mantis_Meshes[counter] = new Mantis_Mesh();
					Mantis_Meshes[counter].mesh = ((MeshFilter)child).sharedMesh;
					counter++;
				}
				foreach (Component child in allRenderers) {
					Mantis_Meshes[counter] = new Mantis_Mesh();
					Mantis_Meshes[counter].mesh = ((SkinnedMeshRenderer)child).sharedMesh;
					counter++;
				}
			}
		}
		void Awake() {
			init_all();
		}
		void init_all() {
			if (Mantis_Meshes == null) {
				if(target) {
					get_all_meshes();
					if (Mantis_Meshes != null) {
						face_number = 0;
						foreach (Mantis_Mesh child in Mantis_Meshes) {
							int triangle_number = child.mesh.triangles.Length;
							child.origin_triangles = new int[child.mesh.subMeshCount][];
							// out data is large than origin data
							child.out_triangles = new int[triangle_number*2];
							for(int i=0; i<child.mesh.subMeshCount; i++) {
								int[] sub_triangles = child.mesh.GetTriangles(i);
								face_number += sub_triangles.Length/3;
								// save origin triangle list
								child.origin_triangles[i] = new int[sub_triangles.Length];
								Array.Copy(sub_triangles, child.origin_triangles[i], sub_triangles.Length);
							}
							// load cached uuid
							string filename = "mantis_uuid_" + child.mesh.GetInstanceID().ToString();
							if(System.IO.File.Exists(filename)) {
								child.uuid = System.IO.File.ReadAllText(filename);
							} else {
								child.uuid = null;
							}
						}
						origin_face_number = face_number;
						string filename2 = "mantis_not_show_help";
						if(System.IO.File.Exists(filename2)) {
							show_help = false;
							save_show_help = false;
						} else {
							show_help = true;
							save_show_help = true;
						}
					}
				}
			}
		}
		void Update() {
			// we cannot use nice yield method in Editor class, I have to write ugly code:(
			switch(state) {
			case 1: download_stage_1(); break;
			case 2: download_stage_2(); break;
			case 3: download_stage_3(); break;
			case 101: upload_stage_1(); break;
			case 102: upload_stage_2(); break;
			}
			// show time elapse label in main thread
			Repaint();
		}
		private void download_stage_1() {
			face_number = 0;
			state = 2;
		}
		private void download_stage_2() {
			Mantis_Mesh child = Mantis_Meshes[tag_when_update];
			// get triangle list by quality value
			if(child.uuid != null) {
				get_triangle_list(child.uuid, quality, child.out_triangles, ref child.out_count);
				state = 3;
			} else {
				www_result = "You need to upload your mesh.";
				end_update();
			}
		}
		private void download_stage_3() {
			if(www.isDone) {
				if(!String.IsNullOrEmpty(www.error)) {
					www_result = "Error with network: " + www.error;
					end_update();
				} else {
					string ret = www.text;
					if(ret[0] == '[' && ret[ret.Length-2] == ']') {
						ret = ret.Substring(1, ret.Length-3);
						string[] triangle_array = ret.Split(new char[]{' '});
						Mantis_Mesh child = Mantis_Meshes[tag_when_update];
						for(int i=0; i<triangle_array.Length; i++) {
							child.out_triangles[i] = int.Parse(triangle_array[i]);
						}
						child.out_count = triangle_array.Length;
						if(child.out_count > 0) {
							int counter = 0;
							int mat = 0;
							while(counter < child.out_count) {
								int len = child.out_triangles[counter];
								counter++;
								if(len > 0) {
									int[] new_triangles = new int[len];
									Array.Copy(child.out_triangles, counter, new_triangles, 0, len);
									child.mesh.SetTriangles(new_triangles, mat);
									counter += len;
								} else {
									child.mesh.SetTriangles((int[])null, mat);
								}
								mat++;
							}
							face_number += child.mesh.triangles.Length/3;
							// refresh normals and bounds
							child.mesh.RecalculateNormals();
							child.mesh.RecalculateBounds();
							EditorUtility.SetDirty (target);
						}
						
						tag_when_update++;
						if(tag_when_update < Mantis_Meshes.Length) {
							// loop to stage 2
							state = 2;
						} else {
							// finish
							save_quality = quality;
							end_update();
						}
					} else {
						www_result = www.text;
						end_update();
					}
				}
			}
		}
		
		private void upload_stage_1() {
			Mantis_Mesh child = Mantis_Meshes[tag_when_update];
			int triangle_number = child.mesh.triangles.Length;
			Vector3[] vertices = child.mesh.vertices;
			// in data is large than origin data
			int[] triangles = new int[triangle_number*2];
			// we need normal data to protect normal boundary
			Vector3[] normals = child.mesh.normals;
			// we need color data to protect color boundary
			Color[] colors = child.mesh.colors;
			// we need uv data to protect uv boundary
			Vector2[] uvs = child.mesh.uv;
			int counter = 0;
			for(int i=0; i<child.mesh.subMeshCount; i++) {
				int[] sub_triangles = child.mesh.GetTriangles(i);
				triangles[counter] = sub_triangles.Length;
				counter++;
				Array.Copy(sub_triangles, 0, triangles, counter, sub_triangles.Length);
				counter += sub_triangles.Length;
			}
			
			// upload data
			upload_data(vertices, vertices.Length, triangles, counter, normals, normals.Length, colors, colors.Length, uvs, uvs.Length);
			state = 102;
		}
		private void upload_stage_2() {
			if(www.isDone) {
				if(!String.IsNullOrEmpty(www.error)) {
					www_result = "Error with network: " + www.error;
					end_update();
				} else {
					string ret = www.text;
					if(ret[0] == '[' && ret[ret.Length-2] == ']') {
						ret = ret.Substring(1, ret.Length-3);
						Mantis_Mesh child = Mantis_Meshes[tag_when_update];
						child.uuid = ret;
						// save uuid to file
						string filename = "mantis_uuid_" + child.mesh.GetInstanceID().ToString();
						System.IO.File.WriteAllText(filename, child.uuid);
						
						tag_when_update++;
						if(tag_when_update < Mantis_Meshes.Length) {
							// loop to stage 1
							state = 101;
						} else {
							// finish
							www_result = "Upload success.";
							end_update();
						}
					} else {
						www_result = www.text;
						end_update();
					}
				}
			}
		}
		private void upload_data(Vector3[] vertex_array, int vertex_count, int[] triangle_array, int triangle_count, Vector3[] normal_array, int normal_count, Color[] color_array, int color_count, Vector2[] uv_array, int uv_count) {
			WWWForm form = new WWWForm();
			StringBuilder vertex_array_string = new StringBuilder();
			StringBuilder triangle_array_string = new StringBuilder();
			StringBuilder normal_array_string = new StringBuilder();
			StringBuilder color_array_string = new StringBuilder();
			StringBuilder uv_array_string = new StringBuilder();
			for(int i=0; i<vertex_count; i++) {
				vertex_array_string.Append(vertex_array[i].x.ToString("G6"));
				vertex_array_string.Append(" ");
				vertex_array_string.Append(vertex_array[i].y.ToString("G6"));
				vertex_array_string.Append(" ");
				vertex_array_string.Append(vertex_array[i].z.ToString("G6"));
				if(i+1 != vertex_count) vertex_array_string.Append(" ");
			}
			for(int i=0; i<triangle_count; i++) {
				triangle_array_string.Append(triangle_array[i].ToString());
				if(i+1 != triangle_count) triangle_array_string.Append(" ");
			}
			for(int i=0; i<normal_count; i++) {
				normal_array_string.Append(normal_array[i].x.ToString("G6"));
				normal_array_string.Append(" ");
				normal_array_string.Append(normal_array[i].y.ToString("G6"));
				normal_array_string.Append(" ");
				normal_array_string.Append(normal_array[i].z.ToString("G6"));
				if(i+1 != normal_count) normal_array_string.Append(" ");
			}
			for(int i=0; i<color_count; i++) {
				color_array_string.Append(color_array[i].r.ToString("G6"));
				color_array_string.Append(" ");
				color_array_string.Append(color_array[i].g.ToString("G6"));
				color_array_string.Append(" ");
				color_array_string.Append(color_array[i].b.ToString("G6"));
				color_array_string.Append(" ");
				color_array_string.Append(color_array[i].a.ToString("G6"));
				if(i+1 != color_count) color_array_string.Append(" ");
			}
			for(int i=0; i<uv_count; i++) {
				uv_array_string.Append(uv_array[i].x.ToString("G6"));
				uv_array_string.Append(" ");
				uv_array_string.Append(uv_array[i].y.ToString("G6"));
				if(i+1 != uv_count) uv_array_string.Append(" ");
			}
			form.AddField("vertex_array", vertex_array_string.ToString());
			form.AddField("vertex_count", vertex_count.ToString());
			form.AddField("triangle_array", triangle_array_string.ToString());
			form.AddField("triangle_count", triangle_count.ToString());
			form.AddField("normal_array", normal_array_string.ToString());
			form.AddField("normal_count", normal_count.ToString());
			form.AddField("color_array", color_array_string.ToString());
			form.AddField("color_count", color_count.ToString());
			form.AddField("uv_array", uv_array_string.ToString());
			form.AddField("uv_count", uv_count.ToString());
			
			www = new WWW("http://" + server_name + "/cgi-bin/upload3.cgi", form);
			www_result = null;
		}
		private void get_triangle_list(string uuid, float goal, int[] triangles, ref int triangle_count) {
			WWWForm form = new WWWForm();
			form.AddField("uuid", uuid);
			form.AddField("goal", goal.ToString());
			form.AddField("protect_boundary", protect_boundary?"1":"0");
			form.AddField("protect_detail", protect_detail?"1":"0");
			form.AddField("protect_symmetry", protect_symmetry?"1":"0");
			www = new WWW("http://" + server_name + "/cgi-bin/download3.cgi", form);
			www_result = null;
		}
		private void clean_all() {
			// restore triangle list
			if (Mantis_Meshes != null) {
				if(target) {
					foreach (Mantis_Mesh child in Mantis_Meshes) {
						if(child.uuid != null) {
							for(int i=0; i<child.mesh.subMeshCount; i++) {
								child.mesh.SetTriangles(child.origin_triangles[i], i);
							}
							child.mesh.RecalculateNormals();
							child.mesh.RecalculateBounds();
							child.uuid = null;
						}
					}
				}
				Mantis_Meshes = null;
			}
		}
		public void OnDisable() {
			clean_all();
		}
		public void OnDestroy() {
			clean_all ();
		}
	}
}