# Use a Python base image
FROM python:3.10-slim-buster

# Set the working directory in the container
WORKDIR /app/backend

# Copy the requirements file and install dependencies
COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY ./backend/app ./app

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the FastAPI application using Uvicorn
# --host 0.0.0.0 makes the server accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
