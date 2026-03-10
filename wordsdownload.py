import requests
import unicodedata

def remover_acentos(txt):
    return ''.join(c for c in unicodedata.normalize('NFD', txt)
                  if unicodedata.category(c) != 'Mn')

def processar_palavras():
    # Link do dicionário clássico do IME-USP
    url = "https://www.ime.usp.br/~pf/dicios/br-sem-acentos.txt"
    
    print(f"Tentando baixar de: {url}")
    
    try:
        # verify=False ajuda a pular erros de certificado no Windows
        response = requests.get(url, verify=False, timeout=15)
        
        if response.status_code == 200:
            linhas = response.text.splitlines()
            palavras_5_letras = set()

            print(f"Sucesso! Processando {len(linhas)} palavras...")

            for linha in linhas:
                p = linha.strip().upper()
                # O Wordle geralmente não usa palavras com hífens ou números
                if len(p) == 5 and p.isalpha():
                    palavras_5_letras.add(p)

            # Salvar o resultado final
            lista_ordenada = sorted(list(palavras_5_letras))
            with open("palavras_wordle.txt", "w", encoding="utf-8") as f:
                for p in lista_ordenada:
                    f.write(p + "\n")

            print(f"Pronto! {len(lista_ordenada)} palavras salvas em 'palavras_wordle.txt'.")
        else:
            print(f"Erro: O servidor respondeu com status {response.status_code}")
            print("Dica: Copie o link acima no seu navegador e salve o arquivo manualmente.")

    except Exception as e:
        print(f"Ocorreu um erro na conexão: {e}")

if __name__ == "__main__":
    processar_palavras()