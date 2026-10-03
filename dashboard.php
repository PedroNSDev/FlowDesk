<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user'])) {
    header('Location: index.php');
    exit;
}

$projetos = $pdo->query("SELECT * FROM projetos")->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <link rel="icon" href="fav.ico" type="image/x-icon">
    <link rel="stylesheet" href="style.css">
</head>
<body>
<h1>Bem-vindo, <?= $_SESSION['user']['nome'] ?></h1>
<a href="logout.php">Sair</a>

<h2>Projetos</h2>

<?php foreach($projetos as $p): ?>
    <div class="card">
        <h3><?= htmlspecialchars($p['nome']) ?></h3>
        <p><?= htmlspecialchars($p['descricao']) ?></p>
        <span><?= $p['status'] ?></span>
    </div>
<?php endforeach; ?>

</body>
</html>