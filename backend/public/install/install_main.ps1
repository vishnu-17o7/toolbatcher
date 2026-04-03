# install_main.ps1 - full installer for Toolbatcher on Windows
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Write-Host "Bootstrapping complete. Starting full installer..."
# Parse args (e.g., tool selections)
# ...existing code for prompting user or reading config...
# Download and run the actual application logic
iex ((New-Object Net.WebClient).DownloadString('https://toolbatcher.com/install/run.ps1'))
