# Converge — Real-Time Collaboration Tool

**Live demo:** https://collab-tool1.vercel.app/  
**Status:** Demo

## What it does
A lightweight collaborative text editor that synchronizes user edits in near-real-time using WebSockets. Supports session rooms, presence indicators, and reconnection handling for reliability.

## Tech stack
- Frontend: React  
- Backend: Node.js, Express, Socket.IO

## Key features
- Multi-user synchronization with low-latency updates  
- Presence / typing indicators and per-session rooms  
- Reconnect and state sync to avoid data loss on transient disconnects

  ## How to run
1. Clone repo  
2. `cd backend` → `npm install` → `npm run dev`  
3. `cd frontend` → `npm install` → `npm run dev`
