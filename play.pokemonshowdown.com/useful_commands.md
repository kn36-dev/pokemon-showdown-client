Get-ChildItem -Path ".\diancie" -File | Where-Object { $_.Name -match "^500-[\d\w]+" } | Rename-Item -NewName { $_.Name -replace "^500-", "diancie-" } -WhatIf

New-Item -ItemType SymbolicLink -Path "C:\Users\knlim\Documents\GitHub\pokemon-showdown\server\static" -Target "C:\Users\knlim\Documents\GitHub\pokemon-showdown-client\play.pokemonshowdown.com"

Get-ChildItem -Path . -Filter "*-452.png" -File -Recurse | Rename-Item -NewName { $_.Name -replace "-452\.png$", "-bewear.png" } -WhatIf
