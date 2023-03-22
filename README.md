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

  subgraph Application Control
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

  track-- Triggers Race -->gpio
  track-- Reads Lane Events -->gpio
  gpio-- Notifies Lane Times -->server;
  gpio-- Notifies Race Start -->server;
  client-- Store Race Results to FS -->server;
  ws-client-- Realtime Race Results -->client;
  ws-server-- Lane States -.->ws-client
  server-- Lane States -.->ws-server;
  server-- Converts Race Data -->csv;
  participants-->client;
```

## Race Rules

This application follows the official [BSA Derby Rules](https://scoutingevent.com/Download/16069695/OR/2021_Monon_Pinewood_Derby_Rules.pdf), with one modification: the number of lanes is adjustable. You can edit values in the `.env` file.

> All cars will race in a double elimination format. Racing will take place on a four-lane track, with cars randomly chosen to race in heats. A first or second place finish in a heat is considered a “win”, and a third or fourth place finish is considered a “loss”. When a car receives its first loss it will be set aside. Heats will continue to be run until only two cars remain without a loss – those two cars are automatically in the Finals.
>
> Then all the cars with one loss will be run in heats again. Cars that receive a second
loss will be eliminated from the race. Heats will continue until all the cars have been run
and only two cars remain with a single loss. These two cars will join the other two cars
in the Finals.
> 
> For the Finals, the four remaining cars will run four heats. Each car will run one heat in
each lane. Cars receive 1 point for a first-place finish, 2 points for second place, 3
points for third place and 4 points for last place. After four heats, the car with the lowest
total score is the winner of the derby!

Those in the bottom half of each heat (4th, 5th, & 6th places in a 6 lane track), will be eliminated in the first round until there are only `half the number of lanes` of cars left. This is repeated a second time with the eliminated cars in Round 2. The winners of each round will face each other in the Finals.
