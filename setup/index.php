<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Building Survey - Admin Setup</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 15px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        .btn:active {
            transform: translateY(0);
        }
        .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .alert-error {
            background: #fee;
            color: #c33;
            border: 1px solid #fcc;
        }
        .alert-success {
            background: #efe;
            color: #3c3;
            border: 1px solid #cfc;
        }
        .alert-info {
            background: #eef;
            color: #33c;
            border: 1px solid #ccf;
        }
        .help-text {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        .already-setup {
            text-align: center;
            padding: 60px 20px;
        }
        .already-setup h2 {
            color: #3c3;
            margin-bottom: 15px;
        }
        .already-setup p {
            color: #666;
            margin-bottom: 25px;
        }
        .already-setup a {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php
        // Check if setup is already completed
        if (file_exists('.setup-complete')) {
            ?>
            <div class="already-setup">
                <h2>✅ Setup már befejezve</h2>
                <p>Az admin felhasználó már létre lett hozva. A setup oldal le lett tiltva biztonsági okokból.</p>
                <a href="<?php echo getenv('NEXT_PUBLIC_APP_URL') ?: 'http://localhost:3000'; ?>">
                    Tovább az alkalmazáshoz →
                </a>
            </div>
            <?php
            exit;
        }

        $error = null;
        $success = null;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            $passwordConfirm = $_POST['password_confirm'] ?? '';
            $fullName = trim($_POST['full_name'] ?? '');

            // Validation
            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $error = 'Érvényes email címet adj meg!';
            } elseif (empty($password) || strlen($password) < 8) {
                $error = 'A jelszónak legalább 8 karakter hosszúnak kell lennie!';
            } elseif ($password !== $passwordConfirm) {
                $error = 'A két jelszó nem egyezik meg!';
            } else {
                // Create admin user via Supabase Admin API
                $supabaseUrl = getenv('SUPABASE_URL');
                $supabaseServiceKey = getenv('SUPABASE_SERVICE_KEY');

                if (empty($supabaseUrl) || empty($supabaseServiceKey)) {
                    $error = 'Supabase környezeti változók hiányoznak! Ellenőrizd a .env fájlt.';
                } else {
                    // Create user in Supabase
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $supabaseUrl . '/auth/v1/admin/users');
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        'apikey: ' . $supabaseServiceKey,
                        'Authorization: Bearer ' . $supabaseServiceKey,
                        'Content-Type: application/json'
                    ]);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                        'email' => $email,
                        'password' => $password,
                        'email_confirm' => true,
                        'user_metadata' => [
                            'full_name' => $fullName ?: null
                        ]
                    ]));

                    $response = curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);

                    if ($httpCode === 200 || $httpCode === 201) {
                        $userData = json_decode($response, true);
                        $userId = $userData['id'] ?? null;

                        if ($userId) {
                            // Connect to PostgreSQL
                            try {
                                $dbHost = getenv('POSTGRES_HOST') ?: 'postgres';
                                $dbName = getenv('POSTGRES_DB') ?: 'building_survey';
                                $dbUser = getenv('POSTGRES_USER') ?: 'postgres';
                                $dbPass = getenv('POSTGRES_PASSWORD');

                                $pdo = new PDO("pgsql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
                                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                                // Create profile with admin role
                                // Note: profiles table only has: id, email, role, created_at, updated_at
                                // full_name is stored in Supabase auth.users metadata
                                $stmt = $pdo->prepare("
                                    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
                                    VALUES (:id, :email, 'admin', NOW(), NOW())
                                    ON CONFLICT (id) DO UPDATE SET
                                        email = EXCLUDED.email,
                                        role = 'admin',
                                        updated_at = NOW()
                                ");
                                $stmt->execute([
                                    ':id' => $userId,
                                    ':email' => $email
                                ]);

                                // Mark setup as complete
                                file_put_contents('.setup-complete', date('Y-m-d H:i:s'));

                                $success = true;
                            } catch (PDOException $e) {
                                $error = 'Adatbázis hiba: ' . $e->getMessage();
                            }
                        } else {
                            $error = 'User létrehozva, de ID nem található.';
                        }
                    } else {
                        $responseData = json_decode($response, true);
                        $errorMsg = $responseData['message'] ?? $responseData['msg'] ?? 'Ismeretlen hiba';
                        $error = 'Supabase hiba: ' . $errorMsg;
                    }
                }
            }
        }
        ?>

        <?php if ($success): ?>
            <div class="already-setup">
                <h2>✅ Sikeres setup!</h2>
                <p>Az admin felhasználó sikeresen létrejött.</p>
                <p><strong>Email:</strong> <?php echo htmlspecialchars($email); ?></p>
                <p style="margin-top: 20px; font-size: 13px; color: #999;">
                    A setup oldal automatikusan le lett tiltva. Most már bejelentkezhetsz.
                </p>
                <a href="<?php echo getenv('NEXT_PUBLIC_APP_URL') ?: 'http://localhost:3000'; ?>">
                    Bejelentkezés →
                </a>
            </div>
        <?php else: ?>
            <h1>🔧 Admin Setup</h1>
            <p class="subtitle">Hozd létre az első admin felhasználót</p>

            <div class="alert alert-info">
                <strong>ℹ️ Fontos:</strong> Ez az oldal csak egyszer futtatható. A setup után automatikusan letiltásra kerül.
            </div>

            <?php if ($error): ?>
                <div class="alert alert-error">
                    <strong>❌ Hiba:</strong> <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="">
                <div class="form-group">
                    <label for="email">Email cím *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="admin@example.com"
                        value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>"
                    >
                </div>

                <div class="form-group">
                    <label for="password">Jelszó *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        placeholder="Min. 8 karakter"
                        minlength="8"
                    >
                    <div class="help-text">Legalább 8 karakter hosszú jelszó</div>
                </div>

                <div class="form-group">
                    <label for="password_confirm">Jelszó mégegyszer *</label>
                    <input
                        type="password"
                        id="password_confirm"
                        name="password_confirm"
                        required
                        placeholder="Írd be újra a jelszót"
                        minlength="8"
                    >
                    <div class="help-text">A két jelszónak meg kell egyeznie</div>
                </div>

                <div class="form-group">
                    <label for="full_name">Teljes név (opcionális)</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        placeholder="Kiss János"
                        value="<?php echo htmlspecialchars($_POST['full_name'] ?? ''); ?>"
                    >
                </div>

                <button type="submit" class="btn">
                    Admin felhasználó létrehozása
                </button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
