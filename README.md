# Racer.pi

_WIP_

My grandpa is the coolest man alive. He is a retired master electrical engineer. In his free time, he builds pinewood derby cars and iterates over his models to build the fastest wooden car you'll ever see. He built a track that times each race using nothing but hardware. He does complex logic in circuits that would be easier for most to code.

Talking with him, I decided that it would be awesome to hook up his system to a raspberry pi for more advanced usage.

We hope by the end to be able to record each race and display the results live on a web server hosted from the raspberry pi.

_Stay tuned for a super cool multi-generational project._


# Application Architecture

<!-- Please view this maarkup with a Mermaid renderer (built into GitHub, or with VS Code + Mermaid Preview extentsion) -->

```mermaid
---
title: Architecture
---
flowchart TD
  subgraph Hardware IO
    track[Physical Race Track]
    gpio[GPIO Handler - Python]
  end

  subgraph State Management
    server[Application Server - NodeJS]
    ws-server[Server Socket]
  end

  subgraph User Interface
    subgraph Client Features
      client[Browser GUI]
      participants[Lane Assignments]
      csv[CSV Download]
    end

    ws-client[Client Socket]
  end

  gpio-- Triggers Race -->track
  track-- Reads Lane Events -->gpio
  gpio-- Notifies Lane Times -->server;
  server-- Notifies Race Start -->gpio;
  client-- Requests Race Start -->server;
  client-- Submits Race Participants -->server;
  ws-client-- Realtime Race Results -->client;
  ws-server-- Lane States -.->ws-client
  server-- Lane States -.->ws-server;
```