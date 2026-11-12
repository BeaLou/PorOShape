# Por o Shape

App web para acompanhar **treinos, peso, medidas e fotos de progresso**. Funciona no navegador do celular ou do computador e pode ser instalado como app (PWA). Sem servidor, sem cadastro: **tudo fica salvo no seu aparelho**.

## O que tem

- **Hoje:** resumo do dia, próximo treino, check-in de hábitos (proteína, água, sono, refeições, movimento, passos) e progresso até a meta.
- **Treino:** divisão de 4 dias em máquinas (A pernas e glúteos, B costas e ombros, C pernas e core, D superior e condicionamento), com séries marcáveis, carga por exercício, sugestão de progressão e "versão mínima" para dias difíceis. Há um modo de baixo impacto que troca a passada por leg press unilateral e a corrida por bike.
- **Corpo:** peso, % de gordura e medidas (cintura, abdômen, quadril, braço, coxa, tórax), com a mudança desde o início.
- **Fotos:** fotos de frente, lado e costas, galeria e comparador de antes e depois.
- **Evolução:** gráficos de peso (com a linha da meta), medidas, treinos por semana e carga por exercício.
- **Backup:** exportar e importar tudo em um arquivo JSON, com ou sem fotos.

Para trazer os dados da versão publicada no Claude, exporte o backup de lá e use **Ajustes, Importar** aqui. O arquivo antigo é aceito como está.

O app não define calorias nem cardápio. Isso fica com um nutricionista.

## Privacidade

Os dados ficam no IndexedDB do navegador. Nada é enviado para servidor nenhum. Por isso, limpar os dados do navegador apaga tudo: **faça backup de vez em quando** (Ajustes, Exportar tudo).

## Rodar localmente

Não há etapa de build nem dependências. Sirva a pasta com qualquer servidor estático:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Abrir o `index.html` direto do disco não funciona, porque o app usa módulos ES.

## Publicar no GitHub Pages

O workflow em `.github/workflows/pages.yml` publica a cada push na branch `main`. Basta ativar em **Settings, Pages, Source: GitHub Actions**. Para repositórios privados, o Pages exige um plano que o suporte.

## Estrutura

```
index.html            estrutura da página
css/styles.css        estilos e temas claro e escuro
js/app.js             estado, telas e ações
js/plan.js            plano de treino, medidas, hábitos e dicas
js/store.js           armazenamento local (IndexedDB)
js/charts.js          gráficos em SVG
js/util.js            funções utilitárias e ícones
sw.js                 cache para uso offline
manifest.webmanifest  configuração do app instalável
```

## Personalizar o treino

Edite o array `DAYS` em `js/plan.js`. Cada exercício tem `id`, nome, séries, repetições, tipo (`load`, `bw` ou `cardio`) e o passo de carga. Use `alt` para definir a alternativa do modo de baixo impacto.
