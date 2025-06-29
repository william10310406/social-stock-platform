#!/bin/bash

# 報告命名規則檢查腳本
# 檢查所有報告檔案是否符合 YYYYMMDD_主題.md 格式

REPORT_DIRS=(
    "frontend/docs/guides"
    "frontend/docs/reports"
    "frontend/docs/implementation"
)

REGEX='^[0-9]{8}_.+\.md$'

error=0

for dir in "${REPORT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        for file in "$dir"/*.md; do
            [ -e "$file" ] || continue
            filename=$(basename "$file")
            if [[ ! $filename =~ $REGEX ]]; then
                echo "❌ $file 不符合命名規則 (YYYYMMDD_主題.md)"
                error=1
            fi
        done
    fi
done

if [ $error -eq 0 ]; then
    echo "✅ 所有報告檔案命名都符合規範！"
    exit 0
else
    echo "\n請將上述檔案重新命名為 YYYYMMDD_主題.md 格式，如 20240629_FRIENDLY_TROUBLESHOOTING.md"
    exit 1
fi 