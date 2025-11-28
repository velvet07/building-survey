<?php
/**
 * Building Survey - Web-based Installer
 *
 * This script allows you to install and configure the application
 * without SSH access, using only FTP and web browser.
 *
 * Usage:
 * 1. Upload all files to your server via FTP
 * 2. Open: https://felmeres.wpmuhely.com/install-web.php
 * 3. Follow the on-screen instructions
 * 4. Delete this file after installation
 */

// Security: Disable after first successful installation
$LOCK_FILE = __DIR__ . '/.install-web.lock';
if (file_exists($LOCK_FILE)) {
    die('Installation already completed. Delete .install-web.lock to run again.');
}

// Configuration
$NODE_MIN_VERSION = 18;
$APP_PORT = 4000;
$APP_DIR = __DIR__;

// Initialize
$step = isset($_GET['step']) ? (int)$_GET['step'] : 1;
$errors = [];
$warnings = [];
$success = [];

/**
 * Execute shell command and return output
 */
function execCommand($cmd, &$output = null, &$exitCode = null) {
    $output = [];
    exec($cmd . ' 2>&1', $output, $exitCode);
    return implode("\n", $output);
}

/**
 * Check if Node.js is installed and version
 */
function checkNodeVersion() {
    global $NODE_MIN_VERSION;

    $output = execCommand('node -v', $lines, $exitCode);

    if ($exitCode !== 0) {
        return ['installed' => false, 'version' => null, 'error' => 'Node.js not found'];
    }

    preg_match('/v(\d+)\./', $output, $matches);
    $version = isset($matches[1]) ? (int)$matches[1] : 0;

    return [
        'installed' => true,
        'version' => $version,
        'versionString' => trim($output),
        'sufficient' => $version >= $NODE_MIN_VERSION
    ];
}

/**
 * Check if port is in use
 */
function checkPort($port) {
    $output = execCommand("lsof -i :$port", $lines, $exitCode);
    return $exitCode === 0; // 0 means port is in use
}

/**
 * Stop running application
 */
function stopApplication() {
    global $APP_PORT;

    // Try to find and kill process on port
    $output = execCommand("lsof -t -i:$APP_PORT", $lines, $exitCode);
    if ($exitCode === 0 && !empty(trim($output))) {
        $pid = trim($output);
        execCommand("kill -9 $pid");
        sleep(2);
        return true;
    }

    // Try to find next processes
    execCommand("pkill -f 'next.*start'");
    sleep(2);

    return true;
}

/**
 * Install npm dependencies
 */
function installDependencies() {
    global $APP_DIR;
    chdir($APP_DIR);

    // Remove old node_modules
    execCommand('rm -rf node_modules');

    // Install
    $output = execCommand('npm install 2>&1', $lines, $exitCode);

    return [
        'success' => $exitCode === 0,
        'output' => $output,
        'exitCode' => $exitCode
    ];
}

/**
 * Build application
 */
function buildApplication() {
    global $APP_DIR;
    chdir($APP_DIR);

    // Remove old build
    execCommand('rm -rf .next');

    // Build
    $output = execCommand('npm run build 2>&1', $lines, $exitCode);

    // Check if BUILD_ID exists
    $buildIdExists = file_exists($APP_DIR . '/.next/BUILD_ID');

    return [
        'success' => $exitCode === 0 && $buildIdExists,
        'output' => $output,
        'exitCode' => $exitCode,
        'buildId' => $buildIdExists ? file_get_contents($APP_DIR . '/.next/BUILD_ID') : null
    ];
}

/**
 * Start application
 */
function startApplication() {
    global $APP_DIR;
    chdir($APP_DIR);

    // Start in background
    execCommand('nohup npm start > /dev/null 2>&1 & echo $! > app.pid');

    sleep(3);

    // Check if running
    if (file_exists($APP_DIR . '/app.pid')) {
        $pid = trim(file_get_contents($APP_DIR . '/app.pid'));
        $running = execCommand("ps -p $pid", $lines, $exitCode) === 0;

        return [
            'success' => $running,
            'pid' => $pid
        ];
    }

    return ['success' => false];
}

/**
 * Check application health
 */
function checkHealth() {
    global $APP_PORT;

    $ch = curl_init("http://localhost:$APP_PORT/api/health");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $httpCode === 200;
}

// Process POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'stop':
                stopApplication();
                header('Location: ?step=3&stopped=1');
                exit;

            case 'install':
                $result = installDependencies();
                if ($result['success']) {
                    header('Location: ?step=4&installed=1');
                } else {
                    header('Location: ?step=3&error=install');
                }
                exit;

            case 'build':
                $result = buildApplication();
                if ($result['success']) {
                    header('Location: ?step=5&built=1');
                } else {
                    header('Location: ?step=4&error=build');
                }
                exit;

            case 'start':
                $result = startApplication();
                if ($result['success']) {
                    header('Location: ?step=6&started=1');
                } else {
                    header('Location: ?step=5&error=start');
                }
                exit;

            case 'finish':
                // Create lock file
                file_put_contents($LOCK_FILE, date('Y-m-d H:i:s'));
                header('Location: ?step=7');
                exit;
        }
    }
}

?>
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Building Survey - Telepítő</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .content {
            padding: 40px;
        }
        .step-indicator {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            position: relative;
        }
        .step-indicator::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 0;
            right: 0;
            height: 2px;
            background: #e0e0e0;
            z-index: 0;
        }
        .step {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #999;
            position: relative;
            z-index: 1;
        }
        .step.active {
            background: #667eea;
            color: white;
        }
        .step.completed {
            background: #10b981;
            color: white;
        }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .alert-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
        }
        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
        }
        .alert-warning {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #f59e0b;
        }
        .alert-info {
            background: #dbeafe;
            color: #1e40af;
            border: 1px solid #3b82f6;
        }
        .check-item {
            display: flex;
            align-items: center;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .check-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .check-icon.success {
            background: #10b981;
            color: white;
        }
        .check-icon.error {
            background: #ef4444;
            color: white;
        }
        .check-icon.warning {
            background: #f59e0b;
            color: white;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #5568d3;
        }
        .btn-secondary {
            background: #6b7280;
        }
        .btn-secondary:hover {
            background: #4b5563;
        }
        .btn-danger {
            background: #ef4444;
        }
        .btn-danger:hover {
            background: #dc2626;
        }
        .btn-success {
            background: #10b981;
        }
        .btn-success:hover {
            background: #059669;
        }
        .code {
            background: #1f2937;
            color: #10b981;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
            margin: 15px 0;
        }
        .buttons {
            display: flex;
            gap: 10px;
            margin-top: 30px;
        }
        h2 {
            color: #1f2937;
            margin-bottom: 20px;
        }
        p {
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        li {
            color: #4b5563;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ Building Survey</h1>
            <p>Web-alapú Telepítő</p>
        </div>

        <div class="content">
            <div class="step-indicator">
                <?php for ($i = 1; $i <= 7; $i++): ?>
                    <div class="step <?= $i < $step ? 'completed' : ($i == $step ? 'active' : '') ?>">
                        <?= $i ?>
                    </div>
                <?php endfor; ?>
            </div>

            <?php if ($step == 1): ?>
                <!-- Step 1: Welcome -->
                <h2>Üdvözöljük!</h2>
                <p>Ez a telepítő végigvezeti Önt az alkalmazás beállításán SSH hozzáférés nélkül.</p>

                <div class="alert alert-info">
                    <strong>ℹ️ Mielőtt folytatná:</strong>
                    <ul>
                        <li>Töltse fel az összes fájlt FTP-n keresztül</li>
                        <li>Győződjön meg róla, hogy van MySQL adatbázisa</li>
                        <li>Ez a folyamat 5-10 percet vehet igénybe</li>
                    </ul>
                </div>

                <div class="buttons">
                    <a href="?step=2" class="btn">Folytatás →</a>
                </div>

            <?php elseif ($step == 2): ?>
                <!-- Step 2: System Check -->
                <h2>Rendszer ellenőrzés</h2>

                <?php
                $nodeCheck = checkNodeVersion();
                $portInUse = checkPort($APP_PORT);
                $uploadsWritable = is_writable($APP_DIR) || mkdir($APP_DIR . '/uploads', 0755, true);
                ?>

                <div class="check-item">
                    <div class="check-icon <?= $nodeCheck['installed'] ? 'success' : 'error' ?>">
                        <?= $nodeCheck['installed'] ? '✓' : '✗' ?>
                    </div>
                    <div>
                        <strong>Node.js telepítve</strong><br>
                        <?= $nodeCheck['installed'] ? $nodeCheck['versionString'] : 'Nincs telepítve' ?>
                    </div>
                </div>

                <div class="check-item">
                    <div class="check-icon <?= $nodeCheck['sufficient'] ? 'success' : 'error' ?>">
                        <?= $nodeCheck['sufficient'] ? '✓' : '✗' ?>
                    </div>
                    <div>
                        <strong>Node.js verzió megfelelő (18+)</strong><br>
                        <?= $nodeCheck['sufficient'] ? 'Rendben' : 'Túl régi verzió' ?>
                    </div>
                </div>

                <div class="check-item">
                    <div class="check-icon <?= $uploadsWritable ? 'success' : 'warning' ?>">
                        <?= $uploadsWritable ? '✓' : '!' ?>
                    </div>
                    <div>
                        <strong>Írható könyvtár</strong><br>
                        <?= $uploadsWritable ? 'Uploads mappa létrehozható' : 'Ellenőrizze a jogosultságokat' ?>
                    </div>
                </div>

                <div class="check-item">
                    <div class="check-icon <?= $portInUse ? 'warning' : 'success' ?>">
                        <?= $portInUse ? '!' : '✓' ?>
                    </div>
                    <div>
                        <strong>Port <?= $APP_PORT ?> állapota</strong><br>
                        <?= $portInUse ? 'Használatban - le kell állítani' : 'Szabad' ?>
                    </div>
                </div>

                <?php if (!$nodeCheck['installed'] || !$nodeCheck['sufficient']): ?>
                    <div class="alert alert-error">
                        <strong>❌ Hiba:</strong> Node.js 18+ szükséges!
                        <p>Lépjen be a CWP7/cPanel Node.js beállításokba és válassza a Node.js 18+ verziót.</p>
                    </div>
                <?php endif; ?>

                <div class="buttons">
                    <a href="?step=1" class="btn btn-secondary">← Vissza</a>
                    <?php if ($nodeCheck['installed'] && $nodeCheck['sufficient']): ?>
                        <a href="?step=3" class="btn">Folytatás →</a>
                    <?php endif; ?>
                </div>

            <?php elseif ($step == 3): ?>
                <!-- Step 3: Stop old instances -->
                <h2>Régi példányok leállítása</h2>

                <?php $portInUse = checkPort($APP_PORT); ?>

                <?php if (isset($_GET['stopped'])): ?>
                    <div class="alert alert-success">
                        ✓ Alkalmazás leállítva
                    </div>
                <?php endif; ?>

                <?php if ($portInUse): ?>
                    <div class="alert alert-warning">
                        <strong>⚠️ Figyelem:</strong> A <?= $APP_PORT ?>-es port használatban van.
                        <p>Kattintson az alábbi gombra a régi példány leállításához.</p>
                    </div>

                    <form method="POST">
                        <input type="hidden" name="action" value="stop">
                        <button type="submit" class="btn btn-danger">Alkalmazás leállítása</button>
                    </form>
                <?php else: ?>
                    <div class="alert alert-success">
                        ✓ A port szabad, folytathatjuk a telepítést
                    </div>

                    <div class="buttons">
                        <a href="?step=2" class="btn btn-secondary">← Vissza</a>
                        <a href="?step=4" class="btn">Folytatás →</a>
                    </div>
                <?php endif; ?>

            <?php elseif ($step == 4): ?>
                <!-- Step 4: Install Dependencies -->
                <h2>Függőségek telepítése</h2>

                <?php if (isset($_GET['installed'])): ?>
                    <div class="alert alert-success">
                        ✓ Függőségek sikeresen telepítve
                    </div>

                    <div class="buttons">
                        <a href="?step=5" class="btn">Folytatás →</a>
                    </div>
                <?php elseif (isset($_GET['error'])): ?>
                    <div class="alert alert-error">
                        ✗ Hiba történt a telepítés során. Ellenőrizze a szerverlogokat.
                    </div>

                    <div class="buttons">
                        <a href="?step=3" class="btn btn-secondary">← Vissza</a>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="action" value="install">
                            <button type="submit" class="btn">Újrapróbálás</button>
                        </form>
                    </div>
                <?php else: ?>
                    <p>Most telepítjük az npm csomagokat. Ez eltarthat néhány percig...</p>

                    <div class="code">
                        $ npm install
                    </div>

                    <div class="alert alert-info">
                        <strong>ℹ️ Megjegyzés:</strong> Ez a folyamat 2-5 percet vehet igénybe a szerver sebességétől függően.
                    </div>

                    <form method="POST">
                        <input type="hidden" name="action" value="install">
                        <div class="buttons">
                            <a href="?step=3" class="btn btn-secondary">← Vissza</a>
                            <button type="submit" class="btn">Telepítés indítása</button>
                        </div>
                    </form>
                <?php endif; ?>

            <?php elseif ($step == 5): ?>
                <!-- Step 5: Build Application -->
                <h2>Alkalmazás build</h2>

                <?php if (isset($_GET['built'])): ?>
                    <div class="alert alert-success">
                        ✓ Build sikeresen befejezve
                    </div>

                    <div class="buttons">
                        <a href="?step=6" class="btn">Folytatás →</a>
                    </div>
                <?php elseif (isset($_GET['error'])): ?>
                    <div class="alert alert-error">
                        ✗ Build hiba történt. Ellenőrizze, hogy:
                        <ul>
                            <li>Az összes fájl feltöltve van</li>
                            <li>A függőségek telepítve vannak</li>
                            <li>Nincs szintaxis hiba a kódban</li>
                        </ul>
                    </div>

                    <div class="buttons">
                        <a href="?step=4" class="btn btn-secondary">← Vissza</a>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="action" value="build">
                            <button type="submit" class="btn">Újrapróbálás</button>
                        </form>
                    </div>
                <?php else: ?>
                    <p>Most buildjük az alkalmazást production módra. Ez eltarthat néhány percig...</p>

                    <div class="code">
                        $ npm run build
                    </div>

                    <div class="alert alert-info">
                        <strong>ℹ️ Megjegyzés:</strong> Ez a folyamat 3-7 percet vehet igénybe.
                    </div>

                    <form method="POST">
                        <input type="hidden" name="action" value="build">
                        <div class="buttons">
                            <a href="?step=4" class="btn btn-secondary">← Vissza</a>
                            <button type="submit" class="btn">Build indítása</button>
                        </div>
                    </form>
                <?php endif; ?>

            <?php elseif ($step == 6): ?>
                <!-- Step 6: Start Application -->
                <h2>Alkalmazás indítása</h2>

                <?php if (isset($_GET['started'])): ?>
                    <?php $healthy = checkHealth(); ?>

                    <?php if ($healthy): ?>
                        <div class="alert alert-success">
                            ✓ Alkalmazás sikeresen elindult és válaszol!
                        </div>
                    <?php else: ?>
                        <div class="alert alert-warning">
                            ⚠️ Alkalmazás elindult, de még nem válaszol. Várjon néhány másodpercet és frissítse az oldalt.
                        </div>
                    <?php endif; ?>

                    <div class="buttons">
                        <a href="?step=6" class="btn btn-secondary">🔄 Frissítés</a>
                        <?php if ($healthy): ?>
                            <form method="POST" style="display: inline;">
                                <input type="hidden" name="action" value="finish">
                                <button type="submit" class="btn btn-success">Befejezés →</button>
                            </form>
                        <?php endif; ?>
                    </div>
                <?php elseif (isset($_GET['error'])): ?>
                    <div class="alert alert-error">
                        ✗ Hiba történt az indítás során.
                    </div>

                    <div class="buttons">
                        <a href="?step=5" class="btn btn-secondary">← Vissza</a>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="action" value="start">
                            <button type="submit" class="btn">Újrapróbálás</button>
                        </form>
                    </div>
                <?php else: ?>
                    <p>Most elindítjuk az alkalmazást háttérben...</p>

                    <div class="code">
                        $ nohup npm start &amp;
                    </div>

                    <form method="POST">
                        <input type="hidden" name="action" value="start">
                        <div class="buttons">
                            <a href="?step=5" class="btn btn-secondary">← Vissza</a>
                            <button type="submit" class="btn">Indítás</button>
                        </div>
                    </form>
                <?php endif; ?>

            <?php elseif ($step == 7): ?>
                <!-- Step 7: Finish -->
                <h2>✅ Telepítés befejezve!</h2>

                <div class="alert alert-success">
                    <strong>Gratulálunk!</strong> Az alkalmazás telepítése sikeresen befejeződött.
                </div>

                <h3 style="margin-top: 30px; margin-bottom: 15px;">Következő lépések:</h3>

                <div class="check-item">
                    <div class="check-icon success">1</div>
                    <div>
                        <strong>Törölje ezt a fájlt!</strong><br>
                        Biztonsági okokból törölje az <code>install-web.php</code> fájlt a szerverről.
                    </div>
                </div>

                <div class="check-item">
                    <div class="check-icon success">2</div>
                    <div>
                        <strong>Menjen az installer oldalra</strong><br>
                        <a href="/install" target="_blank">https://felmeres.wpmuhely.com/install</a>
                    </div>
                </div>

                <div class="check-item">
                    <div class="check-icon success">3</div>
                    <div>
                        <strong>Állítsa be az adatbázist</strong><br>
                        Add meg az adatbázis kapcsolat adatokat és hozd létre az admin felhasználót.
                    </div>
                </div>

                <div class="alert alert-info" style="margin-top: 30px;">
                    <strong>📋 Hasznos információk:</strong>
                    <ul>
                        <li>Alkalmazás URL: <a href="/" target="_blank">https://felmeres.wpmuhely.com</a></li>
                        <li>Installer URL: <a href="/install" target="_blank">https://felmeres.wpmuhely.com/install</a></li>
                        <li>API Health: <a href="/api/health" target="_blank">https://felmeres.wpmuhely.com/api/health</a></li>
                    </ul>
                </div>

                <div class="buttons" style="margin-top: 30px;">
                    <a href="/install" class="btn btn-success">Tovább az installerhez →</a>
                </div>

            <?php endif; ?>
        </div>
    </div>
</body>
</html>
