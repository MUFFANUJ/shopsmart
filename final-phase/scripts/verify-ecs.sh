#!/bin/bash
# Waits for the ECS service to become stable and prints status.
# Required env vars: AWS_REGION, ECS_CLUSTER_NAME, ECS_SERVICE_NAME

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"

if [ -z "$ECS_CLUSTER_NAME" ] || [ -z "$ECS_SERVICE_NAME" ]; then
  echo "Error: ECS_CLUSTER_NAME and ECS_SERVICE_NAME must be set."
  exit 1
fi

echo "Waiting for ECS service to become stable..."
aws ecs wait services-stable \
  --cluster "$ECS_CLUSTER_NAME" \
  --services "$ECS_SERVICE_NAME" \
  --region "$AWS_REGION"

echo "Fetching final ECS service state..."
aws ecs describe-services \
  --cluster "$ECS_CLUSTER_NAME" \
  --services "$ECS_SERVICE_NAME" \
  --region "$AWS_REGION" \
  --output table \
  --query 'services[0].{desiredCount:desiredCount,pendingCount:pendingCount,runningCount:runningCount,status:status,taskDefinition:taskDefinition}'

echo "ECS verification complete."