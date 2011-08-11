<?php
$base = 'http://www.broadbandmap.gov';
$url = $base . $_GET['url'];
unset( $_GET['url'] );
$url .= '?' . http_build_query( $_GET, '', '&' );
echo file_get_contents( $url );
?>