# Team 12 Forge deployment runner

# Usage from the repository root:
#   powershell -ExecutionPolicy Bypass -File deploy/run-local.ps1 -Action bootstrap

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('bootstrap', 'manifest')]
    [string]$Action
)

$ErrorActionPreference = 'Stop'

$Repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Config = Join-Path $Repo 'DxPay - africafintechfoundry access-youth-forge\team12.yml'
$AppYaml = Join-Path $Repo 'deploy\app.yaml'
$RegistryYaml = Join-Path $Repo 'deploy\registry.yaml'
$ReadyYaml = Join-Path $Repo 'deploy\readiness.yaml'

if (-not (Test-Path $Config)) {
    Write-Error "Missing kubeconfig: $Config"
    exit 1
}

switch ($Action) {
    'bootstrap' {
        Write-Host "Creating runtime secret..." -ForegroundColor Cyan
        kubectl --kubeconfig $Config -n team12 create secret generic dxpay-runtime --from-env-file=(Join-Path $Repo 'backend\.env.example') --dry-run=client -o yaml | Out-Null
        Write-Host "Applying readiness..." -ForegroundColor Cyan
        kubectl --kubeconfig $Config -n team12 apply --dry-run=client -f $ReadyYaml
        Write-Host "Applying app..." -ForegroundColor Cyan
        kubectl --kubeconfig $Config -n team12 apply --dry-run=client -f $AppYaml
    }
    'manifest' {
        Write-Host "Applying image manifests..." -ForegroundColor Cyan
        kubectl --kubeconfig $Config -n team12 apply --dry-run=client -f $RegistryYaml
        Write-Host "Applying readiness..." -ForegroundColor Cyan
        kubectl --kubeconfig $Config -n team12 apply --dry-run=client -f $ReadyYaml
        Write-Host "Applying app..." -ForegroundColor Cyan
        kubectl --kubeconfig $Config -n team12 apply --dry-run=client -f $AppYaml
    }
}
