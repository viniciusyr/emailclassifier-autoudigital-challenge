def generate_response(category: str) -> str:

    #Just for mocking, later I'm gonna use Hugging Face to generate a better response.

    if category == "Produtivo":
        return "Obrigado pelo seu email! Seu pedido será analisado e retornaremos em breve."
    else:
        return "Agradecemos seu contato, mas este email não exige ação da nossa parte."
    
