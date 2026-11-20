#!/usr/bin/env bash
set -euo pipefail

modes=("$@")
if [ ${#modes[@]} -eq 0 ]; then
  modes=("all")
fi

missing=()

require() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    missing+=("$name")
  fi
}

command -v python3 >/dev/null 2>&1 || { echo "Falta python3"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "Falta AWS CLI"; exit 1; }

require LAB_ROLE_ARN
require WEB_IMAGE_URI
require SUBNET1
require SUBNET2
require SG_WEB

if [ ${#missing[@]} -gt 0 ]; then
  echo "Faltan variables de entorno:"
  printf '  - %s\n' "${missing[@]}"
  echo
  echo "Ejemplo:"
  echo "  export LAB_ROLE_ARN=arn:aws:iam::<cuenta>:role/LabRole"
  echo "  export WEB_IMAGE_URI=<cuenta>.dkr.ecr.us-east-1.amazonaws.com/turnofacil-web:lab"
  echo "  export SUBNET1=subnet-... SUBNET2=subnet-... SG_WEB=sg-..."
  exit 1
fi

echo "Variables OK para: ${modes[*]}"
