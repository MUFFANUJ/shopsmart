#!/bin/bash
# Destroys all AWS resources created by the final-phase pipeline.
# Run this before re-triggering the pipeline to avoid "already exists" errors.
# Usage: bash final-phase/scripts/clean.sh

set -e

REGION="${AWS_REGION:-us-east-1}"
TF_DIR="$(cd "$(dirname "$0")/../terraform" && pwd)"

echo "=========================================="
echo "  ShopSmart Final Phase — Cleanup"
echo "  Region: $REGION"
echo "=========================================="

# 1. Scale ECS services to 0
echo ""
echo "→ Stopping ECS services..."
CLUSTERS=$(aws ecs list-clusters --region "$REGION" \
  --query 'clusterArns[]' --output text 2>/dev/null || echo "")

for CLUSTER_ARN in $CLUSTERS; do
  CLUSTER_NAME=$(basename "$CLUSTER_ARN")
  if [[ "$CLUSTER_NAME" == *"shopsmart-final"* ]]; then
    SERVICES=$(aws ecs list-services --cluster "$CLUSTER_NAME" \
      --region "$REGION" --query 'serviceArns[]' --output text 2>/dev/null || echo "")
    for SERVICE_ARN in $SERVICES; do
      SERVICE_NAME=$(basename "$SERVICE_ARN")
      echo "  Scaling down: $SERVICE_NAME"
      aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" \
        --desired-count 0 --region "$REGION" > /dev/null 2>&1 || true
    done
  fi
done
sleep 15

# 2. Empty S3 buckets
echo ""
echo "→ Emptying S3 buckets..."
BUCKETS=$(aws s3api list-buckets \
  --query 'Buckets[?starts_with(Name, `shopsmart-final`)].Name' \
  --output text 2>/dev/null || echo "")

for BUCKET in $BUCKETS; do
  if [ -n "$BUCKET" ] && [ "$BUCKET" != "None" ]; then
    echo "  Emptying: $BUCKET"
    aws s3 rm "s3://$BUCKET" --recursive --region "$REGION" > /dev/null 2>&1 || true

    VERSIONS=$(aws s3api list-object-versions --bucket "$BUCKET" \
      --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' \
      --output json 2>/dev/null || echo '{"Objects":[]}')
    if echo "$VERSIONS" | grep -q '"Key"'; then
      aws s3api delete-objects --bucket "$BUCKET" --delete "$VERSIONS" \
        --region "$REGION" > /dev/null 2>&1 || true
    fi

    MARKERS=$(aws s3api list-object-versions --bucket "$BUCKET" \
      --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' \
      --output json 2>/dev/null || echo '{"Objects":[]}')
    if echo "$MARKERS" | grep -q '"Key"'; then
      aws s3api delete-objects --bucket "$BUCKET" --delete "$MARKERS" \
        --region "$REGION" > /dev/null 2>&1 || true
    fi
  fi
done

# 3. Terraform destroy
echo ""
echo "→ Running terraform destroy..."
if [ -f "$TF_DIR/terraform.tfstate" ]; then
  cd "$TF_DIR"
  terraform init -reconfigure > /dev/null 2>&1
  terraform destroy -auto-approve \
    -var="deploy_ecs_service=false" \
    -var="aws_region=$REGION" || echo "⚠️  Some resources may need manual cleanup."
else
  echo "  No local terraform.tfstate found — skipping terraform destroy."
fi

# 4. Force-delete remaining ECR repos
echo ""
echo "→ Cleaning up ECR repositories..."
REPOS=$(aws ecr describe-repositories --region "$REGION" \
  --query 'repositories[?starts_with(repositoryName, `shopsmart-final`)].repositoryName' \
  --output text 2>/dev/null || echo "")
for REPO in $REPOS; do
  if [ -n "$REPO" ] && [ "$REPO" != "None" ]; then
    echo "  Deleting: $REPO"
    aws ecr delete-repository --repository-name "$REPO" --force \
      --region "$REGION" > /dev/null 2>&1 || true
  fi
done

# 5. Delete CloudWatch log groups
echo ""
echo "→ Cleaning up CloudWatch log groups..."
LOG_GROUPS=$(aws logs describe-log-groups \
  --log-group-name-prefix "/ecs/shopsmart-final" --region "$REGION" \
  --query 'logGroups[].logGroupName' --output text 2>/dev/null || echo "")
for LG in $LOG_GROUPS; do
  if [ -n "$LG" ] && [ "$LG" != "None" ]; then
    echo "  Deleting: $LG"
    aws logs delete-log-group --log-group-name "$LG" \
      --region "$REGION" > /dev/null 2>&1 || true
  fi
done

echo ""
echo "=========================================="
echo "✅ Cleanup complete!"
echo "=========================================="