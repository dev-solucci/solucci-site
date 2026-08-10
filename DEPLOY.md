# Como subir o site

O site é estático: HTML, CSS, JS e alguns arquivos em `assets`. Não precisa de PHP, de
banco nem de build. O que está no repositório é exatamente o que fica no servidor.

Repositório: https://github.com/dev-solucci/solucci-site
Servidor: Hostinger, hPanel, domínio `solucci.com.br`

## O fluxo do dia a dia

```bash
python3 -m http.server 4700 --directory /Users/mariocecci/Solucci/site-lite
```

Edita, confere em `localhost:4700`, e quando estiver bom:

```bash
git add -A && git commit -m "descreve o que mudou" && git push
```

A Hostinger escuta o `push` na branch `main` e publica sozinha. Se quiser forçar, tem o
botão **Redeploy** no painel.

Esta pasta tem um `credential.helper` local que pega o token da conta `dev-solucci` no
`gh` na hora do push, porque a conta ativa aqui na máquina é a `marioeve` e ela não tem
acesso de escrita no repositório. Sem isso o push volta com 403. Está em
`.git/config`, não vai pro repositório, e nenhum token fica escrito em arquivo.

O HTML tem cache de dez minutos no `.htaccess`, então a mudança pode demorar esse tanto
pra aparecer pra quem já visitou. CSS e JS têm cache de um ano: se mexer neles e quiser
ver na hora, recarrega com `Cmd+Shift+R`.

## A primeira subida, passo a passo

Isso é uma vez só. Depois fica valendo o fluxo de cima.

### 1. Backup do WordPress

hPanel → **Sites** → painel do `solucci.com.br` → **Arquivos** → **Backups**.

Baixa os dois: o backup de arquivos e o do banco de dados. Se o plano não deixar gerar
backup na hora, dá pra fazer na mão: no **Gerenciador de arquivos**, compacta a
`public_html` e baixa o zip; no **phpMyAdmin**, exporta o banco do WordPress.

Confere que os arquivos baixaram e abrem antes de seguir. O passo seguinte apaga.

### 2. Apagar o WordPress

hPanel → **Sites** → painel do `solucci.com.br` → **WordPress** (ou **Instalador
automático**), e remove a instalação. Isso apaga os arquivos e o banco junto, que é o
ponto: banco de WordPress abandonado continua sendo porta de entrada.

Depois passa no **Gerenciador de arquivos** e confirma que a `public_html` está vazia.
Se sobrou `wp-config.php`, `wp-content` ou `wp-admin`, apaga na mão. O deploy do Git
sobrescreve o que tem mesmo nome, mas não remove o que ele não conhece.

### 3. Conectar o Git

hPanel → **Sites** → painel do `solucci.com.br` → **Avançado** → **Git**.

1. **Continuar com GitHub** e autoriza a extensão da Hostinger na conta `dev-solucci`.
2. Escolhe o repositório `solucci-site`.
3. Branch: `main`. Diretório raiz: `public_html`.
4. **Deploy**.

O painel mostra o status do deploy automático na mesma tela. Com ele ligado, todo push
na `main` publica.

### 4. Conferir no ar

- `https://solucci.com.br` abre o site novo
- `http://solucci.com.br` redireciona pra versão com `https`
- `https://solucci.com.br/robots.txt` e `/sitemap.xml` respondem
- Um endereço qualquer que não existe cai na home, pelo `ErrorDocument` do `.htaccess`
- As três prévias dos trabalhos pintam (elas carregam os sites dos clientes de verdade)

### 5. Avisar o Google

O site velho tinha endereços de WordPress que agora não existem mais. No Search Console,
manda o `sitemap.xml` de novo e pede a indexação da home. O resto sai do índice sozinho
com o tempo.

## Se precisar voltar atrás

O deploy é um clone do repositório, então voltar é `git revert` e push, ou apontar o
Redeploy pra um commit anterior. O WordPress só volta pelo backup do passo 1, por isso
ele vem antes de tudo.
