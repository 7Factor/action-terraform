#!/usr/bin/env bash

set -euo pipefail

plan_stdout_file=$(mktemp)
plan_stderr_file=$(mktemp)
plan_excerpt_file=$(mktemp)
plan_combined_file=$(mktemp)

cleanup_plan_files() {
  rm -f "$plan_stdout_file" "$plan_stderr_file" "$plan_excerpt_file" "$plan_combined_file"
}
trap cleanup_plan_files EXIT

PLAN_COMMENT_MAX_BYTES="${PLAN_COMMENT_MAX_BYTES:-60000}"
PLAN_COMMENT_EXCERPT_MAX_BYTES="${PLAN_COMMENT_EXCERPT_MAX_BYTES:-12288}"

write_multiline_output() {
  local output_name="$1"
  local file_path="$2"
  local delimiter="${output_name}_$(date +%s)_$RANDOM"

  {
    echo "${output_name}<<${delimiter}"
    cat "$file_path"
    printf '\n%s\n' "$delimiter"
  } >> "$GITHUB_OUTPUT"
}

plan_command="${TF_CLI} plan -input=false"

if [ -n "${TF_PLAN_NO_COLOR:-}" ]; then
  plan_command="${plan_command} ${TF_PLAN_NO_COLOR}"
fi

if [ -n "${TF_PLAN_DESTROY:-}" ]; then
  plan_command="${plan_command} ${TF_PLAN_DESTROY}"
fi

if [ -n "${TF_PLAN_OUT:-}" ]; then
  plan_command="${plan_command} ${TF_PLAN_OUT}"
fi

if [ -n "${TF_PLAN_ACTION_ARGS:-}" ]; then
  plan_command="${plan_command} ${TF_PLAN_ACTION_ARGS}"
fi

set +e
eval "$plan_command" \
  > >(tee "$plan_stdout_file") \
  2> >(tee "$plan_stderr_file" >&2)
plan_exit_code=$?
set -e

plan_stdout_bytes=$(wc -c < "$plan_stdout_file" | tr -d '[:space:]')
plan_stderr_bytes=$(wc -c < "$plan_stderr_file" | tr -d '[:space:]')
plan_total_bytes=$((plan_stdout_bytes + plan_stderr_bytes))

if [ "$plan_total_bytes" -le "$PLAN_COMMENT_MAX_BYTES" ]; then
  {
    echo "comment_overflow=false"
    echo "comment_excerpt_source=full"
  } >> "$GITHUB_OUTPUT"

  write_multiline_output "comment_stdout" "$plan_stdout_file"
  write_multiline_output "comment_stderr" "$plan_stderr_file"
else
  plan_summary_match=$(grep -nE -m 1 '^Plan: [0-9]+ to add, [0-9]+ to change, [0-9]+ to destroy\.$' "$plan_stdout_file" || true)

  if [ -n "$plan_summary_match" ]; then
    plan_summary_line="${plan_summary_match%%:*}"
    tail -n +"$plan_summary_line" "$plan_stdout_file" > "$plan_combined_file"
    head -c "$PLAN_COMMENT_EXCERPT_MAX_BYTES" "$plan_combined_file" > "$plan_excerpt_file"
    comment_excerpt_source="plan-summary"
  else
    cat "$plan_stdout_file" "$plan_stderr_file" > "$plan_combined_file"
    tail -c "$PLAN_COMMENT_EXCERPT_MAX_BYTES" "$plan_combined_file" > "$plan_excerpt_file"
    comment_excerpt_source="tail"
  fi

  {
    echo "comment_overflow=true"
    echo "comment_excerpt_source=${comment_excerpt_source}"
    echo "comment_stderr="
  } >> "$GITHUB_OUTPUT"
  write_multiline_output "comment_stdout" "$plan_excerpt_file"
fi

exit "$plan_exit_code"
