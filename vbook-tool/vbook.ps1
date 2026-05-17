param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$ErrorActionPreference = "Stop"

$toolRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$cli = Join-Path $toolRoot "index.js"

if (-not (Test-Path $cli)) {
  throw "Cannot find VBook CLI at: $cli"
}

& node $cli @Args
exit $LASTEXITCODE

