import SimplePeer from "simple-peer";
import { Vector3 } from "@babylonjs/core";

interface PlayerState {
  position: Vector3;
  velocity: Vector3;
}

export class NetworkSystem {
  private peers: SimplePeer.Instance[] = [];
  private lastBroadcast = 0;

  initialize() {
    // Placeholder: in a real deployment, signaling would be handled via a lobby service.
    this.peers = [];
  }

  connect(signal: SimplePeer.SignalData) {
    const peer = new SimplePeer({ initiator: true, trickle: false });
    peer.on("signal", () => {
      // Send signal to remote via signaling server.
    });
    peer.on("data", (data) => {
      void data;
    });
    peer.signal(signal);
    this.peers.push(peer);
  }

  update(delta: number, state: PlayerState) {
    this.lastBroadcast += delta;
    if (this.lastBroadcast < 0.1) return;
    this.lastBroadcast = 0;

    const payload = JSON.stringify({
      x: state.position.x,
      y: state.position.y,
      z: state.position.z,
      vx: state.velocity.x,
      vy: state.velocity.y,
      vz: state.velocity.z,
    });

    this.peers.forEach((peer) => {
      if (peer.connected) {
        peer.send(payload);
      }
    });
  }
}
