try {
    $word = New-Object -ComObject Word.Application
    Write-Output "Word COM is available"
    $word.Quit()
} catch {
    Write-Output "Error: $($_.Exception.Message)"
}
