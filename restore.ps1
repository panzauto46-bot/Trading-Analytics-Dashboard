$baseUrl = "https://api.github.com/repos/panzauto46-bot/Trading-Analytics-Dashboard/git/blobs"
$outDir = "c:\Users\PANZ AUTO\Documents\Website Dashboard Analisis Trading\old-recovery\src"

$files = @{
    "App.tsx" = "85edc6354734f9bf2a89f73d85a721bf233de3a8"
    "main.tsx" = "e710ccb0a5ddd80bcd88e717fc9837457f20ec7b"
    "index.css" = "a461c505f1f0c24ab12240ac3f7fa374dfa237fb"
    "components/AITradingInsights.tsx" = "a484923fcfaa999cb3bec8fd892fe6e6007b4099"
    "components/DashboardSummary.tsx" = "bfd778217c8665770fc81366951d5042dd1be549"
    "components/Header.tsx" = "d36a38c19e1f4c232f67fe469988de45d323eeb9"
    "components/PnLChart.tsx" = "2aad8c1a40306f1e8118b4b4f2080b02970e35d0"
    "components/TradeHistoryTable.tsx" = "729b01158dc81c00551baaa7f6b4fab47d719466"
    "components/TradingHeatmap.tsx" = "033ef088c4a3fa7c8a9e577ac6d7af678952a14b"
    "components/WalletInfo.tsx" = "f86a5efae785733bddaa2c8fc6c1b6043d36bec6"
    "config/wagmi.ts" = "61035ab07e0615994df920a9f8c782f620cd2009"
    "context/TradingDataContext.tsx" = "61147e3c4267eeb33d4d8a0f5882f240ca157b97"
    "data/mockData.ts" = "8a26f3136a7e4e3a7b43e75597215149733a4ca2"
    "types/trade.ts" = "d45f156a8ceede27e2dc42c2df10419c7451739d"
    "utils/tradeGenerator.ts" = "f5e3dde0fa12675fa43ab6654e02fb34401e67fb"
}

foreach ($file in $files.GetEnumerator()) {
    $outPath = Join-Path $outDir $file.Key
    $dir = Split-Path $outPath -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    
    Write-Host "Fetching $($file.Key)..."
    $response = Invoke-RestMethod -Uri "$baseUrl/$($file.Value)"
    $content = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($response.content))
    [System.IO.File]::WriteAllText($outPath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  Saved: $outPath"
}

# Also fetch root files
$rootFiles = @{
    "package.json" = "614b1dd53c9ca93b807f1b77751676e52682f5cc"
    "tsconfig.json" = "d06d38f6f7df2f4bc4a1a3343376f8d01f25707f"
    "vite.config.ts" = "1f06afd4b79b46f28b416d4e339b51ef76d68bb3"
    "index.html" = "f7d1303587aa3bdfc22253624dac3b680cfcb82e"
}

$rootDir = "c:\Users\PANZ AUTO\Documents\Website Dashboard Analisis Trading\old-recovery"
foreach ($file in $rootFiles.GetEnumerator()) {
    $outPath = Join-Path $rootDir $file.Key
    Write-Host "Fetching $($file.Key)..."
    $response = Invoke-RestMethod -Uri "$baseUrl/$($file.Value)"
    $content = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($response.content))
    [System.IO.File]::WriteAllText($outPath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  Saved: $outPath"
}

Write-Host "`nDone! All files restored to old-recovery folder."
