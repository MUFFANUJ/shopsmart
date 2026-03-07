#!/bin/bash

# ===== CONFIG =====
INSTANCE_ID="i-0705b439599d746f3"

# ===== FETCH STATE =====
INSTANCE_STATE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text)

# ===== FETCH HEALTH =====
SYSTEM_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids "$INSTANCE_ID" \
  --query "InstanceStatuses[0].SystemStatus.Status" \
  --output text 2>/dev/null)

INSTANCE_STATUS=$(aws ec2 describe-instance-status \
  --instance-ids "$INSTANCE_ID" \
  --query "InstanceStatuses[0].InstanceStatus.Status" \
  --output text 2>/dev/null)

# Handle stopped or transitional instances
if [ "$INSTANCE_STATE" != "running" ]; then
  SYSTEM_STATUS="N/A"
  INSTANCE_STATUS="N/A"
fi

# ===== OUTPUT =====
echo "-------------------------------"
echo "Instance ID: $INSTANCE_ID"
echo "State:       $INSTANCE_STATE"

if [ "$SYSTEM_STATUS" == "ok" ] && [ "$INSTANCE_STATUS" == "ok" ]; then
  echo "Health:      [OK]"
else
  echo "Health:      [ALERT]"
  echo "[WARNING] SystemStatus=$SYSTEM_STATUS, InstanceStatus=$INSTANCE_STATUS"
fi
echo "-------------------------------"
