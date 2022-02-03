// script to be served to host

import { io, Socket } from "socket.io-client";
import { ServerToHostEvents, HostToServerEvents } from "../models/models";

// create socket - by default, tries to connect to same port website came from
const socket: Socket<ServerToHostEvents, HostToServerEvents> = io();