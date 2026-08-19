# Solucci . versão enxuta

Uma página só, para subir rápido: o que a Solucci faz, três trabalhos que estão no ar
e contato por WhatsApp. Sem formulário, sem seção de processo, sem alavanca de preço.

Mesma identidade da opção 2 em `/site-v2`, com uma fração do peso. Serve como a versão
que vai pro ar agora, enquanto a completa amadurece.

## Rodar

```bash
python3 -m http.server 4700 --directory /Users/mariocecci/Solucci/site-lite
```

Ou pelo Claude Code, com a configuração `solucci-site-lite` do `.claude/launch.json`.

## Peso

Cinco requisições e cerca de 16 KB de recursos próprios na primeira carga, contando a
folha de fontes do Google. Nenhuma imagem no caminho crítico: a única foto do projeto é
a de Open Graph, que só o robô de rede social baixa.

As prévias dos trabalhos são os sites de verdade, dentro de `iframe` com
`loading="lazy"`, então só começam a carregar quando o visitante chega perto daquela
seção. O topo da página não espera por elas.

```
index.html          40 KB, com os SVGs da marca embutidos
css/style.css       12 KB
js/main.js           8 KB, oito comportamentos
assets/bg-solucci.webm   92 KB, fundo do hero
assets/bg-solucci.mp4   124 KB, mesmo fundo pra quem não lê webm
assets/og-solucci.jpg  140 KB, só para o compartilhamento
```

O vídeo de fundo veio com 5,3 MB em 1920 por 1080 com áudio. Como ele entra escurecido
e desfocado, foi reencodado sem áudio, em 960 por 540, e caiu para 92 KB no WebM. Só um
dos dois formatos é baixado, o navegador escolhe.

## A página

**Hero escuro de tela cheia.** Entrega o serviço em duas linhas ("Design, código, jogo
e som"), a explicação concreta embaixo e dois botões, com o WhatsApp em primeiro. O
título decodifica perto do cursor, trocando as letras por glifos de código, que é o
único efeito caro da página e roda em cerca de vinte e três elementos.

Atrás de tudo roda o `bg-solucci` em loop, mudo, com desfoque de 11px, uma camada alta
de preto por cima e um grão leve. É textura, não assunto: o texto continua sendo a
primeira coisa que se lê. O gradiente original do hero segue embaixo e assume sozinho
se o vídeo não tocar.

**O que fazemos.** Quatro cartões, um por divisão, uma frase cada. Nada além.

**Alguns que estão de pé.** Três cartões com moldura de navegador mostrando o site do
cliente ao vivo, em `iframe` de 1440 por 2400 reduzido para caber. Passando o mouse, o
quadro sobe e revela a página inteira, num movimento de três segundos e meio. Não é
print: print pesa, envelhece e quebra no dia em que o cliente mexe no site dele. Aqui a
prévia é sempre a versão atual.

Por baixo do quadro fica o gradiente da marca de cada cliente com o nome. Ele aparece
enquanto o site carrega e continua ali se o quadro não pintar, para o cartão nunca virar
uma caixa branca vazia.

**Contato.** Título, uma frase, botão de WhatsApp e email.

**Zona de brincar.** De propósito destoa do resto da página: é um terminal encravado no
creme, com moldura tracejada em volta pra parecer área separada. E ele responde de
verdade, digitando ou pelo botão:

```
ajuda        lista os comandos
divisoes     o que sai daqui
trabalhos    quem já está no ar, com link
contato      whatsapp e email, clicáveis
nada         devolve undefined, com paciência decrescente
limpar       limpa a tela
```

Já abre com o `ajuda` rodado, senão parece morto. O `contato` é o ponto: quem brinca
acaba com o WhatsApp na mão, dentro da própria brincadeira.

O segredo é o **`xyzzy`**, do Colossal Cave de 1976, o easter egg mais antigo que existe,
cuja resposta original é literalmente "nothing happens". Combina demais com uma função
que devolve `undefined`. Ele acende o modo fósforo verde e imprime a estrela da marca em
ASCII, gerada do próprio `solucci-icon.png`. Também entra pelo **Konami** (cima, cima,
baixo, baixo, esquerda, direita, esquerda, direita, B, A), e no toque, tocando cinco
vezes em `nada.js`.

## Contato

- **Domínio** `solucci.com.br` em canonical, Open Graph, JSON-LD, `robots.txt` e
  `sitemap.xml`
- **Email** `contato@solucci.com.br`
- **WhatsApp** `+55 12 99730 3068` na barra do topo, no hero, no contato, no rodapé, no
  flutuante do celular e no `contactPoint` do JSON-LD

Todos os links de WhatsApp já vão com a mensagem preenchida: "Oi, Solucci. Tenho um
projeto pra tirar do papel."

## Confira antes de subir

1. **O que cada cliente contratou.** As descrições dos três cartões foram escritas
   olhando o que está publicado em cada site, não o contrato. Se o escopo real foi
   outro, ajuste no `index.html`, seção `.trabalhos`.
2. **Um domínio, duas pastas.** Esta versão e a de `/site-v2` apontam para
   `solucci.com.br` no canonical. Só uma pode ir pro ar de cada vez, senão as duas
   competem pelo mesmo endereço na busca.
3. **A prévia ao vivo tem contrapartida.** Cada visita que chega na seção de trabalhos
   abre os três sites dos clientes, então conta como visita na analítica deles e soma
   ao peso da página naquele momento. Hoje nenhum dos três bloqueia `iframe`. Se algum
   passar a bloquear, o cartão volta sozinho para o gradiente da marca, sem quebrar.

## Detalhes de implementação

- A barra do topo entra transparente sobre o hero escuro e vira sólida creme quando o
  hero passa. Bloco 6 do `main.js`.
- A redução do `iframe` é calculada em JavaScript (`largura do cartão / 1440`) e entra
  como variável CSS. A distância de 1500px que o quadro sobe no hover só fecha porque a
  moldura tem proporção fixa de 16 por 10. Mexeu na proporção, refaça a conta.
- A largura de cada letra do título é travada em pixel depois que a fonte carrega,
  senão o texto pula horizontalmente a cada troca de glifo.
- O `opacity:0` da revelação está preso à classe `.js`, então sem JavaScript a página
  aparece inteira em vez de ficar em branco.
- `prefers-reduced-motion` desliga placas, batimento, decodificação, rolagem suave e o
  vídeo do hero.
- O vídeo pausa quando o hero sai da tela, porque fundo parado não precisa gastar
  bateria, e tenta tocar de novo na primeira interação caso a política de autoplay do
  navegador tenha barrado.
- O flutuante de WhatsApp só existe abaixo de 720px e aparece depois de 70% da primeira
  tela.
- A saída do terminal tem altura fixa e rolagem própria, pra página não pular de tamanho
  a cada comando.
- A arte ASCII é gerada no build a partir do `solucci-icon.png` e fica embutida no
  `main.js`, então não custa nenhuma requisição.
