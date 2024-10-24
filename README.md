

# MicroService_Ecom - Scheduler Service

## Overview

This project is a **scheduler microservice** built using **NestJS**, a progressive Node.js framework. The microservice allows for the scheduling of customizable jobs while maintaining essential job-related information. The service provides RESTful API endpoints for job management, enabling users to list all jobs, retrieve details of a specific job by ID, and create new jobs.

The system utilizes **PostgreSQL** for persistent data storage and **Redis** for caching to enhance performance. Additionally, the microservice includes **monitoring** capabilities using **Prometheus** for metrics collection and **Grafana** for visualizing metrics. **Nginx** is used as a load balancer, ensuring scalability and distribution of traffic across multiple service instances.

---

## Project Structure

### Key Components

#### 1. `docker-compose.yml`
The `docker-compose.yml` file defines all services necessary for running the application. This includes:
- **PostgreSQL**: The relational database to store job data.
- **Redis**: The in-memory cache store for optimizing frequently accessed data.
- **Scheduler Service**: The microservice that handles job scheduling and job management API requests.
- **Nginx**: Acts as a load balancer, distributing traffic across multiple instances of the microservice to ensure high availability.
- **Prometheus**: For collecting metrics about the application's performance.
- **Grafana**: For visualizing metrics collected by Prometheus.

Each service is defined with its dependencies and environment variables.

#### 2. `Dockerfile`
The `Dockerfile` contains instructions to build the Docker image for the scheduler microservice:
- **Base Image**: It uses an official Node.js image.
- **Dependency Installation**: Installs all project dependencies defined in `package.json`.
- **Copy Application Code**: Copies the application source code into the container.
- **Build & Run**: Builds the application and sets the command to start the NestJS application inside the container.

This setup ensures the microservice can run consistently across various environments.

#### 3. `nginx.conf`
This file contains the configuration for **Nginx** as a load balancer. It:
- Distributes incoming HTTP requests across multiple instances of the scheduler microservice.
- Provides basic logging for incoming requests to help with monitoring and debugging.

This is crucial for handling high traffic loads and ensuring scalability by distributing the workload evenly.

#### 4. `prometheus.yml`
Configures **Prometheus** to scrape metrics from different services, including:
- **Nginx**: To monitor the number of HTTP requests and latency.
- **Scheduler Service**: To monitor its performance and resource usage.

It specifies the intervals at which Prometheus should scrape the targets and the specific endpoints to monitor.

#### 5. `src/`
This folder contains the source code for the scheduler microservice, structured following NestJS conventions:

- **`app.module.ts`**: The root module where other modules are imported, including the `JobModule` and `RedisModule`.
- **`main.ts`**: The entry point for the NestJS application, where global settings are defined (like validation pipes, Swagger documentation, etc.).
- **`job/`**: This folder contains all job-related logic.
  - **`job.controller.ts`**: Defines the RESTful API endpoints to interact with job data (GET, POST).
  - **`job.service.ts`**: Contains the business logic for managing jobs, including scheduling, retrieving, and persisting jobs in PostgreSQL.
  - **`entities/`**: Defines the **Job** entity, a TypeORM model that maps job data to the PostgreSQL database.
  - **`dto/`**: Defines **Data Transfer Objects** (DTOs) used for input validation and data structures when creating and updating jobs.
- **`redis/`**: Manages the Redis cache, storing frequently accessed job data to reduce load on the database.

---

## Functionality

### Job Scheduling
The microservice allows users to schedule jobs with customizable parameters such as frequency (using cron expressions) and job attributes. It uses the **`node-cron`** library to handle scheduling. This ensures that jobs run automatically at specified intervals without manual intervention.

### API Endpoints
The following API endpoints are available for job management:

1. **GET `/jobs`**:  
   Lists all available jobs with their details. This endpoint returns information such as job ID, name, status, last run, and next run timestamps.

2. **GET `/jobs/:id`**:  
   Retrieves detailed information about a specific job using its unique ID. This includes all job attributes and its scheduling details.

3. **POST `/jobs`**:  
   Creates a new job. Users can specify attributes like job name, scheduling interval (cron expression), and other customizable parameters.

Each endpoint has comprehensive input validation using **DTOs** and `class-validator` to ensure correct data is passed in the API requests.

### Database Integration
The microservice integrates with **PostgreSQL** to store persistent job data. This includes:
- **Job Name**: The identifier for the job.
- **Last Run Timestamp**: When the job last executed.
- **Next Run Timestamp**: When the job is scheduled to run next.
- **Cron Expression**: Defines the scheduling interval for the job.
- **Parameters**: Custom attributes specific to each job.

### Caching
The microservice uses **Redis** to cache frequently accessed data like job lists and job details. This reduces the load on PostgreSQL, improving response times and overall system performance.

### Monitoring
To monitor the health and performance of the microservice, the project includes:
- **Prometheus**: Collects metrics such as request counts, job execution times, and resource utilization.
- **Grafana**: Provides a user-friendly dashboard to visualize the metrics collected by Prometheus. This helps in tracking the service's performance over time and identifying bottlenecks.

### Scalability
The microservice is designed to handle large-scale deployments. It can scale horizontally by running multiple instances of the service behind Nginx as a load balancer. Redis ensures distributed caching, which is important for handling high volumes of API requests efficiently.

---

## Setup

### Prerequisites
Before running the application, ensure the following are installed:
- **Docker** and **Docker Compose**: For containerized deployment.
- **Node.js** and **npm**: If running the application locally outside of Docker.

### Environment Variables
The service relies on certain environment variables for configuration. Ensure the `.env` file is present and contains the following variables:

```env
PGHOST=postgres
PGPORT=5432
PGUSER=postgres
PGPASSWORD=123456789
PGDATABASE=scheduler
REDIS_HOST=redis
REDIS_PORT=6379
```

These variables configure the connection to PostgreSQL and Redis.

### Running the Application

To start the application, run the following commands:

```bash
# Build and run all services in the background
docker-compose up --build -d
```

This will start the scheduler service, PostgreSQL, Redis, Nginx, Prometheus, and Grafana.

### Testing

To run unit and end-to-end tests, use the following commands:

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

These tests ensure the correctness of the job management logic and API functionality.

---

## Monitoring

To monitor the application using **Prometheus** and **Grafana**, follow these steps:

1. Access Prometheus at `http://localhost:9090` and run queries to check metrics. For example, to view the rate of HTTP requests to the microservice:
   ```bash
   rate(nginx_http_requests_total[1m])
   ```

2. Access Grafana at `http://localhost:3000` and log in using the default credentials (`admin/admin`). You can then view predefined dashboards to visualize various metrics.

---

## Conclusion

This scheduler microservice demonstrates a production-ready architecture using **NestJS** with a focus on scalability, performance, and monitoring. It provides a flexible job scheduling system, with robust API management, caching, and monitoring to ensure high performance in large-scale environments.


--- 

This version expands on the original by providing additional details on the architecture, environment variables, and how each component contributes to the overall system. Additionally, there’s a greater focus on scalability, monitoring, and testing, which are key in any production-ready microservice.
