# install.ps1 - bootstrap installer for toolbatcher on Windows PowerShell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Write-Host "Running Toolbatcher bootstrap installer..."

# Check for required tools (Invoke-WebRequest)
if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue) -and -not (Get-Command Invoke-WebRequest -ErrorAction SilentlyContinue)) {
    Write-Host "curl/Invoke-WebRequest is required but not found. Please install PowerShell 6+ or use Windows 10+"
    exit 1
}

# Download and run main installer script
$script = 'https://toolbatcher.com/install/install_main.ps1'
$dest = "$env:TEMP\install_main.ps1"
Invoke-WebRequest -Uri $script -OutFile $dest
& powershell -NoProfile -ExecutionPolicy Bypass -File $dest @args
