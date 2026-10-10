# Design de Sobrancelhas — Site com agendamento

Site estático (HTML + CSS + JavaScript puro) com animações de rolagem e sistema de agendamento.

## Estrutura
- `index.html` — estrutura e textos
- `style.css` — visual preto e dourado e animações
- `script.js` — agendamento, horários e animações ao rolar

## Personalização
No começo do `script.js`:
- `WHATS` — número da profissional com DDI+DDD (ex.: `5511999999999`)
- `HOURS` — horários de atendimento

Serviços, preços e durações ficam no `index.html` (seções "Serviços" e o `<select id="svc">`).

## Publicar no GitHub Pages
1. Crie um repositório no GitHub e envie estes arquivos na raiz.
2. Vá em **Settings → Pages**.
3. Em **Branch**, escolha `main` e a pasta `/ (root)`, depois **Save**.
4. O site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Observação
Os agendamentos ficam salvos no navegador de cada visitante (`localStorage`); a confirmação final vai por WhatsApp.
Para uma agenda compartilhada entre todos os clientes, é necessário um banco de dados (ex.: Supabase).
