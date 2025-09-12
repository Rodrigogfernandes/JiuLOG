<?php
session_start();
session_destroy();
header("Location: ../index.html"); // volta para a tela inicial
exit;
?>