version: '3.8'

services:
  # ============= Databases =============
  
  user-db:
    image: postgres:15-alpine
    container_name: user-db
    environment:
      POSTGRES_DB: user_service_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    ports:
      - "5432:5432"
    volumes:
      - user-db-data:/var/lib/postgresql/data
    networks:
      - ticketkatum-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  auth-db:
    image: postgres:15-alpine
    container_name: auth-db
    environment:
      POSTGRES_DB: auth_service_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    ports:
      - "5433:5432"
    volumes:
      - auth-db-data:/var/lib/postgresql/data
    networks:
      - ticketkatum-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  bus-db:
    image: postgres:15-alpine
    container_name: bus-db
    environment:
      POSTGRES_DB: bus_service_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    ports:
      - "5434:5432"
    volumes:
      - bus-db-data:/var/lib/postgresql/data
    networks:
      - ticketkatum-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  hotel-db:
    image: postgres:15-alpine
    container_name: hotel-db
    environment:
      POSTGRES_DB: hotel_service_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    ports:
      - "5435:5432"
    volumes:
      - hotel-db-data:/var/lib/postgresql/data
    networks:
      - ticketkatum-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  booking-db:
    image: postgres:15-alpine
    container_name: booking-db
    environment:
      POSTGRES_DB: booking_service_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    ports:
      - "5436:5432"
    volumes:
      - booking-db-data:/var/lib/postgresql/data
    networks:
      - ticketkatum-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  payment-db:
    image: postgres:15-alpine
    container_name: payment-db
    environment:
      POSTGRES_DB: payment_service_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
    ports:
      - "5437:5432"
    volumes:
      - payment-db-data:/var/lib/postgresql/data
    networks:
      - ticketkatum-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5