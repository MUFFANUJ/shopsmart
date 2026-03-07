#!/usr/bin/env bash
set -euo pipefail

"$(cd "$(dirname "$0")" && pwd)/scripts/deploy-ec2.sh"
