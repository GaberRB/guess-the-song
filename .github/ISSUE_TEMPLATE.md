---
name: Último Commit
about: Notificação do último commit
title: '[Notificação] Último Commit'
labels: notificação, enhancement
---

Este é um aviso para informar que um novo commit foi adicionado ao repositório.

**Informações do commit:**
- Autor: ${{ github.event.head_commit.author.name }}
- Mensagem: ${{ github.event.head_commit.message }}

Por favor, verifique o novo commit e tome as medidas necessárias, se aplicável.

Obrigado!
