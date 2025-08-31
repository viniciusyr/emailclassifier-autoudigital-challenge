from importlib.metadata import files
from pydoc import text
from fastapi import FastAPI, UploadFile, Form, Request
from classifier import classify_email
from process_email import process_email
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from split_emails import split_emails
from fastapi.responses import StreamingResponse
import json



app = FastAPI(title="Email Classifier - AutoU")

origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000"                     
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,
    allow_methods=["GET", "POST"],         
    allow_headers=["*"],        
)

class EmailInput(BaseModel):
    text: str

@app.post("/read/json")
async def read_email_json(input: EmailInput):
    content = input.text
    result = classify_email(content)
    return result

@app.post("/read")
async def read_email(files: list[UploadFile] = None, text: str = Form(None), request: Request = None):
    contents = []

    if files:
        for file in files:
            raw = (await file.read()).decode("utf-8", errors="ignore")
            contents.append(raw)
    elif text:
        contents.append(text)
    else:
        return {"error": "Invalid data"}

    async def event_stream():
        all_emails = []
        for raw in contents:
            all_emails.extend(split_emails(raw))

        yield json.dumps({"total": len(all_emails)}) + "\n"

        for email in all_emails:
            if await request.is_disconnected():
                print("Client disconnected")
                break
            
            clean_text = process_email(email)
            result = classify_email(clean_text)
            yield json.dumps(result) + "\n"

    return StreamingResponse(event_stream(), media_type="application/json")