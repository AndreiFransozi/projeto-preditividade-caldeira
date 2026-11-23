from fastapi import FastAPI


app = FastAPI(
    title="Caldeiras API",
    version="1.0.0",
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "caldeiras-api"}
