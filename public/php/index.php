<?php
header('Content-Type: text/html; charset=utf-8');
error_log("Hello from PHP!");
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Simple PHP Site</title>
    <style>
        body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;background:#f5f7fb;color:#222;margin:0;padding:2rem}
        .card{max-width:900px;margin:2rem auto;padding:1.5rem;background:#fff;border-radius:8px;box-shadow:0 6px 24px rgba(12,30,60,0.06)}
        h1{margin-top:0}
        footer{font-size:0.85rem;color:#666;margin-top:1rem}
    </style>
</head>
<body>
    <div class="card">
        <h1>Welcome</h1>
        <p>This is a basic PHP-powered page to verify the server serves PHP content.</p>
        <p>Server time: <strong><?php echo date('Y-m-d H:i:s'); ?></strong></p>
        <p>PHP version: <strong><?php echo phpversion(); ?></strong></p>
        <p>If PHP is not installed on the host, the server may show the PHP source instead or return an error.</p>
        <hr>
        <p>Example dynamic content:</p>
        <ul>
            <li>Random number: <?php echo rand(1,100); ?></li>
            <li>User agent: <?php echo htmlspecialchars($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'); ?></li>
        </ul>
        <footer>Simple PHP site — served from <code>/public/php/index.php</code></footer>
    </div>
</body>
</html>