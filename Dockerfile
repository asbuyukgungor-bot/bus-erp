
FROM python:3.10-slim
WORKDIR /app
# Copy requirements first to leverage Docker cache
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
# Copy the entire backend application code
COPY backend/ /app/
EXPOSE 8080
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8080", "server:app"]
