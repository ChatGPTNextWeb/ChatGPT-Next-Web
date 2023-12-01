# Use the official Python base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the poetry.lock and pyproject.toml files to the container
COPY poetry.lock pyproject.toml ./

# Install Poetry
RUN pip install --no-cache-dir poetry

# Install the project dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

# Copy the Flask app code to the container
COPY . .

# Expose the port that Gunicorn will listen on
EXPOSE 5000

# Set the Gunicorn command to start the server
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--timeout", "180"]

# Build the Docker image:
# docker build -t flask-app .

# Run the Docker container:
# docker run -p 8000:8000 flask-app
