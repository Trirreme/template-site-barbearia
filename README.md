# Ganton — Barber & Wear

Modelo de site para barbearia com loja de roupas no mesmo endereço. Marca fictícia, feita para demonstração.

Estética inspirada nos jogos de mundo aberto dos anos 90 na costa oeste: pôr do sol, verde "Grove", capa em quadrinhos e HUD de jogo.

## Páginas

- **Início** (`index.html`): tela de loading, capa em painéis, escolha entre barbearia e vestiário, depoimentos e mapa-radar.
- **Barbearia** (`barbearia.html`): cardápio de serviços em estilo menu de jogo, seleção de barbeiro com barras de habilidade, agenda com dias e horários livres, galeria com lightbox e planos mensais. O agendamento abre o WhatsApp com a mensagem pronta.
- **Vestiário** (`vestiario.html`): provador para montar o look peça por peça (setas do teclado funcionam), contagem regressiva do drop de sexta e catálogo com filtros e tamanhos.

Em todas as páginas:

- O dinheiro do HUD mostra o total da sacola; clicar nele abre a sacola. O pedido sai pelo WhatsApp.
- A barra vermelha do HUD é o progresso de rolagem da página.
- O nome de cada seção aparece no canto da tela ao rolar, como nome de bairro no jogo.
- Cheat: digitar `HESOYAM` no teclado (ou no campo da sacola) dá 10% de desconto.

## Personalizar para um cliente

Tudo que muda de cliente para cliente está em dois arquivos:

- `assets/js/config.js`: nome, número do WhatsApp, endereço, horários, Instagram e cheat.
- `assets/js/data.js`: serviços, barbeiros, galeria, planos e produtos.

Cores e fontes ficam nas variáveis do topo de `assets/css/style.css`.

## Rodar localmente

Site estático, sem build. Abra `index.html` no navegador ou rode:

```bash
python3 -m http.server 8000
```

As fotos de demonstração vêm do Unsplash.
