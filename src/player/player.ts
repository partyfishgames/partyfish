// script to be served to player

import { io, Socket } from "socket.io-client";
import { ServerToPlayerEvents, PlayerToServerEvents } from "../models/models";

// create socket - by default, tries to connect to same port website came from
const socket: Socket<ServerToPlayerEvents, PlayerToServerEvents> = io();