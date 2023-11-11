# Racer.pi

_WIP_

My grandpa is the coolest man alive. He is a retired master electrical engineer. In his free time, he builds pinewood derby cars and iterates over his models to build the fastest wooden car you'll ever see. He built a track that times each race using nothing but hardware. He designs complex logic in circuits that would be easier for most people to code.

Talking with him, I decided that it would be awesome to hook up his system to a raspberry pi for more advanced usage.

We hope by the end to be able to record each race and display the results live on a web server hosted from the raspberry pi.

_Stay tuned for a super cool multi-generational project._


https://user-images.githubusercontent.com/18150457/227034838-89dd19ab-e7dd-4d19-a7b1-5251358dc0d0.mov

# Installing for the first time
This program requires Python3 and NodeJS. Python3 should already have come on your Raspberry Pi. For best Node installation, we reccomend FNM:

```sh
# install fast node manager
curl -fsSL https://fnm.vercel.app/install | bash;
source ~/.bashrc; # needed for using immediately 

# install Node16
fnm install 16;
fnm use 16;
```

Now you are ready to start using `npm` to install the program application. Please run:

```sh
npm install;
```

See `package.json` for avaliable `scripts`. Run `npm start` to run the fullstack, or `npm start:server` to run just the frontend parts.

## Install to Desktop

The following command will install the application as a _single click_ shortcut in the system menu and the desktop.

```sh
sudo bash installToDesktop.sh
```

# Application Architecture

We want the track to have control of race starts and lane events. This may seem a little complicated for such a "simple" project, but it comes with three wins:
1. Realtime frontend updates of race times/results
2. GPIO events can be mocked entirely - great for writing tests for the application logic
3. Event Driven: features are coupled to real life occurrences, not data models

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

### Hardware Layer
Responsibilities:
- Read physical lane events
- Time each lane
- Notify Application of events and results
  - calls `POST <server-port>/gpio/start` when a new race has started
  - calls `POST <server-port>/gpio/time?lane=<lane-number>&time=<lane-time>` when a lane has finished

### Application Control Layer
Responsibilities:
- Respond to events from the GPIO service
  - Forward (via WebSockets) lane events to the frontend
- Persist race data from the frontend
- Serve client application files

### User Interface
Responsibilities:
- Enforce BSA racing guidelines
  - Determine lane assignments for individual cars
  - Determine stages of racing (rounds and heats) 
  - Determine wins and rankings
- Display realtime race results for each heat
  - Respond to events from the WebSocket service
- Store ephemeral data relating to user flow


### Environment
To keep all services in sync, the `.env` file at the root of the project maintains configuration constants that are shared or globally known, such as the port locations of callable services and track information.

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

## Debugging & Testing

The frontend has some utilities to quickly test and debug certain situations. You can activate these utils in the console of the browser since the `DEBUG` object lives off of the window.

```js
DEBUG.preload.cars() // load a set of mock cars to run races against into the browsers localStorage


DEBUG.reset() // nuke localStorage to start from a clean slate
```

### Simulating a Heat

If you are running just the frontend with `npm run server:dev` or `npm run server:start`, then you will need to mock lane events to test the application. We have a testing script that does just that. You will need to run it in a new terminal tab, alongside your server.

```
bash test/mocks/gpio.single-heat.sh <number of cars>
```

So if I have 6 cars racing in one heat, then I should run:

```
bash test/mocks/gpio.single-heat.sh 6
```

Remember that number is important. You should run the exact number of cars that are expected - just like you would in a real race. So if a final heat only has 4 cars, put `4` as the argument to that script.
