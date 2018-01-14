using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

public class GhostMovement : MonoBehaviour {
    Transform player;
    NavMeshAgent nav;
    // Use this for initialization
    private void Awake()
    {
        player = GameObject.FindGameObjectWithTag("Player").transform;
        nav = GetComponent<NavMeshAgent>();
        Debug.Log(player);
    }
    // Update is called once per frame
    void Update () {
        nav.SetDestination(player.position);
	}
}
