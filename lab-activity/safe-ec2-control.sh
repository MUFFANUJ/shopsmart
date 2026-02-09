#!/bin/bash

# ===== CONFIG =====
INSTANCE_ID="i-0705b439599d746f3"

ACTION=$1

if [ -z "$ACTION" ]; then
  echo "[ERROR] Usage: $0 {start|stop}"
  exit 1
fi

# ===== SCOUT =====
CURRENT_STATE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text)

echo "[INFO] Current State: $CURRENT_STATE"

if [ "$ACTION" == "start" ]; then
  if [ "$CURRENT_STATE" == "running" ]; then
    echo "[SKIP] Instance is already running."
  else
    echo "[ACTION] Starting instance..."
    aws ec2 start-instances --instance-ids "$INSTANCE_ID"
  fi

elif [ "$ACTION" == "stop" ]; then
  if [ "$CURRENT_STATE" == "stopped" ]; then
      echo "[SKIP] Instance is already stopped."
  else
    echo "[ACTION] Stopping instance..."
    aws ec2 stop-instances --instance-ids "$INSTANCE_ID"
  fi

else
  echo "[ERROR] Invalid action: $ACTION"
  exit 1
fi