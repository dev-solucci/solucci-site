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

hPanel → **Files** → **Backups** → aba **Restore and download** → tipo **Website
backup** → **Download website**. Esse tipo traz arquivos e banco no mesmo pacote. O
plano tem backup automático diário, então já existe um recente pra baixar.

Confere que o arquivo baixou e abre antes de seguir. O passo seguinte apaga.

### 2. Apagar o WordPress

hPanel → **Website** → **Auto Installer**. Na caixa **Installed Applications** aparece a
linha do WordPress apontando pro `solucci.com.br`. Nos três pontinhos no fim da linha,
**Delete**. Isso apaga os arquivos e o banco junto, que é o ponto: banco de WordPress
abandonado continua sendo porta de entrada.

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
