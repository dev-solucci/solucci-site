# Manual de marca da Solucci

Documento navegável em uma página, bilíngue português e inglês, mais o repositório de
arquivos da marca e os dois PDFs. HTML, CSS e JS puros. Sem build, sem dependência
externa além das fontes do Google.

## Estrutura

```
manual/
  index.html            documento inteiro, os dois idiomas no mesmo arquivo
  css/manual.css
  js/manual.js          idioma, índice, palcos de fundo, cópia de hex
  assets/               o que a própria página usa
  downloads/            o repositório que o visitante baixa
    logo/svg            currentColor mais ink, preto, branco e coral
    logo/png            1000, 2000 e 4000 px de largura, fundo transparente
    logo/favicon        svg, png de 16 a 512 e apple touch icon de 180
    cor/                tokens em css, scss e json, paleta em ase e txt
    tipografia/         css de import e escala, guia de uso e licença
    aplicacoes/         assinatura de e-mail em html de tabela
    solucci-brand-kit.zip  tudo acima em um arquivo só
  pdf/
    manual-marca-solucci-pt.pdf
    solucci-brand-manual-en.pdf
    _impressao-pt.html     versão paginada que gera o PDF
    _impressao-en.html
```

## Como o bilíngue funciona

Os dois idiomas vivem no mesmo HTML. Cada bloco carrega `lang="pt"` ou `lang="en"` e o
CSS esconde um dos lados conforme o `data-lang` do `<html>`. Sem JavaScript, o
português aparece. Com JavaScript, o botão no topo troca e a escolha fica no
`localStorage`. Quem chega com navegador em outro idioma cai no inglês.

Para editar um texto, edite os dois blocos. Se editar só um, o outro idioma fica
desatualizado sem aviso.

## Como regerar os PDFs

Os PDFs saem do próprio `index.html`: um script lê o documento, remove o idioma que não
interessa, troca o cabeçalho de tela por uma capa e imprime pelo Chrome. O script vive no
scratchpad da sessão em que foi feito. Se ele não estiver mais por perto, os
`_impressao-*.html` em `pdf/` continuam servindo: abra no Chrome e imprima em A4 sem
cabeçalho nem rodapé.

## Rodar local

```
python3 -m http.server 4800 --directory /Users/mariocecci/Solucci/marca/manual
```

Também está no `.claude/launch.json` do projeto com o nome `solucci-manual`.

## O que ainda não está aqui

O Pyxeus e o sistema de pixel art ficaram de fora desta versão, por decisão de escopo. O
capítulo entra quando o desenho autoral do mascote estiver fechado.

A assinatura de e-mail aponta para `solucci.com.br/assets/solucci-logo-ink.png`. Esse
arquivo precisa ser publicado nesse caminho antes de a assinatura ser distribuída.

Os valores de CMYK são conversão direta de RGB, sem perfil de cor. Servem de ponto de
partida, não de especificação de gráfica.
