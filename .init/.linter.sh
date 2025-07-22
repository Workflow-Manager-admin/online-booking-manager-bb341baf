#!/bin/bash
cd /home/kavia/workspace/code-generation/online-booking-manager-bb341baf/frontend_container
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

