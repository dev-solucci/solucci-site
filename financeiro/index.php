<?php
declare(strict_types=1);
ini_set('display_errors','0');
require __DIR__.'/chaves.php';
header('Cache-Control: private, no-store');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; img-src 'self'; style-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
header('Referrer-Policy: no-referrer');
$local = PHP_SAPI === 'cli-server' && $_SERVER['SERVER_NAME'] === '127.0.0.1';
if (!$local && ($_SERVER['HTTPS'] ?? '') !== 'on') { http_response_code(403); exit; }
$file = $local && getenv('FINANCEIRO_BASE') ? getenv('FINANCEIRO_BASE') : dirname(realpath($_SERVER['DOCUMENT_ROOT'])).'/solucci_financas_privadas/novembro.json';
if (isset($_GET['sincronizar'])) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !hash_equals(SYNC_HASH, hash('sha256', $_SERVER['HTTP_X_CHAVE'] ?? ''))) { http_response_code(403); exit; }
    $raw = file_get_contents('php://input', false, null, 0, 2097153);
    $data = json_decode($raw, true);
    if (strlen($raw)>2097152 || ($data['mes'] ?? '') !== '2026-11' || !is_array($data['saldos_informados'] ?? null) || !is_array($data['lancamentos'] ?? null)) { http_response_code(422); exit; }
    umask(0077);
    $dir = dirname($file);
    if (!is_dir($dir) && !mkdir($dir,0700,true)) { http_response_code(503); exit; }
    $temp = tempnam($dir,'entrada');
    if (!$temp || file_put_contents($temp,$raw)!==strlen($raw) || !rename($temp,$file)) { http_response_code(503); exit; }
    header('Content-Type: text/plain');
    echo hash('sha256',$raw); exit;
}
ini_set('session.use_strict_mode','1');
session_name('soluccifin');
session_set_cookie_params(['path'=>'/financeiro/','secure'=>!$local,'httponly'=>true,'samesite'=>'Strict']);
session_start();
if (isset($_SESSION['ultimo']) && (time()-$_SESSION['ultimo']>1800 || time()-$_SESSION['inicio']>28800)) { $_SESSION=[]; session_regenerate_id(true); }
$_SESSION['csrf'] ??= bin2hex(random_bytes(24));
$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    if (!is_string($_POST['csrf']??null) || !hash_equals($_SESSION['csrf'],$_POST['csrf'])) { http_response_code(403); exit; }
    if (isset($_POST['sair'])) { $_SESSION=[]; session_destroy(); header('Location: ./',true,303); exit; }
    if (password_verify((string)($_POST['senha']??''),LOGIN_HASH) && strtolower(trim((string)($_POST['usuario']??'')))==='mario') {
        session_regenerate_id(true); $_SESSION=['inicio'=>time(),'ultimo'=>time(),'csrf'=>bin2hex(random_bytes(24))]; header('Location: ./',true,303); exit;
    }
    http_response_code(401); $error='Confira o usuário e a senha.';
}
$auth=isset($_SESSION['inicio']);
if ($auth) { $_SESSION['ultimo']=time(); $d=is_readable($file)?json_decode(file_get_contents($file),true):null; }
function h($s){ return htmlspecialchars((string)$s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
function money($n,$prefix='R$'){return $n===null?'A confirmar':$prefix.' '.number_format((float)$n,2,',','.');}
function day($v){return $v ? implode('/',array_reverse(explode('-',$v))) : 'A confirmar';}
function row($label,$value,$sub=''){echo '<div class="row"><div>'.h($label).($sub!==''?'<small>'.h($sub).'</small>':'').'</div><b>'.h($value).'</b></div>';}
function csrf(){echo '<input type="hidden" name="csrf" value="'.h($_SESSION['csrf']).'">';}
?><!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Central financeira | Solucci</title><link rel="stylesheet" href="estilo.css?v=1"></head><body>
<header><div class="bar"><img src="assets/logo.svg" alt="Solucci" width="112"><span>Finanças pessoais</span><?php if($auth):?><form method="post"><?php csrf(); ?><button name="sair">Sair</button></form><?php endif;?></div></header>
<?php if(!$auth):?><main class="login"><div class="art"><img src="assets/simbolo.png" alt=""></div><section><h1>Central financeira<span>.</span></h1><form method="post"><?php csrf();?><label>Usuário<input name="usuario" required autocomplete="username" autocapitalize="none"></label><label>Senha<input type="password" name="senha" required autocomplete="current-password"></label><?php if($error):?><p role="alert"><?=h($error)?></p><?php endif;?><button class="action">Entrar</button></form></section></main>
<?php elseif(!$d):?><main><h1>Central financeira</h1><p>Aguardando a primeira atualização.</p></main>
<?php else: $s=$d['saldos_informados'];$p=$d['patrimonio_informado']??[];$c=$d['cartoes_informados']??[];$future=$d['recebimentos_previstos']??[];
$positions=$d['saldos_calculados']??[];
foreach ($positions as $account=>$position) $s[$account]=$position['valor'];
$cash=$s['Itau_BRL']+$s['Inter_BRL']+($s['Asaas_BRL']??0)+($s['Mercado_Pago_BRL']??0);$bills=[];$deduct=0;
foreach($d['lancamentos'] as $x){if(isset($x['vencimento']) && str_starts_with($x['vencimento'],$d['mes']) && !in_array($x['pagamento']??'',['pago','paga','quitado','quitada'],true)){ $bills[]=$x;$deduct+=$x['valor_brl']??0; }}
usort($bills,fn($a,$b)=>strcmp($a['vencimento'],$b['vencimento']));
?><main><div class="intro"><h1>Novembro <em>2026</em></h1><p>Consulta ao Gmail em <?=h(day($d['ultima_consulta_gmail']))?></p></div>
<div class="cols"><section class="hero"><h2>Saldo após contas previstas</h2><strong><?=h(money($cash-$deduct))?></strong><p>Considera os saldos informados em reais e as contas de novembro com valor conhecido.</p><footer><span>Em conta <b><?=h(money($cash))?></b></span><span>A reservar <b><?=h(money($deduct))?></b></span></footer></section>
<section class="accounts"><h2>Saldos por conta</h2><?php
$accounts = ['Itau_BRL'=>'Itaú','Mercado_Pago_BRL'=>'Mercado Pago','Inter_BRL'=>'Inter','Asaas_BRL'=>'Asaas','Nomad_USD'=>'Nomad','especie_COP'=>'Em espécie'];
foreach ($accounts as $account=>$label) {
    $position = $positions[$account] ?? null;
    $currency = ['Nomad_USD'=>'US$', 'especie_COP'=>'COP'][$account] ?? 'R$';
    $reference = $position ? $position['origem'].' · '.day($position['data']) : '';
    row($label, money($s[$account] ?? null, $currency), $reference);
}
?></section></div>
<div class="details"><section><h2>Próximas contas</h2><?php foreach($bills as $x)row($x['conta'],money($x['valor_brl']),day($x['vencimento']));foreach($d['lancamentos'] as $x)if(isset($x['mes_vencimento']))row($x['conta'].' · '.($x['final']??''),money($x['valor_brl']),'Fatura parcial · '.substr($x['mes_vencimento'],5).'/'.substr($x['mes_vencimento'],0,4));?>
<h2>Recebimentos</h2><?php foreach ($future as $x) {
    $amount = isset($x['brl_previstos']) ? money($x['brl_previstos']) : money($x['usd_previstos'], 'US$');
    $description = array_filter([$x['conta'], $x['cliente'] ?? null, isset($x['parcela']) ? 'Parcela '.$x['parcela'] : null, $x['estado']]);
    row(day($x['data']), $amount, implode(' · ', $description));
}?></section>
<section><h2>Patrimônio e benefícios</h2><?php row('Investimentos Itaú',money($p['investimentos_itau_brl']??null));row('Carteira LATAM',money($p['carteira_latam_brl']??null));row('LATAM Pass',isset($p['milhas_latam'])?number_format($p['milhas_latam'],0,',','.').' milhas':'A confirmar');?>
<?php if(isset($p['cofrinhos_itau'])): $pots=$p['cofrinhos_itau']; ?>
<h2>Cofrinhos Itaú</h2><?php
row('Total guardado', money($pots['total_brl']), day($pots['data']));
foreach ($pots['saldos'] as $name=>$amount) row($name, money($amount));
row('Rendimento acumulado', money($pots['rendimento_brl']));
endif;
if(isset($c['mercado_pago'])): $mp=$c['mercado_pago']; ?>
<h2>Mercado Pago Visa</h2><?php
row('Fatura parcial', money($mp['fatura_parcial_brl']), 'Fecha em '.day($mp['fechamento']));
row('Limite disponível', money($mp['limite_brl']));
endif; ?>
<h2><?=h($c['nome_black']??'Cartão Black')?></h2><?php row('Limite disponível',money($c['limite_disponivel_black_brl']??null));row('Melhor data de compra',day($c['melhor_data_compra_black']??null));?></section></div>
<details><summary>Movimentações e comprovantes</summary><?php foreach(array_reverse($d['lancamentos']) as $x): $value=isset($x['origem_brl'])?money($x['origem_brl']).' → '.money($x['destino_usd'],'US$'):(isset($x['valor_usd'])?money($x['valor_usd'],'US$'):money($x['valor_brl']??null)); row(ucfirst($x['tipo']).' · '.$x['conta'],$value,implode(' · ',array_filter([$x['data']??$x['data_local']??$x['vencimento']??$x['mes_vencimento']??'', $x['pagamento']??'']))); if(!empty($x['fontes'][0]) && preg_match('/^[a-f0-9]+$/D',$x['fontes'][0])):?><a class="proof" target="_blank" rel="noreferrer" href="https://mail.google.com/mail/u/0/#all/<?=h($x['fontes'][0])?>">Ver comprovante no Gmail</a><?php endif;endforeach;?></details>
<details><summary>Pendências do mês</summary><ul><?php foreach($d['pendencias'] as $item)echo '<li>'.h($item).'</li>';?></ul></details>
</main><?php endif;?></body></html>
