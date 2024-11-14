#! /bin/sh
cd backend && npm run db:init && npm run db:latest && npm run db:seed
