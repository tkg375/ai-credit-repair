#!/bin/bash
# Builds the analyze-report Lambda deployment package
# Output: lambda/analyze-report.zip
# Usage: bash lambda/build.sh

set -e

LAMBDA_DIR="$(dirname "$0")/analyze-report"
OUTPUT="$(dirname "$0")/analyze-report.zip"

echo "Installing Lambda dependencies..."
cd "$LAMBDA_DIR"
npm install --omit=dev

echo "Creating deployment ZIP..."
cd "$LAMBDA_DIR"
zip -r "$OUTPUT" . --exclude "*.DS_Store" --exclude "__tests__/*"

echo ""
echo "Done! Upload to AWS Lambda: $OUTPUT"
echo ""
echo "Lambda settings:"
echo "  Runtime:  nodejs20.x"
echo "  Handler:  index.handler"
echo "  Timeout:  600 seconds (10 minutes)"
echo "  Memory:   512 MB"
