from fastapi import FastAPI, Form, UploadFile
from classifier import classify_email
from response_generator import generate_response
from process_email import process_email
from pydantic import BaseModel


app = FastAPI(title="Email Classifier - AutoU")

class EmailInput(BaseModel):
    text: str

#Just for testing
@app.post("/read/json")
async def read_email_json(input: EmailInput):
    content = input.text
    category = classify_email(content)
    response = generate_response(category)

    return {"categoria": category, "resposta": response}

#allow CORS later if necessary
@app.post("/read")
async def read_email(text: str = Form(None), file: UploadFile = None):

    content = ""

    if file:
        content = (await file.read()).decode("utf-8", erros="ignore")
    elif text:
        content = text
    else:
        return {"Error": "Invalid data"}
        

    clean_text = process_email(content)
    category = classify_email(clean_text)
    response = generate_response(category)

    return {
        "category": category,
        "response": response
    }
