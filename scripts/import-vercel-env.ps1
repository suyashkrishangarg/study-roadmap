# Imports variables from a local .env file into a Vercel project via the REST API.
# The Vercel CLI can only `env pull` (download), and the dashboard has no bulk
# import — this script pushes every key (except DATABASE_URL, which the Neon
# Marketplace integration already injects) to Production + Preview.
#
# Usage (from the project root):
#   .\scripts\import-vercel-env.ps1 -Token <vercel-api-token>
#   .\scripts\import-vercel-env.ps1 -Token <token> -ProjectName study-roadmap -EnvFile .env
#
# Token: vercel.com/account/tokens  (create one, paste it as -Token)

param(
  [Parameter(Mandatory = $true)] [string] $Token,
  [string] $ProjectName = "study-roadmap",
  [string] $EnvFile = ".env"
)

$ErrorActionPreference = "Stop"
$headers = @{ Authorization = "Bearer $Token" }

function Find-Project {
  $personal = Invoke-RestMethod -Headers $headers -Uri "https://api.vercel.com/v9/projects"
  $match = $personal.projects | Where-Object { $_.name -eq $ProjectName }
  if ($match) { return @{ Project = $match; TeamId = $null } }

  try {
    $teams = Invoke-RestMethod -Headers $headers -Uri "https://api.vercel.com/v2/teams"
    foreach ($team in $teams.teams) {
      $scoped = Invoke-RestMethod -Headers $headers -Uri "https://api.vercel.com/v9/projects?teamId=$($team.id)"
      $match = $scoped.projects | Where-Object { $_.name -eq $ProjectName }
      if ($match) { return @{ Project = $match; TeamId = $team.id } }
    }
  } catch {
    # not in a team, or no permission — fall through
  }
  return $null
}

$found = Find-Project
if (-not $found) {
  Write-Host "ERROR: project '$ProjectName' not found under this account." -ForegroundColor Red
  Write-Host "Check the project name in the Vercel dashboard (or pass -ProjectName)."
  exit 1
}

$project = $found.Project
$teamId = $found.TeamId
Write-Host "Project: $($project.name) (id $($project.id))$(if ($teamId) { " · team $teamId" })"

$uri = "https://api.vercel.com/v10/projects/$($project.id)/env"
if ($teamId) { $uri += "?teamId=$teamId" }

if (-not (Test-Path $EnvFile)) {
  Write-Host "ERROR: $EnvFile not found." -ForegroundColor Red
  exit 1
}

$added = 0
Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }

  $idx = $line.IndexOf("=")
  if ($idx -le 0) { return }
  $key = $line.Substring(0, $idx).Trim()
  $value = $line.Substring($idx + 1).Trim().Trim('"')

  if ($key -eq "DATABASE_URL") {
    Write-Host "SKIP   DATABASE_URL — already injected by the Neon integration"
    return
  }

  $body = @{
    key    = $key
    value  = $value
    type   = "encrypted"
    target = @("production", "preview")
  } | ConvertTo-Json

  try {
    Invoke-RestMethod -Method Post -Headers $headers -Uri $uri `
      -ContentType "application/json" -Body $body | Out-Null
    Write-Host "ADDED  $key" -ForegroundColor Green
    $added++
  } catch {
    $msg = "$($_.ErrorDetails.Message)"
    if ($msg -match "already exists") {
      Write-Host "EXISTS $key — already set on Vercel" -ForegroundColor Yellow
    } else {
      Write-Host "FAILED $key — $msg" -ForegroundColor Red
    }
  }
}

Write-Host ""
Write-Host "Done — $added variable(s) added to '$($project.name)' (Production + Preview)."
