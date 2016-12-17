<?php
    $date = $_GET['date'];
    $url = 'http://tvguide.betfair.com/english-uk/tv/'.$date;
    $htm = file_get_contents($url);
    $ch = curl_init();
    curl_setopt ($ch, CURLOPT_URL, $url);
    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt ($ch, CURLOPT_ENCODING , 'gzip');
    $htm = curl_exec ($ch);
    $htm = preg_replace("/<img[^>]+\>/", "(image) ", $htm);
    $htm = preg_replace("/<script[^>]+\>/", "<script>", $htm);
    echo $htm;
?>
