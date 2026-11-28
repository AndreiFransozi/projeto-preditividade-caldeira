# Digital Twin demonstrativo de caldeira

Aplicação local de demonstração. O frontend usa Vite e Three.js; a API FastAPI
simula telemetria, treina um Isolation Forest apenas com dados normais
sintéticos e transmite diagnósticos por WebSocket.

> Os valores, cenários e alertas são artificiais. Este projeto não monitora,
> controla nem valida a segurança de uma caldeira real.

## Estrutura

```text
digital-twin-mvp/
  README.md
  backend/
    main.py
    requirements.txt
  frontend/
    index.html
    package.json
    vite.config.js
    src/
      main.js
      style.css
```

## Requisitos

- Python 3.11 ou superior
- Node.js 20 ou superior e npm
- Um navegador com suporte a WebGL

## 1. Iniciar a API

Abra um terminal na pasta `digital-twin-mvp` e crie um ambiente virtual:

```powershell
cd digital-twin-mvp
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

No PowerShell, se a ativação do ambiente virtual estiver bloqueada, abra o
Prompt de Comando e use:

```bat
.venv\Scripts\activate.bat
```

A API fica em `http://127.0.0.1:8000` e o endpoint de verificacao em
`http://127.0.0.1:8000/health`. Mantenha esse terminal aberto.

## 2. Iniciar o frontend

Abra um segundo terminal na pasta `digital-twin-mvp`:

```powershell
cd frontend
npm install
npm run dev
```

Abra o endereco mostrado pelo Vite, normalmente `http://localhost:5173`.
Mantenha esse terminal aberto tambem. Os botões da página enviam os cenários
para a API, e cada leitura chega pelo WebSocket uma vez por segundo.

## Como funciona a demonstracao

- O Isolation Forest é ajustado na inicialização com amostras sintéticas
  normais em torno das cinco referencias exibidas na tela.
- Cada cenário move gradualmente as leituras até um novo estado ao longo de
  25 segundos; o ruido pequeno continua presente.
- O índice de anomalia é uma escala demonstrativa calibrada contra os scores
  normais sintéticos. **Não é uma probabilidade de falha.**
- A peça com maior desvio padronizado é destacada, e as explicações comparam
  as leituras com as referências simuladas.
- O grafico mantem os ultimos 60 pontos e a lista evita repetir continuamente
  o mesmo alerta.

Este MVP não deve ser conectado a equipamentos nem usado para orientar
operação, manutenção ou decisão de segurança.
