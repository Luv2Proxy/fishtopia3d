import Peer, { DataConnection } from "peerjs";
import { Vector3 } from "@babylonjs/core";

interface PlayerState {
  position: Vector3;
  velocity: Vector3;
}

interface RemotePlayerState {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  lastSeen: number;
}

export class NetworkSystem {
  private peer?: Peer;
  private connections = new Map<string, DataConnection>();
  private remotePlayers = new Map<string, RemotePlayerState>();
  private lastBroadcast = 0;

  initialize() {
    this.peer = new Peer();
    this.peer.on("open", (id) => {
      console.info(`Peer ready: ${id}`);
    });
    this.peer.on("connection", (connection) => {
      this.registerConnection(connection);
    });
  }

  connect(peerId: string) {
    if (!this.peer) return;
    const connection = this.peer.connect(peerId, { reliable: true });
    this.registerConnection(connection);
  }

  update(delta: number, state: PlayerState) {
    this.lastBroadcast += delta;
    if (this.lastBroadcast < 0.1) return;
    this.lastBroadcast = 0;

    const payload = {
      x: state.position.x,
      y: state.position.y,
      z: state.position.z,
      vx: state.velocity.x,
      vy: state.velocity.y,
      vz: state.velocity.z,
    };

    this.connections.forEach((connection) => {
      if (connection.open) {
        connection.send(payload);
      }
    });
  }

  getRemotePlayers() {
    return Array.from(this.remotePlayers.values());
  }

  private registerConnection(connection: DataConnection) {
    this.connections.set(connection.peer, connection);
    connection.on("data", (data) => {
      if (typeof data !== "object" || data === null) return;
      const payload = data as Record<string, number>;
      this.remotePlayers.set(connection.peer, {
        id: connection.peer,
        position: {
          x: payload.x ?? 0,
          y: payload.y ?? 0,
          z: payload.z ?? 0,
        },
        velocity: {
          x: payload.vx ?? 0,
          y: payload.vy ?? 0,
          z: payload.vz ?? 0,
        },
        lastSeen: performance.now(),
      });
    });
    connection.on("close", () => {
      this.connections.delete(connection.peer);
      this.remotePlayers.delete(connection.peer);
    });
  }
}
