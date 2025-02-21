FROM python:3.13.0

WORKDIR /agent

COPY agent .

RUN ["python","main.py"]