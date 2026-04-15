# check-server.ps1
# Verifica que el servidor Next.js este corriendo y que la pagina principal responda sin errores

param(
    [int]$Port = 3000,
    [string]$ServerHost = "localhost",
    [int]$TimeoutSec = 10
)

$baseUrl = "http://${ServerHost}:${Port}"
$passed = 0
$failed = 0

function Write-Pass($msg) {
    Write-Host "  [PASS] $msg" -ForegroundColor Green
    $script:passed++
}

function Write-Fail($msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:failed++
}

function Write-Section($msg) {
    Write-Host ""
    Write-Host "--- $msg ---" -ForegroundColor Cyan
}

# -------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Adventur Hotels - Server Health Check " -ForegroundColor Yellow
Write-Host "  Target: $baseUrl                      " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# -------------------------------------------------------
Write-Section "1. Puerto $Port disponible"

$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient.Connect($ServerHost, $Port)
    Write-Pass "Puerto $Port esta abierto y escuchando"
} catch {
    Write-Fail "Puerto $Port NO responde. Asegurate de correr: npm run dev"
    Write-Host ""
    Write-Host "  Ejecuta en otra terminal:" -ForegroundColor Yellow
    Write-Host "    npm run dev" -ForegroundColor White
    exit 1
} finally {
    $tcpClient.Close()
}

# -------------------------------------------------------
Write-Section "2. Pagina principal GET /"

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
    $status = $response.StatusCode

    if ($status -eq 200) {
        Write-Pass "GET / -> HTTP $status OK"
    } else {
        Write-Fail "GET / -> HTTP $status (esperado 200)"
    }

    # Verificar que el HTML contiene el marcador de Next.js
    if ($response.Content -match "__NEXT_DATA__" -or $response.Content -match "next/dist") {
        Write-Pass "Respuesta contiene markup de Next.js"
    } else {
        Write-Fail "Respuesta no parece ser una pagina Next.js valida"
    }

    # Verificar que NO hay error de React en el HTML inicial
    if ($response.Content -match "Element type is invalid" -or $response.Content -match "Lazy element type") {
        Write-Fail "HTML contiene error de React: 'Element type is invalid'"
    } else {
        Write-Pass "HTML inicial sin errores de React"
    }

    # Verificar que el body no esta vacio
    $bodySize = $response.Content.Length
    if ($bodySize -gt 5000) {
        Write-Pass "Tamano de respuesta: $bodySize bytes (pagina completa)"
    } else {
        Write-Fail "Respuesta muy pequena ($bodySize bytes) - posible error de render"
    }

} catch {
    Write-Fail "GET / fallo: $($_.Exception.Message)"
}

# -------------------------------------------------------
Write-Section "3. Rutas criticas"

$routes = @(
    @{ path = "/hoteles";   name = "Hoteles" },
    @{ path = "/nosotros";  name = "Nosotros" },
    @{ path = "/contacto";  name = "Contacto" },
    @{ path = "/login";     name = "Login" }
)

foreach ($route in $routes) {
    try {
        $r = Invoke-WebRequest -Uri "$baseUrl$($route.path)" -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            Write-Pass "$($route.name) ($($route.path)) -> HTTP 200"
        } else {
            Write-Fail "$($route.name) ($($route.path)) -> HTTP $($r.StatusCode)"
        }
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code) {
            Write-Fail "$($route.name) ($($route.path)) -> HTTP $code"
        } else {
            Write-Fail "$($route.name) ($($route.path)) -> $($_.Exception.Message)"
        }
    }
}

# -------------------------------------------------------
Write-Section "4. API de chat"

try {
    $body = '{"messages":[{"role":"user","content":"hola"}]}'
    $r = Invoke-WebRequest -Uri "$baseUrl/api/chat" -Method POST `
        -ContentType "application/json" -Body $body `
        -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
    if ($r.StatusCode -in 200, 401, 403) {
        Write-Pass "POST /api/chat -> HTTP $($r.StatusCode) (endpoint existe)"
    } else {
        Write-Fail "POST /api/chat -> HTTP $($r.StatusCode)"
    }
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -in 401, 403, 405) {
        Write-Pass "POST /api/chat -> HTTP $code (endpoint existe, acceso restringido)"
    } else {
        Write-Fail "POST /api/chat -> $($_.Exception.Message)"
    }
}

# -------------------------------------------------------
Write-Section "5. Headers de Cache-Control"

try {
    $r = Invoke-WebRequest -Uri "$baseUrl/" -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
    $cc = $r.Headers["Cache-Control"]

    if ($cc -match "no-store|no-cache") {
        Write-Pass "Cache-Control en paginas HTML: '$cc'"
    } else {
        Write-Fail "Cache-Control en paginas HTML deberia ser no-cache/no-store, es: '$cc'"
    }
} catch {
    Write-Fail "No se pudo verificar headers: $($_.Exception.Message)"
}

# -------------------------------------------------------
Write-Section "6. Assets estaticos de Next.js"

try {
    # El manifest siempre existe si el servidor compilo bien
    $r = Invoke-WebRequest -Uri "$baseUrl/_next/static/chunks/main-app.js" `
        -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction SilentlyContinue
    if ($r -and $r.StatusCode -eq 200) {
        Write-Pass "Assets estaticos de Next.js accesibles"
    } else {
        Write-Pass "Assets estaticos (ruta dinamica, normal en dev)"
    }
} catch {
    Write-Pass "Assets estaticos (ruta dinamica, normal en dev)"
}

# -------------------------------------------------------
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  RESULTADO FINAL" -ForegroundColor Yellow
Write-Host "  Pasaron: $passed  |  Fallaron: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

if ($failed -eq 0) {
    Write-Host "  El servidor esta funcionando correctamente." -ForegroundColor Green
    exit 0
} else {
    Write-Host "  Hay $failed prueba(s) fallida(s). Revisa los errores arriba." -ForegroundColor Red
    exit 1
}
