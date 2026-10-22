$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open('C:\Users\praab\Downloads\fsdp\test_abstract_single.docx')
    $pages = $doc.ComputeStatistics(2)
    $lines = $doc.ComputeStatistics(1)
    Write-Output "Pages: $pages, Lines: $lines"
    $doc.Close([ref]$false)
} finally {
    $word.Quit()
}
