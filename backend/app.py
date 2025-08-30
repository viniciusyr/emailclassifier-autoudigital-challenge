from fastapi import FastAPI, Form, UploadFile
from classifier import classify_email
from process_email import process_email
from pydantic import BaseModel


app = FastAPI(title="Email Classifier - AutoU")

class EmailInput(BaseModel):
    text: str

# Just for testing with JSON input
# Allow CORS here later (if necessary)
@app.post("/read/json")
async def read_email_json(input: EmailInput):
    content = input.text
    result = classify_email(content)
    return result

@app.post("/read")
async def read_email(text: str = Form(None), file: UploadFile = None):
    content = ""

    if file:
        content = (await file.read()).decode("utf-8", errors="ignore")
    elif text:
        content = text
    else:
        return {"Error": "Invalid data"}

    clean_text = process_email(content)
    result = classify_email(clean_text)

    return {
        result
    }
