from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.db import init_db
from app.routers import sedes, categorias, productos, auth, usuarios, stock, movimientos, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando bases de datos...")
    init_db()
    yield


app = FastAPI(title="ISP Inventarios", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sedes.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(stock.router)
app.include_router(movimientos.router)
app.include_router(admin.router)


@app.get("/")
def home():
    return {"message": "Sistema ISP funcionando"}
