# Deploy — quizminigames.com

## Pré-requisito: DNS
No painel da Hostinger (ou onde comprou o domínio), crie um registro A:

| Tipo | Nome  | Valor          |
|------|-------|----------------|
| A    | music | IP_DA_SUA_VPS  |

Aguarde 5–10 min para propagar antes de continuar.

---

## 1. Enviar o projeto para o servidor

No seu computador local:
```bash
scp -r . root@IP_DA_SUA_VPS:/srv/guessthesong
```

Ou via git (recomendado):
```bash
# No servidor
mkdir -p /srv/guessthesong
cd /srv/guessthesong
git clone <url-do-seu-repo> .
```

---

## 2. Editar o e-mail do Certbot

No servidor, edite o docker-compose.yml e substitua `seu@email.com`:
```bash
cd /srv/guessthesong
nano docker-compose.yml
# Altere: --email seu@email.com
```

---

## 3. Primeira subida (sem SSL ainda)

O Certbot precisa que o Nginx já esteja rodando na porta 80 para validar o domínio.
Faça em duas etapas:

### Etapa A — Nginx só HTTP (temporário)
Comenta o bloco HTTPS no nginx conf:
```bash
nano nginx/conf.d/quizminigames.conf
# Comente ou apague o bloco "server { listen 443 ... }" por enquanto
```

Sobe só o nginx e o app:
```bash
docker compose up -d nginx guessthesong
```

### Etapa B — Gera o certificado SSL
```bash
docker compose up certbot
```
Aguarde a mensagem "Congratulations!" nos logs.

### Etapa C — Restaura o bloco HTTPS e reinicia
```bash
nano nginx/conf.d/quizminigames.conf
# Restaura o bloco HTTPS (ou git checkout nginx/conf.d/quizminigames.conf)

docker compose restart nginx
```

---

## 4. Verificar

```bash
# Todos os containers rodando?
docker compose ps

# Logs do app
docker compose logs -f guessthesong

# Logs do nginx
docker compose logs -f nginx
```

Acesse: https://music.quizminigames.com

---

## Comandos úteis do dia a dia

```bash
# Subir tudo
docker compose up -d

# Derrubar tudo
docker compose down

# Rebuild após atualizar o código
docker compose up -d --build guessthesong

# Ver uso de recursos
docker stats
```

---

## Adicionar um novo projeto no futuro

1. Adicione o serviço no `docker-compose.yml`
2. Crie `nginx/conf.d/novojogo.conf` com o novo subdomínio
3. Adicione o domínio no certbot (linha `-d`)
4. `docker compose up -d --build`
