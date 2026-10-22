$docxPath = "C:\Users\praab\Downloads\fsdp\ResQLink_Project_Report_Final.docx"
$pdfPath = "C:\Users\praab\Downloads\fsdp\ResQLink_Project_Report_Final.pdf"
$downloadsPdf = "C:\Users\praab\Downloads\ResQLink_Project_Report_Final.pdf"
$desktopPdf = "C:\Users\praab\Desktop\ResQLink_Project_Report_Final.pdf"

Write-Output "Starting Word COM conversion..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = [Microsoft.Office.Interop.Word.WdAlertLevel]::wdAlertsNone 2>$null

try {
    $doc = $word.Documents.Open($docxPath)
    # wdFormatPDF = 17
    $doc.SaveAs([ref]$pdfPath, [ref]17)
    $doc.Close([ref]$false)
    Write-Output "PDF successfully created at: $pdfPath"

    Copy-Item $pdfPath $downloadsPdf -Force
    Write-Output "Copied to Downloads: $downloadsPdf"

    Copy-Item $pdfPath $desktopPdf -Force -ErrorAction SilentlyContinue
    Write-Output "Copied to Desktop: $desktopPdf"
} catch {
    Write-Output "Conversion failed: $($_.Exception.Message)"
} finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
