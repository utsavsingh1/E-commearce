$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server is running on http://localhost:$port"
Write-Host "Press Ctrl+C to stop."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $requestUrl = $context.Request.Url.LocalPath
        
        if ($requestUrl -eq "/") {
            $requestUrl = "/index.html"
        }
        
        # Replace forward slashes with backslashes for Windows path
        $relativePath = $requestUrl.TrimStart("/").Replace("/", "\")
        $filePath = Join-Path $PWD $relativePath
        
        $response = $context.Response
        
        if (Test-Path $filePath -PathType Leaf) {
            try {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $content.Length
                
                if ($filePath.EndsWith(".html")) { $response.ContentType = "text/html" }
                elseif ($filePath.EndsWith(".css")) { $response.ContentType = "text/css" }
                elseif ($filePath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
                elseif ($filePath.EndsWith(".json")) { $response.ContentType = "application/json" }
                elseif ($filePath.EndsWith(".png")) { $response.ContentType = "image/png" }
                elseif ($filePath.EndsWith(".jpg") -or $filePath.EndsWith(".jpeg")) { $response.ContentType = "image/jpeg" }
                
                $response.OutputStream.Write($content, 0, $content.Length)
            } catch {
                $response.StatusCode = 500
            }
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
